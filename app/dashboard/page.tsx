"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  Car,
  PawPrint,
  User,
  LogOut,
  Plus,
  MessageCircle,
  Bell,
  Home,
  Settings,
  Star,
  Navigation,
  ChevronRight,
  Camera,
} from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  email: string
  name: string
  phone: string
  city: string
  pet_type: string
  pet_name: string
  created_at: string
}

interface Ride {
  id: string
  pickup_location: string
  dropoff_location: string
  pickup_time: string
  status: "driver_assigned" | "en_route" | "pet_picked_up" | "in_transit" | "delivered" | "completed"
  driver_name?: string
  driver_avatar?: string
  car_model?: string
  license_plate?: string
  pet_notes?: string
  created_at: string
  rating?: number
}

interface JournalEntry {
  id: string
  image_url: string
  ai_caption: string // Changed from caption to ai_caption to match database schema
  timestamp: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [rides, setRides] = useState<Ride[]>([])
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      const mockProfile: UserProfile = {
        id: "demo-user",
        email: user?.email || "jessica@petride.com",
        name: user?.user_metadata?.full_name || "Jessica Chen",
        phone: "+1 (555) 123-4567",
        city: "San Francisco",
        pet_type: "dog",
        pet_name: "Rover",
        created_at: "2024-01-01T00:00:00Z",
      }

      if (user) {
        const { data: profileData } = await supabase.from("waitlist").select("*").eq("user_id", user.id).single()
        if (profileData) {
          setProfile({ ...profileData, pet_name: "Rover" })
        } else {
          setProfile(mockProfile)
        }
      } else {
        setProfile(mockProfile)
      }

      const mockRides: Ride[] = [
        {
          id: "1",
          pickup_location: "123 Main St, Downtown",
          dropoff_location: "Pet Paradise Vet, Uptown",
          pickup_time: "2024-01-25T14:30:00Z",
          status: "in_transit",
          driver_name: "Sarah Johnson",
          driver_avatar: "/professional-woman-avatar.png",
          car_model: "Honda CR-V",
          license_plate: "ABC-123",
          pet_notes: "Friendly golden retriever, loves treats",
          created_at: "2024-01-25T13:00:00Z",
        },
        {
          id: "2",
          pickup_location: "456 Oak Ave, Midtown",
          dropoff_location: "Happy Paws Grooming",
          pickup_time: "2024-01-26T10:00:00Z",
          status: "driver_assigned",
          driver_name: "Mike Chen",
          driver_avatar: "/professional-man-avatar.png",
          car_model: "Toyota Prius",
          license_plate: "XYZ-789",
          pet_notes: "Small cat, gets nervous in cars",
          created_at: "2024-01-24T16:00:00Z",
        },
        {
          id: "3",
          pickup_location: "789 Pine St, Westside",
          dropoff_location: "Central Park Dog Run",
          pickup_time: "2024-01-15T09:15:00Z",
          status: "completed",
          driver_name: "Emma Wilson",
          rating: 5,
          pet_notes: "Energetic husky, needs secure carrier",
          created_at: "2024-01-14T20:30:00Z",
        },
      ]
      setRides(mockRides)

      if (user) {
        const { data: journalData } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (journalData) {
          setJournalEntries(
            journalData.map((entry) => ({
              id: entry.id,
              image_url: entry.image_url,
              ai_caption: entry.ai_caption, // Changed from entry.caption to entry.ai_caption to match database schema
              timestamp: entry.created_at,
            })),
          )
        }
      }

      setIsLoading(false)
    }

    getUser()
  }, [])

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "driver_assigned":
        return { text: "Driver assigned", emoji: "🐾", color: "bg-blue-100 text-blue-800" }
      case "en_route":
        return { text: "Driver en route", emoji: "🚗", color: "bg-yellow-100 text-yellow-800" }
      case "pet_picked_up":
        return { text: "Pet picked up", emoji: "🐶", color: "bg-purple-100 text-purple-800" }
      case "in_transit":
        return { text: "In transit", emoji: "🚕", color: "bg-orange-100 text-orange-800" }
      case "delivered":
        return { text: "Delivered", emoji: "🎉", color: "bg-green-100 text-green-800" }
      case "completed":
        return { text: "Completed", emoji: "✅", color: "bg-emerald-100 text-emerald-800" }
      default:
        return { text: "Unknown", emoji: "❓", color: "bg-gray-100 text-gray-800" }
    }
  }

  const currentRide = rides.find((ride) =>
    ["driver_assigned", "en_route", "pet_picked_up", "in_transit"].includes(ride.status),
  )
  const upcomingRides = rides.filter((ride) => ["driver_assigned"].includes(ride.status))
  const pastRides = rides.filter((ride) => ride.status === "completed")

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    setIsUploading(true)
    try {
      const supabase = createClient()
      console.log("[v0] Starting file upload:", file.name)

      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = fileName // Simplified path

      console.log("[v0] Uploading to path:", filePath)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pet-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("[v0] Upload error details:", uploadError)
        throw uploadError
      }

      console.log("[v0] File uploaded to storage:", uploadData.path)

      const {
        data: { publicUrl },
      } = supabase.storage.from("pet-photos").getPublicUrl(filePath)

      console.log("[v0] Public URL:", publicUrl)

      let ai_caption = "Looking adorable as always! 🐾"
      try {
        const analysisResponse = await fetch("/api/analyze-pet-photo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: publicUrl }),
        })

        if (analysisResponse.ok) {
          const result = await analysisResponse.json()
          ai_caption = result.caption || ai_caption
        } else {
          console.warn("[v0] AI analysis failed, using default caption")
        }
      } catch (aiError) {
        console.warn("[v0] AI analysis error:", aiError)
      }

      console.log("[v0] AI caption generated:", ai_caption)

      const { data: journalData, error: journalError } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user?.id || null,
          image_url: publicUrl,
          ai_caption: ai_caption,
        })
        .select()
        .single()

      if (journalError) {
        console.error("[v0] Database insert error:", journalError)
        throw journalError
      }

      console.log("[v0] Journal entry saved:", journalData)

      const newEntry: JournalEntry = {
        id: journalData.id,
        image_url: publicUrl,
        ai_caption: ai_caption,
        timestamp: journalData.created_at,
      }

      setJournalEntries((prev) => [newEntry, ...prev])

      console.log("[v0] Upload completed successfully")
    } catch (error) {
      console.error("[v0] Upload error:", error)
      alert(`Failed to upload photo: ${error.message || "Please try again."}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-muted-gray">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-emerald-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-sm border-r border-sage-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-sage-500 flex items-center justify-center">
              <PawPrint className="text-white h-4 w-4" />
            </div>
            <span className="ml-2 text-lg font-serif font-bold text-muted-gray">PetRide</span>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: Home },
              { id: "rides", label: "My Rides", icon: Car },
              { id: "journal", label: "Journal", icon: Camera },
              { id: "messages", label: "Messages", icon: MessageCircle },
              { id: "profile", label: "Profile", icon: User },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                  activeSection === item.id
                    ? "bg-emerald-100 text-emerald-900"
                    : "text-muted-gray hover:bg-sage-50 hover:text-muted-gray"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-sage-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-sage-500 flex items-center justify-center">
              <PawPrint className="text-white h-4 w-4" />
            </div>
            <span className="text-lg font-serif font-bold text-muted-gray">PetRide</span>
          </div>
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-muted-gray" />
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-sage-500 text-white text-sm">
                {profile?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Dashboard Section */}
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center lg:text-left"
                >
                  <h1 className="text-2xl lg:text-3xl font-serif font-bold text-muted-gray mb-2">
                    Hi {profile?.name} 👋
                  </h1>
                  <p className="text-muted-gray/70 text-lg">
                    {currentRide
                      ? `${profile?.pet_name}'s next ride is ${getStatusDisplay(currentRide.status).text.toLowerCase()}!`
                      : `${profile?.pet_name} is ready for the next adventure!`}
                  </p>
                </motion.div>

                {/* Next Ride Card (Centerpiece) */}
                {currentRide && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-emerald-50 to-sage-50 border-emerald-200 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-serif text-muted-gray">Current Ride</CardTitle>
                          <Badge className={getStatusDisplay(currentRide.status).color}>
                            {getStatusDisplay(currentRide.status).emoji} {getStatusDisplay(currentRide.status).text}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={currentRide.driver_avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-emerald-500 text-white">
                              {currentRide.driver_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-muted-gray">{currentRide.driver_name}</p>
                            <p className="text-sm text-muted-gray/70">
                              {currentRide.car_model} • {currentRide.license_plate}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-muted-gray">{currentRide.pickup_location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            <span className="text-sm text-muted-gray">{currentRide.dropoff_location}</span>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                            <Navigation className="h-4 w-4 mr-2" />
                            Track Ride
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat with Driver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Secondary Sections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Upcoming Rides */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
                      <CardHeader>
                        <CardTitle className="text-lg font-serif text-muted-gray">Upcoming Rides</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {upcomingRides.length > 0 ? (
                          upcomingRides.map((ride) => (
                            <div key={ride.id} className="p-3 bg-cream-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-gray">{ride.driver_name}</span>
                                <span className="text-xs text-muted-gray/60">
                                  {new Date(ride.pickup_time).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-muted-gray/70">{ride.pickup_location}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-gray/60 text-center py-4">No upcoming rides</p>
                        )}
                        <Button
                          variant="outline"
                          className="w-full border-sage-200 text-sage-700 hover:bg-sage-50 bg-transparent"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Book New Ride
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Ride History */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
                      <CardHeader>
                        <CardTitle className="text-lg font-serif text-muted-gray">Recent History</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {pastRides.slice(0, 3).map((ride) => (
                          <div key={ride.id} className="p-3 bg-cream-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-gray">{ride.driver_name}</span>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < (ride.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-muted-gray/70">{ride.pickup_location}</p>
                          </div>
                        ))}
                        <Button variant="ghost" className="w-full text-sage-700 hover:bg-sage-50">
                          View All History
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Notifications */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
                      <CardHeader>
                        <CardTitle className="text-lg font-serif text-muted-gray">Notifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm font-medium text-blue-900">Safety Reminder</p>
                          <p className="text-xs text-blue-700 mt-1">Always check your driver's ID before the ride</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-400">
                          <p className="text-sm font-medium text-emerald-900">Special Offer</p>
                          <p className="text-xs text-emerald-700 mt-1">Get 20% off your next 3 rides this month!</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            )}

            {/* My Rides Section */}
            {activeSection === "rides" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-serif font-bold text-muted-gray">My Rides</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Rides */}
                  <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif text-muted-gray">Upcoming</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {upcomingRides.map((ride) => (
                        <div key={ride.id} className="p-4 border border-sage-100 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={getStatusDisplay(ride.status).color}>
                              {getStatusDisplay(ride.status).emoji} {getStatusDisplay(ride.status).text}
                            </Badge>
                            <span className="text-sm text-muted-gray/60">
                              {new Date(ride.pickup_time).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                              <span className="text-sm text-muted-gray">{ride.pickup_location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                              <span className="text-sm text-muted-gray">{ride.dropoff_location}</span>
                            </div>
                          </div>
                          <Button className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600">Track Ride</Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Past Rides */}
                  <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif text-muted-gray">Past Rides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pastRides.map((ride) => (
                        <div key={ride.id} className="p-4 border border-sage-100 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-muted-gray">{ride.driver_name}</span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < (ride.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                              <span className="text-sm text-muted-gray">{ride.pickup_location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                              <span className="text-sm text-muted-gray">{ride.dropoff_location}</span>
                            </div>
                          </div>
                          {!ride.rating && (
                            <Button
                              variant="outline"
                              className="w-full mt-3 border-sage-200 text-sage-700 hover:bg-sage-50 bg-transparent"
                            >
                              Rate Ride
                            </Button>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Messages Section */}
            {activeSection === "messages" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-serif font-bold text-muted-gray">Messages</h1>
                <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-gray/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-gray mb-2">No messages yet</h3>
                    <p className="text-muted-gray/60">Your driver conversations will appear here</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-serif font-bold text-muted-gray">Profile</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Info */}
                  <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif text-muted-gray">Pet Owner Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-4">
                          <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-sage-500 text-white text-lg">
                            {profile?.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-medium text-muted-gray">{profile?.name}</h3>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-muted-gray/60" />
                          <span className="text-sm text-muted-gray">{profile?.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-muted-gray/60" />
                          <span className="text-sm text-muted-gray">{profile?.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-muted-gray/60" />
                          <span className="text-sm text-muted-gray">{profile?.city}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pet Info */}
                  <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif text-muted-gray">Pet Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-sage-100 flex items-center justify-center">
                          <img
                            src="/cute-pet-mascot-in-circular-frame.jpg"
                            alt="Pet"
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        </div>
                        <h3 className="text-xl font-medium text-muted-gray">{profile?.pet_name}</h3>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <PawPrint className="h-4 w-4 text-muted-gray/60" />
                          <Badge className="bg-emerald-100 text-emerald-800 capitalize">{profile?.pet_type}</Badge>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Heart className="h-4 w-4 text-muted-gray/60" />
                          <span className="text-sm text-muted-gray">
                            Loved since {new Date(profile?.created_at || "2024-01-01").getFullYear()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Settings */}
                <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-serif text-muted-gray">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-sage-200 text-muted-gray hover:bg-sage-50 bg-transparent"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notification Preferences
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-sage-200 text-muted-gray hover:bg-sage-50 bg-transparent"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Privacy Settings
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-sage-200 text-muted-gray hover:bg-sage-50 bg-transparent"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Journal Section */}
            {activeSection === "journal" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-serif font-bold text-muted-gray">Pet Journal</h1>
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => document.getElementById("photo-upload")?.click()}
                    disabled={isUploading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Add Photo"}
                  </Button>
                </div>

                {/* Upload Section */}
                <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
                  <CardContent className="p-6">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        dragActive ? "border-emerald-400 bg-emerald-50" : "border-sage-300 hover:border-emerald-400"
                      } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => !isUploading && document.getElementById("photo-upload")?.click()}
                    >
                      <Camera className="h-12 w-12 text-muted-gray/40 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-gray mb-2">
                        {isUploading ? "Uploading..." : `Share ${profile?.pet_name}'s moment`}
                      </h3>
                      <p className="text-muted-gray/60 mb-4">
                        {isUploading
                          ? "Please wait while we process your photo..."
                          : "Upload a photo and let AI tell you what your pet is thinking today"}
                      </p>
                      <Button className="bg-emerald-500 hover:bg-emerald-600" disabled={isUploading}>
                        {isUploading ? "Processing..." : "Choose Photo"}
                      </Button>

                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Gallery */}
                <div className="space-y-4">
                  <h2 className="text-xl font-serif font-semibold text-muted-gray">Photo Memories</h2>

                  {/* Apple Photos Style Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {journalEntries.length > 0 ? (
                      journalEntries.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="group cursor-pointer"
                        >
                          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={entry.image_url || "/placeholder.svg"}
                              alt={`${profile?.pet_name}'s moment`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                          </div>

                          {/* Caption and timestamp */}
                          <div className="mt-2 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-sage-200">
                            <p className="text-sm text-muted-gray leading-relaxed mb-2">"{entry.ai_caption}"</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-gray/60">
                                {new Date(entry.timestamp).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-xs text-muted-gray/60">
                                {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      /* Show empty state when no entries exist */
                      <div className="col-span-full text-center py-12">
                        <Camera className="h-16 w-16 text-muted-gray/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-gray mb-2">No photos yet</h3>
                        <p className="text-muted-gray/60 mb-6">Start capturing {profile?.pet_name}'s special moments</p>
                        <Button
                          className="bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => document.getElementById("photo-upload")?.click()}
                          disabled={isUploading}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Upload First Photo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-sage-200">
        <div className="grid grid-cols-5 py-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "rides", label: "My Rides", icon: Car },
            { id: "journal", label: "Journal", icon: Camera },
            { id: "messages", label: "Messages", icon: MessageCircle },
            { id: "profile", label: "Profile", icon: User },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center py-2 px-1 transition-colors ${
                activeSection === item.id ? "text-emerald-600" : "text-muted-gray/60"
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
