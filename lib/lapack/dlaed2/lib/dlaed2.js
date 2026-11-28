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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import trunc from '@stdlib/math/base/special/trunc/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Merges eigenvalues and deflates the secular equation in divide and conquer.
*
* @private
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {Int32Array} k - output (length-1 array): the number of non-deflated eigenvalues, and the order of the related secular equation
* @param {NonNegativeInteger} N - dimension of the symmetric tridiagonal matrix
* @param {NonNegativeInteger} n1 - location of the last eigenvalue in the leading sub-matrix
* @param {Float64Array} d - eigenvalues of the two submatrices (length N)
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} Q - eigenvectors (N-by-N, column-major with leading dimension LDQ)
* @param {PositiveInteger} LDQ - leading dimension of Q
* @param {Int32Array} INDXQ - permutation sorting each sub-problem (1-based, length N)
* @param {integer} strideINDXQ - stride length for `INDXQ`
* @param {Float64Array} rho - input/output (length-1 array): off-diagonal element associated with the rank-1 cut
* @param {Float64Array} z - updating vector (length N)
* @param {integer} strideZ - stride length for `z`
* @param {Float64Array} DLAMBDA - output eigenvalues for secular equation (length N)
* @param {integer} strideDLAMBDA - stride length for `DLAMBDA`
* @param {Float64Array} w - output z-vector for secular equation (length N)
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} Q2 - output eigenvectors for matrix multiply
* @param {integer} strideQ21 - stride length for `Q2`
* @param {Int32Array} INDX - output permutation (length N)
* @param {integer} strideINDX - stride length for `INDX`
* @param {Int32Array} INDXC - output permutation (length N)
* @param {integer} strideINDXC - stride length for `INDXC`
* @param {Int32Array} INDXP - output permutation (length N)
* @param {integer} strideINDXP - stride length for `INDXP`
* @param {Int32Array} COLTYP - output column types (length max(N,4))
* @param {integer} strideCOLTYP - stride length for `COLTYP`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument is invalid (rejected when `min( 1, trunc( N / 2 ) ) > n1 || trunc( N / 2 ) < n1`)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @returns {integer} status code (0 = success)
*/
function dlaed2( order, k, N, n1, d, strideD, Q, LDQ, INDXQ, strideINDXQ, rho, z, strideZ, DLAMBDA, strideDLAMBDA, w, strideW, Q2, strideQ21, INDX, strideINDX, INDXC, strideINDXC, INDXP, strideINDXP, COLTYP, strideCOLTYP ) { // eslint-disable-line max-len, max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( min( 1, trunc( N / 2 ) ) > n1 || trunc( N / 2 ) < n1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `min( 1, trunc( N / 2 ) ) > n1 || trunc( N / 2 ) < n1`). Value: `%d`.', n1 ) );
	}
	if ( LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDQ ) );
	}
	const od = stride2offset( N, strideD );
	const oindxq = stride2offset( N, strideINDXQ );
	const oz = stride2offset( N, strideZ );
	const odlambda = stride2offset( N, strideDLAMBDA );
	const ow = stride2offset( N, strideW );
	// Q2 holds up to N*N entries: dlaed2.f writes past its documented N1**2+(N-N1)**2 (spec override, ticket 0068).
	const oq2 = stride2offset( N * N, strideQ21 );
	const oindx = stride2offset( N, strideINDX );
	const oindxc = stride2offset( N, strideINDXC );
	const oindxp = stride2offset( N, strideINDXP );
	const ocoltyp = stride2offset( N, strideCOLTYP );
	const sq1 = ( order === 'column-major' ) ? 1 : LDQ;
	const sq2 = ( order === 'column-major' ) ? LDQ : 1;
	return base( k, N, n1, d, strideD, od, Q, sq1, sq2, 0, INDXQ, strideINDXQ, oindxq, rho, z, strideZ, oz, DLAMBDA, strideDLAMBDA, odlambda, w, strideW, ow, Q2, strideQ21, oq2, INDX, strideINDX, oindx, INDXC, strideINDXC, oindxc, INDXP, strideINDXP, oindxp, COLTYP, strideCOLTYP, ocoltyp ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaed2;
