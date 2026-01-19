import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const localesPath = `${scriptDir}/../i18n/locales`;
const primaryLocale = "en";
const secondaryLocale = "sv";

const primaryMessages = JSON.parse(fs.readFileSync(path.resolve(`${localesPath}/${primaryLocale}.json`), "utf8"));
const secondaryMessages = JSON.parse(fs.readFileSync(path.resolve(`${localesPath}/${secondaryLocale}.json`), "utf8"));

let errorsFound = false;

// compare whether both locale files have identical key structure
const getFlattenedKeys = (object, prefix = "") => {
    let keys = [];
    for (const key in object) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (object[key] !== null && typeof object[key] === "object") {
            keys = keys.concat(getFlattenedKeys(object[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
};
const primaryKeys = getFlattenedKeys(primaryMessages);
const secondaryKeys = getFlattenedKeys(secondaryMessages);

const compareKeys = (primaryKeys, secondaryKeys) => {
    const missingKeys = primaryKeys.filter(key => !secondaryKeys.includes(key));
    const extraKeys = secondaryKeys.filter(key => !primaryKeys.includes(key));

    return {
        missingKeys,
        extraKeys
    };
};

const result = compareKeys(primaryKeys, secondaryKeys);

if (result.missingKeys.length > 0 || result.extraKeys.length > 0) {
    console.log(`Message keys in ${secondaryLocale}.json are not identical to ${primaryLocale}.json.`);
    console.log(result);
    errorsFound = true;
}


// check for blank string values in translation files. missing translations should be set to null instead.
const collectBlankStringKeys = (messages, prefix = "") => {
    let keys = [];
    for (const key in messages) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof messages[key] === "string" && messages[key].trim() === "") {
            keys.push(fullKey);
        } else if (typeof messages[key] === "object") {
            keys = keys.concat(collectBlankStringKeys(messages[key], fullKey));
        }
    }
    return keys;
};


const blankStringPrimaryKeys = collectBlankStringKeys(primaryMessages);
const blankStringSecondaryKeys = collectBlankStringKeys(secondaryMessages);

if (blankStringPrimaryKeys.length > 0 || blankStringSecondaryKeys.length > 0) {
    console.log(`Blank string values found in translation files. Missing translations should be set to null instead.`);
    if (blankStringPrimaryKeys.length > 0) {
        console.log(`${primaryLocale}.json:`);
        console.log(blankStringPrimaryKeys);
    }
    if (blankStringSecondaryKeys.length > 0) {
        console.log(`${secondaryLocale}.json:`);
        console.log(blankStringSecondaryKeys);
    }
    errorsFound = true;
}

if (errorsFound) {
    process.exit(1);
} else {
    console.log("Translation files are valid.");
}
