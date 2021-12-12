import {SinonStub} from 'sinon'

export function setStubSequence(stubFn: SinonStub, sequence: any[]): void {
  sequence.forEach((value: any, index: number) => {
    stubFn.onCall(index).returns(value)
  })
}

export function iterateForMinAndMax(
  fn: () => number,
  times: number = 1000
): {min: number; max: number} {
  let value = fn()
  let min: number = value
  let max: number = value

  for (let i = 1; i < times; i++) {
    value = fn()
    min = Math.min(min, value)
    max = Math.max(max, value)
  }

  return {min, max}
}

/*
 * Given the possible values: [a, b] (2 values)
 * Given a length for each result: 3
 * Generate all permutations: 2 ** 3
 *
 * 0: [a, a, a]
 * 1: [a, a, b]
 * 2: [a, b, a]
 * 3: [a, b, b]
 * 4: [b, a, a]
 * 5: [b, a, b]
 * 6: [b, b, a]
 * 7: [b, b, b]
 */
export function getPermutations<T = any>(values: T[], permutationLength: number): T[][] {
  return Array.from({length: values.length ** permutationLength}, (_, index) => {
    const permutation: T[] = []

    for (let i = 0; i < permutationLength; i++) {
      permutation.push(values[Math.floor(index / values.length ** i) % values.length])
    }

    return permutation
  })
}
