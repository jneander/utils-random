/*
 * A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
 * http://baagoe.com/en/RandomMusings/javascript/
 * https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
 * Original work is under MIT license -
 *
 * ---
 *
 * Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * ---
 *
 * Implementation modified from the `seedrandom` library:
 * https://github.com/davidbau/seedrandom/blob/4460ad325a0a15273a211e509f03ae0beb99511a/lib/alea.js
 */

import {bitwiseFract32ToInt32, bitwiseFract32ToUint32} from '../../shared'
import {unbiasedRandomFract32, unbiasedRandomInt32, unbiasedRandomUint32} from '../unbiased-random'
import {SeededNumberGenerator} from './seeded-generator'
import {Seed} from './types'

export type AleaState = {
  c: number
  s0: number
  s1: number
  s2: number
}

/**
 * A class with methods to generate pseudorandom numbers. This class implements
 * the Alea algorithm by Johannes Baagøe, which has a period of ~2^116.
 *
 * When constrained with optional minimums and/or maximums, numbers are
 * generated without additional bias.
 *
 * @export
 * @class AleaNumberGenerator
 * @extends {SeededNumberGenerator<AleaState>}
 */
export class AleaNumberGenerator extends SeededNumberGenerator<AleaState> {
  nextFract32(minInclusive?: number, maxExclusive?: number): number {
    return unbiasedRandomFract32(minInclusive, maxExclusive, () => this.internalNextFract32())
  }

  nextInt32(minInclusive?: number, maxExclusive?: number): number {
    return unbiasedRandomInt32(minInclusive, maxExclusive, () =>
      bitwiseFract32ToInt32(this.internalNextFract32())
    )
  }

  nextUint32(minInclusive?: number, maxExclusive?: number): number {
    return unbiasedRandomUint32(minInclusive, maxExclusive, () =>
      bitwiseFract32ToUint32(this.internalNextFract32())
    )
  }

  protected internalNextFract32(): number {
    const {state} = this
    const t = 2091639 * state.s0 + state.c * 2.3283064365386963e-10 // 2^-32

    state.c = t | 0
    state.s0 = state.s1
    state.s1 = state.s2
    state.s2 = t - state.c

    return state.s2
  }

  protected buildStateFromSeed(seed: Seed): void {
    const mash = buildMash()

    this.state = {
      c: 1,
      s0: mash(' '),
      s1: mash(' '),
      s2: mash(' ')
    }

    // Apply the seeding algorithm from Baagoe.
    this.state.s0 -= mash(seed)

    if (this.state.s0 < 0) {
      this.state.s0 += 1
    }

    this.state.s1 -= mash(seed)

    if (this.state.s1 < 0) {
      this.state.s1 += 1
    }

    this.state.s2 -= mash(seed)

    if (this.state.s2 < 0) {
      this.state.s2 += 1
    }
  }

  protected cloneState(state: AleaState): AleaState {
    return {...state}
  }
}

function buildMash() {
  let n = 0xefc8249d

  return (data: any): number => {
    data = String(data)

    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i)
      let h = 0.02519603282416938 * n
      n = h >>> 0
      h -= n
      h *= n
      n = h >>> 0
      h -= n
      n += h * 0x100000000 // 2^32
    }

    return (n >>> 0) * 2.3283064365386963e-10 // 2^-32
  }
}
