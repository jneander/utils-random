import {
  Math,
  bitwiseFract32ToUint32,
  bitwiseUint32ToFract32,
  bitwiseUint32ToInt32
} from '../../shared'
import {RandomNumberGenerator} from '../types'
import {unbiasedRandomFract32, unbiasedRandomInt32, unbiasedRandomUint32} from '../unbiased-random'

export interface MathRandomNumberGeneratorOptions {
  math?: Math
}

/**
 * A class with methods to generate random numbers using JavaScript's native
 * `Math.random` function. When constrained with optional minimums and/or
 * maximums, numbers are generated without additional bias.
 *
 * @export
 * @class MathRandomNumberGenerator
 * @implements {RandomNumberGenerator}
 */
export class MathRandomNumberGenerator implements RandomNumberGenerator {
  private math: Math

  /**
   * Creates an instance of MathRandomNumberGenerator.
   *
   * @param {Math} [options.math] An optional object which implements a `random`
   * function, returning a number between `0` (inclusive) and `1` (exclusive).
   * This is a subset of JavaScript's native `Math` module. This value defaults
   * to JavaScript's native `Math` module.
   */
  constructor(options: MathRandomNumberGeneratorOptions = {}) {
    this.math = options.math || globalThis.Math
  }

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
    return bitwiseFract32ToUint32(this.math.random())
  }
}
