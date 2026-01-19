import sha1 from "sha1";

// this returns a "random" number between 0 and (range - 1)
// the number is deterministic and based on the given string input
// it should have roughly equal probability for each integer in the given range
export function getDummyNumber(seedString: string, range: number): number {
    const string = btoa(sha1(seedString));

    // FNV-1a hash function for better distribution
    let hash = 0x811C9DC5; // FNV offset basis
    for (let i = 0; i < string.length; i++) {
        hash ^= string.charCodeAt(i); // XOR with the byte
        hash = (hash * 0x01000193) >>> 0; // FNV prime (multiply with a large prime and ensure it's 32-bit)
    }
    const result = hash >>> 0; // Ensure the result is an unsigned 32-bit integer

    const offset = 0; // 4; // some random value to shift the result if the generated values don't look right for demo

    return (result + offset) % range;
}
