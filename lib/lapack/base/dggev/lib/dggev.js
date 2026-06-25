
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the generalized eigenvalues and, optionally, the left and/or right.
* generalized eigenvectors for a pair of N-by-N real nonsymmetric matrices (A,B).
*
* When `work` is `null`, this LAPACKE-style wrapper allocates a workspace of
* size `max(1,8*N)` elements as a convenience. Prefer passing a caller-owned
* buffer for batched use.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobvl - `'compute-vectors'` to compute left eigenvectors, `'no-vectors'` to not
* @param {string} jobvr - `'compute-vectors'` to compute right eigenvectors, `'no-vectors'` to not
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input matrix A (N x N), overwritten on exit
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} B - input matrix B (N x N), overwritten on exit
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} ALPHAR - output: real parts of alpha (length N)
* @param {Float64Array} ALPHAI - output: imaginary parts of alpha (length N)
* @param {Float64Array} BETA - output: beta values (length N)
* @param {Float64Array} VL - output: left eigenvectors (N x N)
* @param {PositiveInteger} LDVL - leading dimension of VL
* @param {Float64Array} VR - output: right eigenvectors (N x N)
* @param {PositiveInteger} LDVR - leading dimension of VR
* @param {(Float64Array|null)} [work=null] - caller-provided workspace (length >= max(1,8*N)), or `null` to auto-allocate
* @param {integer} [strideWork=1] - stride for `work`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} LDA must be >= max(1,N)
* @throws {RangeError} LDB must be >= max(1,N)
* @returns {integer} info - 0 on success, 1..N if QZ iteration failed, N+1 for other errors
*/
function dggev( order, jobvl, jobvr, N, A, LDA, B, LDB, ALPHAR, ALPHAI, BETA, VL, LDVL, VR, LDVR, work, strideWork ) {
	var lwork;
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var ow;

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
		lwork = max( 1, 8 * N );
		work = new Float64Array( lwork );
		strideWork = 1;
	}
	ow = stride2offset( work.length, strideWork );
	return base( jobvl, jobvr, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, work, strideWork, ow ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggev;
