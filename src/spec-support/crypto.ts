import {WebCrypto} from '../shared'

export class WebCryptoDouble implements WebCrypto {
  private valuesSequence: number[][]

  constructor() {
    this.valuesSequence = []
  }

  getRandomValues<T extends ArrayBufferView | null>(array: T): T {
    const values = this.valuesSequence.shift()

    if (values == null) {
      throw new Error('Not enough values in the sequence')
    }

    for (let i = 0; i < array!.byteLength; i++) {
      ;(array as unknown as Uint8Array).set([values[i]], i)
    }

    return array
  }

  pushSequenceValues(values: number[]): void {
    this.valuesSequence.push(values)
  }
}
