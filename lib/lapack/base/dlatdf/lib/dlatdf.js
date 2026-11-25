/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses the LU factorization of the n-by-n matrix computed by sgetc2 and computes a contribution to the reciprocal Dif-estimate.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {integer} ijob - iJOB = 2: First compute an approximative null-vector e of Z using DGECON, e is normalized and solve for Zx = +-e - f with the sign giving the greater value of 2-norm(x).
* @param {NonNegativeInteger} N - the number of columns of the matrix Z.
* @param {Float64Array} Z - on entry, the LU part of the factorization of the n-by-n matrix Z computed by DGETC2: Z = P * L * U * Q.
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Float64Array} RHS - on entry, RHS contains contributions from other subsystems. On exit, RHS contains the solution of the subsystem with entries according to the value of IJOB (see above).
* @param {integer} strideRHS - stride length for `RHS`
* @param {Float64Array} rdsum - input/output (length-1 array): rdsum
* @param {Float64Array} rdscal - input/output (length-1 array): rdscal
* @param {Int32Array} IPIV - the pivot indices; for 1 <= i <= N, row i of the matrix has been interchanged with row IPIV(i) (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Int32Array} JPIV - the pivot indices; for 1 <= j <= N, column j of the matrix has been interchanged with column JPIV(j) (0-based).
* @param {integer} strideJPIV - stride length for `JPIV`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {Float64Array} `RHS`
*/
function dlatdf( order, ijob, N, Z, LDZ, RHS, strideRHS, rdsum, rdscal, IPIV, strideIPIV, JPIV, strideJPIV ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const orhs = stride2offset( N, strideRHS );
	const oipiv = stride2offset( N, strideIPIV );
	const ojpiv = stride2offset( N, strideJPIV );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	return base( ijob, N, Z, sz1, sz2, 0, RHS, strideRHS, orhs, rdsum, rdscal, IPIV, strideIPIV, oipiv, JPIV, strideJPIV, ojpiv ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlatdf;
