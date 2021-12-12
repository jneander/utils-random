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
import {Mulberry32NumberGenerator} from './mulberry32'

describe('numbers > seeded generation > Mulberry32NumberGenerator', () => {
  it('can be instantiated with a numerical seed', () => {
    const gen = new Mulberry32NumberGenerator({seed: 123})
    expect(gen.nextInt32()).to.equal(-913747320)
  })

  it('can be instantiated with a string seed', () => {
    const gen = new Mulberry32NumberGenerator({seed: 'start'})
    expect(gen.nextInt32()).to.equal(-1690874895)
  })

  it('can be instantiated with a function returning a numerical seed', () => {
    const gen = new Mulberry32NumberGenerator({seedFn: () => 123})
    expect(gen.nextInt32()).to.equal(-913747320)
  })

  it('can be instantiated with a function returning a string seed', () => {
    const gen = new Mulberry32NumberGenerator({seedFn: () => 'start'})
    expect(gen.nextInt32()).to.equal(-1690874895)
  })

  it('can be instantiated with a known state', () => {
    const gen1 = new Mulberry32NumberGenerator({seed: 123})
    const gen2 = new Mulberry32NumberGenerator({state: gen1.getState()})
    expect(gen2.nextInt32()).to.equal(gen1.nextInt32())
  })

  it('can be instantiated without deterministic seeding', () => {
    const gen = new Mulberry32NumberGenerator()
    expect(gen.nextInt32())
      .to.be.lessThanOrEqual(MAX_SAFE_INT32_INCLUSIVE)
      .and.greaterThanOrEqual(MIN_SAFE_INT32_INCLUSIVE)
  })

  describe('#getState()', () => {
    it('returns the current state of the generator', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      expect(gen.getState()).to.have.keys('seed')
    })

    it('returns a unique instance of the state', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      expect(gen.getState()).to.not.equal(gen.getState())
    })
  })

  describe('#nextFract32()', () => {
    it('returns a 32-bit decimal fraction', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const value = gen.nextFract32()
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it(`returns a value between ${MIN_SAFE_FRACT32_INCLUSIVE} (inclusive) and ${MAX_SAFE_FRACT32_EXCLUSIVE} (exclusive)`, () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(11749833))
      expect(max).to.equal(bitwiseUint32ToFract32(4272732017))
    })

    it('accepts an optional range', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1622362569))
      expect(max).to.equal(bitwiseUint32ToFract32(2680972956))
    })

    it('accepts an optional minimum', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, undefined), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1622362569))
      expect(max).to.equal(bitwiseUint32ToFract32(4283027463))
    })

    it('accepts an optional maximum', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(undefined, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(11749833))
      expect(max).to.equal(bitwiseUint32ToFract32(2672414727))
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

      const gen = new Mulberry32NumberGenerator({seed: 18})
      const expectedResult = bitwiseUint32ToFract32(2054706655) // 0.47839867300353944
      expect(gen.nextFract32(0.375, 0.6875)).to.equal(expectedResult)
    })
  })

  describe('#nextInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      const gen = new Mulberry32NumberGenerator({seed: 2})
      expect(gen.nextInt32()).to.equal(-1141383503)
    })

    it(`returns a value inclusively between ${MIN_SAFE_INT32_INCLUSIVE} and ${MAX_SAFE_INT32_INCLUSIVE}`, () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(), 100)
      expect(min).to.equal(-2108551897)
      expect(max).to.equal(2100857034)
    })

    it('accepts an optional range', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, 32768), 100)
      expect(min).to.equal(8590)
      expect(max).to.equal(32545)
    })

    it('accepts an optional minimum', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, undefined), 100)
      expect(min).to.equal(11758025)
      expect(max).to.equal(2125256561)
    })

    it('accepts an optional maximum', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(undefined, 32768), 100)
      expect(min).to.equal(-2112391494)
      expect(max).to.equal(-6498877)
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

      const gen = new Mulberry32NumberGenerator({seed: 1})
      expect(gen.nextInt32(8192, 32768)).to.equal(27081)
    })
  })

  describe('#nextUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      const gen = new Mulberry32NumberGenerator({seed: 2})
      expect(gen.nextUint32()).to.equal(3153583793)
    })

    it(`returns a value inclusively between ${MIN_SAFE_UINT32_INCLUSIVE} and ${MAX_SAFE_UINT32_INCLUSIVE}`, () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(), 100)
      expect(min).to.equal(11749833)
      expect(max).to.equal(4272732017)
    })

    it('accepts an optional range', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, 32768), 100)
      expect(min).to.equal(8590)
      expect(max).to.equal(32545)
    })

    it('accepts an optional minimum', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, undefined), 100)
      expect(min).to.equal(11758025)
      expect(max).to.equal(4272740209)
    })

    it('accepts an optional maximum', () => {
      const gen = new Mulberry32NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(undefined, 32768), 100)
      expect(min).to.equal(398)
      expect(max).to.equal(32428)
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
       * 1st generated value: 2693262067, masked to 27379, exceeds the range.
       * 2nd generated value: 11749833, masked to 18889, is within range.
       *
       * Result: minimum (8192) + 18889 = 27081
       */

      const gen = new Mulberry32NumberGenerator({seed: 1})
      expect(gen.nextUint32(8192, 32768)).to.equal(27081)
    })
  })
})
