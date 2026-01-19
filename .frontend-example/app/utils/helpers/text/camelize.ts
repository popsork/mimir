export function camelize(str: string): string {
    return str
        .toLowerCase()
        .split("_")
        .map((word, index) => index > 0 ? capitalizeFirstLetter(word) : word)
        .join("");
}
