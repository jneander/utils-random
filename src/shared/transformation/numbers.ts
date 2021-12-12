export function bitwiseFractToFract32(fract: number): number {
  const divisor = fract < 0 ? -0x100000000 : 0x100000000
  return ((Math.abs(fract) * 0x100000000) >>> 0) / divisor
}

export function bitwiseFract32ToInt32(fract32: number): number {
  return (fract32 * 0x100000000) | 0
}

export function bitwiseFract32ToUint32(fract32: number): number {
  return (fract32 * 0x100000000) >>> 0
}

export function bitwiseInt32ToFract32(int32: number): number {
  return (int32 >>> 0) / 0x100000000
}

export function bitwiseInt32ToUint32(int32: number): number {
  return int32 >>> 0
}

export function bitwiseUint32ToFract32(uint32: number): number {
  return uint32 / 0x100000000
}

export function bitwiseUint32ToInt32(uint32: number): number {
  return uint32 | 0
}
