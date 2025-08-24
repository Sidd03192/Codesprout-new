import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an expert programming instructor creating assignment metadata and test case specifications. Your task is to generate assignment structure data that will coordinate with existing description and code generation APIs.

CRITICAL DATE CALCULATION REQUIREMENTS:
- You MUST parse the current date/time from the user message exactly as provided
- suggestedOpenDate = current date/time + 30 minutes (MANDATORY)
- suggestedDueDate = suggestedOpenDate + 1-7 days based on complexity (MANDATORY)
- ALL dates must be in ISO 8601 format (e.g., "2025-08-23T14:30:00.000Z")
- NEVER use placeholder dates like "2024-01-15" - calculate from actual current time

EXAMPLE DATE CALCULATION:
If current time is "2025-08-23T14:00:00.000Z":
- suggestedOpenDate should be "2025-08-23T14:30:00.000Z" (current + 30 min)
- suggestedDueDate should be "2025-08-30T23:59:00.000Z" (open + 7 days for complex assignment)

STRICT REQUIREMENTS:
- Return ONLY valid JSON in the exact format specified below
- Generate realistic dates based on the current date provided in the user message
- Create appropriate rubric sections based on assignment type
- Default settings: autoGrade=true, checkStyle=true, allowCopyPaste=true, showResults=true, maxAttempts=1
- Generate comprehensive test case specifications
- Locked Lines should contain the lines which include import statements, class declaration, and method headers

SEPARATION OF CONCERNS:
- descriptionPrompt: For problem description enhancement (clear problem statement)
- codePrompt: For skeleton code generation (structure, method signatures, imports)
- TEST CASES: Handled separately - do NOT include test case code in codePrompt
- When user mentions "test cases", generate test case specifications, not code examples

OUTPUT FORMAT (must be valid JSON):
{
  "title": "Assignment Title (concise, descriptive)",
  "classId": "choose id from classes provided or leave blank if none specified",
  "language": "java|python|cpp|c|javascript",
  "suggestedOpenDate": "ISO 8601 date string - current date + 30 minutes",
  "suggestedDueDate": "ISO 8601 date string - open date + appropriate duration",
  "rubric": [
    {
      "id": "section_1",
      "title": "Implementation Requirements",
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
      "title": "Quality and Style",
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
    "maxAttempts": unlimited,
    "allowLateSubmission": false
  },
  "lockedLines": [1, 2, 3, 5, 8],
  "descriptionPrompt": "Detailed prompt for the enhance-description API",
  "codePrompt": "Detailed prompt for the generate-template API",
  "testCasePrompt": "Detailed prompt for the generate-test-cases API"
}

PARSING RULES:
- ALWAYS calculate suggestedOpenDate as current date/time + 30 minutes
- ALWAYS calculate suggestedDueDate as suggestedOpenDate + appropriate duration (1-7 days based on assignment complexity)
- If user mentions specific dates, parse and use them appropriately
- If user specifies different settings (like "unlimited attempts"), override defaults
- Adjust difficulty and rubric based on mentioned course level (intro vs advanced)
- Create 2-4 rubric sections with 1-3 items each, total points around 50-100
- Generate specific prompts for description, code generation, and test case APIs
- Create comprehensive test case structure with multiple scenarios
- testCasePrompt should specify what types of tests to create (unit tests, edge cases, etc.)
- For lockedLines: Determine which lines should be locked based on assignment requirements:
  * Always lock import statements (typically lines 1-3)
  * Always lock class declaration line
  * Always lock method headers/signatures that students must implement
  * Lock any structural elements mentioned in prompt (interfaces, abstract classes, etc.)
  * Use 1-based line numbering
  * Example: [1, 2, 3, 5, 8] means lock lines 1, 2, 3, 5, and 8
  Do not forget to lock lines!
REMEMBER: You must calculate the actual dates based on the current date provided, not use example dates!`;

export async function POST(req) {
  try {
    const { prompt, classes, language = "java" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const currentDate = new Date();
    const currentDateTimeStr = currentDate.toISOString();

    const userMessage = `CURRENT DATE/TIME (USE THIS EXACTLY): ${currentDateTimeStr}

Classes available: ${JSON.stringify(classes, null, 2)}

User prompt: ${prompt}

Programming language: ${language}

MANDATORY DATE CALCULATIONS:
1. Parse the current date/time above: ${currentDateTimeStr}
2. Calculate suggestedOpenDate = ${currentDateTimeStr} + 30 minutes
3. Calculate suggestedDueDate = suggestedOpenDate + 1-7 days (based on assignment complexity)
4. Format both dates in ISO 8601 format

EXAMPLE FOR THIS REQUEST:
Current time: ${currentDateTimeStr}
Your suggestedOpenDate should be: ${new Date(currentDate.getTime() + 30 * 60 * 1000).toISOString()}
Your suggestedDueDate should be around: ${new Date(currentDate.getTime() + 30 * 60 * 1000 + 7 * 24 * 60 * 60 * 1000).toISOString()}

Generate assignment metadata with ACCURATE dates, test case specifications, and specialized prompts for description/code generation APIs. Follow the JSON format exactly.`;

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
      let assignmentMetadata;
      try {
        assignmentMetadata = JSON.parse(content);
      } catch (jsonError) {
        console.error("JSON parsing failed, attempting to extract JSON from response:", content);
        // Try to find JSON within the response if AI included extra text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          assignmentMetadata = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No valid JSON found in AI response");
        }
      }

      // Validate that dates are properly set (fallback validation)
      if (
        !assignmentMetadata.suggestedOpenDate ||
        !assignmentMetadata.suggestedDueDate
      ) {
        console.warn("AI failed to generate dates, using fallback calculation");
        // Fallback date calculation
        const fallbackOpenDate = new Date(currentDate.getTime() + 30 * 60 * 1000); // +30 minutes
        const fallbackDueDate = new Date(fallbackOpenDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
        
        assignmentMetadata.suggestedOpenDate = fallbackOpenDate.toISOString();
        assignmentMetadata.suggestedDueDate = fallbackDueDate.toISOString();
      }

      // Ensure dates are valid
      const openDate = new Date(assignmentMetadata.suggestedOpenDate);
      const dueDate = new Date(assignmentMetadata.suggestedDueDate);

      if (isNaN(openDate.getTime()) || isNaN(dueDate.getTime())) {
        console.warn("AI generated invalid date format, using fallback calculation");
        // Fallback date calculation with proper format
        const fallbackOpenDate = new Date(currentDate.getTime() + 30 * 60 * 1000); // +30 minutes
        const fallbackDueDate = new Date(fallbackOpenDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
        
        assignmentMetadata.suggestedOpenDate = fallbackOpenDate.toISOString();
        assignmentMetadata.suggestedDueDate = fallbackDueDate.toISOString();
        
        // Re-validate with corrected dates
        const correctedOpenDate = new Date(assignmentMetadata.suggestedOpenDate);
        const correctedDueDate = new Date(assignmentMetadata.suggestedDueDate);
        
        if (isNaN(correctedOpenDate.getTime()) || isNaN(correctedDueDate.getTime())) {
          throw new Error("Failed to generate valid dates");
        }
      }

      // Validate date logic
      const finalOpenDate = new Date(assignmentMetadata.suggestedOpenDate);
      const finalDueDate = new Date(assignmentMetadata.suggestedDueDate);

      if (finalOpenDate <= currentDate) {
        console.warn("Open date is not after current time, adjusting");
        const adjustedOpenDate = new Date(currentDate.getTime() + 30 * 60 * 1000);
        assignmentMetadata.suggestedOpenDate = adjustedOpenDate.toISOString();
      }

      if (finalDueDate <= finalOpenDate) {
        console.warn("Due date is not after open date, adjusting");
        const adjustedDueDate = new Date(finalOpenDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        assignmentMetadata.suggestedDueDate = adjustedDueDate.toISOString();
      }

      // Validate that specialized prompts are present
      if (!assignmentMetadata.descriptionPrompt) {
        console.warn("Missing descriptionPrompt, using fallback");
        assignmentMetadata.descriptionPrompt = `Create a clear and detailed problem description for: ${prompt}`;
      }

      if (!assignmentMetadata.codePrompt) {
        console.warn("Missing codePrompt, using fallback");
        assignmentMetadata.codePrompt = `Generate skeleton code for: ${prompt}. Language: ${language}`;
      }

      if (!assignmentMetadata.testCasePrompt) {
        console.warn("Missing testCasePrompt, using fallback");
        assignmentMetadata.testCasePrompt = `Generate comprehensive test cases for: ${prompt}. Include edge cases and boundary conditions.`;
      }

      // Add debugging information
      console.log("Generated assignment metadata:", {
        title: assignmentMetadata.title,
        openDate: assignmentMetadata.suggestedOpenDate,
        dueDate: assignmentMetadata.suggestedDueDate,
        hasDescriptionPrompt: !!assignmentMetadata.descriptionPrompt,
        hasCodePrompt: !!assignmentMetadata.codePrompt,
        hasTestCasePrompt: !!assignmentMetadata.testCasePrompt
      });

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
