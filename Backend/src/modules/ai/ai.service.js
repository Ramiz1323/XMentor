import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Define the client outside so it's initialized once
const createBedrockClient = () => {
  if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn("AWS credentials missing. Bedrock generation will fail.");
    return null;
  }
  return new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
};

const client = createBedrockClient();

export const generateQuestionsService = async (params) => {
  const { subject, topic, difficulty, count, language, classLevel, board, marksPerQ, isLengthy, type } = params;

  if (!client) {
    throw new Error("AWS credentials are not configured on the server.");
  }

  let prompt = '';

  if (type === 'MCQ') {
    const complexityTxt = isLengthy 
      ? 'Focus on lengthy, multi-step calculative and theory based problems where students need to solve on paper before selecting the option (JEE/NEET/WBCHSE Style).' 
      : 'Focus on conceptual clarity and rapid theoretical analysis.';

    let subjectSpecificRules = '';
    if (subject === 'PHYSICS' || subject === 'SCIENCE') {
      subjectSpecificRules = `
PHYSICS/SCIENCE RULES:
- ALL units MUST be in LaTeX (e.g., $m/s^2$, $kg \\cdot m/s$).
- Use scientific notation in LaTeX (e.g., $3 \\times 10^8 m/s$).`;
    } else if (subject === 'CHEMISTRY') {
      subjectSpecificRules = `
CHEMISTRY RULES:
- Use LaTeX for all chemical formulas (e.g., $H_2SO_4$, $Fe^{2+}$).
- Use LaTeX for equilibrium arrows and reactions (e.g., $\\rightarrow$, $\\rightleftharpoons$).`;
    }

    prompt = `Act as a high-level academic curriculum architect. Generate a JSON array of ${count} MCQ questions for class ${classLevel || 'General'} students studying ${board || 'Standards'}.
The entire content MUST be in ${language === 'bengali' ? 'BENGALI' : 'ENGLISH'} language.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Instruction: ${complexityTxt}
${subjectSpecificRules}

CRITICAL FORMATTING RULES:
1. Output MUST be a valid JSON array of objects ONLY.
2. NO conversational text, NO intro, NO outro, NO markdown code blocks (NO \`\`\`json).
3. ALL mathematical expressions MUST be wrapped in LaTeX delimiters ($...$ for inline, $$...$$ for block).
4. **JSON ESCAPING**: Use DOUBLE backslashes for all LaTeX commands in the JSON string (e.g., "\\\\frac{a}{b}").
5. Randomly distribute the correct answer index across 0, 1, 2, and 3.
6. The "answer" field MUST be an integer from 0 to 3.

JSON SCHEMA: 
[{"question": "string", "options": ["string", "string", "string", "string"], "answer": integer, "explanation": "string"}]

Return ONLY the raw JSON array. DO NOT WRAP IN MARKDOWN.`;
  } else {
    // Subjective
    prompt = `Act as a high-level academic curriculum architect for ${board || 'Standards'} board. 
Language: ${language === 'bengali' ? 'BENGALI' : 'ENGLISH'}
Class/Grade: ${classLevel || 'General'}
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Requirement: Generate a JSON array of ${count} SUBJECTIVE (Long Answer) questions.

CRITICAL FORMATTING RULES:
1. Output MUST be a valid JSON array of objects ONLY.
2. NO conversational text, NO intro, NO outro, NO markdown code blocks.
3. ALL mathematical expressions MUST be wrapped in LaTeX delimiters ($...$ for inline, $$...$$ for block).
4. **JSON ESCAPING**: Use DOUBLE backslashes for all LaTeX commands in the JSON string (e.g., "\\\\frac{a}{b}").
5. Format: Return ONLY a JSON array of objects. Example: [{"text": "Question text with $\\\\frac{a}{b}$ math", "marks": ${marksPerQ || 2}}]

Return ONLY the raw JSON array. DO NOT WRAP IN MARKDOWN.`;
  }

  // Claude 3 Haiku Payload
  // Anthropic Claude 3 models use the Messages API
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          }
        ]
      }
    ]
  };

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract text from Claude 3 response
    let generatedText = responseBody.content[0].text;
    
    // Clean up if the AI wrapped it in markdown
    if (generatedText.startsWith('```')) {
      generatedText = generatedText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    }
    
    return generatedText;
  } catch (error) {
    console.error("Bedrock AI Error:", error);
    throw new Error(`AI Generation failed: ${error.message}`);
  }
};
