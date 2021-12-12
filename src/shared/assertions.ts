import {
  MAX_SAFE_FRACT32_EXCLUSIVE,
  MAX_SAFE_INT32_EXCLUSIVE,
  MAX_SAFE_UINT32_EXCLUSIVE,
  MIN_SAFE_FRACT32_INCLUSIVE,
  MIN_SAFE_INT32_INCLUSIVE,
  MIN_SAFE_UINT32_INCLUSIVE
} from './constants'

export function assertSafeRangeFract32(minInclusive: number, maxExclusive: number): void {
  if (minInclusive < MIN_SAFE_FRACT32_INCLUSIVE) {
    throw new Error(`Minimum value must be at least ${MIN_SAFE_FRACT32_INCLUSIVE}.`)
  }

  if (maxExclusive > MAX_SAFE_FRACT32_EXCLUSIVE) {
    throw new Error(`Maximum value must be less than ${MAX_SAFE_FRACT32_EXCLUSIVE}.`)
  }

  if (maxExclusive <= minInclusive) {
    throw new Error('Maximum value must be greater than the given minimum value.')
  }
}

export function assertSafeRangeInt32(minInclusive: number, maxExclusive: number): void {
  if (minInclusive < MIN_SAFE_INT32_INCLUSIVE) {
    throw new Error(`Minimum value must be at least ${MIN_SAFE_INT32_INCLUSIVE}.`)
  }

  if (maxExclusive > MAX_SAFE_INT32_EXCLUSIVE) {
    throw new Error(`Maximum value must be less than ${MAX_SAFE_INT32_EXCLUSIVE}.`)
  }

  if (maxExclusive <= minInclusive) {
    throw new Error('Maximum value must be greater than the given minimum value.')
  }
}

export function assertSafeRangeUint32(minInclusive: number, maxExclusive: number): void {
  if (minInclusive < MIN_SAFE_UINT32_INCLUSIVE) {
    throw new Error(`Minimum value must be at least ${MIN_SAFE_UINT32_INCLUSIVE}.`)
  }

  if (maxExclusive > MAX_SAFE_UINT32_EXCLUSIVE) {
    throw new Error(`Maximum value must be less than ${MAX_SAFE_UINT32_EXCLUSIVE}.`)
  }

  if (maxExclusive <= minInclusive) {
    throw new Error('Maximum value must be greater than the given minimum value.')
  }
}
