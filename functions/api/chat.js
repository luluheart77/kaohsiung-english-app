export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const { messages, scenario } = body;

        if (!messages || !scenario) {
            return new Response(JSON.stringify({ error: "Missing messages or scenario" }), { status: 400 });
        }

        // 1. Updated Scenarios
        const systemPrompts = {
            'River Remediation': "You are an environmental guide at Love River.",
            'Sustainable Tourism': "You are a green-travel guide in Kaohsiung.",
            'Industrial Heritage': "You are a historian at Pier-2 warehouses.",
            'Biodiversity': "You are a naturalist at the local wetlands.",
            'default': `You are a friendly guide in Kaohsiung for the scenario: ${scenario}.`
        };

        const persona = systemPrompts[scenario] || systemPrompts['default'];

        // 2. Combined Instructions (Fixes formatting, brevity, and adaptive level)
        const globalInstructions = `
[STRICT RULES]
- PERSONA: ${persona}
- FORMATTING: Use plain text only. NEVER use bold (**) or italics (*).
- LEVEL: Match the user's English level. Use simple A1 English if they are beginners.
- BREVITY: Keep your opening message under 3 sentences.
- OUTPUT: First provide your English reply, then the separator "###TRANS###", then the Traditional Chinese translation.
`;

        const geminiMessages = [];
        for (const msg of messages) {
            if (msg.role === 'system') continue;
            geminiMessages.push({
                role: msg.role === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }

        // 3. Fix: Prepend instructions to the very first user message (Gemma Style)
        if (geminiMessages.length === 0) {
            geminiMessages.push({ 
                role: 'user', 
                parts: [{ text: `${globalInstructions}\n\nHello! Let's start our conversation.` }] 
            });
        } else {
            // Re-inject rules at the top of history to ensure Gemma follows them
            geminiMessages[0].parts[0].text = globalInstructions + "\n\n" + geminiMessages[0].parts[0].text;
        }

        const apiKey = env.GEMINI_API_KEY;
        // 4. Using Gemma 3 model URL
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;

        const geminiReqBody = {
            contents: geminiMessages, // systemInstruction is removed to fix your error
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 250 
            }
        };

        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiReqBody)
        });

        const data = await response.json();
        if (!response.ok) return new Response(JSON.stringify({ error: "Gemini Error", details: data }), { status: 500 });

        // 5. Single-Call Parsing: Split the English and Chinese parts
        const fullText = data.candidates[0].content.parts[0].text.trim();
        const [reply, translation] = fullText.split('###TRANS###').map(s => s.trim());

        return new Response(JSON.stringify({ 
            reply: reply || fullText, 
            translation: translation || "" 
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
