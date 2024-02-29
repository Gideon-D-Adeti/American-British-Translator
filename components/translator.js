const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");

const reverseDict = (obj) => {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
};

class Translator {
  toBritishEnglish(text) {
    const dict = { ...americanOnly, ...americanToBritishSpelling };
    const titles = americanToBritishTitles;
    const timeRegex = /([1-9]|1[012]):[0-5][0-9]/g;
    const translated = this.translate(
      text,
      dict,
      titles,
      timeRegex,
      "toBritish"
    );
    if (!translated) {
      return text;
    }

    return translated;
  }

  toAmericanEnglish(text) {
    const dict = { ...britishOnly, ...reverseDict(americanToBritishSpelling) };
    const titles = reverseDict(americanToBritishTitles);
    const timeRegex = /([1-9]|1[012]).[0-5][0-9]/g;
    const translated = this.translate(
      text,
      dict,
      titles,
      timeRegex,
      "toAmerican"
    );
    if (!translated) {
      return text;
    }
    return translated;
  }

  translate(text, dict, titles, timeRegex, locale) {
    const lowerText = text.toLowerCase();
    const matchesMap = {};

    // Search for titles/honorifics and add'em to the matchesMap object
    Object.entries(titles).forEach(([k, v]) => {
      if (lowerText.includes(k)) {
        matchesMap[k] = v.charAt(0).toUpperCase() + v.slice(1);
      }
    });

    // Filter words with spaces from current dictionary
    const wordsWithSpace = Object.fromEntries(
      Object.entries(dict).filter(([k]) => k.includes(" "))
    );

    // Search for spaced word matches and add'em to the matchesMap object
    Object.entries(wordsWithSpace).forEach(([k, v]) => {
      if (lowerText.includes(k)) {
        matchesMap[k] = v;
      }
    });

    // Search for individual word matches and add'em to the matchesMap object
    lowerText.match(/(\w+([-'])(\w+)?['-]?(\w+))|\w+/g).forEach((word) => {
      if (dict[word]) matchesMap[word] = dict[word];
    });

    // Search for time matches and add'em to the matchesMap object
    const matchedTimes = lowerText.match(timeRegex);

    if (matchedTimes) {
      matchedTimes.forEach((e) => {
        if (locale === "toBritish") {
          matchesMap[e] = e.replace(":", ".");
        } else {
          matchesMap[e] = e.replace(".", ":");
        }
      });
    }

    // No matches
    if (Object.keys(matchesMap).length === 0) return null;

    const translation = this.replaceAll(text, matchesMap);
    const translationWithHighlight = this.replaceAllWithHighlight(
      text,
      matchesMap
    );

    return [translation, translationWithHighlight];
  }

  replaceAll(text, matchesMap) {
    const re = new RegExp(Object.keys(matchesMap).join("|"), "gi");
    return text.replace(re, (matched) => matchesMap[matched.toLowerCase()]);
  }

  replaceAllWithHighlight(text, matchesMap) {
    const re = new RegExp(Object.keys(matchesMap).join("|"), "gi");
    return text.replace(re, (matched) => {
      return `<span class="highlight">${
        matchesMap[matched.toLowerCase()]
      }</span>`;
    });
  }
}

module.exports = Translator;
