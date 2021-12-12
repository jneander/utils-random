/*
 * A JavaScript implementation of Richard Brent's Xorgens xor4096 algorithm.
 *
 * This fast non-cryptographic random number generator is designed for
 * use in Monte-Carlo algorithms. It combines a long-period xorshift
 * generator with a Weyl generator, and it passes all common batteries
 * of stasticial tests for randomness while consuming only a few nanoseconds
 * for each prng generated.  For background on the generator, see Brent's
 * paper: "Some long-period random number generators using shifts and xors."
 * http://arxiv.org/pdf/1004.3115v1.pdf
 *
 * For nonzero numeric keys, this impelementation provides a sequence
 * identical to that by Brent's xorgens 3 implementation in C.  This
 * implementation also provides for initalizing the generator with
 * string seeds, or for saving and restoring the state of the generator.
 *
 * On Chrome, this prng benchmarks about 2.1 times slower than
 * JavaScript's built-in Math.random().
 *
 * ---
 *
 * Implementation modified from the `seedrandom` library:
 * https://github.com/davidbau/seedrandom/blob/4460ad325a0a15273a211e509f03ae0beb99511a/lib/xor4096.js
 */

import {bitwiseInt32ToFract32, bitwiseInt32ToUint32} from '../../shared'
import {unbiasedRandomFract32, unbiasedRandomInt32, unbiasedRandomUint32} from '../unbiased-random'
import {SeededNumberGenerator} from './seeded-generator'
import {Seed} from './types'

export type Xor4096State = {
  X: number[]
  i: number
  w: number
}

/**
 * A class with methods to generate pseudorandom numbers. This class implements
 * the Xorgens xor4096 algorithm by Richard Brent, which has a period of
 * 2^4128-2^32.
 *
 * When constrained with optional minimums and/or maximums, numbers are
 * generated without additional bias.
 *
 * @export
 * @class Xor4096NumberGenerator
 * @extends {SeededNumberGenerator<Xor4096State>}
 */
export class Xor4096NumberGenerator extends SeededNumberGenerator<Xor4096State> {
  nextFract32(minInclusive?: number, maxExclusive?: number): number {
    return unbiasedRandomFract32(minInclusive, maxExclusive, () =>
      bitwiseInt32ToFract32(this.internalNextInt32())
    )
  }

  nextInt32(minInclusive?: number, maxExclusive?: number): number {
    return unbiasedRandomInt32(minInclusive, maxExclusive, () => this.internalNextInt32())
  }

  nextUint32(minInclusive?: number, maxExclusive?: number): number {
    return unbiasedRandomUint32(minInclusive, maxExclusive, () =>
      bitwiseInt32ToUint32(this.internalNextInt32())
    )
  }

  protected internalNextInt32(): number {
    const state = this.state

    let {X, i, w} = state

    state.w = w = (w + 0x61c88647) | 0

    // Update Weyl generator.
    // Update xor generator.
    let v = X[(i + 34) & 127]
    let t = X[(i = (i + 1) & 127)]

    v ^= v << 13
    t ^= t << 17
    v ^= v >>> 15
    t ^= t >>> 12

    // Update Xor generator array state.
    v = X[i] = v ^ t
    state.i = i

    // Result is the combination.
    return (v + (w ^ (w >>> 16))) | 0
  }

  protected buildStateFromSeed(seed: Seed): void {
    this.state = {
      X: [],
      i: 0,
      w: 0
    }

    const state = this.state

    let t: number
    let v: number
    let i: number
    let j: number
    let w: number = 0
    let X: number[] = []
    let limit = 128

    const numberSeed = typeof seed === 'string' ? Number.parseFloat(seed) : seed
    let strseed = ''

    if (seed === (numberSeed | 0)) {
      // Numeric seeds initialize v, which is used to generates X.
      v = seed
    } else {
      // String seeds are mixed into v and X one character at a time.
      strseed = `${seed}\0`
      v = 0
      limit = Math.max(limit, strseed.length)
    }

    // Initialize circular array and weyl value.
    for (i = 0, j = -32; j < limit; ++j) {
      // Put the unicode characters into the array, and shuffle them.
      if (strseed) {
        v ^= strseed.charCodeAt((j + 32) % strseed.length)
      }

      // After 32 shuffles, take v as the starting w value.
      if (j === 0) {
        w = v
      }

      v ^= v << 10
      v ^= v >>> 15
      v ^= v << 4
      v ^= v >>> 13

      if (j >= 0) {
        w = (w + 0x61c88647) | 0 // Weyl.
        t = X[j & 127] ^= v + w // Combine xor and weyl to init array.
        i = 0 == t ? i + 1 : 0 // Count zeroes.
      }
    }

    // We have detected all zeroes; make the key nonzero.
    if (i >= 128) {
      X[((strseed && strseed.length) || 0) & 127] = -1
    }

    // Run the generator 512 times to further mix the state before using it.
    // Factoring this as a function slows the main generator, so it is just
    // unrolled here.  The weyl generator is not advanced while warming up.
    i = 127
    for (j = 4 * 128; j > 0; --j) {
      v = X[(i + 34) & 127]
      t = X[(i = (i + 1) & 127)]
      v ^= v << 13
      t ^= t << 17
      v ^= v >>> 15
      t ^= t >>> 12
      X[i] = v ^ t
    }

    state.w = w
    state.X = X
    state.i = i
  }

  protected cloneState(state: Xor4096State): Xor4096State {
    const {X, i, w} = state
    return {X: [...X], i, w}
  }
}
