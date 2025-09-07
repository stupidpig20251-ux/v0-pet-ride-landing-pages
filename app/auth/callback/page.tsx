import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; google_signup?: string }>
}) {
  const params = await searchParams
  const code = params.code
  const isGoogleSignup = params.google_signup === "true"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: existingProfile } = await supabase.from("waitlist").select("id").eq("user_id", user.id).single()

        if (existingProfile || isGoogleSignup) {
          // For Google OAuth users without existing profile, create basic waitlist entry
          if (!existingProfile && isGoogleSignup) {
            try {
              const { error: insertError } = await supabase.from("waitlist").insert({
                user_id: user.id,
                name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
                email: user.email,
                phone: user.user_metadata?.phone || "",
                pet_type: "dog", // Default value
                city: user.user_metadata?.city || "",
              })

              if (insertError) {
                console.error("Error creating waitlist entry:", insertError)
              }
            } catch (error) {
              console.error("Error in Google signup flow:", error)
            }
          }
          redirect("/dashboard")
        } else {
          redirect("/waitlist/complete")
        }
      }
    }
  }

  redirect("/")
}
