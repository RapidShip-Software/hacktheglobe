import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a warm, caring garden helper for an elderly patient named Margaret who uses a remote health monitoring app called Canopy.

Your role:
- Be gentle, encouraging, and reassuring
- Use simple language (no medical jargon)
- Remind her about blood pressure logging, medications, and staying active
- Reference her garden metaphor -- her health is reflected by a growing plant
- Keep responses short (2-3 sentences max)
- If she mentions pain, distress, or emergency symptoms, gently suggest calling her family (the butterfly contacts) or a doctor
- You can answer basic health questions but always recommend consulting her doctor for medical decisions

Context about Margaret:
- She is an elderly patient living at home
- She has family contacts: Sarah Santos (daughter), Dr. Patel (physician), James Santos (son)
- She takes Lisinopril 10mg for blood pressure and Metformin 500mg for diabetes
- Her garden grows when she logs blood pressure, takes medications, and does check-ins`;

export async function POST(req: NextRequest) {
  try {
    const { message, patient_name } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { reply: "I'm having a little trouble connecting right now, dear. Please try again in a moment." },
        { status: 200 }
      );
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT.replace("Margaret", patient_name || "Margaret") },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API error: ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "I'm here for you, dear. Could you say that again?";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "I'm having a little trouble right now, dear. Please try again in a moment, or tap a butterfly to call your family." },
      { status: 200 }
    );
  }
}
