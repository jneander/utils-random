import {
  MAX_SAFE_FRACT32_EXCLUSIVE,
  MAX_SAFE_INT32_EXCLUSIVE,
  MAX_SAFE_UINT32_EXCLUSIVE,
  MIN_SAFE_FRACT32_INCLUSIVE,
  MIN_SAFE_INT32_INCLUSIVE,
  MIN_SAFE_UINT32_INCLUSIVE,
  assertSafeRangeFract32,
  assertSafeRangeInt32,
  assertSafeRangeUint32,
  bitwiseFract32ToUint32,
  bitwiseUint32ToFract32
} from '../shared'

export function unbiasedRandomFract32(
  minInclusive: number | undefined,
  maxExclusive: number | undefined,
  randomFract32Fn: () => number
): number {
  if (minInclusive == null && maxExclusive == null) {
    return randomFract32Fn()
  }

  const min = minInclusive ?? MIN_SAFE_FRACT32_INCLUSIVE
  const max = maxExclusive ?? MAX_SAFE_FRACT32_EXCLUSIVE

  assertSafeRangeFract32(min, max)

  const minUint32 = bitwiseFract32ToUint32(min)
  const maxUint32 =
    max === MAX_SAFE_FRACT32_EXCLUSIVE ? MAX_SAFE_UINT32_EXCLUSIVE : bitwiseFract32ToUint32(max)
  const randomUint32Fn = () => bitwiseFract32ToUint32(randomFract32Fn())

  const result = unbiasedRandomUint32FromRange(maxUint32 - minUint32, randomUint32Fn)

  return min + bitwiseUint32ToFract32(result)
}

export function unbiasedRandomInt32(
  minInclusive: number | undefined,
  maxExclusive: number | undefined,
  randomInt32Fn: () => number
): number {
  if (minInclusive == null && maxExclusive == null) {
    return randomInt32Fn()
  }

  const min = minInclusive ?? MIN_SAFE_INT32_INCLUSIVE
  const max = maxExclusive ?? MAX_SAFE_INT32_EXCLUSIVE

  assertSafeRangeInt32(min, max)

  /*
   * Doing range comparisons with int32 values is complicated, as a range across
   * negative and positive integers is split between two distinct bit ranges.
   * Since the random number generation does not depend on continuous ranges of
   * bits, the math can be simplified by shifting the integer range into a
   * continuous bit range. In essence:
   *
   *   1. Map the int32 values into uint32 values (no change in fidelity).
   *   2. Generate a uint32 value within that range.
   *   3. Map the uint32 value back into the int32 range and return.
   *
   * The `rangeShift` value below is the number by which to shift the range from
   * int32 to uint32, and back again.
   */
  const rangeShift = 2 ** 31

  const minUint32 = min + rangeShift
  const maxUint32 = max + rangeShift
  const randomUint32Fn = () => randomInt32Fn() + rangeShift

  const result = unbiasedRandomUint32FromRange(maxUint32 - minUint32, randomUint32Fn)

  return (min + result) | 0
}

export function unbiasedRandomUint32(
  minInclusive: number | undefined,
  maxExclusive: number | undefined,
  randomUint32Fn: () => number
): number {
  if (minInclusive == null && maxExclusive == null) {
    return randomUint32Fn()
  }

  const min = minInclusive ?? MIN_SAFE_UINT32_INCLUSIVE
  const max = maxExclusive ?? MAX_SAFE_UINT32_EXCLUSIVE

  assertSafeRangeUint32(min, max)

  const rangeMin = Math.floor(min)
  const rangeMax = Math.floor(max)

  const value = unbiasedRandomUint32FromRange(rangeMax - rangeMin, randomUint32Fn)

  return rangeMin + value
}

export function unbiasedRandomUint32FromRange(range: number, randomUint32Fn: () => number): number {
  // A range of 1 can only result in the given minimum value.
  if (range === 1) {
    return 0
  }

  /*
   * Much of the implementation below is modified from:
   * - Scott Arciszewski's gist:
   *   https://gist.github.com/sarciszewski/88a7ed143204d17c3e42/3230cd613d8da616109520ef34bd65dbd9f09cd2
   * - Sven Slootweg's `random-number-csprng` library:
   *   https://github.com/joepie91/node-random-number-csprng/tree/33d58fb71200a4d613fbd7bd2c73e82865d5fa5d
   *
   * Both are "licensed" by WTFPL.
   */

  /*
   * `mask` is a value composed of `1` bits which is used to binary-AND with the
   * random value to limit the instances where `randomValue` exceeds the range
   * limit, resulting in additional computations.
   */
  let mask = 0

  /*
   * When a value is generated, it might not be within the given range. The
   * value is potentially still usable, so irrelevant bits will be removed
   * before further comparison. They will be bit-masked out according to the
   * bits used by the allowed range of values. Using the `Math` module in
   * JavaScript, this is achieved as follows:
   *
   *   bitCount = Math.ceil(Math.log2(range))
   *   mask = Math.pow(2, bitCount) - 1
   *
   * To avoid any possible floating-point errors in JavaScript runtimes, this is
   * instead performed as a series of bitwise operations.
   */

  /*
   * Subtract 1 to ensure that powers of two are exclusive in bit form.  For
   * example, an exclusive maximum of `8` (0b00001000) must mask only the
   * allowable values 0–7 (0b00000111).
   */
  let temp = range - 1

  while (temp > 0) {
    mask = (mask << 1) | 1 // Increase mask coverage; 0b00001111 -> 0b00011111
    temp = temp >>> 1 // 0b01000000 -> 0b00100000
  }

  // Ensure the mask is an unsigned 32-bit integer.
  mask = mask >>> 0

  let randomValue = 0

  do {
    const value = randomUint32Fn()
    // Apply the mask and ensure the value is an unsigned 32-bit integer.
    randomValue = (value & mask) >>> 0

    /*
     * When the resulting value is not within the given range, discard it. Using
     * additional operations like modulo to further restrict this value would
     * introduce bias in the randomness of values returned from this function.
     * Instead, simply repeat this block of operations until an acceptable value
     * is derived.
     */
  } while (randomValue >= range)

  return randomValue
}
