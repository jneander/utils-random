import {expect} from 'chai'
import {SinonStub, stub} from 'sinon'

import {iterateForMinAndMax} from '../spec-support'
import {
  MAX_SAFE_UINT32_EXCLUSIVE,
  MAX_SAFE_UINT32_INCLUSIVE,
  MIN_SAFE_UINT32_INCLUSIVE
} from './constants'
import {mathRandomUint32} from './helpers'

describe('shared > helpers', () => {
  describe('.mathRandomUint32()', () => {
    let mathRandom: SinonStub<void[], number>

    beforeEach(() => {
      mathRandom = stub(Math, 'random')
    })

    afterEach(() => {
      mathRandom.restore()
    })

    it('returns an unsigned 32-bit integer', () => {
      mathRandom.returns(0.625)
      expect(mathRandomUint32()).to.equal(2684354560)
    })

    it(`returns a value no less than ${MIN_SAFE_UINT32_INCLUSIVE}`, () => {
      mathRandom.returns(0)
      const value = mathRandomUint32()
      expect(value).to.equal(MIN_SAFE_UINT32_INCLUSIVE)
    })

    it(`returns a value less than ${MAX_SAFE_UINT32_EXCLUSIVE}`, () => {
      mathRandom.returns(1 - 1 / Number.MAX_SAFE_INTEGER)
      const value = mathRandomUint32()
      expect(value).to.equal(MAX_SAFE_UINT32_INCLUSIVE)
    })

    it('returns a value no less than an optional minimum', () => {
      mathRandom.returns(0)
      const value = mathRandomUint32(123, undefined)
      expect(value).to.equal(123)
    })

    it('returns a value less than an optional maximum', () => {
      mathRandom.returns(1 - 1 / Number.MAX_SAFE_INTEGER)
      const value = mathRandomUint32(undefined, 256)
      expect(value).to.equal(255)
    })

    it('returns 32-bit unsigned integers within a given range', () => {
      mathRandom.restore()
      const {min, max} = iterateForMinAndMax(() => mathRandomUint32(123, 256), 100)
      expect(min).to.be.greaterThanOrEqual(123)
      expect(max).to.be.lessThan(256)
    })

    it('returns 32-bit unsigned integers within the maximum range', () => {
      mathRandom.restore()
      const {min, max} = iterateForMinAndMax(() => mathRandomUint32(), 100)
      expect(min).to.be.greaterThanOrEqual(MIN_SAFE_UINT32_INCLUSIVE)
      expect(max).to.be.lessThan(MAX_SAFE_UINT32_EXCLUSIVE)
    })
  })
})
