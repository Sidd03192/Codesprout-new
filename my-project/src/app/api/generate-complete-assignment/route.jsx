import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an expert programming instructor creating assignment metadata and test case specifications. Your task is to generate assignment structure data that will coordinate with existing description and code generation APIs.

STRICT REQUIREMENTS:
- Return ONLY valid JSON in the exact format specified below
- Generate realistic dates (open date should be near current time, due date typically 1-7 days later unless specified)
- Create appropriate rubric sections based on assignment type
- Default settings: autoGrade=true, checkStyle=true, allowCopyPaste=true, showResults=true, maxAttempts=1
- Generate comprehensive test case specifications

OUTPUT FORMAT (must be valid JSON):
{
  "title": "Assignment Title (concise, descriptive)",
  "classId": (choose id from classes provided above / leave blank)
  "language": "java|python|cpp|c|javascript",
  "suggestedOpenDate": "2024-01-15T09:00:00.000Z" (this value must be 30min greater than todays date),
  "suggestedDueDate": "2024-01-22T23:59:59.000Z",
  "rubric": [
    {
      "id": "section_1",
      "title": "Code Implementation",
      "items": [
        {
          "id": "item_1_1", 
          "name": "Correct algorithm implementation",
          "maxPoints": 25,
          "autograde": true
        }
      ],
      "isNameEditable": true,
      "canAddItems": true,
      "autograde": true
    },
    {
      "id": "section_2", 
      "title": "Code Quality",
      "items": [
        {
          "id": "item_2_1",
          "name": "Code style and formatting", 
          "maxPoints": 15,
          "autograde": false
        }
      ],
      "isNameEditable": true,
      "canAddItems": true,
      "autograde": false
    }
  ],
  "settings": {
    "autoGrade": true,
    "checkStyle": true,
    "allowCopyPaste": true,
    "showResults": true,
    "maxAttempts": 1,
    "allowLateSubmission": false
  },
  "lockedLines": [1, 2, 3, 5, 8],
  "descriptionPrompt": "Detailed prompt for the enhance-description API",
  "codePrompt": "Detailed prompt for the generate-template API"
}

PARSING RULES:
- If user mentions specific dates, parse them appropriately. suggestedOpenDate must be greater than today 11:59pm if no start date provided in prompt
- If user specifies different settings (like "unlimited attempts"), override defaults
- Adjust difficulty and rubric based on mentioned course level (intro vs advanced)
- Create 2-4 rubric sections with 1-3 items each, total points around 50-100
- Generate specific prompts for description and code generation APIs
- Create comprehensive test case structure with multiple scenarios
- For lockedLines: Determine which lines should be locked based on assignment requirements:
  * Always lock import statements (typically lines 1-3)
  * Always lock class declaration line
  * Always lock method headers/signatures that students must implement
  * Lock any structural elements mentioned in prompt (interfaces, abstract classes, etc.)
  * Use 1-based line numbering
  * Example: [1, 2, 3, 5, 8] means lock lines 1, 2, 3, 5, and 8`;

export async function POST(req) {
  try {
    const { prompt, classes, language = "java" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split("T")[0];

    const userMessage = `Current date: ${currentDateStr}

    Classes: ${JSON.stringify(classes)}

User prompt: ${prompt}

Programming language: ${language}

Generate assignment metadata, test case specifications, and prompts for description/code generation APIs. Follow the JSON format exactly.`;

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
      max_tokens: 2000,
      top_p: 0.9,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI");
    }

    try {
      // Parse the JSON response
      const assignmentMetadata = JSON.parse(content);
      return NextResponse.json(assignmentMetadata);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, "Content:", content);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Complete assignment generation error:", err);
    return NextResponse.json(
      { error: "Assignment generation failed. Please try again." },
      { status: 500 }
    );
  }
}
