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
import {Xor4096NumberGenerator} from './xor4096'

describe('numbers > seeded generation > Xor4096NumberGenerator', () => {
  it('can be instantiated with a numerical seed', () => {
    const gen1 = new Xor4096NumberGenerator({seed: 123})
    expect(gen1.nextInt32()).to.equal(1030407654)
  })

  it('can be instantiated with a string seed', () => {
    const gen1 = new Xor4096NumberGenerator({seed: 'start'})
    expect(gen1.nextInt32()).to.equal(583067566)
  })

  it('can be instantiated with a function returning a numerical seed', () => {
    const gen1 = new Xor4096NumberGenerator({seedFn: () => 123})
    expect(gen1.nextInt32()).to.equal(1030407654)
  })

  it('can be instantiated with a function returning a string seed', () => {
    const gen1 = new Xor4096NumberGenerator({seedFn: () => 'start'})
    expect(gen1.nextInt32()).to.equal(583067566)
  })

  it('can be instantiated with a known state', () => {
    const gen1 = new Xor4096NumberGenerator({seed: 123})
    const gen2 = new Xor4096NumberGenerator({state: gen1.getState()})
    expect(gen2.nextInt32()).to.equal(gen1.nextInt32())
  })

  it('can be instantiated without deterministic seeding', () => {
    const gen1 = new Xor4096NumberGenerator()
    expect(gen1.nextInt32())
      .to.be.lessThanOrEqual(MAX_SAFE_INT32_INCLUSIVE)
      .and.greaterThanOrEqual(MIN_SAFE_INT32_INCLUSIVE)
  })

  describe('#getState()', () => {
    it('returns the current state of the generator', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      expect(gen.getState()).to.have.keys('X', 'i', 'w')
    })

    it('returns a unique instance of the state', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      expect(gen.getState()).to.not.equal(gen.getState())
    })

    it('returns a deeply unique instance of the state', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      expect(gen.getState().X).to.not.equal(gen.getState().X)
    })
  })

  describe('#nextFract32()', () => {
    it('returns a 32-bit decimal fraction', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const value = gen.nextFract32()
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it(`returns a value between ${MIN_SAFE_FRACT32_INCLUSIVE} (inclusive) and ${MAX_SAFE_FRACT32_EXCLUSIVE} (exclusive)`, () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(2757685))
      expect(max).to.equal(bitwiseUint32ToFract32(4281606268))
    })

    it('accepts an optional range', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1613370421))
      expect(max).to.equal(bitwiseUint32ToFract32(2677097949))
    })

    it('accepts an optional minimum', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, undefined), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1613370421))
      expect(max).to.equal(bitwiseUint32ToFract32(4276746301))
    })

    it('accepts an optional maximum', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(undefined, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(2757685))
      expect(max).to.equal(bitwiseUint32ToFract32(2666133565))
    })

    it('returns a value without bias', () => {
      /*
       * minimum: 0.3750 = 0b01100000000000000000000000000000 (as uint32: 1610612736)
       * maximum: 0.6875 = 0b10100000000000000000000000000000 (as uint32: 2952790016)
       * range:   0.3125 = 0b01010000000000000000000000000000 (as uint32: 1342177280)
       * mask:             0b01111111111111111111111111111111
       *
       * masked value 1:   0b01010010010101011111111011111101
       * masked value 2:   0b00011010011110000101010111011111
       *
       * 1st generated value: 1381367549, masked to 1381367549, exceeds the range.
       * 2nd generated value: 2196928089, masked to 49444441, is within range.
       *
       * Result: minimum (1610612736) + 49444441 = 1660057177
       */

      const gen = new Xor4096NumberGenerator({seed: 6})
      const expectedResult = bitwiseUint32ToFract32(1660057177) // 0.3865121810231358
      expect(gen.nextFract32(0.375, 0.6875)).to.equal(expectedResult)
    })
  })

  describe('#nextInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      const gen = new Xor4096NumberGenerator({seed: 2})
      expect(gen.nextInt32()).to.equal(-391824616)
    })

    it(`returns a value inclusively between ${MIN_SAFE_INT32_INCLUSIVE} and ${MAX_SAFE_INT32_INCLUSIVE}`, () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(), 100)
      expect(min).to.equal(-2089604581)
      expect(max).to.equal(2106213579)
    })

    it('accepts an optional range', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, 32768), 100)
      expect(min).to.equal(8283)
      expect(max).to.equal(32412)
    })

    it('accepts an optional minimum', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, undefined), 100)
      expect(min).to.equal(2765877)
      expect(max).to.equal(2134130812)
    })

    it('accepts an optional maximum', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(undefined, 32768), 100)
      expect(min).to.equal(-2105413335)
      expect(max).to.equal(-10839206)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0110111101101011
       * masked value 2:  0b0101110100000001
       *
       * 1st generated value: 842198891, masked to 28523, exceeds the range.
       * 2nd generated value: 95608065, masked to 23809, is within range.
       *
       * Result: minimum (8192) + 23809 = 32001
       */

      const gen = new Xor4096NumberGenerator({seed: 9})
      expect(gen.nextInt32(8192, 32768)).to.equal(32001)
    })
  })

  describe('#nextUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      const gen = new Xor4096NumberGenerator({seed: 2})
      expect(gen.nextUint32()).to.equal(3903142680)
    })

    it(`returns a value inclusively between ${MIN_SAFE_UINT32_INCLUSIVE} and ${MAX_SAFE_UINT32_INCLUSIVE}`, () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(), 100)
      expect(min).to.equal(2757685)
      expect(max).to.equal(4281606268)
    })

    it('accepts an optional range', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, 32768), 100)
      expect(min).to.equal(8283)
      expect(max).to.equal(32412)
    })

    it('accepts an optional minimum', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, undefined), 100)
      expect(min).to.equal(2765877)
      expect(max).to.equal(4281614460)
    })

    it('accepts an optional maximum', () => {
      const gen = new Xor4096NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(undefined, 32768), 100)
      expect(min).to.equal(250)
      expect(max).to.equal(31996)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0110111101101011
       * masked value 2:  0b0101110100000001
       *
       * 1st generated value: 2989682539, masked to 28523, exceeds the range.
       * 2nd generated value: 2243091713, masked to 23809, is within range.
       *
       * Result: minimum (8192) + 23809 = 32001
       */

      const gen = new Xor4096NumberGenerator({seed: 9})
      expect(gen.nextUint32(8192, 32768)).to.equal(32001)
    })
  })
})
