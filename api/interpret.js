export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { dream, religion } = req.body;
    if (!dream) return res.status(400).json({ error: 'স্বপ্নের বর্ণনা প্রয়োজন' });

    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    if (!CLAUDE_API_KEY) {
        return res.status(500).json({ error: 'API Key সেট করা হয়নি' });
    }

    const isSanatan = religion === 'sanatan';
    const scriptureRef = isSanatan
        ? "বেদ, পুরাণ (বিষ্ণু পুরাণ, অগ্নি পুরাণ, গরুড় পুরাণ), উপনিষদ ও সনাতন স্বপ্নশাস্ত্র"
        : "কুরআন ও হাদিস (বিশেষত ইবনে সিরিনের স্বপ্নের কিতাব)";
    const actionCtx = isSanatan
        ? "কোন পূজা, মন্ত্র, দান বা আচার পালন করা উচিত"
        : "কোন দোয়া, আমল বা ইবাদত করা উচিত";
    const systemPrompt = isSanatan
        ? "আপনি একজন অভিজ্ঞ সনাতন ধর্মীয় স্বপ্ন বিশেষজ্ঞ। শুধুমাত্র বাংলায় উত্তর দিন।"
        : "আপনি একজন অভিজ্ঞ ইসলামিক স্বপ্ন বিশেষজ্ঞ। শুধুমাত্র বাংলায় উত্তর দিন।";

    const userPrompt = `ইউজারের স্বপ্ন: "${dream}"

**১. স্বপ্নের সংক্ষিপ্ত অর্থ**
সংক্ষেপে বলুন।

**২. ধর্মগ্রন্থে কী বলা আছে**
${scriptureRef} অনুযায়ী বলুন।

**৩. ভবিষ্যতে কী হতে পারে**
বিস্তারিত বলুন।

**৪. এখন কী করা উচিত**
${actionCtx} — বিস্তারিত বলুন।`;

    try {
        const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userPrompt }
                ]
            })
        });

        if (!apiRes.ok) {
            const err = await apiRes.json();
            throw new Error(err?.error?.message || `HTTP ${apiRes.status}`);
        }

        const data = await apiRes.json();
        return res.status(200).json({ text: data.content[0].text });

    } catch (e) {
        return res.status(500).json({ error: `AI ত্রুটি: ${e.message}` });
    }
}    for (let i = 0; i < API_KEYS.length; i++) {
        try {
            const apiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEYS[i]}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                    })
                }
            );
            if (apiRes.status === 429 || apiRes.status === 403) continue;
            if (!apiRes.ok) {
                const err = await apiRes.json();
                throw new Error(err?.error?.message || `HTTP ${apiRes.status}`);
            }
            const data = await apiRes.json();
            return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
        } catch (e) {
            if (i === API_KEYS.length - 1) {
                return res.status(500).json({ error: `AI ত্রুটি: ${e.message}` });
            }
        }
    }
    return res.status(429).json({ error: 'সব API key এর limit শেষ।' });
                                                                                                                                                                                                                                    }
