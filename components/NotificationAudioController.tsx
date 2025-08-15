"use client"

import { useEffect, useRef, useCallback } from "react"

interface NotificationAudioControllerProps {
  unseenCount: number
  alertEnabled: boolean
  onAudioBlocked?: () => void
}

export function NotificationAudioController({
  unseenCount,
  alertEnabled,
  onAudioBlocked,
}: NotificationAudioControllerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevUnseenRef = useRef<number>(0)
  const awaitingGestureRef = useRef(false)
  const audioUnlockedRef = useRef(false)

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio("/alert.mp3")
      audio.preload = "auto"
      audio.loop = true
      audio.playsInline = true
      audio.volume = 0.7
      audio.muted = false
      audioRef.current = audio

      audio.addEventListener("loadstart", () => console.log("[v0] Audio loading started"))
      audio.addEventListener("canplay", () => console.log("[v0] Audio can play"))
      audio.addEventListener("error", (e) => console.log("[v0] Audio error:", e))
      audio.addEventListener("loadeddata", () => console.log("[v0] Audio data loaded"))
    }

    const unlockAudio = async () => {
      if (audioRef.current && !audioUnlockedRef.current) {
        try {
          audioRef.current.currentTime = 0
          await audioRef.current.play()
          audioRef.current.pause()
          audioRef.current.currentTime = 0
          audioUnlockedRef.current = true
          console.log("[v0] Audio unlocked after user gesture")
        } catch (e) {
          console.log("[v0] Failed to unlock audio:", e)
        }
      }
    }

    const events = ["click", "touchstart", "keydown"]
    events.forEach((event) => {
      document.addEventListener(event, unlockAudio, { once: true, passive: true })
    })

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
      events.forEach((event) => {
        document.removeEventListener(event, unlockAudio)
      })
    }
  }, [])

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !alertEnabled) {
      console.log("[v0] Cannot play audio - audio:", !!audio, "alertEnabled:", alertEnabled)
      return
    }

    try {
      audio.currentTime = 0
      console.log(
        "[v0] Attempting to play audio - readyState:",
        audio.readyState,
        "unlocked:",
        audioUnlockedRef.current,
      )

      await audio.play()
      awaitingGestureRef.current = false
      console.log("[v0] Notification audio started successfully")
    } catch (error) {
      console.log("[v0] Audio autoplay blocked:", error)

      if (!awaitingGestureRef.current) {
        awaitingGestureRef.current = true
        onAudioBlocked?.()

        const enableAudio = async () => {
          try {
            audio.currentTime = 0
            await audio.play()
            awaitingGestureRef.current = false
            audioUnlockedRef.current = true
            console.log("[v0] Audio enabled after user gesture")
          } catch (e) {
            console.log("[v0] Still unable to play audio:", e)
          }
        }

        const handleUserGesture = () => {
          enableAudio()
          document.removeEventListener("click", handleUserGesture)
        }

        document.addEventListener("click", handleUserGesture, { passive: true })

        setTimeout(() => {
          document.removeEventListener("click", handleUserGesture)
          awaitingGestureRef.current = false
        }, 30000)
      }
    }
  }, [alertEnabled, onAudioBlocked])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const prev = prevUnseenRef.current
    const curr = unseenCount

    console.log("[v0] Notification count changed - prev:", prev, "curr:", curr, "alertEnabled:", alertEnabled)

    if (alertEnabled && prev === 0 && curr > 0) {
      console.log("[v0] Playing notification alert - conditions met")
      tryPlay()
    } else if (alertEnabled && prev < curr && curr > 0) {
      console.log("[v0] Playing notification alert - count increased from", prev, "to", curr)
      tryPlay()
    } else {
      console.log("[v0] Not playing alert - prev:", prev, "curr:", curr, "alertEnabled:", alertEnabled)
    }

    if (curr === 0 || !alertEnabled) {
      console.log("[v0] Stopping notification alert")
      audio.pause()
      audio.currentTime = 0
    }

    prevUnseenRef.current = curr
  }, [unseenCount, alertEnabled, tryPlay])

  return null
}
