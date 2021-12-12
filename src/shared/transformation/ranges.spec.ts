import {expect} from 'chai'

import {
  MAX_SAFE_INT32_INCLUSIVE,
  MAX_SAFE_UINT32_INCLUSIVE,
  MIN_SAFE_INT32_INCLUSIVE,
  MIN_SAFE_UINT32_INCLUSIVE
} from '../constants'
import {remapInt32ToUint32, remapUint32ToInt32} from './ranges'

describe('shared > transformation > ranges', () => {
  describe('.remapInt32ToUint32()', () => {
    it('returns an unsigned 32-bit integer', () => {
      expect(remapInt32ToUint32(-1)).to.equal(2147483647)
    })

    it('maps the minimum signed 32-bit integer to the minimum unsigned 32-bit integer', () => {
      expect(remapInt32ToUint32(MIN_SAFE_INT32_INCLUSIVE)).to.equal(MIN_SAFE_UINT32_INCLUSIVE)
    })

    it('maps the maximum signed 32-bit integer to the maximum unsigned 32-bit integer', () => {
      expect(remapInt32ToUint32(MAX_SAFE_INT32_INCLUSIVE)).to.equal(MAX_SAFE_UINT32_INCLUSIVE)
    })
  })

  describe('.remapUint32ToInt32()', () => {
    it('returns a signed 32-bit integer', () => {
      expect(remapUint32ToInt32(2147483647)).to.equal(-1)
    })

    it('maps the minimum unsigned 32-bit integer to the minimum signed 32-bit integer', () => {
      expect(remapUint32ToInt32(MIN_SAFE_UINT32_INCLUSIVE)).to.equal(MIN_SAFE_INT32_INCLUSIVE)
    })

    it('maps the maximum unsigned 32-bit integer to the maximum signed 32-bit integer', () => {
      expect(remapUint32ToInt32(MAX_SAFE_UINT32_INCLUSIVE)).to.equal(MAX_SAFE_INT32_INCLUSIVE)
    })
  })
})
