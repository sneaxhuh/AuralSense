"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WaveformVisualizerProps {
  audioUrl: string
  isPlaying: boolean
  onPlayPause: () => void
}

export function WaveformVisualizer({ audioUrl, isPlaying, onPlayPause }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioData, setAudioData] = useState<number[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const generateWaveformData = () => {
      // Generate mock waveform data for visualization
      const data = []
      for (let i = 0; i < 200; i++) {
        data.push(Math.random() * 0.8 + 0.1)
      }
      setAudioData(data)
    }

    generateWaveformData()
  }, [audioUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || audioData.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const barWidth = width / audioData.length
      const progress = duration > 0 ? currentTime / duration : 0

      audioData.forEach((amplitude, index) => {
        const barHeight = amplitude * height * 0.8
        const x = index * barWidth
        const y = (height - barHeight) / 2

        // Create gradient based on progress
        const isPlayed = index / audioData.length < progress

        if (isPlayed) {
          ctx.fillStyle = "rgba(6, 182, 212, 0.8)" // Cyan for played portion
        } else {
          ctx.fillStyle = "rgba(100, 116, 139, 0.4)" // Gray for unplayed
        }

        ctx.fillRect(x, y, barWidth - 1, barHeight)
      })
    }

    draw()
  }, [audioData, currentTime, duration])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
    }
  }, [audioUrl])

  // ...existing useEffects...

// 🧠 NEW useEffect to control audio playback
useEffect(() => {
  const audio = audioRef.current
  if (!audio) return

  if (isPlaying) {
    audio.play().catch((err) => {
      console.error("Audio play failed:", err)
    })
  } else {
    audio.pause()
  }
}, [isPlaying])

useEffect(() => {
  return () => {
    audioRef.current?.pause()
  }
}, [])


  return (
    <motion.div
      className="space-y-4 p-6 bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-2xl border border-slate-600/30 backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Audio Waveform</h3>
        <Button
          onClick={onPlayPause}
          size="sm"
          className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-lg"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} width={800} height={120} className="w-full h-24 rounded-lg bg-slate-900/50" />
        <motion.div
          className="absolute top-0 left-0 w-1 h-full bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
          style={{
            left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
          }}
          animate={isPlaying ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
          transition={{ duration: 1, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
        />
      </div>

      <div className="flex justify-between text-sm text-slate-400">
        <span>{Math.floor(currentTime)}s</span>
        <span>{Math.floor(duration)}s</span>
      </div>

      <audio ref={audioRef} src={audioUrl} />
    </motion.div>
  )
}
