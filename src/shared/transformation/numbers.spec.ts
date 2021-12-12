import {expect} from 'chai'

import {
  MAX_SAFE_INT32_INCLUSIVE,
  MAX_SAFE_UINT32_INCLUSIVE,
  MIN_SAFE_INT32_INCLUSIVE,
  MIN_SAFE_UINT32_INCLUSIVE,
  ONE_BIT_AS_FRACT32
} from '../constants'
import {
  bitwiseFract32ToInt32,
  bitwiseFract32ToUint32,
  bitwiseFractToFract32,
  bitwiseInt32ToFract32,
  bitwiseInt32ToUint32,
  bitwiseUint32ToFract32,
  bitwiseUint32ToInt32
} from './numbers'

describe('shared > transformation > numbers', () => {
  describe('.bitwiseFract32ToInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      const value = bitwiseFract32ToInt32(0.625)
      expect(value).to.equal(-1610612736)
    })

    it(`can return the minimum, safe, signed 32-bit integer (${MIN_SAFE_INT32_INCLUSIVE})`, () => {
      const value = bitwiseFract32ToInt32(0.5)
      expect(value).to.equal(MIN_SAFE_INT32_INCLUSIVE)
    })

    it(`can return the maximum, safe, signed 32-bit integer (${MAX_SAFE_INT32_INCLUSIVE})`, () => {
      const value = bitwiseFract32ToInt32(0.5 - ONE_BIT_AS_FRACT32)
      expect(value).to.equal(MAX_SAFE_INT32_INCLUSIVE)
    })
  })

  describe('.bitwiseFract32ToUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      const value = bitwiseFract32ToUint32(0.625)
      expect(value).to.equal(2684354560)
    })

    it(`can return the minimum, safe, unsigned 32-bit integer (${MIN_SAFE_UINT32_INCLUSIVE})`, () => {
      const value = bitwiseFract32ToUint32(0)
      expect(value).to.equal(MIN_SAFE_UINT32_INCLUSIVE)
    })

    it(`can return the maximum, safe, unsigned 32-bit integer (${MAX_SAFE_UINT32_INCLUSIVE})`, () => {
      const value = bitwiseFract32ToUint32(1 - ONE_BIT_AS_FRACT32)
      expect(value).to.equal(MAX_SAFE_UINT32_INCLUSIVE)
    })
  })

  describe('.bitwiseFractToFract32()', () => {
    it('returns the given decimal fraction when representable with 32 bits', () => {
      const value = 0.5 - ONE_BIT_AS_FRACT32
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it('returns the given negative decimal fraction when representable with 32 bits', () => {
      const value = -0.5 - ONE_BIT_AS_FRACT32
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it('coerces the given 33+-bit decimal fraction into 32-bit representation', () => {
      const value = 0.5 - 1 / (2 ** 33 - 1)
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.not.equal(value)
    })
  })

  describe('.bitwiseInt32ToFract32()', () => {
    it('returns a decimal fraction', () => {
      const value = bitwiseInt32ToFract32(-1610612736)
      expect(value).to.equal(0.625)
    })

    it('returns a 32-bit decimal fraction', () => {
      const value = bitwiseInt32ToFract32(123456789)
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it('returns a value less than 1', () => {
      const value = bitwiseInt32ToFract32(-1)
      expect(value).to.equal(1 - ONE_BIT_AS_FRACT32)
    })

    it('returns a value no less than 0', () => {
      const value = bitwiseInt32ToFract32(0.5)
      expect(value).to.equal(0)
    })
  })

  describe('.bitwiseInt32ToUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      const value = bitwiseInt32ToUint32(-1610612736)
      expect(value).to.equal(2684354560)
    })

    it(`can return the minimum, safe, unsigned 32-bit integer (${MIN_SAFE_UINT32_INCLUSIVE})`, () => {
      const value = bitwiseInt32ToUint32(0)
      expect(value).to.equal(MIN_SAFE_UINT32_INCLUSIVE)
    })

    it(`can return the maximum, safe, unsigned 32-bit integer (${MAX_SAFE_UINT32_INCLUSIVE})`, () => {
      const value = bitwiseInt32ToUint32(-1)
      expect(value).to.equal(MAX_SAFE_UINT32_INCLUSIVE)
    })
  })

  describe('.bitwiseUint32ToFract32()', () => {
    it('returns a decimal fraction', () => {
      const value = bitwiseUint32ToFract32(2684354560)
      expect(value).to.equal(0.625)
    })

    it('returns a 32-bit decimal fraction', () => {
      const value = bitwiseUint32ToFract32(123456789)
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it('returns a value less than 1', () => {
      const value = bitwiseUint32ToFract32(MAX_SAFE_UINT32_INCLUSIVE)
      expect(value).to.equal(1 - ONE_BIT_AS_FRACT32)
    })

    it('returns a value no less than 0', () => {
      const value = bitwiseUint32ToFract32(0)
      expect(value).to.equal(0)
    })
  })

  describe('.bitwiseUint32ToInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      const value = bitwiseUint32ToInt32(2684354560)
      expect(value).to.equal(-1610612736)
    })

    it(`can return the minimum, safe, signed 32-bit integer (${MIN_SAFE_INT32_INCLUSIVE})`, () => {
      const value = bitwiseUint32ToInt32(2 ** 31)
      expect(value).to.equal(MIN_SAFE_INT32_INCLUSIVE)
    })

    it(`can return the maximum, safe, signed 32-bit integer (${MAX_SAFE_INT32_INCLUSIVE})`, () => {
      const value = bitwiseUint32ToInt32(2 ** 31 - 1)
      expect(value).to.equal(MAX_SAFE_INT32_INCLUSIVE)
    })
  })
})
