const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
});

const languageMap = {
  ar: 'Arabic',
  am: 'Amharic',
  bg: 'Bulgarian',
  bn: 'Bengali',
  ca: 'Catalan',
  cs: 'Czech',
  da: 'Danish',
  de: 'German',
  el: 'Greek',
  en: 'English',
  en_AU: 'English (Australia)',
  en_GB: 'English (Great Britain)',
  en_US: 'English (USA)',
  es: 'Spanish',
  es_419: 'Spanish (Latin America and Caribbean)',
  et: 'Estonian',
  fa: 'Persian',
  fi: 'Finnish',
  fil: 'Filipino',
  fr: 'French',
  gu: 'Gujarati',
  he: 'Hebrew',
  hi: 'Hindi',
  hr: 'Croatian',
  hu: 'Hungarian',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  kn: 'Kannada',
  ko: 'Korean',
  lt: 'Lithuanian',
  lv: 'Latvian',
  ml: 'Malayalam',
  mr: 'Marathi',
  ms: 'Malay',
  nl: 'Dutch',
  no: 'Norwegian',
  pl: 'Polish',
  pt_BR: 'Portuguese (Brazil)',
  pt_PT: 'Portuguese (Portugal)',
  ro: 'Romanian',
  ru: 'Russian',
  sk: 'Slovak',
  sl: 'Slovenian',
  sr: 'Serbian',
  sv: 'Swedish',
  sw: 'Swahili',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  vi: 'Vietnamese',
  zh_CN: 'Chinese (China)',
  zh_TW: 'Chinese (Taiwan)'
};

async function translateStrings(targetLang) {
  const sourceFile = path.join(__dirname, '..', '_locales', 'en', 'messages.json');
  const targetDir = path.join(__dirname, '..', '_locales', targetLang);
  const targetFile = path.join(targetDir, 'messages.json');

  // Read source strings
  const sourceStrings = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Prepare screenshots
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const screenshots = fs.readdirSync(screenshotsDir)
    .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
    .map(file => fs.readFileSync(path.join(screenshotsDir, file)));

  // Prepare prompt
  const prompt = `Assume a role of a professional app localizer. Translate the attached strings from English to ${languageMap[targetLang]}. Make it sound natural in the target language, however try to preserve the initial tone of voice. Only reply with the translated strings in JSON format.`;

  // Split strings into chunks if needed
  const chunkSize = 50; // Adjust this value based on API limits
  const stringChunks = Object.entries(sourceStrings).reduce((chunks, [key, value]) => {
    const lastChunk = chunks[chunks.length - 1];
    if (lastChunk.length < chunkSize) {
      lastChunk.push([key, value]);
    } else {
      chunks.push([[key, value]]);
    }
    return chunks;
  }, [[]]);

  let translatedStrings = {};
  let totalChunks = stringChunks.length;

  console.log(`Starting translation to ${targetLang}. Total chunks: ${totalChunks}`);

  for (let i = 0; i < stringChunks.length; i++) {
    const chunk = stringChunks[i];
    console.log(`Translating chunk ${i + 1}/${totalChunks} (${chunk.length} strings)`);

    const chunkObject = Object.fromEntries(chunk);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: JSON.stringify(chunkObject, null, 2) },
            ...screenshots.map(screenshot => ({
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${screenshot.toString('base64')}`,
              },
            })),
          ],
        },
      ],
      max_tokens: 4096,
      response_format: {
        type: 'json_object',
      },
    });

    const translatedChunk = JSON.parse(response.choices[0].message.content);
    translatedStrings = { ...translatedStrings, ...translatedChunk };

    console.log(`Chunk ${i + 1}/${totalChunks} translated successfully`);
  }

  console.log(`All chunks translated. Writing to file...`);

  // Write translated strings to file
  fs.writeFileSync(targetFile, JSON.stringify(translatedStrings, null, 2));
  console.log(`Translated strings saved to ${targetFile}`);
  console.log(`Translation to ${targetLang} completed successfully`);
}

async function translateStoreDescription(targetLang) {
  const sourceFile = path.join(__dirname, '..', '_locales', 'en', 'store_description.txt');
  const targetDir = path.join(__dirname, '..', '_locales', targetLang);
  const targetFile = path.join(targetDir, 'store_description.txt');

  // Read source store description
  const sourceDescription = fs.readFileSync(sourceFile, 'utf8');

  console.log(`Translating store description to ${targetLang}`);

  const prompt = `Assume the role of a professional app localizer. Translate the following store description from English to ${languageMap[targetLang]}. Make it sound natural in the target language, but preserve the initial tone and marketing style. Only reply with the translated text.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: sourceDescription },
    ],
    max_tokens: 4096,
  });

  const translatedDescription = response.choices[0].message.content.trim();

  // Write translated store description to file
  fs.writeFileSync(targetFile, translatedDescription);
  console.log(`Translated store description saved to ${targetFile}`);
}

const targetLang = process.argv[2];
if (!targetLang) {
  console.error('Please provide a target language code as an argument.');
  process.exit(1);
}

(async () => {
  await translateStrings(targetLang);
  await translateStoreDescription(targetLang);
})();