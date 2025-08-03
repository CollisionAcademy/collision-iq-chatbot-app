const { onRequest } = require('firebase-functions/v2/https');
const { VertexAI } = require('@google-cloud/vertexai');
const cors = require('cors')({ origin: true });

const vertexAI = new VertexAI({
  project: 'collision-iq-chatbot-467804',
  location: 'us-central1',
});

const model = vertexAI.getGenerativeModel({ model: 'gemini-pro' });

exports.getGeminiReply = onRequest({ region: 'us-central1' }, async (req, res) => {
  cors(req, res, async () => {
    try {
      const userMessage = req.body?.message?.toString?.() || 'Hello from Firebase!';
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
      });

      const reply = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) throw new Error('No reply from Gemini.');

      res.json({ reply });
    } catch (error) {
      console.error('Gemini error:', error);
      res.status(500).send('Gemini failed');
    }
  });
});
