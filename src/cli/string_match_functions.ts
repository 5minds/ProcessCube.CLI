import * as distance from 'jaro-winkler';

export function getClosestMatch(searchString: string, listOfStrings: string[]): string | null {
  if (listOfStrings.length === 0) {
    return null;
  }

  const rated = listOfStrings.map((str: string) => {
    return {
      text: str,
      distance: distance(searchString, str)
    };
  });

  rated.sort(function(a, b) {
    if (a.distance < b.distance) {
      return 1;
    } else if (a.distance > b.distance) {
      return -1;
    } else {
      return 0;
    }
  });

  return rated[0].text;
}
