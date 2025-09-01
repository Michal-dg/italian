const express = require('express');
const fetch = require('node-fetch'); // Render może wymagać tej biblioteki
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); // Serwuje pliki z głównego folderu

// Endpoint API do bezpiecznej komunikacji z Google
app.post('/api/get-speech', async (req, res) => {
  const { text, lang, rate } = req.body;
  const GOOGLE_API_KEY = process.env.GOOGLE_TTS_API_KEY;

  if (!text || !lang || !GOOGLE_API_KEY) {
    return res.status(400).json({ error: 'Brakujące dane lub klucza API na serwerze.' });
  }
  
  const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;
  
  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: text },
        voice: { languageCode: lang, name: 'it-IT-Wavenet-A' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: rate || 1.0 },
      }),
    });
    const data = await apiResponse.json();
    if (!apiResponse.ok) return res.status(apiResponse.status).json(data);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera pośredniczącego.' });
  }
});

// Ważne: upewnij się, że dla każdego innego zapytania serwer odsyła index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});