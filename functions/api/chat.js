export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        
        const { messages, scenario } = body;
        
        if (!messages || !scenario) {
            return new Response(JSON.stringify({ error: "Missing messages or scenario" }), { status: 400 });
        }

        const systemPrompts = {
            // Match the 'title_en' fields from your kaohsiung_tour_data.json
            'River Remediation': "You are an environmental guide at the Love River. Help the user learn about the river's cleanup history while practicing English. Start with a warm welcome.",
            'Sustainable Tourism': "You are a green-travel guide. Help the user explore Kaohsiung's eco-friendly transit like solar boats. Start with a warm welcome.",
            'Industrial Heritage': "You are a cultural historian at Pier-2. Talk about how old warehouses became art. Start with a warm welcome.",
            'Biodiversity': "You are a naturalist at the wetlands. Talk about mangroves and local birds. Start with a warm welcome.",
            // Fallback generic prompt
            'default': `You are a friendly local guide in Kaohsiung. The scenario is: ${scenario}. Help the user practice English while learning about the area.`
        };

    const globalRules = `
    STRICT CONSTRAINTS:
    1. FORMATTING: Use plain text ONLY. Do not use bold (**) or italics (*).
    2. ADAPTIVE LEVEL: Continuously analyze the user's English level. If they use simple words and short sentences, reply using A1-A2 level English. If they use complex grammar, you may use B2-C1 level English.
    3. BREVITY: Keep your opening message under 3 sentences.
    `;

    const systemPrompt = (systemPrompts[scenario] || "You are a helpful AI assistant.") + globalRules;

        const geminiMessages = [];

        // Format history for Gemini API
        for (const msg of messages) {
            if (msg.role === 'system') continue;
            geminiMessages.push({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }

        // Gemini requires the last message to be from the user, or at least one user message to start.
        if (geminiMessages.length === 0) {
            geminiMessages.push({ 
                role: 'user', 
                parts: [{ text: `Hello! Please introduce yourself very briefly (maximum 2 sentences) and start our roleplay in the ${scenario} scenario.` }] 
            });
        }

        const apiKey = env.GEMINI_API_KEY;
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;

        const geminiReqBody = {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: geminiMessages,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 150 
            }
        };

        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(geminiReqBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Error:", data);
            return new Response(JSON.stringify({ error: "Error from Gemini API", details: data }), { status: 500 });
        }

        const replyRaw = data.candidates[0].content.parts[0].text.trim();
        
        // Let's ask Gemini to also provide a Traditional Chinese translation in a structured way for hints.
        const translateBody = {
            contents: [{
                role: "user",
                parts: [{ text: `Translate the following English text to fluent Traditional Chinese (Taiwanese flavor) for a language learner. Do not provide any other text, just the translation.\n\nText: ${replyRaw}` }]
            }]
        };
        const transResponse = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(translateBody)
        });
        const transData = await transResponse.json();
        let translation = "";
        if (transResponse.ok && transData.candidates && transData.candidates.length > 0) {
            translation = transData.candidates[0].content.parts[0].text.trim();
        }

        return new Response(JSON.stringify({ reply: replyRaw, translation: translation }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
