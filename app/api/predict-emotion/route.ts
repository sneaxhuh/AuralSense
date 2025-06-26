import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { spawn } from "child_process"
import os from "os"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile || !audioFile.name.toLowerCase().endsWith(".wav")) {
      return NextResponse.json({ error: "Only .wav files are supported" }, { status: 400 })
    }

    const tempPath = path.join(os.tmpdir(), `${Date.now()}_${audioFile.name}`)
    await fs.writeFile(tempPath, Buffer.from(await audioFile.arrayBuffer()))

    const scriptPath = path.join(process.cwd(), "python", "predict.py")
    const modelPath = path.join(process.cwd(), "python", "crnn.pth")

    const python = spawn("python3", [scriptPath, "--file", tempPath, "--model", modelPath])

    const stdout: string[] = []
    const stderr: string[] = []

    for await (const chunk of python.stdout) stdout.push(chunk.toString())
    for await (const chunk of python.stderr) stderr.push(chunk.toString())

    await fs.unlink(tempPath)

    if (stderr.length > 0) {
      console.error("Python stderr:", stderr.join(""))
      return NextResponse.json({ error: "Model execution error" }, { status: 500 })
    }

    try {
      return NextResponse.json(JSON.parse(stdout.join("").trim()))
    } catch {
      return NextResponse.json({ error: "Invalid response from model" }, { status: 500 })
    }
  } catch (err) {
    console.error("Server error:", err)
    return NextResponse.json({ error: "Server error during prediction" }, { status: 500 })
  }
}
