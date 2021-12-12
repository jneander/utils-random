import {arrayIndices, rangeChars, uniqueValues} from '@jneander/utils-arrays'
import Chai, {expect} from 'chai'
import ChaiEach from 'chai-each'
import {stub} from 'sinon'

import {setStubSequence} from '../spec-support'
import {
  randomArrayEntry,
  randomArrayIndex,
  randomArrayValue,
  sampleArrayEntries,
  sampleArrayIndices,
  sampleArrayValues
} from './selection'

Chai.use(ChaiEach)

describe('arrays > selection', () => {
  describe('.randomArrayEntry()', () => {
    const aThroughE = rangeChars('A', 'E')

    it('returns a random entry from the given array', () => {
      const entry = randomArrayEntry(aThroughE)
      // @ts-ignore
      expect(entry).to.deep.be.oneOf(Array.from(aThroughE.entries()))
    })

    context('when given an optional `randomUint32Fn`', () => {
      it('calls the function with a start index of 0', () => {
        const nonRandomInt = stub().returns(2)
        randomArrayEntry(aThroughE, {randomUint32Fn: nonRandomInt})
        const [startindex] = nonRandomInt.lastCall.args
        expect(startindex).to.equal(0)
      })

      it('uses the array length for the end index', () => {
        const nonRandomInt = stub().returns(2)
        randomArrayEntry(aThroughE, {randomUint32Fn: nonRandomInt})
        const [, endEntry] = nonRandomInt.lastCall.args
        expect(endEntry).to.equal(5)
      })

      it('uses an exclusive end index', () => {
        const nonRandomInt = stub().returns(2)
        randomArrayEntry(aThroughE, {randomUint32Fn: nonRandomInt})
        const [, , endInclusive] = nonRandomInt.lastCall.args
        expect(endInclusive).not.to.equal(true)
      })

      it('uses the result of calling the function', () => {
        const nonRandomInt = stub().returns(2)
        const entry = randomArrayEntry(aThroughE, {randomUint32Fn: nonRandomInt})
        expect(entry).to.deep.equal([2, 'C'])
      })
    })
  })

  describe('.randomArrayIndex()', () => {
    const aThroughE = rangeChars('A', 'E')

    it('returns a random index from the given array', () => {
      const index = randomArrayIndex(aThroughE)
      expect(index).to.be.oneOf([0, 1, 2, 3, 4])
    })

    context('when given an optional `randomUint32Fn`', () => {
      it('calls the function with a start index of 0', () => {
        const nonRandomInt = stub().returns(2)
        randomArrayIndex(aThroughE, {randomUint32Fn: nonRandomInt})
        const [startindex] = nonRandomInt.lastCall.args
        expect(startindex).to.equal(0)
      })

      it('uses the array length for the end index', () => {
        const nonRandomInt = stub().returns(2)
        randomArrayIndex(aThroughE, {randomUint32Fn: nonRandomInt})
        const [, endIndex] = nonRandomInt.lastCall.args
        expect(endIndex).to.equal(5)
      })

      it('uses an exclusive end index', () => {
        const nonRandomInt = stub().returns(2)
        randomArrayIndex(aThroughE, {randomUint32Fn: nonRandomInt})
        const [, , endInclusive] = nonRandomInt.lastCall.args
        expect(endInclusive).not.to.equal(true)
      })

      it('uses the result of calling the function', () => {
        const nonRandomInt = stub().returns(2)
        const index = randomArrayIndex(aThroughE, {randomUint32Fn: nonRandomInt})
        expect(index).to.equal(2)
      })
    })
  })

  describe('.randomArrayValue()', () => {
    const aThroughE = rangeChars('A', 'E')

    it('returns a random value from the given array', () => {
      const value = randomArrayValue(aThroughE)
      expect(value).to.be.oneOf(aThroughE)
    })

    context('when given an optional `randomUint32Fn`', () => {
      it('calls the function with a start index of 0', () => {
        const nonRandomInt = stub().returns(2)
        randomArrayValue(aThroughE, {randomUint32Fn: nonRandomInt})
        const [startindex] = nonRandomInt.lastCall.args
        expect(startindex).to.equal(0)
      })

      it('uses the array length for the end index', () => {
        const nonRandomInt = stub().returns(2)
        randomArrayValue(aThroughE, {randomUint32Fn: nonRandomInt})
        const [, endValue] = nonRandomInt.lastCall.args
        expect(endValue).to.equal(5)
      })

      it('uses an exclusive end index', () => {
        const nonRandomInt = stub().returns(2)
        randomArrayValue(aThroughE, {randomUint32Fn: nonRandomInt})
        const [, , endInclusive] = nonRandomInt.lastCall.args
        expect(endInclusive).not.to.equal(true)
      })

      it('uses the result of calling the function', () => {
        const nonRandomInt = stub().returns(2)
        const value = randomArrayValue(aThroughE, {randomUint32Fn: nonRandomInt})
        expect(value).to.equal('C')
      })
    })
  })

  describe('.sampleArrayEntries()', () => {
    const aThroughE = rangeChars('A', 'E')

    it('returns the optionally-given number of items from the given array', () => {
      const entries = sampleArrayEntries(aThroughE, {count: 3})
      expect(entries).to.have.length(3)
    })

    it('returns one item by default', () => {
      const entries = sampleArrayEntries(aThroughE)
      expect(entries).to.have.length(1)
    })

    it('returns entries', () => {
      const entries = sampleArrayEntries(aThroughE, {count: 3})
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

      const entries = sampleArrayEntries(aThroughE, {
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

      const entries = sampleArrayEntries(aThroughE, {
        count: aThroughE.length,
        randomUint32Fn: predictableRandomInt,
        unique: false
      })
      const uniqueEntries = Object.values(Object.fromEntries(entries))
      expect(uniqueEntries).to.have.length.lessThan(entries.length)
    })
  })

  describe('.sampleArrayIndices()', () => {
    const aThroughE = rangeChars('A', 'E')

    it('returns the optionally-given number of items from the given array', () => {
      const indices = sampleArrayIndices(aThroughE, {count: 3})
      expect(indices).to.have.length(3)
    })

    it('returns one item by default', () => {
      const indices = sampleArrayIndices(aThroughE)
      expect(indices).to.have.length(1)
    })

    it('returns indices', () => {
      const indices = sampleArrayIndices(aThroughE, {count: 3})
      // @ts-ignore
      expect(indices).to.each.be.oneOf(arrayIndices(aThroughE))
    })

    it('returns unique entries by default', () => {
      const predictableRandomInt = stub()
      /*
       * Use a sequence with a repeatable, known outcome. This ensures this test
       * will always pass with the current implementation without needing to
       * know implementation details.
       */
      setStubSequence(predictableRandomInt, [1, 2, 1, 2, 3])

      const indices = sampleArrayIndices(aThroughE, {
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

      const indices = sampleArrayIndices(aThroughE, {
        count: aThroughE.length,
        randomUint32Fn: predictableRandomInt,
        unique: false
      })
      const uniqueIndices = uniqueValues(indices)
      expect(uniqueIndices).to.have.length.lessThan(indices.length)
    })
  })

  describe('.sampleArrayValues()', () => {
    const aThroughE = rangeChars('A', 'E')

    it('returns the optionally-given number of items from the given array', () => {
      const values = sampleArrayValues(aThroughE, {count: 3})
      expect(values).to.have.length(3)
    })

    it('returns one item by default', () => {
      const values = sampleArrayValues(aThroughE)
      expect(values).to.have.length(1)
    })

    it('returns values from the array', () => {
      const values = sampleArrayValues(aThroughE, {count: 3})
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

      const values = sampleArrayValues(aThroughE, {
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

      const values = sampleArrayValues(['A', 'A', 'A', 'A', 'A'], {
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

      const values = sampleArrayValues(aThroughE, {
        count: aThroughE.length,
        randomUint32Fn: predictableRandomInt,
        unique: false
      })
      const unique = uniqueValues(values)
      expect(unique).to.have.length.lessThan(values.length)
    })
  })
})
