"use strict";

const Translator = require("../components/translator.js");

module.exports = function (app) {
  const translator = new Translator();

  app.route("/api/translate").post((req, res) => {
    const { text, locale } = req.body;

    // Check for required fields
    if (!locale || text === undefined) {
      return res.json({ error: "Required field(s) missing" });
    }

    // Check for empty text
    if (text === "") {
      return res.json({ error: "No text to translate" });
    }

    let translation = "";

    // Translate text based on locale
    if (locale === "american-to-british") {
      translation = translator.toBritishEnglish(text);
    } else if (locale === "british-to-american") {
      translation = translator.toAmericanEnglish(text);
    } else {
      return res.json({ error: "Invalid value for locale field" });
    }

    // Check if translation is the same as the original text
    if (translation === text || !translation) {
      return res.json({ text, translation: "Everything looks good to me!" });
    } else {
      return res.json({ text, translation: translation[1] });
    }
  });
};
