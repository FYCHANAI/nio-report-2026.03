// 檔案位置：api/gemini.js
export default async function handler(req, res) {
    // 1. 只允許 POST 請求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. 從前端接收使用者的問題與系統指令
    const { prompt, systemInstruction } = req.body;
    
    // 3. 從 Vercel 環境變數中安全讀取 API Key (這裡不會寫死金鑰)
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: '伺服器缺少 API 金鑰' });
    }

    const fullPrompt = `${systemInstruction}\n\n用戶的請求是：${prompt}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    try {
        // 4. 由後端伺服器去向 Google 發送請求
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || 'Google API 發生錯誤' });
        }

        // 5. 將成功的結果回傳給前端
        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
