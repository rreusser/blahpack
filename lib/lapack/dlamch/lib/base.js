/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// VARIABLES //

// IEEE 754 double-precision constants:
const EPS = 1.1102230246251565e-16;          // 2^-53 (half of Number.EPSILON)
const SFMIN = 2.2250738585072014e-308;       // Number.MIN_VALUE (normalized)
const BASE = 2;                              // radix
const PREC = EPS * BASE;                     // eps * radix
const DIGITS = 53;                           // significand bits
const RND = 1.0;                             // 1.0 for IEEE rounding
const EMIN = -1021;                          // min exponent
const RMIN = 2.2250738585072014e-308;        // tiny = 2^emin (same as sfmin for IEEE)
const EMAX = 1024;                           // max exponent
const RMAX = 1.7976931348623157e+308;        // Number.MAX_VALUE


// MAIN //

/** @type {Object<string, number>} */
const TABLE = {
	'epsilon': EPS,
	'safe-minimum': SFMIN,
	'base': BASE,
	'precision': PREC,
	'digits': DIGITS,
	'rounding': RND,
	'min-exponent': EMIN,
	'underflow': RMIN,
	'max-exponent': EMAX,
	'overflow': RMAX
};

/**
* Determines double-precision machine parameters.
*
* @private
* @param {MachineParameter} cmach - specifies the machine parameter
* @returns {number} machine parameter value
*/
function dlamch( cmach ) {
	const v = TABLE[ cmach ];
	if ( v !== void 0 ) {
		return v;
	}
	return 0.0;
}


// EXPORTS //

export default dlamch;
