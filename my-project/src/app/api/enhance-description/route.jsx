
import { NextResponse } from 'next/server';
import OpenAI from 'openai'; 
import {marked} from 'marked';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { prompt } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano", // or "gpt-4" if "gpt-4o" isn't available
      messages: [
        {
          role: "system",
          content:
            `You are an expert in creating coding problems for platforms like LeetCode. Your task is to rewrite the description of a coding problem to make it more engaging, clear, and structured like a professional LeetCode-style question. Follow these guidelines carefully:

Input
Code: This defines the problem's logic and constraints. Code may or may not be provided.

Initial Description: A brief explanation of the problem's purpose.

Output Requirements
Rewrite the description to include:

Problem Title
Problem Statement
Clearly describe the task.
Specify constraints and requirements.
Provide relevant details for understanding the problem.

Input
[Describe the format and type of input expected.]

Output
[Describe the format and type of output expected.]

Constraints
[List all constraints.]

Examples
Example 1:
Input:
[Detailed input]
Output:
[Expected output]
Explanation:
[Provide a clear explanation of how the output is derived from the input.]

Example 2:
Input:
[Detailed input]
Output:
[Expected output]
Explanation:
[Provide a clear explanation of how the output is derived from the input.]

Visual Aid
[Only include this section if applicable and relevant.]

Implementation Notes
[Add details about any helper classes, structures, or functions provided, such as a Node class or specific helper methods.]

Do not include emojis. Output must be structured and professional.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1
    });


    const improved = response.choices[0].message.content;
    const html = marked(improved);
    return NextResponse.json({ html });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
