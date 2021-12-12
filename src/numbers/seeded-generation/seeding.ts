import {WebCrypto} from '../../shared'
import {MathRandomNumberGenerator} from '../insecure-generation'
import {WebCryptoNumberGenerator} from '../secure-generation'
import {Seed} from './types'

/**
 * A function which returns a seed value for use with instantiating seeded
 * number generators.
 *
 * @export
 * @param {WebCrypto} [crypto=globalThis.crypto] A subset of JavaScript's native
 * `Crypto` module. This is a subset of JavaScript's native `Crypto` module.
 * This value defaults to JavaScript's native `Crypto` module, when available.
 * When JavaScript's `Crypto` module is not available in the current environment
 * and a substititute is not given, JavaScript's `Math.random` function will be
 * used for equivalent behavior.
 *
 * @returns {Seed} A value for use with instantiating seeded number generators.
 */
export function randomSeed(crypto: WebCrypto = globalThis.crypto): Seed {
  if (crypto) {
    const gen = new WebCryptoNumberGenerator({crypto})
    return gen.nextUint32()
  }

  const gen = new MathRandomNumberGenerator()
  return gen.nextUint32()
}

/**
 * A function which takes a seed value and returns an unsigned 32-bit integer
 * for use with instantiating seeded number generators.
 *
 * @export
 * @param {Seed} seed A string or number which could be used to
 * deterministically seed a pseudorandom number generator.
 * @returns {number} An unsigned 32-bit integer value for use with instantiating
 * seeded number generators.
 */
export function seedToUint32(seed: Seed): number {
  if (Number.isFinite(seed)) {
    return (seed as number) >>> 0
  }

  // Below is a JavaScript port of Java's String.hashCode() method.
  const strseed = String(seed)
  let result: number = 0
  let char

  for (let i = 0; i < strseed.length; i++) {
    char = strseed.charCodeAt(i)
    result = (result << 5) - result + char
    result = result & result
  }

  return result
}
