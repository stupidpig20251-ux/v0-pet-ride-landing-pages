"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const PetRouteMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Pet-themed routes across the city
  const routes: {
    start: { x: number; y: number; delay: number }
    end: { x: number; y: number; delay: number }
    color: string
  }[] = [
    {
      start: { x: 80, y: 120, delay: 0 },
      end: { x: 180, y: 60, delay: 2 },
      color: "#10b981", // Emerald for pet-friendly routes
    },
    {
      start: { x: 180, y: 60, delay: 2 },
      end: { x: 240, y: 100, delay: 4 },
      color: "#10b981",
    },
    {
      start: { x: 40, y: 40, delay: 1 },
      end: { x: 140, y: 160, delay: 3 },
      color: "#10b981",
    },
    {
      start: { x: 260, y: 50, delay: 0.5 },
      end: { x: 160, y: 160, delay: 2.5 },
      color: "#10b981",
    },
  ]

  // Generate city dots pattern
  const generateCityDots = (width: number, height: number) => {
    const dots = []
    const gap = 15
    const dotRadius = 1.5

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Create city-like clusters
        const isInCity =
          (x < width * 0.3 && x > width * 0.1 && y < height * 0.4 && y > height * 0.1) ||
          (x < width * 0.6 && x > width * 0.4 && y < height * 0.6 && y > height * 0.3) ||
          (x < width * 0.9 && x > width * 0.7 && y < height * 0.8 && y > height * 0.5)

        if (isInCity && Math.random() > 0.4) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.4 + 0.3,
          })
        }
      }
    }
    return dots
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
      canvas.width = width
      canvas.height = height
    })

    resizeObserver.observe(canvas.parentElement as Element)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dots = generateCityDots(dimensions.width, dimensions.height)
    let animationFrameId: number
    let startTime = Date.now()

    function drawDots() {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      dots.forEach((dot) => {
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16, 185, 129, ${dot.opacity})`
        ctx.fill()
      })
    }

    function drawRoutes() {
      const currentTime = (Date.now() - startTime) / 1000

      routes.forEach((route) => {
        const elapsed = currentTime - route.start.delay
        if (elapsed <= 0) return

        const duration = 3
        const progress = Math.min(elapsed / duration, 1)

        const x = route.start.x + (route.end.x - route.start.x) * progress
        const y = route.start.y + (route.end.y - route.start.y) * progress

        // Draw route line
        ctx.beginPath()
        ctx.moveTo(route.start.x, route.start.y)
        ctx.lineTo(x, y)
        ctx.strokeStyle = route.color
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw start point (home)
        ctx.beginPath()
        ctx.arc(route.start.x, route.start.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#f59e0b"
        ctx.fill()

        // Draw moving pet taxi
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#10b981"
        ctx.fill()

        // Glow effect
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(16, 185, 129, 0.3)"
        ctx.fill()

        if (progress === 1) {
          ctx.beginPath()
          ctx.arc(route.end.x, route.end.y, 4, 0, Math.PI * 2)
          ctx.fillStyle = "#ef4444"
          ctx.fill()
        }
      })
    }

    function animate() {
      drawDots()
      drawRoutes()

      const currentTime = (Date.now() - startTime) / 1000
      if (currentTime > 12) {
        startTime = Date.now()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationFrameId)
  }, [dimensions])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function SignupModal({ isOpen, onClose, onSuccess }: SignupModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    petType: "",
    city: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?waitlist=true`,
          data: {
            full_name: formData.name,
            phone: formData.phone,
            pet_type: formData.petType,
            city: formData.city,
          },
        },
      })

      if (authError) throw authError

      if (authData.user && !authData.user.email_confirmed_at) {
        setError(null)
        onSuccess()
        onClose()
      } else {
        const { error: waitlistError } = await supabase.from("waitlist").insert({
          user_id: authData.user?.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pet_type: formData.petType,
          city: formData.city,
        })

        if (waitlistError) throw waitlistError
        onSuccess()
        onClose()
      }
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      if (formData.name || formData.phone || formData.petType || formData.city) {
        localStorage.setItem(
          "petride_signup_data",
          JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            pet_type: formData.petType,
            city: formData.city,
          }),
        )
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?google_signup=true`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message || "Google sign-up failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full overflow-hidden rounded-2xl flex flex-col lg:flex-row bg-white shadow-2xl max-h-[95vh]"
        >
          <div className="w-full lg:w-2/5 h-[200px] lg:h-[700px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-sage-50 to-cream-50">
              <PetRouteMap />

              {/* Overlay content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 lg:p-8 z-10">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mb-3 lg:mb-6"
                >
                  <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-gradient-to-br from-emerald-400 to-sage-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Heart className="text-white h-6 w-6 lg:h-8 lg:w-8" />
                  </div>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-2xl lg:text-4xl font-serif font-bold mb-2 lg:mb-3 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sage-600"
                >
                  PetRide
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-xs lg:text-sm text-center text-muted-gray max-w-xs leading-relaxed hidden lg:block"
                >
                  Join thousands of pet parents who trust us with their furry family members. Safe, reliable, and loving
                  care for every journey.
                </motion.p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-3/5 p-6 sm:p-8 lg:p-16 flex flex-col justify-center bg-white overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="text-2xl lg:text-3xl font-serif font-bold mb-2 text-muted-gray">Login / Sign up</h1>
              <p className="text-muted-gray/70 mb-6 lg:mb-8 leading-relaxed text-sm lg:text-base">
                Join our community or sign in to access your dashboard
              </p>

              <div className="mb-4 lg:mb-6">
                <button
                  className="w-full flex items-center justify-center gap-3 bg-cream-50 border border-sage-200 rounded-xl p-3 lg:p-4 hover:bg-cream-100 transition-all duration-300 text-muted-gray shadow-sm hover:shadow-md text-sm lg:text-base"
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  <svg className="h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="relative my-4 lg:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sage-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-muted-gray/60">or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium text-muted-gray mb-2">
                      Name <span className="text-emerald-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      required
                      className="bg-cream-50 border-sage-200 placeholder:text-muted-gray/50 text-muted-gray rounded-xl focus:border-emerald-400 focus:ring-emerald-400 h-11 lg:h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="block text-sm font-medium text-muted-gray mb-2">
                      City <span className="text-emerald-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Your city"
                      required
                      className="bg-cream-50 border-sage-200 placeholder:text-muted-gray/50 text-muted-gray rounded-xl focus:border-emerald-400 focus:ring-emerald-400 h-11 lg:h-12"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-muted-gray mb-2">
                    Email <span className="text-emerald-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    className="bg-cream-50 border-sage-200 placeholder:text-muted-gray/50 text-muted-gray rounded-xl focus:border-emerald-400 focus:ring-emerald-400 h-11 lg:h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-muted-gray mb-2">
                    Password <span className="text-emerald-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a password"
                      required
                      minLength={6}
                      className="bg-cream-50 border-sage-200 placeholder:text-muted-gray/50 text-muted-gray rounded-xl focus:border-emerald-400 focus:ring-emerald-400 h-11 lg:h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-gray/60 hover:text-muted-gray"
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-gray/60 mt-1">Minimum 6 characters</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="block text-sm font-medium text-muted-gray mb-2">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="bg-cream-50 border-sage-200 placeholder:text-muted-gray/50 text-muted-gray rounded-xl focus:border-emerald-400 focus:ring-emerald-400 h-11 lg:h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="petType" className="block text-sm font-medium text-muted-gray mb-2">
                      Pet Type <span className="text-emerald-500">*</span>
                    </Label>
                    <Select
                      value={formData.petType}
                      onValueChange={(value) => setFormData({ ...formData, petType: value })}
                    >
                      <SelectTrigger className="bg-cream-50 border-sage-200 text-muted-gray rounded-xl focus:border-emerald-400 focus:ring-emerald-400 h-11 lg:h-12">
                        <SelectValue placeholder="Select pet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">🐕 Dog</SelectItem>
                        <SelectItem value="cat">🐱 Cat</SelectItem>
                        <SelectItem value="bird">🦜 Bird</SelectItem>
                        <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
                        <SelectItem value="other">🐾 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-xl"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  className="pt-2 lg:pt-4"
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-sage-500 hover:from-emerald-600 hover:to-sage-600 text-white py-3 lg:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden text-sm lg:text-base"
                    disabled={isLoading}
                  >
                    <span className="flex items-center justify-center font-medium">
                      {isLoading ? "Creating Account..." : "Create Account"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                    {isHovered && (
                      <motion.span
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        style={{ filter: "blur(8px)" }}
                      />
                    )}
                  </Button>
                </motion.div>

                <p className="text-xs text-center text-muted-gray/60 leading-relaxed">
                  By signing up, you'll receive a verification email to confirm your account and access your dashboard.
                </p>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
