import {
  WebCrypto,
  bitwiseUint32ToFract32,
  bitwiseUint32ToInt32,
  getRandomBytes,
  uint8ArrayToUint32
} from '../../shared'
import {RandomNumberGenerator} from '../types'
import {unbiasedRandomFract32, unbiasedRandomInt32, unbiasedRandomUint32} from '../unbiased-random'

export interface WebCryptoNumberGeneratorOptions {
  crypto?: WebCrypto
}

/**
 * A class with methods to generate random numbers using JavaScript's native
 * `Crypto` module. When constrained with optional minimums and/or maximums,
 * numbers are generated without additional bias.
 *
 * @export
 * @class WebCryptoNumberGenerator
 * @implements {RandomNumberGenerator}
 */
export class WebCryptoNumberGenerator implements RandomNumberGenerator {
  private crypto: WebCrypto

  /**
   * Creates an instance of WebCryptoNumberGenerator.
   *
   * This generator is not usable in an environment where Javascript's `Crypto`
   * module is not available and a substititute is not given.
   *
   * @param {WebCrypto} [options.crypto] An optional object which implements a
   * `getRandomValues` function, populating a given `Uint8Array` with random
   * bytes. This is a subset of JavaScript's native `Crypto` module. This value
   * defaults to JavaScript's native `Crypto` module, when available.
   */
  constructor(options: WebCryptoNumberGeneratorOptions = {}) {
    this.crypto = options.crypto || globalThis.crypto
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
    return uint8ArrayToUint32(getRandomBytes(4, this.crypto))
  }
}
