export function humanize(str: string) {
    return capitalizeFirstLetter(str.replace(/_|-/g, " "));
}
