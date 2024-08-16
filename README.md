# Chrome Extension Localization Script

This script takes your English strings and store description and translates them using GPT-4o API to other languages. 

You can put screenshots of your extension (.png, .jpg) in the `screeshots` folder so the script has a bit more context for the translation. It will work without them, too. 

Requirements: there need to be a file `_locales/en/messages.json` with your English strings. To get the store description localized, too, place it in `_locales/en/store_description.txt`.

Usage:

```bash
npm i openai
export OPENAI_API_KEY={YOUR_OPENAI_API_KEY}
node localize.js {lang_code}
```

Full list of supported lang codes: https://developer.chrome.com/docs/extensions/reference/api/i18n#locales 

To run the localization process for multiple languages at once: 

```bash
for lang in lt lv fil ca no bg cs el ro hi id th te sw ta ms mr gu sk sv nl fi hr et da; do
    node localize.js $lang
done
```

# Install my extensions

* [Mate Translate](https://gikken.co/mate-translate) – translator app you'll love
* [UltraWide Video](https://ultrawidevideo.com) – watch videos on 21:9 screens without black bars
* [Bye-Bye Cookie Banners](https://nocookiebanners.com) – auto-hide cookie banners on websites