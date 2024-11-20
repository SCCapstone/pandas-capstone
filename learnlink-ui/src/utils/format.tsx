export const formatEnum = (value: string): string => {
    return value
        .toLowerCase() // Convert all characters to lowercase
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, (char: string) => char.toUpperCase()); // Capitalize the first letter of each word
};