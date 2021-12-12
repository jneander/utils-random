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
import {XorShift7NumberGenerator} from './xorShift7'

describe('numbers > seeded generation > XorShift7NumberGenerator', () => {
  it('can be instantiated with a numerical seed', () => {
    const gen1 = new XorShift7NumberGenerator({seed: 123})
    expect(gen1.nextInt32()).to.equal(713000723)
  })

  it('can be instantiated with a string seed', () => {
    const gen1 = new XorShift7NumberGenerator({seed: 'start'})
    expect(gen1.nextInt32()).to.equal(-1114820125)
  })

  it('can be instantiated with a function returning a numerical seed', () => {
    const gen1 = new XorShift7NumberGenerator({seedFn: () => 123})
    expect(gen1.nextInt32()).to.equal(713000723)
  })

  it('can be instantiated with a function returning a string seed', () => {
    const gen1 = new XorShift7NumberGenerator({seedFn: () => 'start'})
    expect(gen1.nextInt32()).to.equal(-1114820125)
  })

  it('can be instantiated with a known state', () => {
    const gen1 = new XorShift7NumberGenerator({seed: 123})
    const gen2 = new XorShift7NumberGenerator({state: gen1.getState()})
    expect(gen2.nextInt32()).to.equal(gen1.nextInt32())
  })

  it('can be instantiated without deterministic seeding', () => {
    const gen1 = new XorShift7NumberGenerator()
    expect(gen1.nextInt32())
      .to.be.lessThanOrEqual(MAX_SAFE_INT32_INCLUSIVE)
      .and.greaterThanOrEqual(MIN_SAFE_INT32_INCLUSIVE)
  })

  describe('#getState()', () => {
    it('returns the current state of the generator', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      expect(gen.getState()).to.have.keys('X', 'i')
    })

    it('returns a unique instance of the state', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      expect(gen.getState()).to.not.equal(gen.getState())
    })

    it('returns a deeply unique instance of the state', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      expect(gen.getState().X).to.not.equal(gen.getState().X)
    })
  })

  describe('#nextFract32()', () => {
    it('returns a 32-bit decimal fraction', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const value = gen.nextFract32()
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it(`returns a value between ${MIN_SAFE_FRACT32_INCLUSIVE} (inclusive) and ${MAX_SAFE_FRACT32_EXCLUSIVE} (exclusive)`, () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(178163600))
      expect(max).to.equal(bitwiseUint32ToFract32(4276765383))
    })

    it('accepts an optional range', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1617185655))
      expect(max).to.equal(bitwiseUint32ToFract32(2666152647))
    })

    it('accepts an optional minimum', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, undefined), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1748754339))
      expect(max).to.equal(bitwiseUint32ToFract32(4253948066))
    })

    it('accepts an optional maximum', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(undefined, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(138141603))
      expect(max).to.equal(bitwiseUint32ToFract32(2643335330))
    })

    it('returns a value without bias', () => {
      /*
       * minimum: 0.3750 = 0b01100000000000000000000000000000 (as uint32: 1610612736)
       * maximum: 0.6875 = 0b10100000000000000000000000000000 (as uint32: 2952790016)
       * range:   0.3125 = 0b01010000000000000000000000000000 (as uint32: 1342177280)
       * mask:             0b01111111111111111111111111111111
       *
       * masked value 1:   0b01111100010001001111110101000010
       * masked value 2:   0b00101000101001011001111110001101
       *
       * 1st generated value: 4232379714, masked to 2084896066, exceeds the range.
       * 2nd generated value: 681942925, masked to 681942925, is within range.
       *
       * Result: minimum (1610612736) + 681942925 = 2292555661
       */

      const gen = new XorShift7NumberGenerator({seed: 7})
      const expectedResult = bitwiseUint32ToFract32(2292555661) // 0.5337772101629525
      expect(gen.nextFract32(0.375, 0.6875)).to.equal(expectedResult)
    })
  })

  describe('#nextInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      const gen = new XorShift7NumberGenerator({seed: 4})
      expect(gen.nextInt32()).to.equal(-1171430091)
    })

    it(`returns a value inclusively between ${MIN_SAFE_INT32_INCLUSIVE} and ${MAX_SAFE_INT32_INCLUSIVE}`, () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(), 100)
      expect(min).to.equal(-2132315971)
      expect(max).to.equal(2108387136)
    })

    it('accepts an optional range', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, 32768), 100)
      expect(min).to.equal(8220)
      expect(max).to.equal(32719)
    })

    it('accepts an optional minimum', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, undefined), 100)
      expect(min).to.equal(15175869)
      expect(max).to.equal(2129289927)
    })

    it('accepts an optional maximum', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(undefined, 32768), 100)
      expect(min).to.equal(-2132315971)
      expect(max).to.equal(-18201913)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0110010100110101
       * masked value 2:  0b0010010111000000
       *
       * 1st generated value: 976053557, masked to 25909, exceeds the range.
       * 2nd generated value: 842016192, masked to 9664, is within range.
       *
       * Result: minimum (8192) + 9664 = 17856
       */

      const gen = new XorShift7NumberGenerator({seed: 4})
      expect(gen.nextInt32(8192, 32768)).to.equal(17856)
    })
  })

  describe('#nextUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      const gen = new XorShift7NumberGenerator({seed: 4})
      expect(gen.nextUint32()).to.equal(3123537205)
    })

    it(`returns a value inclusively between ${MIN_SAFE_UINT32_INCLUSIVE} and ${MAX_SAFE_UINT32_INCLUSIVE}`, () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(), 100)
      expect(min).to.equal(178163600)
      expect(max).to.equal(4276765383)
    })

    it('accepts an optional range', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, 32768), 100)
      expect(min).to.equal(8220)
      expect(max).to.equal(32719)
    })

    it('accepts an optional minimum', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, undefined), 100)
      expect(min).to.equal(178171792)
      expect(max).to.equal(4276773575)
    })

    it('accepts an optional maximum', () => {
      const gen = new XorShift7NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(undefined, 32768), 100)
      expect(min).to.equal(69)
      expect(max).to.equal(32500)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0110010100110101
       * masked value 2:  0b0010010111000000
       *
       * 1st generated value: 3123537205, masked to 25909, exceeds the range.
       * 2nd generated value: 2989499840, masked to 9664, is within range.
       *
       * Result: minimum (8192) + 9664 = 17856
       */

      const gen = new XorShift7NumberGenerator({seed: 4})
      expect(gen.nextUint32(8192, 32768)).to.equal(17856)
    })
  })
})
