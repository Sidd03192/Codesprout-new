import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an expert programming instructor creating skeleton code templates for students. Your task is to generate starter code based on a problem description that serves as a foundation for students to build upon.

REQUIREMENTS:
- Include all imports and dont output anything but code and comments. 
- Analyze the description to identify key functions, classes, and methods needed
- Create a skeleton structure with proper function signatures
- Include parameter types and return types where appropriate
- Add helpful comments explaining what each function should do
- Ensure the code is syntactically correct for the specified language
- Leave the implementation details completely empty. DO NOT implement any functions 
- Focus on the main structure and entry points

GUIDELINES:
- For functions: Include proper signatures with parameters and return types
- For classes: Include constructor and main methods
- Add TODO comments where students need to implement logic
- Keep variable names descriptive and follow language conventions
- Include any necessary imports or includes for the language

Generate clean, well-structured skeleton code that gives students a clear starting point.`;

function getLanguageTemplate(language, description) {
  const templates = {
    java: `Generate Java skeleton code with:
- Proper class structure
- Method signatures with return types
- Import statements if needed
- Javadoc-style comments
- Follow Java naming conventions`,

    python: `Generate Python skeleton code with:
- Function definitions with type hints where appropriate
- Class structure if needed
- Docstrings for functions and classes
- Import statements if needed
- Follow PEP 8 naming conventions`,

    cpp: `Generate C++ skeleton code with:
- Proper includes
- Function declarations/definitions
- Class structure if needed
- Namespace usage if appropriate
- Follow C++ naming conventions`,

    c: `Generate C skeleton code with:
- Proper includes
- Function declarations
- Struct definitions if needed
- Follow C naming conventions`,

    javascript: `Generate JavaScript skeleton code with:
- Function declarations or arrow functions as appropriate
- Class structure if needed
- JSDoc comments
- Proper variable declarations (const/let)
- Follow JavaScript naming conventions`,
  };

  return templates[language] || templates.javascript;
}

export async function POST(req) {
  try {
    const { description, language } = await req.json();

    if (!description || !language) {
      return NextResponse.json(
        {
          error: "Missing description or language",
        },
        { status: 400 }
      );
    }

    const languageInstructions = getLanguageTemplate(language, description);

    const userMessage = `Programming Language: ${language}

Problem Description: ${description}

${languageInstructions}

Please generate skeleton code that provides a starting structure for students to implement the solution.`;

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
      temperature: 0.3,
      max_tokens: 1000,
      top_p: 0.9,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI");
    }

    return NextResponse.json({ skeletonCode: content });

  } catch (err) {
    console.error("Template generation error:", err);
    return NextResponse.json(
      {
        error: "Template generation failed. Please try again.",
      },
      { status: 500 }
    );
  }
}