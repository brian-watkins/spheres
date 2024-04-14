export function toCamel(word: string, capitalizeFirst: boolean = false): string {
  return word
    .split("-")
    .map((word, i) => capitalizeFirst || i > 0 ? capitalize(word) : word)
    .join("")
}

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.substring(1)
}