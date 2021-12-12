import {arrayIndices} from '@jneander/utils-arrays'

import {RandomUint32Fn} from '../numbers'
import {mathRandomUint32} from '../shared'
import {shuffleArray} from './transformation'

// Single Selection

export interface RandomFromArrayOptions {
  randomUint32Fn?: RandomUint32Fn
}

/**
 * A function which returns a randomly-selected entry (index and value pair)
 * from the given array.
 *
 * @export
 * @param {T[]} array An array of values.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given array as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @returns {[number, T]} An entry (index and value pair) from the given array.
 */
export function randomArrayEntry<T = any>(
  array: T[],
  options: RandomFromArrayOptions = {}
): [number, T] {
  const index = randomArrayIndex(array, options)
  return [index, array[index]]
}

/**
 * A function which returns a randomly-selected index from the given array.
 *
 * @export
 * @param {T[]} array An array of values.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given array as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @returns {number} An index from the given array.
 */
export function randomArrayIndex(array: any[], options: RandomFromArrayOptions = {}): number {
  const {randomUint32Fn = mathRandomUint32} = options
  return randomUint32Fn(0, array.length)
}

/**
 * A function which returns a randomly-selected value from the given array.
 *
 * @export
 * @param {T[]} array An array of values.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given array as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @returns {T} A value from the given array.
 */
export function randomArrayValue<T = any>(array: T[], options: RandomFromArrayOptions = {}): T {
  return array[randomArrayIndex(array, options)]
}

// Multiple Selection

export interface SampleFromArrayOptions {
  count?: number
  randomUint32Fn?: RandomUint32Fn
  unique?: boolean
}

/**
 * A function which returns one or more randomly-selected entries (index and
 * value pair) from the given array.
 *
 * @export
 * @param {T[]} array An array of values.
 * @param {number} [options.count] An optional number of entries to be selected
 * from the given array. This value must be an integer, no less than 1, and no
 * more than the length of the given array.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given array as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @param {boolean} [options.unique] An optional boolean to determine whether or
 * not an entry selected from the given array can be selected more than once. A
 * value of `true` will disallow entries from being selected more than once. A
 * value of `false` will allow entries to be selected any number of times. This
 * defaults to `true`.
 * @returns {[number, T][]} An array of entries (index and value pair) from the
 * given array.
 */
export function sampleArrayEntries<T = any>(
  array: T[],
  options: SampleFromArrayOptions = {}
): [number, T][] {
  const {count = 1, randomUint32Fn = mathRandomUint32, unique = true} = options

  if (unique) {
    return shuffleArray<[number, T]>(Array.from(array.entries()), {randomUint32Fn}).slice(0, count)
  }

  return sampleNonUnique(array, count, randomUint32Fn, index => [index, array[index]])
}

/**
 * A function which returns one or more randomly-selected indicies from the
 * given array.
 *
 * @export
 * @param {T[]} array An array of values.
 * @param {number} [options.count] An optional number of indicies to be selected
 * from the given array. This value must be an integer, no less than 1, and no
 * more than the length of the given array.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given array as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @param {boolean} [options.unique] An optional boolean to determine whether or
 * not an index selected from the given array can be selected more than once. A
 * value of `true` will disallow indices from being selected more than once. A
 * value of `false` will allow indices to be selected any number of times. This
 * defaults to `true`.
 * @returns {number[]} An array of indices from the given array.
 */
export function sampleArrayIndices(array: any[], options: SampleFromArrayOptions = {}): number[] {
  // count cannot be non-positive, or greater than array length when unique
  const {count = 1, randomUint32Fn = mathRandomUint32, unique = true} = options

  if (unique) {
    return shuffleArray(arrayIndices(array), {randomUint32Fn}).slice(
      0,
      Math.max(0, Math.floor(count))
    )
  }

  return sampleNonUnique(array, count, randomUint32Fn, index => index)
}

/**
 * A function which returns one or more randomly-selected values from the given
 * array.
 *
 * @export
 * @param {T[]} array An array of values.
 * @param {number} [options.count] An optional number of values to be selected
 * from the given array. This value must be an integer, no less than 1, and no
 * more than the length of the given array.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given array as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @param {boolean} [options.unique] An optional boolean to determine whether or
 * not a value selected from the given array can be selected more than once. A
 * value of `true` will disallow values from being selected more than once. A
 * value of `false` will allow values to be selected any number of times. This
 * defaults to `true`.
 * @returns {T[]} An array of values from the given array.
 */
export function sampleArrayValues<T = any>(array: T[], options: SampleFromArrayOptions = {}): T[] {
  const {count = 1, randomUint32Fn = mathRandomUint32, unique = true} = options

  if (unique) {
    return shuffleArray<T>(array, {randomUint32Fn}).slice(0, count)
  }

  return sampleNonUnique(array, count, randomUint32Fn, index => array[index])
}

function sampleNonUnique<T>(
  array: any[],
  count: number,
  randomUint32Fn: RandomUint32Fn,
  makeValue: (index: number) => T
): T[] {
  const result: T[] = []

  for (let i = 0; i < count; i++) {
    const index = randomArrayIndex(array, {randomUint32Fn})
    result.push(makeValue(index))
  }

  return result
}
