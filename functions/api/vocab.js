export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const { botReply, scenario, topicId } = body;

        if (!botReply) {
            return new Response(JSON.stringify({ words: [] }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apiKey = env.GEMINI_API_KEY;
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const extractPrompt = `You are a vocabulary extraction assistant for a sustainability education app about Kaohsiung, Taiwan.

The app covers ALL 17 UN Sustainable Development Goals (SDGs), including:
- SDG 1 (No Poverty), SDG 2 (Zero Hunger), SDG 3 (Good Health), SDG 4 (Quality Education)
- SDG 5 (Gender Equality), SDG 6 (Clean Water), SDG 7 (Clean Energy), SDG 8 (Decent Work)
- SDG 9 (Industry & Innovation), SDG 10 (Reduced Inequalities), SDG 11 (Sustainable Cities)
- SDG 12 (Responsible Consumption), SDG 13 (Climate Action), SDG 14 (Life Below Water)
- SDG 15 (Life on Land), SDG 16 (Peace & Justice), SDG 17 (Partnerships)

From this AI tutor reply in a scenario about "${scenario}", extract up to 3 important English vocabulary words or phrases that a language learner should know. Focus on:
- Sustainability / SDG-related terms (environmental, social, economic, governance, cultural)
- Technical or specialized vocabulary used in the reply
- Words that appear bolded (**word**) or used as key concepts
- Domain-specific terms related to the scenario topic

For each word/phrase, provide:
- The English word/phrase
- A concise Traditional Chinese translation (2-6 characters ideally)
- Which SDG numbers it relates to (1-17, pick 1-3 most relevant)

AI reply to analyze:
"${botReply}"

Return ONLY a JSON array. No markdown, no explanation. Format:
[{"word": "...", "zh": "...", "sdgs": [11, 13]}, ...]

If no meaningful vocabulary found, return: []`;

        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: extractPrompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 400,
                    responseMimeType: 'application/json',
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Gemini vocab error:', data);
            return new Response(JSON.stringify({ words: [] }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '[]';
        let words = [];
        try {
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed)) {
                words = parsed
                    .filter(w => w && typeof w.word === 'string' && typeof w.zh === 'string')
                    .map(w => ({
                        word: w.word.trim(),
                        zh: w.zh.trim(),
                        sdgs: Array.isArray(w.sdgs) ? w.sdgs.filter(n => Number.isInteger(n) && n >= 1 && n <= 17) : [11],
                        topicId: topicId || null,
                    }))
                    .slice(0, 3);
            }
        } catch (e) {
            console.error('Vocab parse error:', rawText);
        }

        return new Response(JSON.stringify({ words }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Vocab endpoint error:', error);
        return new Response(JSON.stringify({ words: [], error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}