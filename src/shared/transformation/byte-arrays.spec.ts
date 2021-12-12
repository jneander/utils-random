import {expect} from 'chai'

import {getPermutations, iterateForMinAndMax} from '../../spec-support'
import {MAX_SAFE_UINT32_INCLUSIVE, MIN_SAFE_UINT32_INCLUSIVE} from '../constants'
import {uint8ArrayToUint32, uint32ToUint8Array} from './byte-arrays'

describe('shared > transformation > byte arrays', () => {
  describe('.uint8ArrayToUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      const byteArray = Uint8Array.from([128, 128, 128, 128])
      expect(uint8ArrayToUint32(byteArray)).to.equal(2155905152)
    })

    it('returns a 8-bit integer when given a 1-byte array', () => {
      const byteArray = Uint8Array.from([128])
      expect(uint8ArrayToUint32(byteArray)).to.equal(128)
    })

    it('returns a 8-bit integer when given a zero-padded 1-byte array', () => {
      const byteArray = Uint8Array.from([0, 0, 0, 128])
      expect(uint8ArrayToUint32(byteArray)).to.equal(128)
    })

    it('returns a 16-bit integer when given a 2-byte array', () => {
      const byteArray = Uint8Array.from([128, 128])
      expect(uint8ArrayToUint32(byteArray)).to.equal(32896)
    })

    it('returns a 16-bit integer when given a zero-padded 2-byte array', () => {
      const byteArray = Uint8Array.from([0, 0, 128, 128])
      expect(uint8ArrayToUint32(byteArray)).to.equal(32896)
    })

    it('returns a 24-bit integer when given a 3-byte array', () => {
      const byteArray = Uint8Array.from([128, 128, 128])
      expect(uint8ArrayToUint32(byteArray)).to.equal(8421504)
    })

    it('returns a 24-bit integer when given a zero-padded 3-byte array', () => {
      const byteArray = Uint8Array.from([0, 128, 128, 128])
      expect(uint8ArrayToUint32(byteArray)).to.equal(8421504)
    })

    it(`can return the minimum, safe, unsigned 32-bit integer (${MIN_SAFE_UINT32_INCLUSIVE})`, () => {
      const byteArray = Uint8Array.from([0, 0, 0, 0])
      expect(uint8ArrayToUint32(byteArray)).to.equal(MIN_SAFE_UINT32_INCLUSIVE)
    })

    it(`can return the maximum, safe, unsigned 32-bit integer (${MAX_SAFE_UINT32_INCLUSIVE})`, () => {
      const byteArray = Uint8Array.from([255, 255, 255, 255])
      expect(uint8ArrayToUint32(byteArray)).to.equal(MAX_SAFE_UINT32_INCLUSIVE)
    })

    it(`returns a value inclusively between ${MIN_SAFE_UINT32_INCLUSIVE} and ${MAX_SAFE_UINT32_INCLUSIVE}`, () => {
      /*
       * The following values are used for their frequent involvement with
       * operational mistakes and other bugs:
       *
       *     0 === 0b00000000
       *   127 === 0b01111111
       *   128 === 0b10000000
       *   255 === 0b11111111
       */

      const byteArrays = getPermutations([0, 127, 128, 255], 4).map(v => Uint8Array.from(v))
      const {min, max} = iterateForMinAndMax(
        () => uint8ArrayToUint32(byteArrays.pop()!),
        byteArrays.length
      )
      expect(min).to.be.greaterThanOrEqual(MIN_SAFE_UINT32_INCLUSIVE)
      expect(max).to.be.lessThanOrEqual(MAX_SAFE_UINT32_INCLUSIVE)
    })
  })

  describe('#uint32ToUint8Array()', () => {
    it('returns an unsigned 8-bit integer array', () => {
      const byteArray = Uint8Array.from([128, 128, 128, 128])
      expect(uint32ToUint8Array(2155905152)).to.deep.equal(byteArray)
    })

    it('includes one 8-bit integer when given a 1-byte integer', () => {
      const byteArray = Uint8Array.from([0, 0, 0, 128])
      expect(uint32ToUint8Array(128)).to.deep.equal(byteArray)
    })

    it('includes two 8-bit integers when given a 2-byte integer', () => {
      const byteArray = Uint8Array.from([0, 0, 128, 128])
      expect(uint32ToUint8Array(32896)).to.deep.equal(byteArray)
    })

    it('includes three 8-bit integers when given a 3-byte integer', () => {
      const byteArray = Uint8Array.from([0, 128, 128, 128])
      expect(uint32ToUint8Array(8421504)).to.deep.equal(byteArray)
    })

    it(`can convert the minimum, safe, unsigned 32-bit integer (${MIN_SAFE_UINT32_INCLUSIVE})`, () => {
      const byteArray = Uint8Array.from([0, 0, 0, 0])
      expect(uint32ToUint8Array(MIN_SAFE_UINT32_INCLUSIVE)).to.deep.equal(byteArray)
    })

    it(`can convert the maximum, safe, unsigned 32-bit integer (${MAX_SAFE_UINT32_INCLUSIVE})`, () => {
      const byteArray = Uint8Array.from([255, 255, 255, 255])
      expect(uint32ToUint8Array(MAX_SAFE_UINT32_INCLUSIVE)).to.deep.equal(byteArray)
    })
  })
})
