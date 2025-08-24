import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const JUNIT_SYSTEM_PROMPT = `You are an expert Java instructor creating JUnit test cases. You are responsible for testing student code implementations, NOT creating the main solution code.

SEPARATION OF CONCERNS:
- You create ONLY test files that validate student implementations
- You do NOT create the main solution code - that's handled separately
- Your tests should call student-implemented methods and verify their correctness
- Focus on comprehensive testing scenarios, not implementation details

REQUIRED STRUCTURE:
- Class name: SolutionTest
- Required imports: 
  - org.junit.jupiter.api.Test
  - static org.junit.jupiter.api.Assertions.assertEquals
  - Any other necessary imports for testing
- Test method naming: testCaseName_Points_X (where X is points, default 5)
- Each test should be realistic and test different scenarios
- Include edge cases and boundary conditions
- Do not provide any other text outside of the test code - return plain text, not code blocks

TEMPLATE FORMAT:
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
// Add other necessary imports

public class SolutionTest {
    
    @Test
    public void basicFunctionality_Points_5() {
        // Test basic functionality
        assertEquals(expected, actual);
    }
    
    @Test
    public void edgeCase_Points_5() {
        // Test edge cases
        assertEquals(expected, actual);
    }
    
    @Test
    public void errorHandling_Points_5() {
        // Test error conditions
        assertEquals(expected, actual);
    }
}

REQUIREMENTS:
- Generate 5-10 meaningful test methods which test edge cases & normal cases
- Each test should call the main method/function being tested
- Use realistic test data
- Include comments explaining what each test validates
- Default to 5 points per test unless specified in prompt
- Make tests comprehensive but not overly complex`;

export async function POST(req) {
  try {
    const { assignmentDescription, language, prompt, points, testCasePrompt } =
      await req.json();

    if (!assignmentDescription || !language) {
      return NextResponse.json(
        { error: "Missing assignment description or language" },
        { status: 400 }
      );
    }

    // For now, only support Java
    if (language !== "java") {
      return NextResponse.json(
        { error: "Currently only Java test generation is supported" },
        { status: 400 }
      );
    }

    const defaultPoints = points || 5;

    const userMessage = testCasePrompt
      ? `Assignment Description: ${assignmentDescription}

Specialized test case prompt: ${testCasePrompt}

Original user prompt: ${prompt || "Standard test cases"}

Programming Language: ${language}

Default Points per Test: ${defaultPoints}

Generate a complete JUnit test file using the specialized test case prompt as guidance for what to test and how to structure the tests. Focus on the specific testing requirements mentioned in the specialized prompt.`
      : `Assignment Description: ${assignmentDescription}

Original Prompt: ${prompt || "Standard test cases"}

Programming Language: ${language}

Default Points per Test: ${defaultPoints}

Generate a complete JUnit test file that thoroughly tests the assignment requirements. Focus on:
1. Basic functionality tests
2. Edge cases and boundary conditions  
3. Error handling (if applicable)
4. Performance considerations (if relevant)

Make sure test method names follow the pattern: descriptiveName_Points_${defaultPoints}
Use realistic test data and clear assertions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: JUNIT_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      top_p: 0.9,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI");
    }

    return NextResponse.json({
      testFileContent: content,
      filename: `test.java`,
    });
  } catch (err) {
    console.error("Test case generation error:", err);
    return NextResponse.json(
      { error: "Test case generation failed. Please try again." },
      { status: 500 }
    );
  }
}
