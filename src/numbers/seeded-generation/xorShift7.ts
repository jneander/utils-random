/*
 * A JavaScript implementation of the "xorshift7" algorithm by François Panneton
 * and Pierre L'ecuyer: "On the Xorgshift Random Number Generators"
 * http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf
 *
 * ---
 *
 * Implementation modified from the `seedrandom` library:
 * https://github.com/davidbau/seedrandom/blob/4460ad325a0a15273a211e509f03ae0beb99511a/lib/xorshift7.js
 */

import {bitwiseInt32ToFract32, bitwiseInt32ToUint32} from '../../shared'
import {unbiasedRandomFract32, unbiasedRandomInt32, unbiasedRandomUint32} from '../unbiased-random'
import {SeededNumberGenerator} from './seeded-generator'
import {Seed} from './types'

export type XorShift7State = {
  X: number[]
  i: number
}

/**
 * A class with methods to generate pseudorandom numbers. This class implements
 * the "xorshift7" algorithm by François Panneton and Pierre L'ecuyer, which has
 * a period of 2^256-1.
 *
 * When constrained with optional minimums and/or maximums, numbers are
 * generated without additional bias.
 *
 * @export
 * @class XorShift7NumberGenerator
 * @extends {SeededNumberGenerator<XorShift7State>}
 */
export class XorShift7NumberGenerator extends SeededNumberGenerator<XorShift7State> {
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

    let {X, i} = state

    // Update xor generator.
    let t = X[i]
    t ^= t >>> 7
    let v = t ^ (t << 24)

    t = X[(i + 1) & 7]
    v ^= t ^ (t >>> 10)
    t = X[(i + 3) & 7]
    v ^= t ^ (t >>> 3)
    t = X[(i + 4) & 7]
    v ^= t ^ (t << 7)
    t = X[(i + 7) & 7]
    t = t ^ (t << 13)
    v ^= t ^ (t << 9)

    X[i] = v
    state.i = (i + 1) & 7

    return v
  }

  protected buildStateFromSeed(seed: Seed): void {
    this.state = {
      X: [],
      i: 0
    }

    const state = this.state

    let j: number
    let X: number[] = []

    const numberSeed = typeof seed === 'string' ? Number.parseFloat(seed) : seed

    if (seed === (numberSeed | 0)) {
      // Seed state array using a 32-bit integer.
      X[0] = seed
    } else {
      // Seed state using a string.
      const strseed = String(seed)
      for (j = 0; j < strseed.length; ++j) {
        X[j & 7] = (X[j & 7] << 15) ^ ((strseed.charCodeAt(j) + X[(j + 1) & 7]) << 13)
      }
    }

    // Enforce an array length of 8, not all zeroes.
    while (X.length < 8) {
      X.push(0)
    }

    for (j = 0; j < 8 && X[j] === 0; ) {
      ++j
    }

    if (j == 8) {
      X[7] = -1
    }

    state.X = X
    state.i = 0

    // Discard an initial 256 values.
    for (j = 256; j > 0; --j) {
      this.nextInt32()
    }
  }

  protected cloneState(state: XorShift7State): XorShift7State {
    const {X, i} = state
    return {X: [...X], i}
  }
}
