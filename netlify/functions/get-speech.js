// Plik: netlify/functions/get-speech.js
// Usunęliśmy linię z 'require("node-fetch")'

exports.handler = async function (event) {
  const { text, lang, rate } = JSON.parse(event.body);
  const GOOGLE_API_KEY = process.env.GOOGLE_TTS_API_KEY;

  if (!text || !lang || !GOOGLE_API_KEY) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Brakujące dane lub klucza API na serwerze.' }),
    };
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

    if (!apiResponse.ok) {
      return { statusCode: apiResponse.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Błąd funkcji serwerowej.' }),
    };
  }
};