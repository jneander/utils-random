import {arrayIndices, rangeChars, uniqueValues} from '@jneander/utils-arrays'
import Chai, {expect} from 'chai'
import ChaiEach from 'chai-each'
import {stub} from 'sinon'

import {setStubSequence} from '../spec-support'
import {
  randomStringEntry,
  randomStringIndex,
  randomStringValue,
  sampleStringEntries,
  sampleStringIndices,
  sampleStringValues
} from './selection'

Chai.use(ChaiEach)

describe('strings > selection', () => {
  const aThroughE = rangeChars('A', 'E')
  const abcde = aThroughE.join('')

  describe('.randomStringEntry()', () => {
    it('returns a random entry from the given array', () => {
      const entry = randomStringEntry(abcde)
      // @ts-ignore
      expect(entry).to.deep.be.oneOf(Array.from(aThroughE.entries()))
    })

    context('when given an optional `randomUint32Fn`', () => {
      it('calls the function with a start index of 0', () => {
        const nonRandomInt = stub().returns(2)
        randomStringEntry(abcde, {randomUint32Fn: nonRandomInt})
        const [startindex] = nonRandomInt.lastCall.args
        expect(startindex).to.equal(0)
      })

      it('uses the array length for the end index', () => {
        const nonRandomInt = stub().returns(2)
        randomStringEntry(abcde, {randomUint32Fn: nonRandomInt})
        const [, endEntry] = nonRandomInt.lastCall.args
        expect(endEntry).to.equal(5)
      })

      it('uses an exclusive end index', () => {
        const nonRandomInt = stub().returns(2)
        randomStringEntry(abcde, {randomUint32Fn: nonRandomInt})
        const [, , endInclusive] = nonRandomInt.lastCall.args
        expect(endInclusive).not.to.equal(true)
      })

      it('uses the result of calling the function', () => {
        const nonRandomInt = stub().returns(2)
        const entry = randomStringEntry(abcde, {randomUint32Fn: nonRandomInt})
        expect(entry).to.deep.equal([2, 'C'])
      })
    })
  })

  describe('.randomStringIndex()', () => {
    it('returns a random index from the given array', () => {
      const index = randomStringIndex(abcde)
      expect(index).to.be.oneOf([0, 1, 2, 3, 4])
    })

    context('when given an optional `randomUint32Fn`', () => {
      it('calls the function with a start index of 0', () => {
        const nonRandomInt = stub().returns(2)
        randomStringIndex(abcde, {randomUint32Fn: nonRandomInt})
        const [startindex] = nonRandomInt.lastCall.args
        expect(startindex).to.equal(0)
      })

      it('uses the array length for the end index', () => {
        const nonRandomInt = stub().returns(2)
        randomStringIndex(abcde, {randomUint32Fn: nonRandomInt})
        const [, endIndex] = nonRandomInt.lastCall.args
        expect(endIndex).to.equal(5)
      })

      it('uses an exclusive end index', () => {
        const nonRandomInt = stub().returns(2)
        randomStringIndex(abcde, {randomUint32Fn: nonRandomInt})
        const [, , endInclusive] = nonRandomInt.lastCall.args
        expect(endInclusive).not.to.equal(true)
      })

      it('uses the result of calling the function', () => {
        const nonRandomInt = stub().returns(2)
        const index = randomStringIndex(abcde, {randomUint32Fn: nonRandomInt})
        expect(index).to.equal(2)
      })
    })
  })

  describe('.randomStringValue()', () => {
    const aThroughE = rangeChars('A', 'E')

    it('returns a random value from the given array', () => {
      const value = randomStringValue(abcde)
      expect(value).to.be.oneOf(aThroughE)
    })

    context('when given an optional `randomUint32Fn`', () => {
      it('calls the function with a start index of 0', () => {
        const nonRandomInt = stub().returns(2)
        randomStringValue(abcde, {randomUint32Fn: nonRandomInt})
        const [startindex] = nonRandomInt.lastCall.args
        expect(startindex).to.equal(0)
      })

      it('uses the array length for the end index', () => {
        const nonRandomInt = stub().returns(2)
        randomStringValue(abcde, {randomUint32Fn: nonRandomInt})
        const [, endValue] = nonRandomInt.lastCall.args
        expect(endValue).to.equal(5)
      })

      it('uses an exclusive end index', () => {
        const nonRandomInt = stub().returns(2)
        randomStringValue(abcde, {randomUint32Fn: nonRandomInt})
        const [, , endInclusive] = nonRandomInt.lastCall.args
        expect(endInclusive).not.to.equal(true)
      })

      it('uses the result of calling the function', () => {
        const nonRandomInt = stub().returns(2)
        const value = randomStringValue(abcde, {randomUint32Fn: nonRandomInt})
        expect(value).to.equal('C')
      })
    })
  })

  describe('.sampleStringEntries()', () => {
    it('returns the optionally-given number of items from the given array', () => {
      const entries = sampleStringEntries(abcde, {count: 3})
      expect(entries).to.have.length(3)
    })

    it('returns one item by default', () => {
      const entries = sampleStringEntries(abcde)
      expect(entries).to.have.length(1)
    })

    it('returns entries', () => {
      const entries = sampleStringEntries(abcde, {count: 3})
      // @ts-ignore
      expect(entries).to.each.deep.be.oneOf(Array.from(aThroughE.entries()))
    })

    it('returns unique entries by default', () => {
      const predictableRandomInt = stub()
      /*
       * Use a sequence with a repeatable, known outcome. This ensures this test
       * will always pass with the current implementation without needing to
       * know implementation details.
       */
      setStubSequence(predictableRandomInt, [1, 2, 1, 2, 3])

      const entries = sampleStringEntries(abcde, {
        count: aThroughE.length,
        randomUint32Fn: predictableRandomInt
      })
      const uniqueEntries = Object.values(Object.fromEntries(entries))
      expect(uniqueEntries).to.have.length(entries.length)
    })

    it('optionally disregards uniqueness', () => {
      const predictableRandomInt = stub()
      /*
       * Use a sequence with a repeatable, known outcome. This ensures this test
       * will always pass with the current implementation without needing to
       * know implementation details.
       */
      setStubSequence(predictableRandomInt, [1, 2, 1, 2, 3])

      const entries = sampleStringEntries(abcde, {
        count: aThroughE.length,
        randomUint32Fn: predictableRandomInt,
        unique: false
      })
      const uniqueEntries = Object.values(Object.fromEntries(entries))
      expect(uniqueEntries).to.have.length.lessThan(entries.length)
    })
  })

  describe('.sampleStringIndices()', () => {
    it('returns the optionally-given number of items from the given array', () => {
      const indices = sampleStringIndices(abcde, {count: 3})
      expect(indices).to.have.length(3)
    })

    it('returns one item by default', () => {
      const indices = sampleStringIndices(abcde)
      expect(indices).to.have.length(1)
    })

    it('returns indices', () => {
      const indices = sampleStringIndices(abcde, {count: 3})
      // @ts-ignore
      expect(indices).to.each.be.oneOf(arrayIndices(abcde))
    })

    it('returns unique entries by default', () => {
      const predictableRandomInt = stub()
      /*
       * Use a sequence with a repeatable, known outcome. This ensures this test
       * will always pass with the current implementation without needing to
       * know implementation details.
       */
      setStubSequence(predictableRandomInt, [1, 2, 1, 2, 3])

      const indices = sampleStringIndices(abcde, {
        count: aThroughE.length,
        randomUint32Fn: predictableRandomInt
      })
      const uniqueIndices = uniqueValues(indices)
      expect(uniqueIndices).to.have.length(indices.length)
    })

    it('optionally disregards uniqueness', () => {
      const predictableRandomInt = stub()
      /*
       * Use a sequence with a repeatable, known outcome. This ensures this test
       * will always pass with the current implementation without needing to
       * know implementation details.
       */
      setStubSequence(predictableRandomInt, [1, 2, 1, 2, 3])

      const indices = sampleStringIndices(abcde, {
        count: aThroughE.length,
        randomUint32Fn: predictableRandomInt,
        unique: false
      })
      const uniqueIndices = uniqueValues(indices)
      expect(uniqueIndices).to.have.length.lessThan(indices.length)
    })
  })

  describe('.sampleStringValues()', () => {
    it('returns the optionally-given number of items from the given array', () => {
      const values = sampleStringValues(abcde, {count: 3})
      expect(values).to.have.length(3)
    })

    it('returns one item by default', () => {
      const values = sampleStringValues(abcde)
      expect(values).to.have.length(1)
    })

    it('returns values from the array', () => {
      const values = sampleStringValues(abcde, {count: 3})
      // @ts-ignore
      expect(values).to.each.be.oneOf(aThroughE)
    })

    it('returns unique entries by default', () => {
      const predictableRandomInt = stub()
      /*
       * Use a sequence with a repeatable, known outcome. This ensures this test
       * will always pass with the current implementation without needing to
       * know implementation details.
       */
      setStubSequence(predictableRandomInt, [1, 2, 1, 2, 3])

      const values = sampleStringValues(abcde, {
        count: aThroughE.length,
        randomUint32Fn: predictableRandomInt
      })
      const unique = uniqueValues(values)
      expect(unique).to.have.length(values.length)
    })

    it('considers values as unique by index', () => {
      const predictableRandomInt = stub()
      /*
       * Use a sequence with a repeatable, known outcome. This ensures this test
       * will always pass with the current implementation without needing to
       * know implementation details.
       */
      setStubSequence(predictableRandomInt, [1, 2, 1, 2, 3])

      const values = sampleStringValues('AAAAA', {
        count: 5,
        randomUint32Fn: predictableRandomInt
      })
      expect(values).to.have.length(5)
    })

    it('optionally disregards uniqueness', () => {
      const predictableRandomInt = stub()
      /*
       * Use a sequence with a repeatable, known outcome. This ensures this test
       * will always pass with the current implementation without needing to
       * know implementation details.
       */
      setStubSequence(predictableRandomInt, [1, 2, 1, 2, 3])

      const values = sampleStringValues(abcde, {
        count: aThroughE.length,
        randomUint32Fn: predictableRandomInt,
        unique: false
      })
      const unique = uniqueValues(values)
      expect(unique).to.have.length.lessThan(values.length)
    })
  })
})
