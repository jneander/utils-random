import {sampleArrayEntries, sampleArrayIndices, sampleArrayValues} from '../arrays'
import {RandomUint32Fn} from '../numbers'
import {mathRandomUint32} from '../shared'

// Single Selection

export interface RandomFromStringOptions {
  randomUint32Fn?: RandomUint32Fn
}

/**
 * A function which returns a randomly-selected entry (index and character pair)
 * from the given string.
 *
 * @export
 * @param {string} string A string with non-zero length.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given string as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @returns {[number, string]} An entry (index and character pair) from the
 * given string.
 */
export function randomStringEntry(
  string: string,
  options: RandomFromStringOptions = {}
): [number, string] {
  const index = randomStringIndex(string, options)
  return [index, string[index]]
}

/**
 * A function which returns a randomly-selected index from the given string.
 *
 * @export
 * @param {string} string A string with non-zero length.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given string as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @returns {number} An index from the given string.
 */
export function randomStringIndex(string: string, options: RandomFromStringOptions = {}): number {
  const {randomUint32Fn = mathRandomUint32} = options
  return randomUint32Fn(0, string.length)
}

/**
 * A function which returns a randomly-selected character from the given string.
 *
 * @export
 * @param {string} string A string with non-zero length.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given string as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @returns {string} A character from the given string.
 */
export function randomStringValue(string: string, options: RandomFromStringOptions = {}): string {
  return string[randomStringIndex(string, options)]
}

// Multiple Selection

export interface SampleFromStringOptions {
  count?: number
  randomUint32Fn?: RandomUint32Fn
  unique?: boolean
}

/**
 * A function which returns one or more randomly-selected entries (index and
 * character pair) from the given string.
 *
 * @export
 * @param {string} string A string with non-zero length.
 * @param {number} [options.count] An optional number of entries to be selected
 * from the given string. This value must be an integer, no less than 1, and no
 * more than the length of the given string.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given string as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @param {boolean} [options.unique] An optional boolean to determine whether or
 * not an entry selected from the given string can be selected more than once. A
 * value of `true` will disallow entries from being selected more than once. A
 * value of `false` will allow entries to be selected any number of times. This
 * defaults to `true`.
 * @returns {[number, string][]} An array of entries (index and character pair)
 * from the given string.
 */
export function sampleStringEntries(
  string: string,
  options: SampleFromStringOptions = {}
): [number, string][] {
  return sampleArrayEntries<string>(string.split(''), options)
}

/**
 * A function which returns one or more randomly-selected indicies from the
 * given string.
 *
 * @export
 * @param {string} string A string with non-zero length.
 * @param {number} [options.count] An optional number of indicies to be selected
 * from the given string. This value must be an integer, no less than 1, and no
 * more than the length of the given string.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given string as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @param {boolean} [options.unique] An optional boolean to determine whether or
 * not an index selected from the given string can be selected more than once. A
 * value of `true` will disallow indices from being selected more than once. A
 * value of `false` will allow indices to be selected any number of times. This
 * defaults to `true`.
 * @returns {number[]} An array of indices from the given string.
 */
export function sampleStringIndices(
  string: string,
  options: SampleFromStringOptions = {}
): number[] {
  return sampleArrayIndices(string.split(''), options)
}

/**
 * A function which returns one or more randomly-selected characters from the
 * given string.
 *
 * @export
 * @param {string} string A string with non-zero length.
 * @param {number} [options.count] An optional number of characters to be
 * selected from the given string. This value must be an integer, no less than
 * 1, and no more than the length of the given string.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given string as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @param {boolean} [options.unique] An optional boolean to determine whether or
 * not a character selected from the given string can be selected more than
 * once. A value of `true` will disallow characters from being selected more
 * than once. A value of `false` will allow characters to be selected any number
 * of times. This defaults to `true`.
 * @returns {string[]} An array of characters from the given string.
 */
export function sampleStringValues(
  string: string,
  options: SampleFromStringOptions = {}
): string[] {
  return sampleArrayValues<string>(string.split(''), options)
}
