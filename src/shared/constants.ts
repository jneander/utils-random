export const ONE_BIT_AS_FRACT32 = 1 / 2 ** 32

/*
 * 32-bit decimal fractions are in the range [0, 1 - 1 / 2 ^ 32].
 */
export const MIN_SAFE_FRACT32_INCLUSIVE = 0
export const MAX_SAFE_FRACT32_EXCLUSIVE = 1
export const MAX_SAFE_FRACT32_INCLUSIVE = MAX_SAFE_FRACT32_EXCLUSIVE - ONE_BIT_AS_FRACT32

/*
 * Signed 32-bit integers are in the range [-2 ^ 31, 2 ^ 31 - 1].
 */
export const MIN_SAFE_INT32_INCLUSIVE = -(2 ** 31)
export const MAX_SAFE_INT32_EXCLUSIVE = 2 ** 31
export const MAX_SAFE_INT32_INCLUSIVE = MAX_SAFE_INT32_EXCLUSIVE - 1

/*
 * Unsigned 32-bit integers are in the range [0, (2 ^ 32) - 1].
 */
export const MIN_SAFE_UINT32_INCLUSIVE = 0
export const MAX_SAFE_UINT32_EXCLUSIVE = 2 ** 32
export const MAX_SAFE_UINT32_INCLUSIVE = MAX_SAFE_UINT32_EXCLUSIVE - 1
