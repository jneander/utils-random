/*
 * A JavaScript implementation of the "xorwow" prng algorithm by George
 * Marsaglia. See http://www.jstatsoft.org/v08/i14/paper
 *
 * ---
 *
 * Implementation modified from the `seedrandom` library:
 * https://github.com/davidbau/seedrandom/blob/4460ad325a0a15273a211e509f03ae0beb99511a/lib/xorwow.js
 */

import {bitwiseInt32ToFract32, bitwiseInt32ToUint32} from '../../shared'
import {unbiasedRandomFract32, unbiasedRandomInt32, unbiasedRandomUint32} from '../unbiased-random'
import {SeededNumberGenerator} from './seeded-generator'
import {Seed} from './types'

export type XorWowState = {
  d: number
  v: number
  w: number
  x: number
  y: number
  z: number
}

/**
 * A class with methods to generate pseudorandom numbers. This class implements
 * the "xorwow" algorithm by George Marsaglia, which has a period of 2^192-2^32.
 *
 * When constrained with optional minimums and/or maximums, numbers are
 * generated without additional bias.
 *
 * @export
 * @class XorWowNumberGenerator
 * @extends {SeededNumberGenerator<XorWowState>}
 */
export class XorWowNumberGenerator extends SeededNumberGenerator<XorWowState> {
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

    const t = state.x ^ (state.x >>> 2)

    state.x = state.y
    state.y = state.z
    state.z = state.w
    state.w = state.v

    return (
      ((state.d = (state.d + 362437) | 0) + (state.v = state.v ^ (state.v << 4) ^ (t ^ (t << 1)))) |
      0
    )
  }

  protected buildStateFromSeed(seed: Seed): void {
    this.state = {
      d: 0,
      v: 0,
      w: 0,
      x: 0,
      y: 0,
      z: 0
    }

    const state = this.state

    const numberSeed = typeof seed === 'string' ? Number.parseFloat(seed) : seed
    let strseed = ''

    if (seed === (numberSeed | 0)) {
      // Integer seed.
      state.x = seed
    } else {
      // String seed.
      strseed += seed
    }

    // Mix in string seed, then discard an initial batch of 64 values.
    for (let k = 0; k < strseed.length + 64; k++) {
      state.x ^= strseed.charCodeAt(k) | 0
      if (k == strseed.length) {
        state.d = (state.x << 10) ^ (state.x >>> 4)
      }
      this.nextFract32()
    }
  }

  protected cloneState(state: XorWowState): XorWowState {
    return {...state}
  }
}
