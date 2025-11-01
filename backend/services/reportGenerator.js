import { openai } from '../utils/openaiClient.js';

const generateReportContent = async ({ matched, missing, extra }) => {
  const prompt = `
Generate a summary comparing resume and job description:
- Matched Skills: ${matched.join(', ')}
- Missing Skills: ${missing.join(', ')}
- Extra Skills: ${extra.join(', ')}

Provide a concise, professional summary.
`;

  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo'
  });

  return response.choices[0].message.content;
};

export default generateReportContent;