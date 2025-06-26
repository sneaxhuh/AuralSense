"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileAudio, Play, Pause, RotateCcw, Loader2, Zap, Brain, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WaveformVisualizer } from "@/components/waveform-visualizer"
import { EmotionDisplay } from "@/components/emotion-display"

interface EmotionResult {
  emotion: string
  confidence: number
  processing_time: number
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
}

export default function AuralSense() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EmotionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!file.type.includes("wav") && !file.name.toLowerCase().endsWith(".wav")) {
      return "Invalid format. Please upload a .wav audio file"
    }
    if (file.size > 25 * 1024 * 1024) {
      return "File too large. Maximum size is 25MB"
    }
    return null
  }

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selectedFile)
    setError(null)
    setResult(null)
    setUploadProgress(100)

    const url = URL.createObjectURL(selectedFile)
    setAudioUrl(url)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect],
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const analyzeEmotion = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("audio", file)

                  const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Neural analysis failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const resetInterface = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setIsPlaying(false)
    setUploadProgress(0)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <motion.div
        className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <motion.div
                className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 backdrop-blur-sm"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Brain className="h-8 w-8 text-cyan-400" />
              </motion.div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
              >
                <Zap className="h-6 w-6 text-yellow-400" />
              </motion.div>
              <motion.div
                className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm"
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Waves className="h-8 w-8 text-purple-400" />
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-6xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">
              AuralSense
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Advanced neural speech analysis for real-time emotion recognition
            </p>
            <motion.div
              className="w-32 h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-500 mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </motion.div>

          {/* Main Interface */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card className="glassmorphic-card border-slate-700/50 backdrop-blur-xl bg-slate-900/30 shadow-2xl">
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                          isDragging
                            ? "border-cyan-500 bg-cyan-500/5 scale-105"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <motion.div
                          className="space-y-6"
                          animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <motion.div
                            className="flex justify-center"
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div
                              className={`p-6 rounded-full bg-gradient-to-br transition-all duration-300 ${
                                isDragging
                                  ? "from-cyan-500/30 to-teal-500/30 border-2 border-cyan-500/50"
                                  : "from-slate-700/50 to-slate-600/50 border-2 border-slate-600/50"
                              }`}
                            >
                              <Upload
                                className={`h-12 w-12 transition-colors duration-300 ${
                                  isDragging ? "text-cyan-400" : "text-slate-400"
                                }`}
                              />
                            </div>
                          </motion.div>

                          <div className="space-y-3">
                            <h3 className="text-2xl font-semibold text-white">Drop your audio file here</h3>
                            <p className="text-slate-400 text-lg">or click to browse • .wav format • max 25MB</p>
                          </div>

                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white border-0 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/40 px-8 py-3 text-lg font-semibold rounded-xl"
                          >
                            <Upload className="h-5 w-5 mr-2" />
                            Select Audio File
                          </Button>
                        </motion.div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".wav,audio/wav"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="analysis"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-8"
                    >
                      {/* File Info */}
                      <motion.div
                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600/50 backdrop-blur-sm"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
                          whileHover={{ rotate: 5 }}
                        >
                          <FileAudio className="h-6 w-6 text-cyan-400" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-lg truncate">{file.name}</h4>
                          <p className="text-slate-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                          </p>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={resetInterface}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl"
                          >
                            <RotateCcw className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      </motion.div>

                      {/* Waveform Visualizer */}
                      {audioUrl && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <WaveformVisualizer
                            audioUrl={audioUrl}
                            isPlaying={isPlaying}
                            onPlayPause={toggleAudioPlayback}
                          />
                        </motion.div>
                      )}

                      {/* Audio Controls */}
                      {audioUrl && (
                        <motion.div
                          className="flex justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Button
                            onClick={toggleAudioPlayback}
                            variant="outline"
                            className="bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-slate-500/50 backdrop-blur-sm rounded-xl px-6 py-3"
                          >
                            {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                            {isPlaying ? "Pause" : "Play"} Preview
                          </Button>
                          <audio
                            ref={audioRef}
                            src={audioUrl}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                          />
                        </motion.div>
                      )}

                      {/* Analyze Button */}
                      <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button
                          onClick={analyzeEmotion}
                          disabled={isLoading}
                          className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-300 px-12 py-4 text-xl font-semibold rounded-2xl ${
                            isLoading
                              ? "animate-pulse shadow-xl shadow-purple-500/40"
                              : "hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105"
                          }`}
                        >
                          {isLoading ? (
                            <motion.div
                              className="flex items-center"
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                            >
                              <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                              Neural Processing...
                            </motion.div>
                          ) : (
                            <>
                              <Brain className="h-6 w-6 mr-3" />
                              Analyze Emotion
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-red-500/50 bg-red-500/10 backdrop-blur-sm">
                  <div className="p-4">
                    <p className="text-red-400 text-center font-medium">{error}</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Display */}
          <AnimatePresence>{result && <EmotionDisplay result={result} onReset={resetInterface} />}</AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
