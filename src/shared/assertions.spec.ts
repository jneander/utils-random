import {expect} from 'chai'

import {assertSafeRangeFract32, assertSafeRangeInt32, assertSafeRangeUint32} from './assertions'
import {
  MAX_SAFE_FRACT32_EXCLUSIVE,
  MAX_SAFE_INT32_EXCLUSIVE,
  MAX_SAFE_UINT32_EXCLUSIVE,
  MIN_SAFE_FRACT32_INCLUSIVE,
  MIN_SAFE_INT32_INCLUSIVE,
  MIN_SAFE_UINT32_INCLUSIVE,
  ONE_BIT_AS_FRACT32
} from './constants'

describe('shared > assertions', () => {
  describe('.assertSafeRangeFract32()', () => {
    it(`accepts values between ${MIN_SAFE_FRACT32_INCLUSIVE} and ${MAX_SAFE_FRACT32_EXCLUSIVE}`, () => {
      expect(() => assertSafeRangeFract32(0.25, 0.75)).to.not.throw()
    })

    it(`accepts ${MIN_SAFE_FRACT32_INCLUSIVE} as a minimum value`, () => {
      expect(() => assertSafeRangeFract32(0, 0.75)).to.not.throw()
    })

    it(`accepts ${MAX_SAFE_FRACT32_EXCLUSIVE} as a maximum value`, () => {
      expect(() => assertSafeRangeFract32(0.25, 1)).to.not.throw()
    })

    it(`rejects any minimum value below ${MIN_SAFE_FRACT32_INCLUSIVE}`, () => {
      expect(() => assertSafeRangeFract32(0 - ONE_BIT_AS_FRACT32, 1)).to.throw()
    })

    it(`rejects any maximum value above ${MAX_SAFE_FRACT32_EXCLUSIVE}`, () => {
      expect(() => assertSafeRangeFract32(0.25, 1 + ONE_BIT_AS_FRACT32)).to.throw()
    })

    it('rejects equal minimum and maximum values', () => {
      expect(() => assertSafeRangeFract32(0.25, 0.25)).to.throw()
    })

    it('rejects any maximum value below the given minimum value', () => {
      expect(() => assertSafeRangeFract32(0.25, 0.24)).to.throw()
    })
  })

  describe('.assertSafeRangeInt32()', () => {
    it(`accepts values between ${MIN_SAFE_INT32_INCLUSIVE} and ${MAX_SAFE_INT32_EXCLUSIVE}`, () => {
      expect(() => assertSafeRangeInt32(123, 456)).to.not.throw()
    })

    it(`accepts ${MIN_SAFE_INT32_INCLUSIVE} as a minimum value`, () => {
      expect(() => assertSafeRangeInt32(MIN_SAFE_INT32_INCLUSIVE, 456)).to.not.throw()
    })

    it(`accepts ${MAX_SAFE_INT32_EXCLUSIVE} as a maximum value`, () => {
      expect(() => assertSafeRangeInt32(123, MAX_SAFE_INT32_EXCLUSIVE)).to.not.throw()
    })

    it(`rejects any minimum value below ${MIN_SAFE_INT32_INCLUSIVE}`, () => {
      expect(() => assertSafeRangeInt32(MIN_SAFE_INT32_INCLUSIVE - 1, 456)).to.throw()
    })

    it(`rejects any maximum value above ${MAX_SAFE_INT32_EXCLUSIVE}`, () => {
      expect(() => assertSafeRangeInt32(123, MAX_SAFE_INT32_EXCLUSIVE + 1)).to.throw()
    })

    it('rejects equal minimum and maximum values', () => {
      expect(() => assertSafeRangeInt32(123, 123)).to.throw()
    })

    it('rejects any maximum value below the given minimum value', () => {
      expect(() => assertSafeRangeInt32(123, 122)).to.throw()
    })
  })

  describe('.assertSafeRangeUint32()', () => {
    it(`accepts values between ${MIN_SAFE_UINT32_INCLUSIVE} and ${MAX_SAFE_UINT32_EXCLUSIVE}`, () => {
      expect(() => assertSafeRangeUint32(123, 456)).to.not.throw()
    })

    it(`accepts ${MIN_SAFE_UINT32_INCLUSIVE} as a minimum value`, () => {
      expect(() => assertSafeRangeUint32(MIN_SAFE_UINT32_INCLUSIVE, 456)).to.not.throw()
    })

    it(`accepts ${MAX_SAFE_UINT32_EXCLUSIVE} as a maximum value`, () => {
      expect(() => assertSafeRangeUint32(123, MAX_SAFE_UINT32_EXCLUSIVE)).to.not.throw()
    })

    it(`rejects any minimum value below ${MIN_SAFE_UINT32_INCLUSIVE}`, () => {
      expect(() => assertSafeRangeUint32(MIN_SAFE_UINT32_INCLUSIVE - 1, 456)).to.throw()
    })

    it(`rejects any maximum value above ${MAX_SAFE_UINT32_EXCLUSIVE}`, () => {
      expect(() => assertSafeRangeUint32(123, MAX_SAFE_UINT32_EXCLUSIVE + 1)).to.throw()
    })

    it('rejects equal minimum and maximum values', () => {
      expect(() => assertSafeRangeUint32(123, 123)).to.throw()
    })

    it('rejects any maximum value below the given minimum value', () => {
      expect(() => assertSafeRangeUint32(123, 122)).to.throw()
    })
  })
})
