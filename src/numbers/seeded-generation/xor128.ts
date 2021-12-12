/*
 * A JavaScript implementation of the "xor128" prng algorithm by George
 * Marsaglia. See http://www.jstatsoft.org/v08/i14/paper
 *
 * ---
 *
 * Implementation modified from the `seedrandom` library:
 * https://github.com/davidbau/seedrandom/blob/4460ad325a0a15273a211e509f03ae0beb99511a/lib/xor128.js
 */

import {bitwiseInt32ToFract32, bitwiseInt32ToUint32} from '../../shared'
import {unbiasedRandomFract32, unbiasedRandomInt32, unbiasedRandomUint32} from '../unbiased-random'
import {SeededNumberGenerator} from './seeded-generator'
import {Seed} from './types'

export type Xor128State = {
  w: number
  x: number
  y: number
  z: number
}

/**
 * A class with methods to generate pseudorandom numbers. This class implements
 * the "xor128" algorithm by George Marsaglia, which has a period of 2^128-1.
 *
 * When constrained with optional minimums and/or maximums, numbers are
 * generated without additional bias.
 *
 * @export
 * @class Xor128NumberGenerator
 * @extends {SeededNumberGenerator<Xor128State>}
 */
export class Xor128NumberGenerator extends SeededNumberGenerator<Xor128State> {
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

    const t = state.x ^ (state.x << 11)
    state.x = state.y
    state.y = state.z
    state.z = state.w

    return (state.w ^= (state.w >>> 19) ^ t ^ (t >>> 8))
  }

  protected buildStateFromSeed(seed: Seed): void {
    this.state = {
      w: 0,
      x: 0,
      y: 0,
      z: 0
    }

    const numberSeed = typeof seed === 'string' ? Number.parseFloat(seed) : seed
    let strseed = ''

    if (seed === (numberSeed | 0)) {
      // Integer seed.
      this.state.x = seed
    } else {
      // String seed.
      strseed += seed
    }

    // Mix in string seed, then discard an initial batch of 64 values.
    for (let k = 0; k < strseed.length + 64; k++) {
      this.state.x ^= strseed.charCodeAt(k) | 0
      this.nextFract32()
    }
  }

  protected cloneState(state: Xor128State): Xor128State {
    return {...state}
  }
}
