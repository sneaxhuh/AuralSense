import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { spawn } from "child_process"
import os from "os"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile || !audioFile.name.toLowerCase().endsWith(".wav")) {
      return NextResponse.json({ error: "Only .wav files are supported" }, { status: 400 })
    }

    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const tempPath = path.join(os.tmpdir(), `${Date.now()}_${audioFile.name}`)
    await fs.writeFile(tempPath, buffer)

    const modelPath = path.join(process.cwd(), "python", "crnn.pth")
    const scriptPath = path.join(process.cwd(), "python", "predict.py")

    const python = spawn("python3", [scriptPath, "--file", tempPath, "--model", modelPath])

    const chunks: string[] = []
    const stderr: string[] = []

    for await (const chunk of python.stdout) {
      chunks.push(chunk.toString())
    }
    for await (const chunk of python.stderr) {
      stderr.push(chunk.toString())
    }

    await fs.unlink(tempPath)

    if (stderr.length > 0) {
      console.error("Python error:", stderr.join(""))
      return NextResponse.json({ error: "Model inference failed." }, { status: 500 })
    }

    const output = chunks.join("").trim()
    let emotionData
    try {
      emotionData = JSON.parse(output)
    } catch {
      console.error("Failed to parse Python output:", output)
      return NextResponse.json({ error: "Invalid model output" }, { status: 500 })
    }

    return NextResponse.json({
      ...emotionData,
      model_version: "CRNN-SER v1",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error analyzing emotion:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
