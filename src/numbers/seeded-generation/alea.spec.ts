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
import {AleaNumberGenerator} from './alea'

describe('numbers > seeded generation > AleaNumberGenerator', () => {
  it('can be instantiated with a numerical seed', () => {
    const gen1 = new AleaNumberGenerator({seed: 123})
    expect(gen1.nextInt32()).to.equal(2062144002)
  })

  it('can be instantiated with a string seed', () => {
    const gen1 = new AleaNumberGenerator({seed: 'start'})
    expect(gen1.nextInt32()).to.equal(16195758)
  })

  it('can be instantiated with a function returning a numerical seed', () => {
    const gen1 = new AleaNumberGenerator({seedFn: () => 123})
    expect(gen1.nextInt32()).to.equal(2062144002)
  })

  it('can be instantiated with a function returning a string seed', () => {
    const gen1 = new AleaNumberGenerator({seedFn: () => 'start'})
    expect(gen1.nextInt32()).to.equal(16195758)
  })

  it('can be instantiated with a known state', () => {
    const gen1 = new AleaNumberGenerator({seed: 123})
    const gen2 = new AleaNumberGenerator({state: gen1.getState()})
    expect(gen2.nextInt32()).to.equal(gen1.nextInt32())
  })

  it('can be instantiated without deterministic seeding', () => {
    const gen1 = new AleaNumberGenerator()
    expect(gen1.nextInt32())
      .to.be.lessThanOrEqual(MAX_SAFE_INT32_INCLUSIVE)
      .and.greaterThanOrEqual(MIN_SAFE_INT32_INCLUSIVE)
  })

  describe('#getState()', () => {
    it('returns the current state of the generator', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      expect(gen.getState()).to.have.keys('c', 's0', 's1', 's2')
    })

    it('returns a unique instance of the state', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      expect(gen.getState()).to.not.equal(gen.getState())
    })
  })

  describe('#nextFract32()', () => {
    it('returns a 32-bit decimal fraction', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const value = gen.nextFract32()
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it(`returns a value between ${MIN_SAFE_FRACT32_INCLUSIVE} (inclusive) and ${MAX_SAFE_FRACT32_EXCLUSIVE} (exclusive)`, () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(564133))
      expect(max).to.equal(bitwiseUint32ToFract32(4256972577))
    })

    it('accepts an optional range', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1611176869))
      expect(max).to.equal(bitwiseUint32ToFract32(2683618930))
    })

    it('accepts an optional minimum', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, undefined), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1611176869))
      expect(max).to.equal(bitwiseUint32ToFract32(4279666680))
    })

    it('accepts an optional maximum', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(undefined, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(564133))
      expect(max).to.equal(bitwiseUint32ToFract32(2669053944))
    })

    it('returns a value without bias', () => {
      /*
       * minimum: 0.3750 = 0b01100000000000000000000000000000 (as uint32: 1610612736)
       * maximum: 0.6875 = 0b10100000000000000000000000000000 (as uint32: 2952790016)
       * range:   0.3125 = 0b01010000000000000000000000000000 (as uint32: 1342177280)
       * mask:             0b01111111111111111111111111111111
       *
       * masked value 1:   0b01110101001000110010100100011100
       * masked value 2:   0b01000001101010010111001101010110
       *
       * 1st generated value: 1965238556, masked to 1965238556, exceeds the range.
       * 2nd generated value: 3249107798, masked to 1101624150, is within range.
       *
       * Result: minimum (1610612736) + 1101624150 = 2712236886
       */

      const gen = new AleaNumberGenerator({seed: 2})
      const expectedResult = bitwiseUint32ToFract32(2712236886) // 0.631491859909147
      expect(gen.nextFract32(0.375, 0.6875)).to.equal(expectedResult)
    })
  })

  describe('#nextInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      expect(gen.nextInt32()).to.equal(-2035612224)
    })

    it(`returns a value inclusively between ${MIN_SAFE_INT32_INCLUSIVE} and ${MAX_SAFE_INT32_INCLUSIVE}`, () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(), 100)
      expect(min).to.equal(-2104668363)
      expect(max).to.equal(2124699534)
    })

    it('accepts an optional range', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, 32768), 100)
      expect(min).to.equal(8263)
      expect(max).to.equal(32734)
    })

    it('accepts an optional minimum', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, undefined), 100)
      expect(min).to.equal(572325)
      expect(max).to.equal(2124707726)
    })

    it('accepts an optional maximum', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(undefined, 32768), 100)
      expect(min).to.equal(-2141034837)
      expect(max).to.equal(-32347237)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0111110110100111
       * masked value 2:  0b0011011100001011
       *
       * 1st generated value: 3232464295, masked to 32167, exceeds the range.
       * 2nd generated value: 3030857483, masked to 14091, is within range.
       *
       * Result: minimum (8192) + 14091 = 22283
       */

      const gen = new AleaNumberGenerator({seed: 5})
      expect(gen.nextInt32(8192, 32768)).to.equal(22283)
    })
  })

  describe('#nextUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      expect(gen.nextUint32()).to.equal(2259355072)
    })

    it(`returns a value inclusively between ${MIN_SAFE_UINT32_INCLUSIVE} and ${MAX_SAFE_UINT32_INCLUSIVE}`, () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(), 100)
      expect(min).to.equal(564133)
      expect(max).to.equal(4256972577)
    })

    it('accepts an optional range', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, 32768), 100)
      expect(min).to.equal(8263)
      expect(max).to.equal(32734)
    })

    it('accepts an optional minimum', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, undefined), 100)
      expect(min).to.equal(572325)
      expect(max).to.equal(4256980769)
    })

    it('accepts an optional maximum', () => {
      const gen = new AleaNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(undefined, 32768), 100)
      expect(min).to.equal(71)
      expect(max).to.equal(32527)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0111110110100111
       * masked value 2:  0b0011011100001011
       *
       * 1st generated value: 1084980647, masked to 32167, exceeds the range.
       * 2nd generated value: 883373835, masked to 14091, is within range.
       *
       * Result: minimum (8192) + 14091 = 22283
       */

      const gen = new AleaNumberGenerator({seed: 5})
      expect(gen.nextUint32(8192, 32768)).to.equal(22283)
    })
  })
})
