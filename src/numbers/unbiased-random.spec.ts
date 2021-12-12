import {expect} from 'chai'
import {SinonStub, stub} from 'sinon'

import {
  MAX_SAFE_FRACT32_EXCLUSIVE,
  MAX_SAFE_FRACT32_INCLUSIVE,
  MAX_SAFE_INT32_EXCLUSIVE,
  MAX_SAFE_INT32_INCLUSIVE,
  MAX_SAFE_UINT32_EXCLUSIVE,
  MAX_SAFE_UINT32_INCLUSIVE,
  MIN_SAFE_FRACT32_INCLUSIVE,
  MIN_SAFE_INT32_INCLUSIVE,
  MIN_SAFE_UINT32_INCLUSIVE,
  ONE_BIT_AS_FRACT32,
  bitwiseUint32ToFract32
} from '../shared'
import {unbiasedRandomFract32, unbiasedRandomInt32, unbiasedRandomUint32} from './unbiased-random'

describe('numbers > unbiased random', () => {
  /*
   * To ensure that "unbiased random" is working as intended, these specs assume
   * some knowledge about the internal math of the algorithm. This is necessary
   * to guarantee the intended behavior and protect against known problematic
   * cases. To avoid redundancy, the repeated examples in the spec blocks below
   * will not repeat explanations. Instead, all vital descriptions are presented
   * in this comment.
   *
   * The examples below largely employ values with known behavior, or values on
   * either side of a bit boundary.
   *
   * Some repeated examples involve the following uint32 values:
   *
   *     127 => 0b01111111
   *     126 => 0b01111110
   *     254 => 0b11111110
   *     255 => 0b11111111
   *
   *   127 is used as the `maxExclusive` value.
   *   126 is a valid value for that range.
   *   254 is a generated value, which is above 127 and not valid as-is. It is
   *   bit-masked down to 126, a valid value.
   *   255 is a generated value, also not valid as-is. It is bit-masked down to
   *   127, which is still not valid.
   */

  describe('.unbiasedRandomFract32()', () => {
    let randomFract32Fn: SinonStub<void[], number>

    beforeEach(() => {
      randomFract32Fn = stub().returns(0.1)
    })

    it('returns the generated fract32 value when within the given range', () => {
      randomFract32Fn.returns(0.125)
      const value = unbiasedRandomFract32(
        MIN_SAFE_FRACT32_INCLUSIVE,
        MAX_SAFE_FRACT32_EXCLUSIVE,
        randomFract32Fn
      )
      expect(value).to.equal(0.125)
    })

    it('offsets the generated value by the given minimum', () => {
      randomFract32Fn.returns(0)
      const value = unbiasedRandomFract32(0.125, 0.75, randomFract32Fn)
      expect(value).to.equal(0.125)
    })

    it('adjusts the generated value to be within range, when possible', () => {
      randomFract32Fn.returns(bitwiseUint32ToFract32(254))
      const maxExclusive = bitwiseUint32ToFract32(127)
      const value = unbiasedRandomFract32(MIN_SAFE_FRACT32_INCLUSIVE, maxExclusive, randomFract32Fn)
      expect(value).to.equal(bitwiseUint32ToFract32(126))
    })

    context('when the adjusted value still exceeds the range', () => {
      const maxExclusive = bitwiseUint32ToFract32(127)
      const usableValue = bitwiseUint32ToFract32(123)

      beforeEach(() => {
        randomFract32Fn.onFirstCall().returns(bitwiseUint32ToFract32(255))
        randomFract32Fn.onSecondCall().returns(usableValue)
      })

      it('generates another value', () => {
        unbiasedRandomFract32(MIN_SAFE_FRACT32_INCLUSIVE, maxExclusive, randomFract32Fn)
        expect(randomFract32Fn.callCount).to.equal(2)
      })

      it('uses the next generated value adjustable to the range', () => {
        const value = unbiasedRandomFract32(
          MIN_SAFE_FRACT32_INCLUSIVE,
          maxExclusive,
          randomFract32Fn
        )
        expect(value).to.equal(usableValue)
      })
    })

    it(`can return the minimum 32-bit decimal fraction (${MIN_SAFE_FRACT32_INCLUSIVE})`, () => {
      randomFract32Fn.returns(MIN_SAFE_FRACT32_INCLUSIVE)
      const value = unbiasedRandomFract32(
        MIN_SAFE_FRACT32_INCLUSIVE,
        MAX_SAFE_FRACT32_EXCLUSIVE,
        randomFract32Fn
      )
      expect(value).to.equal(MIN_SAFE_FRACT32_INCLUSIVE)
    })

    it(`can return the maximum 32-bit decimal fraction (${MAX_SAFE_FRACT32_INCLUSIVE})`, () => {
      randomFract32Fn.returns(MAX_SAFE_FRACT32_INCLUSIVE)
      const value = unbiasedRandomFract32(
        MIN_SAFE_FRACT32_INCLUSIVE,
        MAX_SAFE_FRACT32_EXCLUSIVE,
        randomFract32Fn
      )
      expect(value).to.equal(MAX_SAFE_FRACT32_INCLUSIVE)
    })

    context('when the difference between the given minimum and maximum is 1 bit', () => {
      it('does not call the given generator function', () => {
        unbiasedRandomFract32(0.125, 0.125 + ONE_BIT_AS_FRACT32, randomFract32Fn)
        expect(randomFract32Fn.callCount).to.equal(0)
      })

      it('returns the given minimum value', () => {
        const value = unbiasedRandomFract32(0.125, 0.125 + ONE_BIT_AS_FRACT32, randomFract32Fn)
        expect(value).to.equal(0.125)
      })
    })

    it(`uses ${MIN_SAFE_FRACT32_INCLUSIVE} as the default minimum`, () => {
      randomFract32Fn.returns(MIN_SAFE_FRACT32_INCLUSIVE)
      const value = unbiasedRandomFract32(undefined, MAX_SAFE_FRACT32_EXCLUSIVE, randomFract32Fn)
      expect(value).to.equal(MIN_SAFE_FRACT32_INCLUSIVE)
    })

    it(`uses ${MAX_SAFE_FRACT32_EXCLUSIVE} as the default maximum`, () => {
      randomFract32Fn.returns(MAX_SAFE_FRACT32_INCLUSIVE)
      const value = unbiasedRandomFract32(MIN_SAFE_FRACT32_INCLUSIVE, undefined, randomFract32Fn)
      expect(value).to.equal(MAX_SAFE_FRACT32_INCLUSIVE)
    })

    it(`accepts a maximum of ${MAX_SAFE_FRACT32_EXCLUSIVE}`, () => {
      expect(() => {
        unbiasedRandomFract32(
          MIN_SAFE_FRACT32_INCLUSIVE,
          MAX_SAFE_FRACT32_EXCLUSIVE,
          randomFract32Fn
        )
      }).to.not.throw()
    })

    it(`rejects any minimum lower than ${MIN_SAFE_FRACT32_INCLUSIVE}`, () => {
      expect(() => {
        unbiasedRandomFract32(
          MIN_SAFE_FRACT32_INCLUSIVE - ONE_BIT_AS_FRACT32,
          0.125,
          randomFract32Fn
        )
      }).to.throw()
    })

    it(`rejects any maximum higher than ${MAX_SAFE_FRACT32_EXCLUSIVE}`, () => {
      expect(() => {
        unbiasedRandomFract32(
          MIN_SAFE_FRACT32_INCLUSIVE,
          MAX_SAFE_FRACT32_EXCLUSIVE + 1,
          randomFract32Fn
        )
      }).to.throw()
    })

    it(`rejects any maximum equal to the given minimum`, () => {
      expect(() => {
        unbiasedRandomFract32(0.125, 0.125, randomFract32Fn)
      }).to.throw()
    })

    it(`rejects any maximum lower than the given minimum`, () => {
      expect(() => {
        unbiasedRandomFract32(0.125, 0.125 - ONE_BIT_AS_FRACT32, randomFract32Fn)
      }).to.throw()
    })
  })

  describe('.unbiasedRandomInt32()', () => {
    let randomInt32Fn: SinonStub<void[], number>

    beforeEach(() => {
      randomInt32Fn = stub().returns(1)
    })

    it('returns the generated int32 value when within the given range', () => {
      randomInt32Fn.returns(123)
      const value = unbiasedRandomInt32(0, 125, randomInt32Fn)
      expect(value).to.equal(123)
    })

    it('supports positive 1-byte numbers', () => {
      randomInt32Fn.returns(123)
      const value = unbiasedRandomInt32(0, 2 ** 8, randomInt32Fn)
      expect(value).to.equal(123)
    })

    it('supports negative 1-byte numbers', () => {
      randomInt32Fn.returns(-123)
      const value = unbiasedRandomInt32(-(2 ** 8), 0, randomInt32Fn)
      expect(value).to.equal(-123)
    })

    it('supports positive 2-byte numbers', () => {
      randomInt32Fn.returns(257)
      const value = unbiasedRandomInt32(0, 2 ** 16, randomInt32Fn)
      expect(value).to.equal(257)
    })

    it('supports negative 2-byte numbers', () => {
      randomInt32Fn.returns(-257)
      const value = unbiasedRandomInt32(-(2 ** 16), 0, randomInt32Fn)
      expect(value).to.equal(-257)
    })

    it('supports positive 4-byte numbers', () => {
      randomInt32Fn.returns(257)
      const value = unbiasedRandomInt32(-(2 ** 31), 2 ** 31, randomInt32Fn)
      expect(value).to.equal(257)
    })

    it('supports negative 4-byte numbers', () => {
      randomInt32Fn.returns(-2049)
      const value = unbiasedRandomInt32(-(2 ** 31), 2 ** 31, randomInt32Fn)
      expect(value).to.equal(-2049)
    })

    it('offsets the generated value by the given minimum', () => {
      randomInt32Fn.returns(0)
      const value = unbiasedRandomInt32(123, 256, randomInt32Fn)
      expect(value).to.equal(123)
    })

    it('adjusts the generated value to be within range, when possible', () => {
      randomInt32Fn.returns(254)
      const maxExclusive = 127
      const value = unbiasedRandomInt32(0, maxExclusive, randomInt32Fn)
      expect(value).to.equal(126)
    })

    context('when the adjusted value still exceeds the range', () => {
      const maxExclusive = 127
      const usableValue = 123

      beforeEach(() => {
        randomInt32Fn.onFirstCall().returns(255)
        randomInt32Fn.onSecondCall().returns(usableValue)
      })

      it('generates another value', () => {
        unbiasedRandomInt32(MIN_SAFE_INT32_INCLUSIVE, maxExclusive, randomInt32Fn)
        expect(randomInt32Fn.callCount).to.equal(2)
      })

      it('uses the next generated value adjustable to the range', () => {
        const value = unbiasedRandomInt32(MIN_SAFE_INT32_INCLUSIVE, maxExclusive, randomInt32Fn)
        expect(value).to.equal(usableValue)
      })
    })

    it(`can return the minimum signed 32-bit integer (${MAX_SAFE_INT32_INCLUSIVE})`, () => {
      randomInt32Fn.returns(MAX_SAFE_INT32_INCLUSIVE)
      const value = unbiasedRandomInt32(
        MIN_SAFE_INT32_INCLUSIVE,
        MAX_SAFE_INT32_EXCLUSIVE,
        randomInt32Fn
      )
      expect(value).to.equal(MAX_SAFE_INT32_INCLUSIVE)
    })

    it(`can return the maximum signed 32-bit integer (${MAX_SAFE_INT32_INCLUSIVE})`, () => {
      randomInt32Fn.returns(MAX_SAFE_INT32_INCLUSIVE)
      const value = unbiasedRandomInt32(
        MIN_SAFE_INT32_INCLUSIVE,
        MAX_SAFE_INT32_EXCLUSIVE,
        randomInt32Fn
      )
      expect(value).to.equal(MAX_SAFE_INT32_INCLUSIVE)
    })

    context('when the difference between the given minimum and maximum is 1 bit (1)', () => {
      it('does not call the given generator function', () => {
        unbiasedRandomInt32(123, 124, randomInt32Fn)
        expect(randomInt32Fn.callCount).to.equal(0)
      })

      it('returns the given minimum value', () => {
        const value = unbiasedRandomInt32(123, 124, randomInt32Fn)
        expect(value).to.equal(123)
      })
    })

    it(`uses ${MIN_SAFE_INT32_INCLUSIVE} as the default minimum`, () => {
      randomInt32Fn.returns(MIN_SAFE_INT32_INCLUSIVE)
      const value = unbiasedRandomInt32(undefined, MAX_SAFE_INT32_EXCLUSIVE, randomInt32Fn)
      expect(value).to.equal(MIN_SAFE_INT32_INCLUSIVE)
    })

    it(`uses ${MAX_SAFE_INT32_EXCLUSIVE} as the default maximum`, () => {
      randomInt32Fn.returns(MAX_SAFE_INT32_INCLUSIVE)
      const value = unbiasedRandomInt32(MIN_SAFE_INT32_INCLUSIVE, undefined, randomInt32Fn)
      expect(value).to.equal(MAX_SAFE_INT32_INCLUSIVE)
    })

    it(`accepts a maximum of ${MAX_SAFE_INT32_EXCLUSIVE}`, () => {
      expect(() => {
        unbiasedRandomInt32(MIN_SAFE_INT32_INCLUSIVE, MAX_SAFE_INT32_EXCLUSIVE, randomInt32Fn)
      }).to.not.throw()
    })

    it(`rejects any minimum lower than ${MIN_SAFE_INT32_INCLUSIVE}`, () => {
      expect(() => {
        unbiasedRandomInt32(MIN_SAFE_INT32_INCLUSIVE - 1, MAX_SAFE_INT32_EXCLUSIVE, randomInt32Fn)
      }).to.throw()
    })

    it(`rejects any maximum higher than ${MAX_SAFE_INT32_EXCLUSIVE}`, () => {
      expect(() => {
        unbiasedRandomInt32(MIN_SAFE_INT32_INCLUSIVE, MAX_SAFE_INT32_EXCLUSIVE + 1, randomInt32Fn)
      }).to.throw()
    })

    it(`rejects any maximum equal to the given minimum`, () => {
      expect(() => {
        unbiasedRandomInt32(123, 123, randomInt32Fn)
      }).to.throw()
    })

    it(`rejects any maximum lower than the given minimum`, () => {
      expect(() => {
        unbiasedRandomInt32(123, 122, randomInt32Fn)
      }).to.throw()
    })
  })

  describe('.unbiasedRandomUint32()', () => {
    let randomUint32Fn: SinonStub<void[], number>

    beforeEach(() => {
      randomUint32Fn = stub().returns(1)
    })

    it('returns the generated uint32 value when within the given range', () => {
      randomUint32Fn.returns(123)
      const value = unbiasedRandomInt32(0, 125, randomUint32Fn)
      expect(value).to.equal(123)
    })

    it('supports 1-byte numbers', () => {
      randomUint32Fn.returns(123)
      const value = unbiasedRandomUint32(0, 2 ** 8, randomUint32Fn)
      expect(value).to.equal(123)
    })

    it('supports 2-byte numbers', () => {
      randomUint32Fn.returns(257)
      const value = unbiasedRandomUint32(0, 2 ** 16, randomUint32Fn)
      expect(value).to.equal(257)
    })

    it('supports 4-byte numbers', () => {
      randomUint32Fn.returns(2049)
      const value = unbiasedRandomUint32(0, 2 ** 32, randomUint32Fn)
      expect(value).to.equal(2049)
    })

    it('offsets the generated value by the given minimum', () => {
      randomUint32Fn.returns(0)
      const value = unbiasedRandomUint32(123, 256, randomUint32Fn)
      expect(value).to.equal(123)
    })

    it('adjusts the generated value to be within range, when possible', () => {
      randomUint32Fn.returns(254)
      const maxExclusive = 127
      const value = unbiasedRandomUint32(0, maxExclusive, randomUint32Fn)
      expect(value).to.equal(126)
    })

    it('gets additional values when unable to adjust', () => {
      randomUint32Fn.onFirstCall().returns(255)
      randomUint32Fn.onSecondCall().returns(13)
      const maxExclusive = 127 // 0b01111111
      const value = unbiasedRandomUint32(0, maxExclusive, randomUint32Fn)
      expect(value).to.equal(13)
    })

    context('when the adjusted value still exceeds the range', () => {
      const maxExclusive = 127
      const usableValue = 123

      beforeEach(() => {
        randomUint32Fn.onFirstCall().returns(255)
        randomUint32Fn.onSecondCall().returns(usableValue)
      })

      it('generates another value', () => {
        unbiasedRandomUint32(MIN_SAFE_UINT32_INCLUSIVE, maxExclusive, randomUint32Fn)
        expect(randomUint32Fn.callCount).to.equal(2)
      })

      it('uses the next generated value adjustable to the range', () => {
        const value = unbiasedRandomUint32(MIN_SAFE_UINT32_INCLUSIVE, maxExclusive, randomUint32Fn)
        expect(value).to.equal(usableValue)
      })
    })

    it('ensures large values are returned as unsigned 32-bit integers', () => {
      // This is a case which was known to break with bitwise operations on 32-bit value
      randomUint32Fn.returns(2982918433)
      const value = unbiasedRandomUint32(0, MAX_SAFE_UINT32_INCLUSIVE, randomUint32Fn)
      expect(value).to.equal(2982918433)
    })

    it(`can return the minimum unsigned 32-bit integer (${MAX_SAFE_UINT32_INCLUSIVE})`, () => {
      randomUint32Fn.returns(MAX_SAFE_UINT32_INCLUSIVE)
      const value = unbiasedRandomUint32(
        MIN_SAFE_UINT32_INCLUSIVE,
        MAX_SAFE_UINT32_EXCLUSIVE,
        randomUint32Fn
      )
      expect(value).to.equal(MAX_SAFE_UINT32_INCLUSIVE)
    })

    it(`can return the maximum unsigned 32-bit integer (${MAX_SAFE_UINT32_INCLUSIVE})`, () => {
      randomUint32Fn.returns(MAX_SAFE_UINT32_INCLUSIVE)
      const value = unbiasedRandomUint32(
        MIN_SAFE_UINT32_INCLUSIVE,
        MAX_SAFE_UINT32_EXCLUSIVE,
        randomUint32Fn
      )
      expect(value).to.equal(MAX_SAFE_UINT32_INCLUSIVE)
    })

    context('when the difference between the given minimum and maximum is 1 bit (1)', () => {
      it('does not call the given generator function', () => {
        unbiasedRandomUint32(123, 124, randomUint32Fn)
        expect(randomUint32Fn.callCount).to.equal(0)
      })

      it('returns the given minimum value', () => {
        const value = unbiasedRandomUint32(123, 124, randomUint32Fn)
        expect(value).to.equal(123)
      })
    })

    it(`uses ${MIN_SAFE_UINT32_INCLUSIVE} as the default minimum`, () => {
      randomUint32Fn.returns(MIN_SAFE_UINT32_INCLUSIVE)
      const value = unbiasedRandomUint32(undefined, MAX_SAFE_UINT32_EXCLUSIVE, randomUint32Fn)
      expect(value).to.equal(MIN_SAFE_UINT32_INCLUSIVE)
    })

    it(`uses ${MAX_SAFE_UINT32_EXCLUSIVE} as the default maximum`, () => {
      randomUint32Fn.returns(MAX_SAFE_UINT32_INCLUSIVE)
      const value = unbiasedRandomUint32(MIN_SAFE_UINT32_INCLUSIVE, undefined, randomUint32Fn)
      expect(value).to.equal(MAX_SAFE_UINT32_INCLUSIVE)
    })

    it(`accepts a maximum of ${MAX_SAFE_UINT32_EXCLUSIVE}`, () => {
      expect(() => {
        unbiasedRandomUint32(MIN_SAFE_UINT32_INCLUSIVE, MAX_SAFE_UINT32_EXCLUSIVE, randomUint32Fn)
      }).to.not.throw()
    })

    it(`rejects any minimum lower than ${MIN_SAFE_UINT32_INCLUSIVE}`, () => {
      expect(() => {
        unbiasedRandomUint32(MIN_SAFE_UINT32_INCLUSIVE - 1, 1, randomUint32Fn)
      }).to.throw()
    })

    it(`rejects any maximum higher than ${MAX_SAFE_UINT32_EXCLUSIVE}`, () => {
      expect(() => {
        unbiasedRandomUint32(
          MIN_SAFE_UINT32_INCLUSIVE,
          MAX_SAFE_UINT32_EXCLUSIVE + 1,
          randomUint32Fn
        )
      }).to.throw()
    })

    it(`rejects any maximum equal to the given minimum`, () => {
      expect(() => {
        unbiasedRandomUint32(123, 123, randomUint32Fn)
      }).to.throw()
    })

    it(`rejects any maximum lower than the given minimum`, () => {
      expect(() => {
        unbiasedRandomUint32(123, 122, randomUint32Fn)
      }).to.throw()
    })
  })
})
