import {RandomUint32Fn} from '../numbers'
import {mathRandomUint32} from '../shared'

export interface ShuffleArrayOptions {
  randomUint32Fn?: RandomUint32Fn
}

/**
 * A function which accepts an array and returns a new array with the contents
 * of the given array having randomized positions.
 *
 * @export
 * @param {T[]} array An array of values.
 * @param {RandomUint32Fn} [options.randomUint32Fn] An optional function which
 * returns an unsigned 32-bit integer. The function must accept an inclusive
 * minimum and exclusive maximum to be the boundaries of the returned value.
 * This function will be called with `0` for the minimum and the length of the
 * given array as the maximum. This function defaults to one which uses
 * `Math.random` and does not eliminate bias.
 * @returns {T[]} An array with the same contents of the given array having
 * randomized positions.
 */
export function shuffleArray<T = any>(array: T[], options: ShuffleArrayOptions = {}): T[] {
  const {randomUint32Fn = mathRandomUint32} = options
  const arrayCopy = [...array]

  for (let i = arrayCopy.length; i > 0; i--) {
    let j = randomUint32Fn(0, i)
    ;[arrayCopy[i - 1], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i - 1]]
  }

  return arrayCopy
}
