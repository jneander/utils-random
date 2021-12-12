import {expect} from 'chai'

import {
  MAX_SAFE_FRACT32_EXCLUSIVE,
  MAX_SAFE_INT32_INCLUSIVE,
  MAX_SAFE_UINT32_INCLUSIVE,
  MIN_SAFE_FRACT32_INCLUSIVE,
  MIN_SAFE_INT32_INCLUSIVE,
  MIN_SAFE_UINT32_INCLUSIVE,
  bitwiseFractToFract32,
  bitwiseUint32ToFract32
} from '../../shared'
import {iterateForMinAndMax} from '../../spec-support'
import {XorWowNumberGenerator} from './xorWow'

describe('numbers > seeded generation > XorWowNumberGenerator', () => {
  it('can be instantiated with a numerical seed', () => {
    const gen = new XorWowNumberGenerator({seed: 123})
    expect(gen.nextInt32()).to.equal(-27449093)
  })

  it('can be instantiated with a string seed', () => {
    const gen = new XorWowNumberGenerator({seed: 'start'})
    expect(gen.nextInt32()).to.equal(2083255092)
  })

  it('can be instantiated with a function returning a numerical seed', () => {
    const gen = new XorWowNumberGenerator({seedFn: () => 123})
    expect(gen.nextInt32()).to.equal(-27449093)
  })

  it('can be instantiated with a function returning a string seed', () => {
    const gen = new XorWowNumberGenerator({seedFn: () => 'start'})
    expect(gen.nextInt32()).to.equal(2083255092)
  })

  it('can be instantiated with a known state', () => {
    const gen1 = new XorWowNumberGenerator({seed: 123})
    const gen2 = new XorWowNumberGenerator({state: gen1.getState()})
    expect(gen2.nextInt32()).to.equal(gen1.nextInt32())
  })

  it('can be instantiated without deterministic seeding', () => {
    const gen = new XorWowNumberGenerator()
    expect(gen.nextInt32())
      .to.be.lessThanOrEqual(MAX_SAFE_INT32_INCLUSIVE)
      .and.greaterThanOrEqual(MIN_SAFE_INT32_INCLUSIVE)
  })

  describe('#getState()', () => {
    it('returns the current state of the generator', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      expect(gen.getState()).to.have.keys('d', 'v', 'w', 'x', 'y', 'z')
    })

    it('returns a unique instance of the state', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      expect(gen.getState()).to.not.equal(gen.getState())
    })
  })

  describe('#nextFract32()', () => {
    it('returns a 32-bit decimal fraction', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const value = gen.nextFract32()
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it(`returns a value between ${MIN_SAFE_FRACT32_INCLUSIVE} (inclusive) and ${MAX_SAFE_FRACT32_EXCLUSIVE} (exclusive)`, () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(41613143))
      expect(max).to.equal(bitwiseUint32ToFract32(4280617750))
    })

    it('accepts an optional range', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1625196873))
      expect(max).to.equal(bitwiseUint32ToFract32(2679601653))
    })

    it('accepts an optional minimum', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, undefined), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1628967302))
      expect(max).to.equal(bitwiseUint32ToFract32(4240896955))
    })

    it('accepts an optional maximum', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(undefined, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(18354566))
      expect(max).to.equal(bitwiseUint32ToFract32(2630284219))
    })

    it('returns a value without bias', () => {
      /*
       * minimum: 0.3750 = 0b01100000000000000000000000000000 (as uint32: 1610612736)
       * maximum: 0.6875 = 0b10100000000000000000000000000000 (as uint32: 2952790016)
       * range:   0.3125 = 0b01010000000000000000000000000000 (as uint32: 1342177280)
       * mask:             0b01111111111111111111111111111111
       *
       * masked value 1:   0b01111011100010100100110000000100
       * masked value 2:   0b01001011010000100001111010001000
       *
       * 1st generated value: 4220144644, masked to 2072660996, exceeds the range.
       * 2nd generated value: 3410108040, masked to 1262624392, is within range.
       *
       * Result: minimum (1610612736) + 1262624392 = 2873237128
       */

      const gen = new XorWowNumberGenerator({seed: 14})
      const expectedResult = bitwiseUint32ToFract32(2873237128) // 0.6689776498824358
      expect(gen.nextFract32(0.375, 0.6875)).to.equal(expectedResult)
    })
  })

  describe('#nextInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      const gen = new XorWowNumberGenerator({seed: 2})
      expect(gen.nextInt32()).to.equal(-900626929)
    })

    it(`returns a value inclusively between ${MIN_SAFE_INT32_INCLUSIVE} and ${MAX_SAFE_INT32_INCLUSIVE}`, () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(), 100)
      expect(min).to.equal(-2047763257)
      expect(max).to.equal(2142730741)
    })

    it('accepts an optional range', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, 32768), 100)
      expect(min).to.equal(8814)
      expect(max).to.equal(32668)
    })

    it('accepts an optional minimum', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(undefined, 32768), 100)
      expect(min).to.equal(-2097180105)
      expect(max).to.equal(-14349546)
    })

    it('accepts an optional maximum', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, undefined), 100)
      expect(min).to.equal(41621335)
      expect(max).to.equal(2142738933)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0110011001101100
       * masked value 2:  0b0010111010010000
       *
       * 1st generated value: 1555097196, masked to 26220, exceeds the range.
       * 2nd generated value: 4003081872, masked to 18889, is within range.
       *
       * Result: minimum (8192) + 11920 = 20112
       */

      const gen = new XorWowNumberGenerator({seed: 4})
      expect(gen.nextInt32(8192, 32768)).to.equal(20112)
    })
  })

  describe('#nextUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      const gen = new XorWowNumberGenerator({seed: 2})
      expect(gen.nextUint32()).to.equal(3394340367)
    })

    it(`returns a value inclusively between ${MIN_SAFE_UINT32_INCLUSIVE} and ${MAX_SAFE_UINT32_INCLUSIVE}`, () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(), 100)
      expect(min).to.equal(41613143)
      expect(max).to.equal(4280617750)
    })

    it('accepts an optional range', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, 32768), 100)
      expect(min).to.equal(8814)
      expect(max).to.equal(32668)
    })

    it('accepts an optional minimum', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(undefined, 32768), 100)
      expect(min).to.equal(622)
      expect(max).to.equal(32512)
    })

    it('accepts an optional maximum', () => {
      const gen = new XorWowNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, undefined), 100)
      expect(min).to.equal(41621335)
      expect(max).to.equal(4280625942)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0110011001101100
       * masked value 2:  0b0010111010010000
       *
       * 1st generated value: 3702580844, masked to 26220, exceeds the range.
       * 2nd generated value: 1855598224, masked to 11920, is within range.
       *
       * Result: minimum (8192) + 11920 = 28688
       */

      const gen = new XorWowNumberGenerator({seed: 4})
      expect(gen.nextUint32(8192, 32768)).to.equal(20112)
    })
  })
})
