
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the generalized eigenvalues, the generalized real Schur form (S,T).
* and optionally the left and/or right matrices of Schur vectors for a pair of
* N-by-N real nonsymmetric matrices (A,B).
*
* When `WORK` is `null`, this wrapper auto-allocates a workspace of size
* `max(8*N, 6*N+16, 1)` elements as a convenience. Prefer passing a
* caller-owned buffer for batched use.
*
* When `BWORK` is `null`, this wrapper auto-allocates a logical workspace
* of size `N` elements. Only used when `sort='sorted'`.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobvsl - `'compute-vectors'` to compute left Schur vectors, `'no-vectors'` to not
* @param {string} jobvsr - `'compute-vectors'` to compute right Schur vectors, `'no-vectors'` to not
* @param {string} sort - `'sorted'` to order eigenvalues, `'not-sorted'` to not
* @param {Function} selctg - selection function `(alphar, alphai, beta) => boolean`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input matrix A (N x N), overwritten by Schur form S on exit
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} B - input matrix B (N x N), overwritten by triangular form T on exit
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} ALPHAR - output: real parts of alpha (length N)
* @param {Float64Array} ALPHAI - output: imaginary parts of alpha (length N)
* @param {Float64Array} BETA - output: beta values (length N)
* @param {Float64Array} VSL - output: left Schur vectors (N x N)
* @param {PositiveInteger} LDVSL - leading dimension of VSL
* @param {Float64Array} VSR - output: right Schur vectors (N x N)
* @param {PositiveInteger} LDVSR - leading dimension of VSR
* @param {(Float64Array|null)} WORK - caller-provided workspace of length at least max(8*N, 6*N+16, 1), or null to auto-allocate
* @param {(Uint8Array|null)} BWORK - caller-provided logical workspace of length at least N, or null to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to max(1,N)
* @throws {RangeError} tenth argument must be greater than or equal to max(1,N)
* @returns {Object} result with properties: info (integer status code), sdim (number of sorted eigenvalues)
*/
function dgges( order, jobvsl, jobvsr, sort, selctg, N, A, LDA, B, LDB, ALPHAR, ALPHAI, BETA, VSL, LDVSL, VSR, LDVSR, WORK, BWORK ) {
	var svsl1;
	var svsl2;
	var svsr1;
	var svsr2;
	var lwork;
	var sa1;
	var sa2;
	var sb1;
	var sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		svsl1 = 1;
		svsl2 = LDVSL;
		svsr1 = 1;
		svsr2 = LDVSR;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		svsl1 = LDVSL;
		svsl2 = 1;
		svsr1 = LDVSR;
		svsr2 = 1;
	}
	if ( WORK === null ) {
		lwork = ( N > 0 ) ? max( 8 * N, ( 6 * N ) + 16 ) : 1;
		WORK = new Float64Array( lwork );
	}
	if ( BWORK === null ) {
		BWORK = new Uint8Array( max( 1, N ) );
	}
	return base( jobvsl, jobvsr, sort, selctg, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, svsl1, svsl2, 0, VSR, svsr1, svsr2, 0, WORK, 1, 0, BWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgges;
