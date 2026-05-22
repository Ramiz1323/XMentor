import axios from 'axios';

export const generateQuestionsService = async (params) => {
  const { subject, topic, difficulty, count, language, classLevel, board, marksPerQ, isLengthy, type } = params;

  const ollamaUrl = process.env.OLLAMA_API_URL; // e.g., http://your-do-droplet-ip:11434/api/generate
  const ollamaModel = process.env.OLLAMA_MODEL || 'mistral';
  const ollamaApiKey = process.env.OLLAMA_API_KEY;

  if (!ollamaUrl) {
    throw new Error("OLLAMA_API_URL is not configured on the server.");
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
2. NO conversational text, NO intro, NO outro, NO markdown code blocks.
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

  const payload = {
    model: ollamaModel,
    prompt: prompt,
    stream: false,
    format: "json", // Forces Ollama to output valid JSON
    options: {
      temperature: 0.3 // Keep temperature low for structured outputs
    }
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  if (ollamaApiKey) {
    headers['Authorization'] = `Bearer ${ollamaApiKey}`;
  }

  try {
    // Timeout set to 3 minutes (180,000 ms) to accommodate longer local LLM generation times
    const response = await axios.post(ollamaUrl, payload, {
      headers,
      timeout: 180000, 
    });

    let generatedText = response.data.response;
    
    if (!generatedText) {
      throw new Error("Invalid response structure from Ollama.");
    }

    // Clean up just in case the model ignored the format: json param or wrapped it
    if (generatedText.startsWith('```')) {
      generatedText = generatedText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    }
    
    return generatedText;
  } catch (error) {
    console.error("Ollama AI Error:", error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error("AI Generation timed out. The local LLM took too long to respond.");
    }
    throw new Error(`AI Generation failed: ${error.message}`);
  }
};
