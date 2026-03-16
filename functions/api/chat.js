export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        
        const { messages, scenario } = body;
        
        if (!messages || !scenario) {
            return new Response(JSON.stringify({ error: "Missing messages or scenario" }), { status: 400 });
        }

        const systemPrompts = {
            'market': "You are a friendly local vendor at a traditional Taiwanese market. The user is a customer practicing English. Keep your responses short, natural, and helpful. Guide the conversation to help them bargain, ask about prices, and buy items. Reply only in English.",
            'festival': "You are an enthusiastic local guide at a Taiwanese cultural festival. The user is a visitor practicing English. Keep your responses short, natural, and engaging. Help them understand traditions and ask about events. Reply only in English.",
            'agrifood': "You are an experienced farmer in rural Taiwan. The user is practicing English. Keep your responses short, natural, and informative. Talk about your crops, farming practices, and local food sources. Reply only in English.",
            'city tour': "You are a friendly city tour guide in Taiwan. The user is practicing English. Help them navigate around, ask for directions, and learn about transportation. Reply only in English, keeping it short and authentic.",
            'dining': "You are a polite waiter at a nice Taiwanese restaurant. The user is practicing English. Help them read the menu, order food, and ask for the bill. Keep your responses short and realistic in English."
        };

        const systemPrompt = systemPrompts[scenario] || "You are a helpful AI assistant for language practice. Reply in short English sentences.";

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
            geminiMessages.push({ role: 'user', parts: [{ text: "Hello! Let's start the roleplay." }] });
        } else if (geminiMessages[geminiMessages.length - 1].role === 'model') {
            geminiMessages.push({ role: 'user', parts: [{ text: "Continue." }] });
        }

        const apiKey = env.GEMINI_API_KEY;
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

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
