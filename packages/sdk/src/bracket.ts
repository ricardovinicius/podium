export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Generates an array-based binary tree bracket.
 * The output length is 2N - 1 where N is the number of participants.
 * Internal nodes (matches) are initialized to the zero address.
 * Leaf nodes are populated with the participant addresses.
 * 
 * @param participants An array of participant addresses. Must be a power of 2.
 * @returns The array representing the bracket tree.
 */
export function generateBracket(participants: string[]): `0x${string}`[] {
  const n = participants.length;
  if (!isPowerOfTwo(n)) {
    throw new Error("Number of participants must be a power of two.");
  }

  const bracketLength = 2 * n - 1;
  const bracket = new Array<`0x${string}`>(bracketLength).fill(ZERO_ADDRESS);

  const startIndex = n - 1;
  for (let i = 0; i < n; i++) {
    bracket[startIndex + i] = participants[i] as `0x${string}`;
  }

  return bracket;
}

/**
 * Returns the left and right child indices for a given node index in the bracket array.
 */
export function getChildren(nodeIndex: number, numParticipants: number): [number, number] | null {
  const bracketLength = 2 * numParticipants - 1;
  const left = 2 * nodeIndex + 1;
  const right = 2 * nodeIndex + 2;
  
  if (left >= bracketLength || right >= bracketLength) {
    return null; // Leaf node
  }
  return [left, right];
}

/**
 * Returns the parent index for a given node.
 */
export function getParent(nodeIndex: number): number | null {
  if (nodeIndex === 0) return null; // Root node
  return Math.floor((nodeIndex - 1) / 2);
}
