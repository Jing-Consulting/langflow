export default function sensitiveSort(a: string | null | undefined, b: string | null | undefined): number {
  // Handle null/undefined values to prevent crashes
  const strA = a ?? "";
  const strB = b ?? "";

  // Extract the name and number from each string using regular expressions
  const regex = /(.+) \((\w+)\)/;
  const matchA = strA.match(regex);
  const matchB = strB.match(regex);

  if (matchA && matchB) {
    // Compare the names alphabetically
    const nameA = matchA[1];
    const nameB = matchB[1];
    if (nameA !== nameB) {
      return nameA.localeCompare(nameB);
    }

    // If the names are the same, compare the numbers numerically
    const numberA = parseInt(matchA[2]);
    const numberB = parseInt(matchB[2]);
    return numberA - numberB;
  } else {
    // Handle cases where one or both strings do not match the expected pattern
    // Simple strings are treated as pure alphabetical comparisons
    return strA.localeCompare(strB);
  }
}
