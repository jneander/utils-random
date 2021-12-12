import {assertSafeRangeUint32} from './assertions'
import {MAX_SAFE_UINT32_EXCLUSIVE, MIN_SAFE_UINT32_INCLUSIVE} from './constants'
import {WebCrypto} from './types'

export function getRandomBytes(length: number, crypto: WebCrypto): Uint8Array {
  const out = new Uint8Array(length)
  crypto.getRandomValues(out)
  return out
}

export function mathRandomUint32(
  minInclusive: number = MIN_SAFE_UINT32_INCLUSIVE,
  maxExclusive: number = MAX_SAFE_UINT32_EXCLUSIVE
): number {
  assertSafeRangeUint32(minInclusive, maxExclusive)

  const minInt = Math.floor(minInclusive)
  const maxInt = Math.floor(maxExclusive)

  return Math.floor(Math.random() * (maxInt - minInt)) + minInt
}
