import {shuffleArray} from '../arrays'
import {RandomUint32Fn} from '../numbers'

export interface ShuffleStringOptions {
  randomUint32Fn?: RandomUint32Fn
}

export function shuffleString(string: string, options: ShuffleStringOptions = {}): string {
  return shuffleArray(string.split(''), options).join('')
}
