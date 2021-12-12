# @jneander/utils-random

Utilities for Number, String, and Array Randomness

[![License: MIT][license-badge]][license-url]

[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square
[license-url]: https://github.com/jneander/utils-random/blob/master/LICENSE

Much of this library builds minimally on the work of others, folks who deserve
credit for their efforts in the space of random value generation.

## Installation

```
npm install @jneander/utils-random
```

## Saving and Restoring Seeded PRNG State

For seeded pseudorandom number generators, an internal state is used to ensure
deterministic sequences of generation. Each seedable generator in this library
has a method to obtain this state and allows creating new instances using prior
state.

## Unbiased Random

Random number generation which is constrained by minimum and/or maximum values
has the potential to be biased by operations which result in one subset of
values more often than other values.

For a scaled-down example, consider a function which generates random numbers
using 4 bits of fidelity. This means each integer between 0 and 15 is possible,
and for this case is assumed to be equally likely with an even distribution of
randomness.

Suppose this function is used to generate values between 0 and 9. There are two common ways to take a value from the 4-bit range and map it to the constrained range.

1. Reduce the fidelity of the first range to fit all values in to the second range.
2. Return the modulus of the 4-bit value against the constrained range.

The first option has the following possible outcomes:

| 4-bit | Constrained (Rounded) |
| ----- | --------------------- |
| 0     | 0                     |
| 1     | 1                     |
| 2     | 1                     |
| 3     | 2                     |
| 4     | 3                     |
| 5     | 3                     |
| 6     | 4                     |
| 7     | 4                     |
| 8     | 5                     |
| 9     | 6                     |
| 10    | 6                     |
| 11    | 7                     |
| 12    | 8                     |
| 13    | 8                     |
| 14    | 9                     |
| 15    | 9                     |

The resulting distribution is as follows:

| Result | Occurrence % |
| ------ | ------------ |
| 0      | 6.25%        |
| 1      | 12.50%       |
| 2      | 6.25%        |
| 3      | 12.50%       |
| 4      | 12.50%       |
| 5      | 6.25%        |
| 6      | 12.50%       |
| 7      | 6.25%        |
| 8      | 12.50%       |
| 9      | 6.25%        |

The formerly-even distribution is no longer even. Bias has been introduced.

The second option has the following possible outcomes:

| 4-bit | Constrained (Modulus) |
| ----- | --------------------- |
| 0     | 0                     |
| 1     | 1                     |
| 2     | 2                     |
| 3     | 3                     |
| 4     | 4                     |
| 5     | 5                     |
| 6     | 6                     |
| 7     | 7                     |
| 8     | 8                     |
| 9     | 9                     |
| 10    | 0                     |
| 11    | 1                     |
| 12    | 2                     |
| 13    | 3                     |
| 14    | 4                     |
| 15    | 5                     |

The resulting distribution is as follows:

| Result | Occurrence % |
| ------ | ------------ |
| 0      | 12.50%       |
| 1      | 12.50%       |
| 2      | 12.50%       |
| 3      | 12.50%       |
| 4      | 12.50%       |
| 5      | 12.50%       |
| 6      | 6.25%        |
| 7      | 6.25%        |
| 8      | 6.25%        |
| 9      | 6.25%        |

Similarly to the first option, the formerly-even distribution is no longer even.
Bias has been introduced.

If unbiased random number generation is desired, these two approaches are not
viable. This library uses a different approach, one which accepts some waste in
computation to ensure bias is minimized, if not altogether avoided.

It works as follows:

The given minimum value is subtracted from the given maximum to create a
normalized range of allowable values to be returned. The minimum is inclusive,
while the maximum is exclusive. For example, a minimum of 8 and maximum of 11
becomes a range of the values between 0 and 3. This means the values of 0, 1,
and 2 are allowed as a result.

The generator function is called. The value is compared to the range. When the
value is allowed by the range, it is added to the original minimum and returned.
With the above example, a generated value of 2 is allowed by the range. It is
then added to the minimum of 8, and the resulting value of 10 is returned.

When the generated value exceeds the range, two different things could happen.

1. It could be discarded and replaced with a subsequent generated number, which
   is exponentially wasteful as the range of allowed values decreases.
2. It can be reconsidered in a different form, one which avoids bias while
   minimizing waste from additional number generation.

In the above example, all of the allowed values have one thing in common: They
all use only the two least-significant bits to be represented.

```
0 => 0b00000000
1 => 0b00000001
2 => 0b00000010
```

The more significant bits are irrelevant. An advantage of doing random number
generation in base-2 is that each bit has a degree of randomness equivalent to
the whole of the value. As long as the generator functions are able to return
any valid value for the type (e.g. [0, 2 ** 32 - 1] for uint32), this means the
irrelevant bits can be safely ignored in the generated value when comparing it
to the range. To do this, the relevant bits are identified from the largest
allowed value to create a mask:

```
2 => 0b00000010
m => 0b00000011
```

When the generated value is masked, its value is minimized (without losing
randomness), potentially to be within the range. It must then be compared again
to determine if it has become an allowed value.

```
21 => 0b00010101
    & 0b00000011
    = 0b00000001 = 1

23 => 0b00010111
    & 0b00000011
    = 0b00000011 = 3
```

In the above case of 21, the masked result of 1 is allowed and can be used for
the result. However, in the case of 32, it masks down to 3, which is not in
range. At this point, this random value is discarded and the process must be
repeated with another generated value.

To simplify the math, both the fract32 and int32 functions map into unit32
values for computation, then back out into their respective types at the end.
This ensures all operations are performed on non-negative, finite numbers
(everything in the uint32 range, [0, 2 ** 32 - 1]).

## References

- http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html
- https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
- https://newbedev.com/seeding-the-random-number-generator-in-javascript
