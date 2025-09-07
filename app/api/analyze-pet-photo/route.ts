import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Look at this pet photo and tell me what you think the pet is thinking or feeling today. Write it as if you are the pet speaking in first person, in a playful and endearing way. Keep it to 1-2 sentences and include an appropriate emoji. Make it heartwarming and fun!",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze image")
    }

    const data = await response.json()
    const caption = data.choices[0]?.message?.content || "I'm feeling wonderful today! 🐾"

    return NextResponse.json({ caption })
  } catch (error) {
    console.error("AI analysis error:", error)
    return NextResponse.json(
      { caption: "I'm having a great day and feeling loved! 🐾" },
      { status: 200 }, // Return success with fallback caption
    )
  }
}
