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
import {Xor128NumberGenerator} from './xor128'

describe('numbers > seeded generation > Xor128NumberGenerator', () => {
  it('can be instantiated with a numerical seed', () => {
    const gen1 = new Xor128NumberGenerator({seed: 123})
    expect(gen1.nextInt32()).to.equal(1899687109)
  })

  it('can be instantiated with a string seed', () => {
    const gen1 = new Xor128NumberGenerator({seed: 'start'})
    expect(gen1.nextInt32()).to.equal(134654883)
  })

  it('can be instantiated with a function returning a numerical seed', () => {
    const gen1 = new Xor128NumberGenerator({seedFn: () => 123})
    expect(gen1.nextInt32()).to.equal(1899687109)
  })

  it('can be instantiated with a function returning a string seed', () => {
    const gen1 = new Xor128NumberGenerator({seedFn: () => 'start'})
    expect(gen1.nextInt32()).to.equal(134654883)
  })

  it('can be instantiated with a known state', () => {
    const gen1 = new Xor128NumberGenerator({seed: 123})
    const gen2 = new Xor128NumberGenerator({state: gen1.getState()})
    expect(gen2.nextInt32()).to.equal(gen1.nextInt32())
  })

  it('can be instantiated without deterministic seeding', () => {
    const gen1 = new Xor128NumberGenerator()
    expect(gen1.nextInt32())
      .to.be.lessThanOrEqual(MAX_SAFE_INT32_INCLUSIVE)
      .and.greaterThanOrEqual(MIN_SAFE_INT32_INCLUSIVE)
  })

  describe('#getState()', () => {
    it('returns the current state of the generator', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      expect(gen.getState()).to.have.keys('w', 'x', 'y', 'z')
    })

    it('returns a unique instance of the state', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      expect(gen.getState()).to.not.equal(gen.getState())
    })
  })

  describe('#nextFract32()', () => {
    it('returns a 32-bit decimal fraction', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const value = gen.nextFract32()
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it(`returns a value between ${MIN_SAFE_FRACT32_INCLUSIVE} (inclusive) and ${MAX_SAFE_FRACT32_EXCLUSIVE} (exclusive)`, () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(76327295))
      expect(max).to.equal(bitwiseUint32ToFract32(4292193909))
    })

    it('accepts an optional range', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1611896875))
      expect(max).to.equal(bitwiseUint32ToFract32(2684291739))
    })

    it('accepts an optional minimum', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, undefined), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1666407658))
      expect(max).to.equal(bitwiseUint32ToFract32(4287247749))
    })

    it('accepts an optional maximum', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(undefined, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(55794922))
      expect(max).to.equal(bitwiseUint32ToFract32(2676635013))
    })

    it('returns a value without bias', () => {
      /*
       * minimum: 0.3750 = 0b01100000000000000000000000000000 (as uint32: 1610612736)
       * maximum: 0.6875 = 0b10100000000000000000000000000000 (as uint32: 2952790016)
       * range:   0.3125 = 0b01010000000000000000000000000000 (as uint32: 1342177280)
       * mask:             0b01111111111111111111111111111111
       *
       * masked value 1:   0b01010011001011010111101010010100
       * masked value 2:   0b00000101100111011101101011010101
       *
       * 1st generated value: 1395489428, masked to 1395489428, exceeds the range.
       * 2nd generated value: 94231253, masked to 94231253, is within range.
       *
       * Result: minimum (1610612736) + 94231253 = 1704843989
       */

      const gen = new Xor128NumberGenerator({seed: 18})
      const expectedResult = bitwiseUint32ToFract32(1704843989) // 0.39693992328830063
      expect(gen.nextFract32(0.375, 0.6875)).to.equal(expectedResult)
    })
  })

  describe('#nextInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      const gen = new Xor128NumberGenerator({seed: 2})
      expect(gen.nextInt32()).to.equal(-1932416579)
    })

    it(`returns a value inclusively between ${MIN_SAFE_INT32_INCLUSIVE} and ${MAX_SAFE_INT32_INCLUSIVE}`, () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(), 100)
      expect(min).to.equal(-2122256440)
      expect(max).to.equal(2044483409)
    })

    it('accepts an optional range', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, 32768), 100)
      expect(min).to.equal(8495)
      expect(max).to.equal(32720)
    })

    it('accepts an optional minimum', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, undefined), 100)
      expect(min).to.equal(25235400)
      expect(max).to.equal(2144718453)
    })

    it('accepts an optional maximum', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(undefined, 32768), 100)
      expect(min).to.equal(-2122256440)
      expect(max).to.equal(-2773387)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0111000110111000
       * masked value 2:  0b0010000110111011
       *
       * 1st generated value: 4028363192, masked to 29112, exceeds the range.
       * 2nd generated value: 923083195, masked to 8635, is within range.
       *
       * Result: minimum (8192) + 8635 = 16827
       */

      const gen = new Xor128NumberGenerator({seed: 7})
      expect(gen.nextInt32(8192, 32768)).to.equal(16827)
    })
  })

  describe('#nextUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      const gen = new Xor128NumberGenerator({seed: 2})
      expect(gen.nextUint32()).to.equal(2362550717)
    })

    it(`returns a value inclusively between ${MIN_SAFE_UINT32_INCLUSIVE} and ${MAX_SAFE_UINT32_INCLUSIVE}`, () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(), 100)
      expect(min).to.equal(76327295)
      expect(max).to.equal(4292193909)
    })

    it('accepts an optional range', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, 32768), 100)
      expect(min).to.equal(8495)
      expect(max).to.equal(32720)
    })

    it('accepts an optional minimum', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, undefined), 100)
      expect(min).to.equal(76335487)
      expect(max).to.equal(4292202101)
    })

    it('accepts an optional maximum', () => {
      const gen = new Xor128NumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(undefined, 32768), 100)
      expect(min).to.equal(439)
      expect(max).to.equal(32673)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0111000110111000
       * masked value 2:  0b0010000110111011
       *
       * 1st generated value: 1880879544, masked to 29112, exceeds the range.
       * 2nd generated value: 3070566843, masked to 8635, is within range.
       *
       * Result: minimum (8192) + 8635 = 16827
       */

      const gen = new Xor128NumberGenerator({seed: 7})
      expect(gen.nextUint32(8192, 32768)).to.equal(16827)
    })
  })
})
