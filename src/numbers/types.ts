export type RandomUint32Fn = (minInclusive: number, maxExclusive: number) => number

export interface RandomNumberGenerator {
  /**
   * A method which returns a randomly-generated 32-bit decimal fraction. The
   * number will be between an optional minimum (inclusive) and optional maximum
   * (exclusive).
   *
   * @param {number} [minInclusive] An optional lower limit (inclusive) which
   * the returned value will be at least. The lower limit will default to `0`
   * and cannot be below this number.
   * @param {number} [maxExclusive] An optional upper limit (exclusive) below
   * which the returned number will be constrained. The upper limit will default
   * to `1` and cannot exceed this number.
   * @returns {number} A 32-bit decimal fraction.
   */
  nextFract32(minInclusive?: number, maxExclusive?: number): number

  /**
   * A method which returns a randomly-generated, signed 32-bit integer. The
   * number will be between an optional minimum (inclusive) and optional maximum
   * (exclusive).
   *
   * @param {number} [minInclusive] An optional lower limit (inclusive) which
   * the returned value will be at least. The lower limit will default to
   * `-2147483648` and cannot be below this number.
   * @param {number} [maxExclusive] An optional upper limit (exclusive) below
   * which the returned number will be constrained. The upper limit will default
   * to `2147483647` and cannot exceed this number.
   * @returns {number} A signed 32-bit integer.
   */
  nextInt32(minInclusive?: number, maxExclusive?: number): number

  /**
   * A method which returns a randomly-generated, unsigned 32-bit integer. The
   * number will be between an optional minimum (inclusive) and optional maximum
   * (exclusive).
   *
   * @param {number} [minInclusive] An optional lower limit (inclusive) which
   * the returned value will be at least. The lower limit will default to `0`
   * and cannot be below this number.
   * @param {number} [maxExclusive] An optional upper limit (exclusive) below
   * which the returned number will be constrained. The upper limit will default
   * to `4294967296` and cannot exceed this number.
   * @returns {number} An unsigned 32-bit integer.
   */
  nextUint32(minInclusive?: number, maxExclusive?: number): number
}
