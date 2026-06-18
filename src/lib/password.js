// Cryptographically-secure temporary password generator.
// Uses crypto.getRandomValues() (CSPRNG); Math.random() is NOT safe for secrets
// (see .claude/SECURITY_REMEDIATION.md P2).

// No ambiguous characters (no 0/O, 1/l/I) so temp passwords are easy to read aloud.
const PASSWORD_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
const PASSWORD_LENGTH = 10

/**
 * Generate a random temporary password using a CSPRNG.
 * @param {number} [length=PASSWORD_LENGTH]
 * @returns {string}
 */
export function generateTempPassword(length = PASSWORD_LENGTH) {
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)
  return Array.from(
    randomValues,
    (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length],
  ).join('')
}
