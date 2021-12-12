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
  bitwiseFractToFract32,
  bitwiseUint32ToFract32
} from '../../shared'
import {MathRandomNumberGenerator} from './math-random-number-generator'

describe('numbers > insecure generation > MathRandomNumberGenerator', () => {
  let gen: MathRandomNumberGenerator
  let math: {
    random: SinonStub<[], number>
  }

  beforeEach(() => {
    math = {
      random: stub<[], number>()
    }

    gen = new MathRandomNumberGenerator({math})
  })

  describe('#nextFract32()', () => {
    it('returns a decimal fraction', () => {
      math.random.returns(0.625)
      expect(gen.nextFract32()).to.equal(0.625)
    })

    it('returns a 32-bit decimal fraction', () => {
      math.random.returns(0.625)
      const value = gen.nextFract32()
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it(`returns a value no less than ${MIN_SAFE_FRACT32_INCLUSIVE}`, () => {
      math.random.returns(0)
      const value = gen.nextFract32()
      expect(value).to.equal(MIN_SAFE_FRACT32_INCLUSIVE)
    })

    it(`returns a value less than ${MAX_SAFE_FRACT32_EXCLUSIVE}`, () => {
      math.random.returns(1 - 1 / Number.MAX_SAFE_INTEGER)
      const value = gen.nextFract32()
      expect(value).to.equal(MAX_SAFE_FRACT32_INCLUSIVE)
    })

    it('returns a value no less than an optional minimum', () => {
      math.random.returns(0)
      const value = gen.nextFract32(0.375, undefined)
      expect(value).to.equal(0.375)
    })

    it('returns a value less than an optional maximum', () => {
      math.random.returns(1 - 1 / Number.MAX_SAFE_INTEGER)
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

      math.random.onFirstCall().returns(bitwiseUint32ToFract32(1710092718))
      math.random.onSecondCall().returns(bitwiseUint32ToFract32(2591577567))
      const expectedResult = bitwiseUint32ToFract32(2054706655) // 0.47839867300353944
      expect(gen.nextFract32(0.375, 0.6875)).to.equal(expectedResult)
    })
  })

  describe('#nextInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      math.random.returns(0.625)
      expect(gen.nextInt32()).to.equal(-1610612736)
    })

    it(`returns a value no less than ${MIN_SAFE_INT32_INCLUSIVE}`, () => {
      math.random.returns(0.5)
      const value = gen.nextInt32()
      expect(value).to.equal(MIN_SAFE_INT32_INCLUSIVE)
    })

    it(`returns a value less than ${MAX_SAFE_INT32_EXCLUSIVE}`, () => {
      math.random.returns(0.5 - 1 / Number.MAX_SAFE_INTEGER)
      const value = gen.nextInt32()
      expect(value).to.equal(MAX_SAFE_INT32_INCLUSIVE)
    })

    it('returns a value no less than an optional minimum', () => {
      math.random.returns(0)
      const value = gen.nextInt32(123, undefined)
      expect(value).to.equal(123)
    })

    it('returns a value less than an optional maximum', () => {
      math.random.returns(1 - 1 / Number.MAX_SAFE_INTEGER)
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

      math.random.onFirstCall().returns(bitwiseUint32ToFract32(545778419))
      math.random.onSecondCall().returns(bitwiseUint32ToFract32(2159233481))
      expect(gen.nextInt32(8192, 32768)).to.equal(27081)
    })
  })

  describe('#nextUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      math.random.returns(0.625)
      expect(gen.nextUint32()).to.equal(2684354560)
    })

    it(`returns a value no less than ${MIN_SAFE_UINT32_INCLUSIVE}`, () => {
      math.random.returns(0)
      const value = gen.nextUint32()
      expect(value).to.equal(MIN_SAFE_UINT32_INCLUSIVE)
    })

    it(`returns a value less than ${MAX_SAFE_UINT32_EXCLUSIVE}`, () => {
      math.random.returns(1 - 1 / Number.MAX_SAFE_INTEGER)
      const value = gen.nextUint32()
      expect(value).to.equal(MAX_SAFE_UINT32_INCLUSIVE)
    })

    it('returns a value no less than an optional minimum', () => {
      math.random.returns(0)
      const value = gen.nextUint32(123, undefined)
      expect(value).to.equal(123)
    })

    it('returns a value less than an optional maximum', () => {
      math.random.returns(1 - 1 / Number.MAX_SAFE_INTEGER)
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

      math.random.onFirstCall().returns(bitwiseUint32ToFract32(545778419))
      math.random.onSecondCall().returns(bitwiseUint32ToFract32(2159233481))
      expect(gen.nextUint32(8192, 32768)).to.equal(27081)
    })
  })
})
