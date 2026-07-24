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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute the generalized eigenvalues and optionally the left and/or.
* right generalized eigenvectors of a complex matrix pair (A, B).
*
* When `work` (resp. `rwork`) is `null`, this LAPACKE-style wrapper allocates a
* workspace as a convenience: `work` of size `N + max(1,(N*32)+(33*32))` complex
* elements and `rwork` of size `max(1,8*N)` real elements. Prefer passing
* caller-owned buffers for batched use.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobvl - `'none'` or `'compute'`
* @param {string} jobvr - `'none'` or `'compute'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} ALPHA - output eigenvalue numerators
* @param {integer} strideALPHA - `ALPHA` stride length
* @param {Complex128Array} BETA - output eigenvalue denominators
* @param {integer} strideBETA - `BETA` stride length
* @param {Complex128Array} VL - left eigenvector matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - right eigenvector matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {(Complex128Array|null)} [work=null] - caller-provided complex workspace (length >= N + max(1,(N*32)+(33*32))), or `null` to auto-allocate
* @param {integer} [strideWork=1] - stride for `work` (complex elements)
* @param {(Float64Array|null)} [rwork=null] - caller-provided real workspace (length >= max(1,8*N)), or `null` to auto-allocate
* @param {integer} [strideRwork=1] - stride for `rwork`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zggev( order, jobvl, jobvr, N, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, VL, LDVL, VR, LDVR, work, strideWork, rwork, strideRwork ) {
	let sa1, sa2, sb1, sb2, svl1, svl2, svr1, svr2, lwork, lrwork;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDVL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	if ( jobvl !== 'compute' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobvl` value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'compute' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobvr` value. Value: `%s`.', jobvr ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	if ( work === null || work === void 0 ) {
		lwork = N + max( 1, ( N * 32 ) + ( 33 * 32 ) );
		work = new Complex128Array( lwork );
		strideWork = 1;
	}
	if ( rwork === null || rwork === void 0 ) {
		lrwork = max( 1, 8 * N );
		rwork = new Float64Array( lrwork );
		strideRwork = 1;
	}
	const oa = stride2offset( N, strideALPHA );
	const ob = stride2offset( N, strideBETA );
	const ow = stride2offset( work.length, strideWork );
	const orw = stride2offset( rwork.length, strideRwork );
	return base( jobvl, jobvr, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHA, strideALPHA, oa, BETA, strideBETA, ob, VL, svl1, svl2, 0, VR, svr1, svr2, 0, work, strideWork, ow, rwork, strideRwork, orw );
}


// EXPORTS //

export default zggev;
