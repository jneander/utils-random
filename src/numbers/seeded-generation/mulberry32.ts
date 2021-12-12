import {bitwiseUint32ToFract32, bitwiseUint32ToInt32} from '../../shared'
import {unbiasedRandomFract32, unbiasedRandomInt32, unbiasedRandomUint32} from '../unbiased-random'
import {SeededNumberGenerator} from './seeded-generator'
import {seedToUint32} from './seeding'
import {Seed} from './types'

/*
 * Written in 2017 by Tommy Ettinger (tommy.ettinger@gmail.com)
 *
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 *
 * See <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 * ---
 *
 * Original source:
 * https://gist.github.com/tommyettinger/46a874533244883189143505d203312c/fc93b8ad259c09a3635d80ed12a05309120795dc
 */

export type Mulberry32State = {
  seed: number
}

/**
 * A class with methods to generate pseudorandom numbers. This class implements
 * the Mulberry32 algorithm by Tommy Ettinger, which has a period of ~2^32.
 *
 * When constrained with optional minimums and/or maximums, numbers are
 * generated without additional bias.
 *
 * @export
 * @class Mulberry32NumberGenerator
 * @extends {SeededNumberGenerator<Mulberry32State>}
 */
export class Mulberry32NumberGenerator extends SeededNumberGenerator<Mulberry32State> {
  nextFract32(minInclusive?: number, maxExclusive?: number): number {
    return unbiasedRandomFract32(minInclusive, maxExclusive, () =>
      bitwiseUint32ToFract32(this.internalNextUint32())
    )
  }

  nextInt32(minInclusive?: number, maxExclusive?: number): number {
    return unbiasedRandomInt32(minInclusive, maxExclusive, () =>
      bitwiseUint32ToInt32(this.internalNextUint32())
    )
  }

  nextUint32(minInclusive?: number, maxExclusive?: number): number {
    return unbiasedRandomUint32(minInclusive, maxExclusive, () => this.internalNextUint32())
  }

  protected internalNextUint32(): number {
    let t = (this.state.seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return (t ^ (t >>> 14)) >>> 0
  }

  protected buildStateFromSeed(seed: Seed): void {
    this.state = {seed: seedToUint32(seed)}
  }

  protected cloneState(state: Mulberry32State): Mulberry32State {
    return {...state}
  }
}
