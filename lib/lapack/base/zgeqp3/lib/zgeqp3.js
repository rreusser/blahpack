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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base, { computeWorkSize } from './base.js';


// MAIN //

/**
* Computes a QR factorization with column pivoting of an M-by-N matrix:.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} JPVT - input array
* @param {integer} strideJPVT - `JPVT` stride length
* @param {Complex128Array} TAU - input array
* @param {integer} strideTAU - `TAU` stride length
* @param {(Complex128Array|null)} WORK - caller-owned complex workspace, or
* `null` to auto-allocate at the minimum required size (`computeWorkSize(M,N)`)
* @param {integer} strideWork - `WORK` stride length
* @param {(Float64Array|null)} RWORK - caller-owned real workspace, or `null`
* to auto-allocate at the minimum required size (`max(1, 2*N)`)
* @param {integer} strideRWork - `RWORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgeqp3( order, M, N, A, LDA, JPVT, strideJPVT, TAU, strideTAU, WORK, strideWork, RWORK, strideRWork ) {
	var minRWork;
	var minWork;
	var sa1;
	var sa2;
	var oj;
	var ot;
	var ow;
	var or;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	oj = stride2offset( N, strideJPVT );
	ot = stride2offset( N, strideTAU );

	// The wrapper is the single sanctioned allocation site (base/ndarray never
	// allocate): allocate a complex WORK and a real RWORK when the caller
	// passes `null`.
	if ( WORK === null || WORK === void 0 ) {
		minWork = computeWorkSize( M, N );
		WORK = new Complex128Array( minWork );
		strideWork = 1;
		ow = 0;
	} else {
		ow = stride2offset( N, strideWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		minRWork = max( 1, 2 * N );
		RWORK = new Float64Array( minRWork );
		strideRWork = 1;
		or = 0;
	} else {
		or = stride2offset( N, strideRWork );
	}
	return base( M, N, A, sa1, sa2, 0, JPVT, strideJPVT, oj, TAU, strideTAU, ot, WORK, strideWork, ow, RWORK, strideRWork, or );
}


// EXPORTS //

export default zgeqp3;
