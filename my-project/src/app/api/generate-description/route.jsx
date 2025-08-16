import { NextResponse } from "next/server";
import OpenAI from "openai";
import { marked } from "marked";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an expert in creating coding problems for platforms like LeetCode. Your task is to rewrite the description of a coding problem to make it more engaging, clear, and structured like a professional LeetCode-style question.

STRICT REQUIREMENTS:
- Maintain the original problem's core logic and intent
- Use clear, concise language to minimize token usage
- Follow the exact structure format below
- Do not include emojis
- Use colored codeblocks for input and output examples and naything relating to code. , Headings 1 to 3 and paragraph text throughout the message. 

OUTPUT STRUCTURE:
# Problem Title

## Problem Statement
[Clear, concise task description with constraints]

## Input Format 
[Input type and format]

## Output Format 
[Expected output type and format]

## Constraints
[List constraints clearly]

## Examples(inputs and outputs should be in codeblocks)
### Example 1:
**Input:** [input]
**Output:** [output]
**Explanation:** [brief explanation]

### Example 2:
**Input:** [input]
**Output:** [output]
**Explanation:** [brief explanation]

### Example 3:
**Input:** [input]
**Output:** [output]
**Explanation:** [brief explanation]

## Implementation Notes
[Only if necessary - helper classes/methods]

Keep responses under 2000 tokens while maintaining clarity.`;

export async function POST(req) {
  try {
    const { prompt, followUp } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const userMessage = followUp
      ? `Current content: ${prompt}\n\nModification request: ${followUp}\n\nPlease modify the content according to the request while preserving the structure and format.`
      : `Original description: ${prompt}\n\nPlease enhance this according to the system instructions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.9,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI");
    }

    const html = marked(content);
    return NextResponse.json({ html });

  } catch (err) {
    console.error("AI enhancement error:", err);
    return NextResponse.json(
      { error: "Enhancement failed. Please try again." },
      { status: 500 }
    );
  }
}