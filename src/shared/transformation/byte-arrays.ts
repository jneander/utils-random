export function uint8ArrayToUint32(byteArray: Uint8Array): number {
  /*
   * The order of the given bytes will be interpreted as most-significant to
   * least-significant. For example:
   *
   *   [0b10100110, 0b01011010] => 0b1010011001011010
   *
   * This makes byte order and bit order consistent. To simplify operations, and
   * to ensure byte arrays shorter than 4 have consistent significance starting
   * from the end-most index, reverse the byte array at the start of this
   * function.
   */

  const bytes = byteArray.slice(0, 4)
  bytes.reverse()

  let uint32 = 0

  for (let i = 0; i < 4; i++) {
    uint32 |= bytes[i] << (8 * i)
  }

  return uint32 >>> 0
}

export function uint32ToUint8Array(uint32: number): Uint8Array {
  /*
   * Perform the exact inverse of `uint8ArrayToUint32`.
   *
   *   0b0101000000001100 => [0b01010000, 0b00001100]
   */

  return new Uint8Array([
    (uint32 & 4278190080) >>> 24,
    (uint32 & 16711680) >>> 16,
    (uint32 & 65280) >>> 8,
    uint32 & 255
  ])
}
