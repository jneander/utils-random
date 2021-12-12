import {rangeChars} from '@jneander/utils-arrays'
import Chai, {expect} from 'chai'
import ChaiEach from 'chai-each'
import {stub} from 'sinon'

import {setStubSequence} from '../spec-support'
import {shuffleString} from './transformation'

Chai.use(ChaiEach)

describe('strings > transformation', () => {
  describe('.shuffleString()', () => {
    const aThroughE = 'ABCDE'

    it('returns an array with the same members as the given array', () => {
      const shuffled = shuffleString(aThroughE)
      expect(shuffled.split('')).to.have.same.members(rangeChars('A', 'E'))
    })

    it('returns a new array instance', () => {
      const shuffled = shuffleString(aThroughE)
      expect(shuffled).to.not.equal(aThroughE)
    })

    it('randomizes the order of the members of the array', () => {
      const predictableRandomInt = stub()
      /*
       * Use a sequence with a repeatable, known outcome. This ensures this test
       * will always pass with the current implementation without needing to
       * know implementation details.
       */
      setStubSequence(predictableRandomInt, [1, 2, 1, 2, 3])

      const shuffled = shuffleString(aThroughE, {
        randomUint32Fn: predictableRandomInt
      })
      expect(shuffled).to.not.deep.equal(aThroughE)
    })
  })
})
