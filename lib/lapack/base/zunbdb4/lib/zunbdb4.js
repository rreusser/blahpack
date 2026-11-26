/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns (CSD-prep variant 4 — widest `M1`/`M2` partition).
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} M - total number of rows
* @param {integer} P - number of rows in `X11`
* @param {NonNegativeInteger} Q - number of columns
* @param {Complex128Array} X11 - top block (`P`-by-`Q`)
* @param {PositiveInteger} LDX11 - leading dimension of `X11`
* @param {Complex128Array} X21 - bottom block (`(M-P)`-by-`Q`)
* @param {PositiveInteger} LDX21 - leading dimension of `X21`
* @param {Float64Array} THETA - output array (length at least `Q`)
* @param {integer} strideTHETA - stride length for `THETA`
* @param {Float64Array} PHI - output array (length at least `Q-1`)
* @param {integer} stridePHI - stride length for `PHI`
* @param {Complex128Array} TAUP1 - output array (length at least `M-Q`)
* @param {integer} strideTAUP1 - stride length for `TAUP1` (in complex elements)
* @param {Complex128Array} TAUP2 - output array (length at least `M-Q`)
* @param {integer} strideTAUP2 - stride length for `TAUP2` (in complex elements)
* @param {Complex128Array} TAUQ1 - output array (length at least `Q`)
* @param {integer} strideTAUQ1 - stride length for `TAUQ1` (in complex elements)
* @param {Complex128Array} PHANTOM - workspace and output (length at least `M`)
* @param {integer} stridePHANTOM - stride length for `PHANTOM` (in complex elements)
* @param {(Complex128Array|null)} WORK - workspace (length at least `max(P, M-P, Q+1)` complex elements, the reference minimum and optimum `LWORK`)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `P < M - Q || M - P < M - Q`)
* @throws {RangeError} fourth argument is invalid (rejected when `Q < M - Q || Q > M`)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, P )` (column-major)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, Q )` (row-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, M - P )` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, Q )` (row-major)
* @throws {RangeError} `M` must be a nonnegative integer
* @throws {RangeError} `P` must satisfy `P >= M-Q && M-P >= M-Q`
* @throws {RangeError} `Q` must satisfy `0 <= Q <= M && M-Q <= Q`
* @throws {RangeError} `LDX11` must satisfy the leading-dimension constraint
* @throws {RangeError} `LDX21` must satisfy the leading-dimension constraint
* @returns {integer} `info` (0 = success)
*/
function zunbdb4( order, M, P, Q, X11, LDX11, X21, LDX21, THETA, strideTHETA, PHI, stridePHI, TAUP1, strideTAUP1, TAUP2, strideTAUP2, TAUQ1, strideTAUQ1, PHANTOM, stridePHANTOM, WORK ) {
	let sx111, sx112, sx211, sx212;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( P < M - Q || M - P < M - Q ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `P < M - Q || M - P < M - Q`). Value: `%d`.', P ) );
	}
	if ( Q < M - Q || Q > M ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `Q < M - Q || Q > M`). Value: `%d`.', Q ) );
	}
	if ( order === 'column-major' && ( LDX11 < max( 1, P ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', P, LDX11 ) );
	}
	if ( order === 'row-major' && ( LDX11 < max( 1, Q ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', Q, LDX11 ) );
	}
	if ( order === 'column-major' && ( LDX21 < max( 1, M - P ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', M - P, LDX21 ) );
	}
	if ( order === 'row-major' && ( LDX21 < max( 1, Q ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', Q, LDX21 ) );
	}
	if ( order === 'column-major' ) {
		sx111 = 1;
		sx112 = LDX11;
		sx211 = 1;
		sx212 = LDX21;
	} else {
		sx111 = LDX11;
		sx112 = 1;
		sx211 = LDX21;
		sx212 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		// Reference LWORKMIN = max( ILARF+LLARF-1, IORBDB5+LORBDB5-1 ) with ILARF = IORBDB5 = 2 (ticket 0074):
		WORK = new Complex128Array( max( max( Q - 1, P - 1 ), max( M - P - 1, Q ) ) + 1 );
	}
	return base( M, P, Q, X11, sx111, sx112, 0, X21, sx211, sx212, 0, THETA, strideTHETA, 0, PHI, stridePHI, 0, TAUP1, strideTAUP1, 0, TAUP2, strideTAUP2, 0, TAUQ1, strideTAUQ1, 0, PHANTOM, stridePHANTOM, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zunbdb4;
