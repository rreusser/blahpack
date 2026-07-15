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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base, { computeWorkSize } from './base.js';


// MAIN //

/**
* Computes the singular value decomposition (SVD) of a complex M-by-N matrix A.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobu - `'all-columns'`: all M columns of U returned, `'economy'`: first min(M,N) columns, `'overwrite'`: overwrite A, `'none'`: no U
* @param {string} jobvt - `'all-rows'`: all N rows of V^H returned, `'economy'`: first min(M,N) rows, `'overwrite'`: overwrite A, `'none'`: no VT
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} s - input array
* @param {integer} strideS - `s` stride length
* @param {Complex128Array} U - input matrix
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Complex128Array} VT - input matrix
* @param {PositiveInteger} LDVT - leading dimension of `VT`
* @param {(Complex128Array|null)} WORK - caller-owned complex workspace, or
* `null` to auto-allocate at the minimum required size (`computeWorkSize(M,N)`)
* @param {integer} strideWork - `WORK` stride length
* @param {(Float64Array|null)} RWORK - caller-owned real workspace, or `null`
* to auto-allocate at the minimum required size (`max(1, 5*min(M,N))`)
* @param {integer} strideRWork - `RWORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid `jobu` value
* @throws {TypeError} third argument must be a valid `jobvt` value
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to max(1,N) (row-major) or max(1,M) (column-major)
* @throws {RangeError} eleventh argument must be greater than or equal to max(1,N) (row-major) or max(1,M) (column-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to max(1,N) (row-major) or max(1,M) (column-major)
* @returns {integer} info status code
*/
function zgesvd( order, jobu, jobvt, M, N, A, LDA, s, strideS, U, LDU, VT, LDVT, WORK, strideWork, RWORK, strideRWork ) {
	var minRWork;
	var minWork;
	var sa1;
	var sa2;
	var su1;
	var su2;
	var sv1;
	var sv2;
	var os;
	var ow;
	var or;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDVT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVT ) );
	}
	if ( order === 'column-major' && LDVT < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDVT ) );
	}
	if ( order === 'row-major' && LDU < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDU ) );
	}
	if ( order === 'column-major' && LDU < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDU ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( jobu !== 'all-columns' && jobu !== 'economy' && jobu !== 'overwrite' && jobu !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobu` value. Value: `%s`.', jobu ) );
	}
	if ( jobvt !== 'all-rows' && jobvt !== 'economy' && jobvt !== 'overwrite' && jobvt !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobvt` value. Value: `%s`.', jobvt ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		su1 = 1;
		su2 = LDU;
		sv1 = 1;
		sv2 = LDVT;
	} else {
		sa1 = LDA;
		sa2 = 1;
		su1 = LDU;
		su2 = 1;
		sv1 = LDVT;
		sv2 = 1;
	}
	os = stride2offset( N, strideS );

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
		minRWork = max( 1, 5 * Math.min( M, N ) );
		RWORK = new Float64Array( minRWork );
		strideRWork = 1;
		or = 0;
	} else {
		or = stride2offset( N, strideRWork );
	}
	return base( jobu, jobvt, M, N, A, sa1, sa2, 0, s, strideS, os, U, su1, su2, 0, VT, sv1, sv2, 0, WORK, strideWork, ow, RWORK, strideRWork, or );
}


// EXPORTS //

export default zgesvd;
