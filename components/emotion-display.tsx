"use client"

import { motion } from "framer-motion"
import { CheckCircle, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EmotionResult {
  emotion: string
  confidence: number
  processing_time: number
}

interface EmotionDisplayProps {
  result: EmotionResult
  onReset: () => void
}

const emotionConfig = {
  happy: {
    color: "from-yellow-400 to-orange-400",
    textColor: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/20",
    emoji: "😊",
    description: "Positive and joyful emotional state detected",
  },
  sad: {
    color: "from-blue-400 to-indigo-400",
    textColor: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
    emoji: "😢",
    description: "Melancholic emotional pattern identified",
  },
  angry: {
    color: "from-red-400 to-rose-400",
    textColor: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
    emoji: "😠",
    description: "Intense negative emotional state detected",
  },
  fearful: {
    color: "from-purple-400 to-violet-400",
    textColor: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/20",
    emoji: "😨",
    description: "Anxious emotional pattern recognized",
  },
  disgust: {
    color: "from-green-400 to-emerald-400",
    textColor: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    glow: "shadow-green-500/20",
    emoji: "🤢",
    description: "Aversive emotional response detected",
  },
  surprised: {
    color: "from-orange-400 to-amber-400",
    textColor: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
    emoji: "😲",
    description: "Unexpected emotional reaction identified",
  },
  calm: {
    color: "from-teal-400 to-cyan-400",
    textColor: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    glow: "shadow-teal-500/20",
    emoji: "😌",
    description: "Calm and relaxed emotional state detected",
  },
  neutral: {
    color: "from-gray-400 to-slate-400",
    textColor: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    glow: "shadow-gray-500/20",
    emoji: "😐",
    description: "Balanced emotional state detected",
  },
}

export function EmotionDisplay({ result, onReset }: EmotionDisplayProps) {
  const config = emotionConfig[result.emotion as keyof typeof emotionConfig] || emotionConfig.neutral

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card
        className={`glassmorphic-card border-2 backdrop-blur-xl bg-slate-900/30 shadow-2xl ${config.border} ${config.glow}`}
      >
        <div className="p-8 text-center space-y-8">
          {/* Success Indicator */}
          <motion.div
            className="flex items-center justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-medium">Analysis Complete</span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sparkles className="h-4 w-4 text-green-400" />
            </motion.div>
          </motion.div>

          {/* Main Emotion Display */}
          <motion.div
            className={`inline-flex items-center space-x-6 px-8 py-6 rounded-3xl border-2 backdrop-blur-sm ${config.bg} ${config.border} shadow-xl`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="text-6xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3,
              }}
            >
              {config.emoji}
            </motion.div>

            <div className="text-left space-y-2">
              <motion.h2
                className={`text-4xl font-orbitron font-bold capitalize bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {result.emotion}
              </motion.h2>

              <motion.div
                className="space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${config.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence * 100}%` }}
                      transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-slate-300 font-mono text-sm">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-slate-400">Confidence Level</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-slate-300 text-lg max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {config.description}
          </motion.p>

          {/* Processing Time */}
          <motion.div
            className="text-sm text-slate-400 space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {typeof result.processing_time === "number" && (
  <p>Processing Time: {result.processing_time.toFixed(2)}s</p>
)}

            <p>Neural Network: EmotionNet v2.1</p>
          </motion.div>

          {/* Reset Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <Button
              onClick={onReset}
              className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl px-8 py-3 rounded-xl"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Analyze Another File
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
