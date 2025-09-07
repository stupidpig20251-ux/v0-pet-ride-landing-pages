"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function WaitlistCompletePage() {
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    petType: "",
    city: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
        return
      }

      setUser(user)
      // Pre-populate name from Google profile
      setFormData((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
      }))
    }

    getUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Check if user is already in waitlist
      const { data: existing } = await supabase.from("waitlist").select("id").eq("email", user.email).single()

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("waitlist")
          .update({
            name: formData.name,
            phone: formData.phone,
            pet_type: formData.petType,
            city: formData.city,
            user_id: user.id,
          })
          .eq("email", user.email)

        if (updateError) throw updateError
      } else {
        // Insert new record
        const { error: insertError } = await supabase.from("waitlist").insert({
          name: formData.name,
          email: user.email,
          phone: formData.phone,
          pet_type: formData.petType,
          city: formData.city,
          user_id: user.id,
        })

        if (insertError) throw insertError
      }

      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-sage-500 flex items-center justify-center shadow-lg shadow-emerald-200 mx-auto mb-4">
            <Heart className="text-white h-8 w-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-muted-gray mb-2">Complete Your Waitlist</h1>
          <p className="text-muted-gray/70 text-sm">Just a few more details to get you on the list!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-muted-gray mb-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-50 border-gray-200 text-muted-gray rounded-xl"
            />
          </div>

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
              className="bg-cream-50 border-sage-200 placeholder:text-muted-gray/50 text-muted-gray rounded-xl focus:border-emerald-400 focus:ring-emerald-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                className="bg-cream-50 border-sage-200 placeholder:text-muted-gray/50 text-muted-gray rounded-xl focus:border-emerald-400 focus:ring-emerald-400"
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
                className="bg-cream-50 border-sage-200 placeholder:text-muted-gray/50 text-muted-gray rounded-xl focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="petType" className="block text-sm font-medium text-muted-gray mb-2">
              Pet Type <span className="text-emerald-500">*</span>
            </Label>
            <Select value={formData.petType} onValueChange={(value) => setFormData({ ...formData, petType: value })}>
              <SelectTrigger className="bg-cream-50 border-sage-200 text-muted-gray rounded-xl focus:border-emerald-400 focus:ring-emerald-400">
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

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-xl"
            >
              {error}
            </motion.p>
          )}

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-sage-500 hover:from-emerald-600 hover:to-sage-600 text-white py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              <span className="flex items-center justify-center font-medium">
                {isLoading ? "Joining..." : "Complete Waitlist"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}
