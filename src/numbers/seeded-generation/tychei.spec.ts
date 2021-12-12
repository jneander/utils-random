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
import {TycheiNumberGenerator} from './tychei'

describe('numbers > seeded generation > TycheiNumberGenerator', () => {
  it('can be instantiated with a numerical seed', () => {
    const gen1 = new TycheiNumberGenerator({seed: 123})
    expect(gen1.nextInt32()).to.equal(-1578735223)
  })

  it('can be instantiated with a string seed', () => {
    const gen1 = new TycheiNumberGenerator({seed: 'start'})
    expect(gen1.nextInt32()).to.equal(877432999)
  })

  it('can be instantiated with a function returning a numerical seed', () => {
    const gen1 = new TycheiNumberGenerator({seedFn: () => 123})
    expect(gen1.nextInt32()).to.equal(-1578735223)
  })

  it('can be instantiated with a function returning a string seed', () => {
    const gen1 = new TycheiNumberGenerator({seedFn: () => 'start'})
    expect(gen1.nextInt32()).to.equal(877432999)
  })

  it('can be instantiated with a known state', () => {
    const gen1 = new TycheiNumberGenerator({seed: 123})
    const gen2 = new TycheiNumberGenerator({state: gen1.getState()})
    expect(gen2.nextInt32()).to.equal(gen1.nextInt32())
  })

  it('can be instantiated without deterministic seeding', () => {
    const gen1 = new TycheiNumberGenerator()
    expect(gen1.nextInt32())
      .to.be.lessThanOrEqual(MAX_SAFE_INT32_INCLUSIVE)
      .and.greaterThanOrEqual(MIN_SAFE_INT32_INCLUSIVE)
  })

  describe('#getState()', () => {
    it('returns the current state of the generator', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      expect(gen.getState()).to.have.keys('a', 'b', 'c', 'd')
    })

    it('returns a unique instance of the state', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      expect(gen.getState()).to.not.equal(gen.getState())
    })
  })

  describe('#nextFract32()', () => {
    it('returns a 32-bit decimal fraction', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const value = gen.nextFract32()
      // Transforming the value through 32-bit integer representation maintains fidelity
      expect(bitwiseFractToFract32(value)).to.equal(value)
    })

    it(`returns a value between ${MIN_SAFE_FRACT32_INCLUSIVE} (inclusive) and ${MAX_SAFE_FRACT32_EXCLUSIVE} (exclusive)`, () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(40702034))
      expect(max).to.equal(bitwiseUint32ToFract32(4248773928))
    })

    it('accepts an optional range', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1619813035))
      expect(max).to.equal(bitwiseUint32ToFract32(2677724266))
    })

    it('accepts an optional minimum', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(0.375, undefined), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(1643789421))
      expect(max).to.equal(bitwiseUint32ToFract32(4283491299))
    })

    it('accepts an optional maximum', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextFract32(undefined, 0.625), 100)
      expect(min).to.equal(bitwiseUint32ToFract32(33176685))
      expect(max).to.equal(bitwiseUint32ToFract32(2672878563))
    })

    it('returns a value without bias', () => {
      /*
       * minimum: 0.3750 = 0b01100000000000000000000000000000 (as uint32: 1610612736)
       * maximum: 0.6875 = 0b10100000000000000000000000000000 (as uint32: 2952790016)
       * range:   0.3125 = 0b01010000000000000000000000000000 (as uint32: 1342177280)
       * mask:             0b01111111111111111111111111111111
       *
       * masked value 1:   0b01101100010111100101000010011110
       * masked value 2:   0b00100100001101100111000111110100
       *
       * 1st generated value: 1818120350, masked to 1818120350, exceeds the range.
       * 2nd generated value: 2755031540, masked to 607547892, is within range.
       *
       * Result: minimum (1610612736) + 607547892 = 2218160628
       */

      const gen = new TycheiNumberGenerator({seed: 1})
      const expectedResult = bitwiseUint32ToFract32(2218160628) // 0.5164557667449117
      expect(gen.nextFract32(0.375, 0.6875)).to.equal(expectedResult)
    })
  })

  describe('#nextInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      const gen = new TycheiNumberGenerator({seed: 2})
      expect(gen.nextInt32()).to.equal(-265168835)
    })

    it(`returns a value inclusively between ${MIN_SAFE_INT32_INCLUSIVE} and ${MAX_SAFE_INT32_INCLUSIVE}`, () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(), 100)
      expect(min).to.equal(-2127471134)
      expect(max).to.equal(2043056662)
    })

    it('accepts an optional range', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, 32768), 100)
      expect(min).to.equal(8356)
      expect(max).to.equal(32707)
    })

    it('accepts an optional minimum', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(8192, undefined), 100)
      expect(min).to.equal(20020706)
      expect(max).to.equal(2101298472)
    })

    it('accepts an optional maximum', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextInt32(undefined, 32768), 100)
      expect(min).to.equal(-2127471134)
      expect(max).to.equal(-32064077)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0110010010010010
       * masked value 2:  0b0100101100011101
       *
       * 1st generated value: 3386762386, masked to 25746, exceeds the range.
       * 2nd generated value: 3753167645, masked to 19229, is within range.
       *
       * Result: minimum (8192) + 19229 = 27421
       */

      const gen = new TycheiNumberGenerator({seed: 6})
      expect(gen.nextInt32(8192, 32768)).to.equal(27421)
    })
  })

  describe('#nextUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      const gen = new TycheiNumberGenerator({seed: 2})
      expect(gen.nextUint32()).to.equal(4029798461)
    })

    it(`returns a value inclusively between ${MIN_SAFE_UINT32_INCLUSIVE} and ${MAX_SAFE_UINT32_INCLUSIVE}`, () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(), 100)
      expect(min).to.equal(40702034)
      expect(max).to.equal(4248773928)
    })

    it('accepts an optional range', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, 32768), 100)
      expect(min).to.equal(8356)
      expect(max).to.equal(32707)
    })

    it('accepts an optional minimum', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(8192, undefined), 100)
      expect(min).to.equal(40710226)
      expect(max).to.equal(4248782120)
    })

    it('accepts an optional maximum', () => {
      const gen = new TycheiNumberGenerator({seed: 1})
      const {min, max} = iterateForMinAndMax(() => gen.nextUint32(undefined, 32768), 100)
      expect(min).to.equal(164)
      expect(max).to.equal(32624)
    })

    it('returns a value without bias', () => {
      /*
       * minimum:  8192 = 0b0010000000000000
       * maximum: 32768 = 0b1000000000000000
       * range:   24576 = 0b0110000000000000
       * mask:            0b0111111111111111
       *
       * masked value 1:  0b0110010010010010
       * masked value 2:  0b0100101100011101
       *
       * 1st generated value: 1239278738, masked to 25746, exceeds the range.
       * 2nd generated value: 1605683997, masked to 19229, is within range.
       *
       * Result: minimum (8192) + 19229 = 27421
       */

      const gen = new TycheiNumberGenerator({seed: 6})
      expect(gen.nextUint32(8192, 32768)).to.equal(27421)
    })
  })
})
