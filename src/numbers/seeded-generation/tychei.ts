/*
 * A JavaScript implementation of the "Tyche-i" prng algorithm by Samuel Neves
 * and Filipe Araujo. See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
 *
 * ---
 *
 * Implementation modified from the `seedrandom` library:
 * https://github.com/davidbau/seedrandom/blob/4460ad325a0a15273a211e509f03ae0beb99511a/lib/tychei.js
 */

import {bitwiseInt32ToFract32, bitwiseInt32ToUint32} from '../../shared'
import {unbiasedRandomFract32, unbiasedRandomInt32, unbiasedRandomUint32} from '../unbiased-random'
import {SeededNumberGenerator} from './seeded-generator'
import {Seed} from './types'

export type TycheiState = {
  a: number
  b: number
  c: number
  d: number
}

/**
 * A class with methods to generate pseudorandom numbers. This class implements
 * the "Tyche-i" algorithm by Samuel Neves, which has a period of ~2^127.
 *
 * When constrained with optional minimums and/or maximums, numbers are
 * generated without additional bias.
 *
 * @export
 * @class TycheiNumberGenerator
 * @extends {SeededNumberGenerator<TycheiState>}
 */
export class TycheiNumberGenerator extends SeededNumberGenerator<TycheiState> {
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
    let {a, b, c, d} = this.state

    b = (b << 25) ^ (b >>> 7) ^ c
    c = (c - d) | 0
    d = (d << 24) ^ (d >>> 8) ^ a
    a = (a - b) | 0

    this.state.b = b = (b << 20) ^ (b >>> 12) ^ c
    this.state.c = c = (c - d) | 0
    this.state.d = (d << 16) ^ (c >>> 16) ^ a
    this.state.a = (a - b) | 0

    return this.state.a
  }

  protected buildStateFromSeed(seed: Seed): void {
    this.state = {
      a: 0,
      b: 0,
      c: 2654435769 | 0,
      d: 1367130551
    }

    const numberSeed = typeof seed === 'string' ? Number.parseFloat(seed) : seed
    let strseed = ''

    if (seed === Math.floor(numberSeed)) {
      // Integer seed.
      this.state.a = (seed / 0x100000000) | 0
      this.state.b = seed | 0
    } else {
      // String seed.
      strseed += seed
    }

    // Mix in string seed, then discard an initial batch of 64 values.
    for (let k = 0; k < strseed.length + 20; k++) {
      this.state.b ^= strseed.charCodeAt(k) | 0
      this.nextInt32()
    }
  }

  protected cloneState(state: TycheiState): TycheiState {
    return {...state}
  }
}
