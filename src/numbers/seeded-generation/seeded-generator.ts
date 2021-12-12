import {RandomNumberGenerator} from '../types'
import {randomSeed} from './seeding'
import {Seed} from './types'

export interface SeededNumberGeneratorOptions<State> {
  seed?: Seed
  seedFn?: () => Seed
  state?: State
}

export abstract class SeededNumberGenerator<State> implements RandomNumberGenerator {
  protected state!: State

  /**
   * Creates an instance of a seeded number generator.
   *
   * @param {Seed} [options.seed] An optional string or number with which to
   * deterministically seed this pseudorandom number generator.
   * @param {() => Seed} [options.seedFn] An optional function which returns a
   * seed value (string or number) with which to deterministically seed this
   * pseudorandom number generator. When no initial seed, state, or seed
   * function is given, this value will default to a function which uses either
   * `Crypto` or `Math.random` to randomly generate an initial seed for this
   * instance of the generator, depending on availability within the current
   * environment.
   * @param {State} [options.state] An optional initial state from an previous
   * instance of this seeded number generator.
   */
  constructor(options: SeededNumberGeneratorOptions<State> = {}) {
    if (options.state) {
      this.state = this.cloneState(options.state)
    } else {
      let seed = options.seed

      if (seed == null) {
        seed = (options.seedFn || randomSeed)()
      }

      this.buildStateFromSeed(seed)
    }
  }

  /**
   * A method which returns the current internal state of the pseudorandom
   * number generator. This state can be used to re-instantiate the same
   * generator class and deterministically resume seeded number generation.
   *
   * @returns {State} The current internal state of the generator.
   */
  getState(): State {
    return this.cloneState(this.state)
  }

  abstract nextFract32(minInclusive?: number, maxExclusive?: number): number

  abstract nextInt32(minInclusive?: number, maxExclusive?: number): number

  abstract nextUint32(minInclusive?: number, maxExclusive?: number): number

  protected abstract buildStateFromSeed(seed: Seed): void

  protected abstract cloneState(state: State): State
}
