import {expect} from 'chai'

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
  WebCrypto,
  bitwiseFractToFract32,
  bitwiseUint32ToFract32
} from '../../shared'
import {iterateForMinAndMax, WebCryptoDouble} from '../../spec-support'
import {WebCryptoNumberGenerator} from './web-crypto-number-generator'

describe('numbers > secure generation > WebCryptoNumberGenerator', () => {
  let crypto: WebCryptoDouble

  beforeEach(() => {
    crypto = new WebCryptoDouble()
  })

  describe('#nextFract32()', () => {
    it('returns a decimal fraction', () => {
      crypto.pushSequenceValues([96, 0, 0, 0])
      const gen = new WebCryptoNumberGenerator({crypto})
      expect(gen.nextFract32()).to.equal(0.375)
    })

    it('returns a 32-bit decimal fraction', () => {
      crypto.pushSequenceValues([128, 128, 128, 128])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextFract32()
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it(`returns a value no less than ${MIN_SAFE_FRACT32_INCLUSIVE}`, () => {
      crypto.pushSequenceValues([0, 0, 0, 0])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextFract32()
      expect(value).to.equal(MIN_SAFE_FRACT32_INCLUSIVE)
    })

    it(`returns a value less than ${MAX_SAFE_FRACT32_EXCLUSIVE}`, () => {
      crypto.pushSequenceValues([255, 255, 255, 255])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextFract32()
      expect(value).to.equal(MAX_SAFE_FRACT32_INCLUSIVE)
    })

    it('returns a value no less than an optional minimum', () => {
      crypto.pushSequenceValues([0, 0, 0, 0])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextFract32(0.375, undefined)
      expect(value).to.equal(0.375)
    })

    it('returns a value less than an optional maximum', () => {
      crypto.pushSequenceValues([255, 255, 255, 255])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextFract32(undefined, 0.5)
      expect(value).to.equal(0.5 - ONE_BIT_AS_FRACT32)
    })

    it('returns a value without bias', () => {
      /*
       * minimum: 0.3750 = 0b01100000000000000000000000000000 (as uint32: 1610612736)
       * maximum: 0.6875 = 0b10100000000000000000000000000000 (as uint32: 2952790016)
       * range:   0.3125 = 0b01010000000000000000000000000000 (as uint32: 1342177280)
       * mask:             0b01111111111111111111111111111111
       *
       * masked value 1:   0b01100101111011011111000110101110
       * masked value 2:   0b00011010011110000101010111011111
       *
       * 1st generated value: 1710092718, masked to 1710092718, exceeds the range.
       * 2nd generated value: 2591577567, masked to 444093919, is within range.
       *
       * Result: minimum (1610612736) + 444093919 = 2054706655
       */

      crypto.pushSequenceValues([101, 237, 241, 174])
      crypto.pushSequenceValues([154, 120, 85, 223])
      const gen = new WebCryptoNumberGenerator({crypto})
      const expectedResult = bitwiseUint32ToFract32(2054706655) // 0.47839867300353944
      expect(gen.nextFract32(0.375, 0.6875)).to.equal(expectedResult)
    })
  })

  describe('#nextInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      crypto.pushSequenceValues([128, 128, 128, 128])
      const gen = new WebCryptoNumberGenerator({crypto})
      expect(gen.nextInt32()).to.equal(-2139062144)
    })

    it(`returns a value no less than ${MIN_SAFE_INT32_INCLUSIVE}`, () => {
      crypto.pushSequenceValues([128, 0, 0, 0])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextInt32()
      expect(value).to.equal(MIN_SAFE_INT32_INCLUSIVE)
    })

    it(`returns a value less than ${MAX_SAFE_INT32_EXCLUSIVE}`, () => {
      crypto.pushSequenceValues([127, 255, 255, 255])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextInt32()
      expect(value).to.equal(MAX_SAFE_INT32_INCLUSIVE)
    })

    it('returns a value no less than an optional minimum', () => {
      crypto.pushSequenceValues([0, 0, 0, 0])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextInt32(123, undefined)
      expect(value).to.equal(123)
    })

    it('returns a value less than an optional maximum', () => {
      crypto.pushSequenceValues([255, 255, 255, 255])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextInt32(undefined, 0)
      expect(value).to.equal(-1)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0110101011110011
       * masked value 2:  0b0100100111001001
       *
       * 1st generated value: 545778419, masked to 27379, exceeds the range.
       * 2nd generated value: 2159233481, masked to 18889, is within range.
       *
       * Result: minimum (8192) + 18889 = 27081
       */

      crypto.pushSequenceValues([32, 125, 234, 243])
      crypto.pushSequenceValues([128, 179, 73, 201])
      const gen = new WebCryptoNumberGenerator({crypto})
      expect(gen.nextInt32(8192, 32768)).to.equal(27081)
    })
  })

  describe('#nextUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      crypto.pushSequenceValues([128, 128, 128, 128])
      const gen = new WebCryptoNumberGenerator({crypto})
      expect(gen.nextUint32()).to.equal(2155905152)
    })

    it(`returns a value no less than ${MIN_SAFE_UINT32_INCLUSIVE}`, () => {
      crypto.pushSequenceValues([0, 0, 0, 0])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextUint32()
      expect(value).to.equal(MIN_SAFE_UINT32_INCLUSIVE)
    })

    it(`returns a value less than ${MAX_SAFE_UINT32_EXCLUSIVE}`, () => {
      crypto.pushSequenceValues([255, 255, 255, 255])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextUint32()
      expect(value).to.equal(MAX_SAFE_UINT32_INCLUSIVE)
    })

    it('returns a value no less than an optional minimum', () => {
      crypto.pushSequenceValues([0, 0, 0, 0])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextUint32(123, undefined)
      expect(value).to.equal(123)
    })

    it('returns a value less than an optional maximum', () => {
      crypto.pushSequenceValues([255, 255, 255, 255])
      const gen = new WebCryptoNumberGenerator({crypto})
      const value = gen.nextUint32(undefined, 256)
      expect(value).to.equal(255)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0110101011110011
       * masked value 2:  0b0100100111001001
       *
       * 1st generated value: 545778419, masked to 27379, exceeds the range.
       * 2nd generated value: 2159233481, masked to 18889, is within range.
       *
       * Result: minimum (8192) + 18889 = 27081
       */

      crypto.pushSequenceValues([32, 125, 234, 243])
      crypto.pushSequenceValues([128, 179, 73, 201])
      const gen = new WebCryptoNumberGenerator({crypto})
      expect(gen.nextUint32(8192, 32768)).to.equal(27081)
    })
  })

  context('with the real Crypto API', () => {
    let crypto: WebCrypto = globalThis.crypto

    before(async () => {
      if (crypto == null) {
        crypto = (await import('crypto')).webcrypto as unknown as WebCrypto
      }
    })

    /*
     * These are smoke tests which test the outer boundary requirements of this
     * function. They are non-deterministic, due to the use of the real Web
     * Crypto API. In the event the assertions within fail, the failure will be
     * difficult to reproduce. However, this signals that something is wrong
     * with the implementation and that additional tests using a fake Crypto
     * object are required to guarantee the correct behavior.
     */

    describe('#nextFract32()', () => {
      it('returns 32-bit decimal fractions within a given range', () => {
        const gen = new WebCryptoNumberGenerator({crypto})
        const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, 0.6875), 100)
        expect(min).to.be.greaterThanOrEqual(0.375)
        expect(max).to.be.lessThan(0.6875)
      })

      it('returns 32-bit decimal fractions within the maximum range', () => {
        const gen = new WebCryptoNumberGenerator({crypto})
        const {min, max} = iterateForMinAndMax(() => gen.nextFract32(), 100)
        expect(min).to.be.greaterThanOrEqual(MIN_SAFE_FRACT32_INCLUSIVE)
        expect(max).to.be.lessThan(MAX_SAFE_FRACT32_EXCLUSIVE)
      })
    })

    describe('#nextInt32()', () => {
      it('returns 32-bit signed integers within a given range', () => {
        const gen = new WebCryptoNumberGenerator({crypto})
        const {min, max} = iterateForMinAndMax(() => gen.nextInt32(123, 256), 100)
        expect(min).to.be.greaterThanOrEqual(123)
        expect(max).to.be.lessThan(256)
      })

      it('returns 32-bit signed integers within the maximum range', () => {
        const gen = new WebCryptoNumberGenerator({crypto})
        const {min, max} = iterateForMinAndMax(() => gen.nextInt32(), 100)
        expect(min).to.be.greaterThanOrEqual(MIN_SAFE_INT32_INCLUSIVE)
        expect(max).to.be.lessThan(MAX_SAFE_INT32_EXCLUSIVE)
      })
    })

    describe('#nextUint32()', () => {
      it('returns 32-bit unsigned integers within a given range', () => {
        const gen = new WebCryptoNumberGenerator({crypto})
        const {min, max} = iterateForMinAndMax(() => gen.nextUint32(123, 256), 100)
        expect(min).to.be.greaterThanOrEqual(123)
        expect(max).to.be.lessThan(256)
      })

      it('returns 32-bit unsigned integers within the maximum range', () => {
        const gen = new WebCryptoNumberGenerator({crypto})
        const {min, max} = iterateForMinAndMax(() => gen.nextUint32(), 100)
        expect(min).to.be.greaterThanOrEqual(MIN_SAFE_UINT32_INCLUSIVE)
        expect(max).to.be.lessThan(MAX_SAFE_UINT32_EXCLUSIVE)
      })
    })
  })
})
