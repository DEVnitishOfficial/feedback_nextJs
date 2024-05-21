import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const prompt = "Create a list of three open-ended and engaging questions formatted as a singl string, Each question should be seperated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensetive topics, focusing insted on unversal themes that encourage  friendly interection. For example your output should be stractured like this : 'what's a hobby you've recently started?|| if you could have dinner with any historical figure, who would it be?|| What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curisoity, and contribute to a positive and welcoming conversational environment."

    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      max_tokens:200,
      stream: true,
      prompt,
    })
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error
      return NextResponse.json({
        name, status, message, headers
      }, { status })
    } else {
      console.error("An unexpected error occured ", error)
      throw error
    }
    console.log(error)
  }
}

