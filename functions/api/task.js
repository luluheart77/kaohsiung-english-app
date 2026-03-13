export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        
        const { action, scenario, userMessage, currentTasks } = body;
        const apiKey = env.GEMINI_API_KEY;
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        if (action === 'evaluate_tasks') {
            // Evaluates if the user's message met any of the current tasks
            const evalPrompt = `
You are a strict but fair language evaluator. The user is in a scenario: ${scenario}.
The user said: "${userMessage}"
Here are their current open tasks:
${currentTasks.map(t => `- ID ${t.id}: ${t.question}`).join('\n')}

Determine if the user's message successfully completes any of these tasks accurately.
Return a JSON array of task IDs that were completed. If none, return an empty array.
Output ONLY raw JSON like [1, 2] without markdown wrapping or code blocks.
            `;

            const response = await fetch(apiURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: evalPrompt }] }],
                    generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
                })
            });

            const data = await response.json();
            if(!response.ok) throw new Error(JSON.stringify(data));
            
            const rawOutput = data.candidates[0].content.parts[0].text.trim();
            let completedIds = [];
            try {
                completedIds = JSON.parse(rawOutput);
            } catch (e) {
                console.error("Failed to parse completion JSON:", rawOutput);
            }

            return new Response(JSON.stringify({ completedIds }), { headers: { 'Content-Type': 'application/json' } });
        }

        if (action === 'request_hint') {
            const history = body.history;
            const hintPrompt = `
The user is learning English in a scenario: ${scenario}.
Here is the recent conversation history:
${history.map(m => `${m.role}: ${m.content}`).join('\n')}

Provide ONE short, natural sentence the user could say next to continue the conversation or accomplish a relevant goal. Provide ONLY the English sentence, no quotes, no explanations.
            `;
            
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: hintPrompt }] }],
                    generationConfig: { temperature: 0.6 }
                })
            });
            const data = await response.json();
            const hintRaw = data.candidates[0].content.parts[0].text.trim();
            
            return new Response(JSON.stringify({ hint: hintRaw }), { headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
