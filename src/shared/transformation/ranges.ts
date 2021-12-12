export function remapInt32ToUint32(int32: number): number {
  return int32 + 2 ** 31
}

export function remapUint32ToInt32(uint32: number): number {
  return uint32 - 2 ** 31
}
