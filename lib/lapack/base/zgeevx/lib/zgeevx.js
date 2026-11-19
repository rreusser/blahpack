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
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes eigenvalues, eigenvectors, and reciprocal condition numbers for a complex nonsymmetric matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} balanc - specifies the operation type
* @param {string} jobvl - specifies the operation type
* @param {string} jobvr - specifies the operation type
* @param {string} sense - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {Int32Array} ilo - input/output (length-1 array): ilo
* @param {Int32Array} ihi - input/output (length-1 array): ihi
* @param {Float64Array} SCALE - input array
* @param {integer} strideSCALE - stride length for `SCALE`
* @param {Float64Array} abnrm - input/output (length-1 array): abnrm
* @param {Float64Array} RCONDE - input array
* @param {integer} strideRCONDE - stride length for `RCONDE`
* @param {Float64Array} RCONDV - input array
* @param {integer} strideRCONDV - stride length for `RCONDV`
* @param {Float64Array} WORK - input array
* @param {Float64Array} RWORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} N must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zgeevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, w, strideW, VL, LDVL, VR, LDVR, ilo, ihi, SCALE, strideSCALE, abnrm, RCONDE, strideRCONDE, RCONDV, strideRCONDV, WORK, RWORK ) { // eslint-disable-line max-len, max-params
	let svl1, svl2, svr1, svr2, sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvr ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDVL < 1 || ( jobvl === 'compute-vectors' && LDVL < N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (rejected when `LDVL < 1 || ( jobvl === "compute-vectors" && LDVL < N )`). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( jobvr === 'compute-vectors' && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `LDVR < 1 || ( jobvr === "compute-vectors" && LDVR < N )`). Value: `%d`.', LDVR ) );
	}
	if ( balanc !== 'none' && balanc !== 'permute' && balanc !== 'scale' && balanc !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid balanc value. Value: `%s`.', balanc ) );
	}
	if ( sense !== 'none' && sense !== 'eigenvalues' && sense !== 'right-vectors' && sense !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be a valid sense value. Value: `%s`.', sense ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		sa1 = LDA;
		sa2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		if ( sense === 'right-vectors' || sense === 'both' ) {
			WORK = new Complex128Array( max( 1, ( N*N ) + ( 2*N ) ) );
		} else {
			WORK = new Complex128Array( max( 1, 2*N ) );
		}
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, 2 * N );
		RWORK = new Float64Array( minRwork );
	}
	return base( balanc, jobvl, jobvr, sense, N, A, sa1, sa2, 0, w, strideW, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, ilo, ihi, SCALE, strideSCALE, 0, abnrm, RCONDE, strideRCONDE, 0, RCONDV, strideRCONDV, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgeevx;
