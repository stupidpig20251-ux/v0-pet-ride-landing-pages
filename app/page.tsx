"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SignupModal } from "@/components/signup-modal"
import { SuccessModal } from "@/components/success-modal"
import { Clock, Shield, Heart, Star } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function HomePage() {
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setIsSuccessOpen(true)
    }

    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [searchParams])

  const handleSignupSuccess = () => {
    setIsSuccessOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-lg border-b border-border/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-lg sm:text-xl">🐾</span>
            </div>
            <span className="text-xl sm:text-2xl font-serif font-bold text-foreground">PetRide</span>
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-sm sm:text-base px-3 sm:px-4">
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground hidden sm:block">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
            </div>
          ) : (
            <Button className="wellness-button text-sm sm:text-base px-4 sm:px-6" onClick={() => setIsSignupOpen(true)}>
              Login / Sign up
            </Button>
          )}
        </div>
      </header>

      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 wellness-gradient-1">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="mb-8 sm:mb-12">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl"></div>
              <img
                src="/cute-pet-mascot-in-circular-frame.jpg"
                alt="PetRide mascot"
                className="relative mx-auto w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover shadow-2xl border-4 border-white/50"
              />
            </div>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-bold text-foreground mb-6 sm:mb-8 text-balance">
            Awaken Your Pet's
            <span className="block text-foreground">Inner Journey</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
            Mindful, serene pet transportation for conscious professionals. Because your beloved companion deserves
            peaceful journeys filled with care and tranquility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Button
              size="lg"
              onClick={() => setIsSignupOpen(true)}
              className="wellness-button text-base sm:text-lg shadow-xl"
            >
              Begin the Journey
            </Button>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="ghost"
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border border-primary/30 rounded-full hover:bg-primary/5"
              >
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-foreground mb-12 sm:mb-16">
            Why mindful professionals choose PetRide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="wellness-card p-6 sm:p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium mb-3 sm:mb-4">Sacred Time</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Honor your commitments while we tenderly care for your pet's transportation needs with mindful
                attention.
              </p>
            </div>

            <div className="wellness-card p-6 sm:p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium mb-3 sm:mb-4">Loving Care</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Compassionate drivers create a serene environment where your pet feels safe, loved, and at peace.
              </p>
            </div>

            <div className="wellness-card p-6 sm:p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium mb-3 sm:mb-4">Trusted Protection</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Certified caregivers, gentle handling, and complete insurance provide the peace of mind you deserve.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 wellness-gradient-2">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-foreground mb-12 sm:mb-16">
            Your Pet's Mindful Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="relative mb-6 sm:mb-8">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-white">1</span>
                </div>
                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl"></div>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium mb-3 sm:mb-4">Gentle Booking</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Schedule with intention through our peaceful app, sharing your pet's unique needs and destination.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6 sm:mb-8">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-white">2</span>
                </div>
                <div className="absolute -inset-4 bg-accent/10 rounded-full blur-xl"></div>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium mb-3 sm:mb-4">Mindful Arrival</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Our certified pet companion arrives with a tranquil vehicle designed for your pet's comfort and
                serenity.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6 sm:mb-8">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-white">3</span>
                </div>
                <div className="absolute -inset-4 bg-primary/5 rounded-full blur-xl"></div>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium mb-3 sm:mb-4">Peaceful Delivery</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Your beloved companion arrives refreshed and calm. Receive gentle updates and photos throughout their
                journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-8 sm:mb-12">
            Cherished by mindful pet parents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-serif font-bold text-primary mb-2 sm:mb-3">450+</div>
              <p className="text-muted-foreground text-sm sm:text-base">Peaceful Journeys</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-serif font-bold text-primary mb-2 sm:mb-3">12</div>
              <p className="text-muted-foreground text-sm sm:text-base">Mindful Cities</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-serif font-bold text-primary mb-2 sm:mb-3">98%</div>
              <p className="text-muted-foreground text-sm sm:text-base">Serenity Rating</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="wellness-card p-6 sm:p-8 text-left">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed italic text-sm sm:text-base">
                "PetRide brought such peace to my hectic day. Luna arrived at the vet completely calm and happy. The
                gentle updates throughout gave me such comfort during my important meeting."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mr-3 sm:mr-4">
                  <img src="/professional-woman-avatar.png" alt="Sarah" className="rounded-full" />
                </div>
                <div>
                  <p className="font-serif font-medium text-sm sm:text-base">Sarah M.</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Wellness Coach</p>
                </div>
              </div>
            </div>

            <div className="wellness-card p-6 sm:p-8 text-left">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed italic text-sm sm:text-base">
                "The mindful approach to pet care is exactly what I needed. Max actually looks forward to his rides now.
                Such a beautiful service for conscious pet parents."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mr-3 sm:mr-4">
                  <img src="/professional-man-avatar.png" alt="Michael" className="rounded-full" />
                </div>
                <div>
                  <p className="font-serif font-medium text-sm sm:text-base">Michael R.</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Meditation Teacher</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 wellness-gradient-1">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-6 sm:mb-8 text-balance">
            Ready to embrace mindful pet care?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 leading-relaxed">
            Join our community of conscious professionals who trust PetRide for serene, loving pet transportation.
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="wellness-button text-lg sm:text-xl shadow-2xl">
                View Dashboard
              </Button>
            </Link>
          ) : (
            <Button
              size="lg"
              onClick={() => setIsSignupOpen(true)}
              className="wellness-button text-lg sm:text-xl shadow-2xl"
            >
              Begin Your Journey
            </Button>
          )}
          <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
            Experience the first mindful pet transportation service
          </p>
        </div>
      </section>

      <footer className="border-t border-border py-8 sm:py-12 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs sm:text-sm">🐾</span>
                </div>
                <span className="font-bold text-card-foreground text-sm sm:text-base">PetRide</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Safe, reliable pet transportation for busy professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-card-foreground mb-2 sm:mb-3 text-sm sm:text-base">Services</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>Vet Appointments</li>
                <li>Grooming Trips</li>
                <li>Pet Daycare</li>
                <li>Emergency Transport</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-card-foreground mb-2 sm:mb-3 text-sm sm:text-base">Company</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Safety</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-card-foreground mb-2 sm:mb-3 text-sm sm:text-base">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Driver Requirements</li>
                <li>Insurance</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 PetRide. All rights reserved. Made with ❤️ for pets and their humans.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} onSuccess={handleSignupSuccess} />
      <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} />
    </div>
  )
}
