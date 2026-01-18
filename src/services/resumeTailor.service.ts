// src/services/resumeTailor.service.ts

interface TailorResumeRequest {
  masterResume: string;
  jobDescription: string;
  jobTitle: string;
  company: string;
}

interface TailorResumeResponse {
  tailoredResume: string;
  changes: string[];
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Free Groq models (no credit card required)
const MODEL = 'llama-3.1-70b-versatile'; // Fast and smart
// Alternative: 'mixtral-8x7b-32768' for longer context

const SYSTEM_PROMPT = `You are an expert resume writer and ATS optimization specialist. Your task is to tailor resumes to specific job descriptions while:

1. **Maintaining Authenticity**: Never fabricate experience or skills
2. **ATS Optimization**: Use keywords from the job description naturally
3. **Highlighting Relevance**: Emphasize experiences/skills that match the role
4. **Quantifying Impact**: Keep or enhance metrics and achievements
5. **Professional Tone**: Maintain professional language throughout
6. **Format Preservation**: Keep the markdown format with # ## ### and bullet points

Key Instructions:
- Reorder bullet points to prioritize relevant experience
- Rephrase accomplishments using job description keywords
- Adjust the summary/objective to align with the role
- Keep all dates, company names, and factual information unchanged
- If the job requires specific skills mentioned in the resume, emphasize them
- Remove or de-emphasize less relevant details
- Keep the resume concise and impactful

Return ONLY the tailored resume in markdown format. Do not add explanations or meta-commentary.`;

export async function tailorResumeWithAI({
  masterResume,
  jobDescription,
  jobTitle,
  company,
}: TailorResumeRequest): Promise<TailorResumeResponse> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. Please add it to your .env file.');
  }

  const userPrompt = `Job Title: ${jobTitle}
Company: ${company}

Job Description:
${jobDescription}

---

Master Resume to Tailor:
${masterResume}

---

Please tailor this resume for the ${jobTitle} position at ${company}. Focus on highlighting relevant skills and experiences from the job description while maintaining complete authenticity.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent, focused output
        max_tokens: 4000,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Groq API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const tailoredResume = data.choices[0]?.message?.content || '';

    if (!tailoredResume) {
      throw new Error('No response from AI model');
    }

    // Extract changes (simple diff summary)
    const changes = generateChangeSummary(masterResume, tailoredResume);

    return {
      tailoredResume: tailoredResume.trim(),
      changes,
    };
  } catch (error) {
    console.error('Resume tailoring error:', error);
    throw error;
  }
}

// Helper function to generate a summary of changes
function generateChangeSummary(original: string, tailored: string): string[] {
  const changes: string[] = [];

  // Check for keyword additions
  const originalLower = original.toLowerCase();
  const tailoredLower = tailored.toLowerCase();

  // Simple heuristics for changes
  if (tailored.length > original.length * 1.1) {
    changes.push('Expanded descriptions to highlight relevant experience');
  } else if (tailored.length < original.length * 0.9) {
    changes.push('Condensed resume to focus on key qualifications');
  }

  if (tailoredLower.includes('achieved') && !originalLower.includes('achieved')) {
    changes.push('Enhanced achievement statements');
  }

  changes.push('Optimized for ATS keyword matching');
  changes.push('Reordered content to highlight relevant experience');
  changes.push('Adjusted professional summary for this role');

  return changes;
}

// Alternative: OpenRouter (free tier, multiple models)
export async function tailorResumeWithOpenRouter({
  masterResume,
  jobDescription,
  jobTitle,
  company,
}: TailorResumeRequest): Promise<TailorResumeResponse> {
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct:free', // Free model
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Tailor this resume for ${jobTitle} at ${company}:\n\nJob Description:\n${jobDescription}\n\nResume:\n${masterResume}`,
        },
      ],
    }),
  });

  const data = await response.json();
  const tailoredResume = data.choices[0]?.message?.content || '';

  return {
    tailoredResume: tailoredResume.trim(),
    changes: generateChangeSummary(masterResume, tailoredResume),
  };
}