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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reorders the Schur factorization of a complex matrix A = Q·T·Qᴴ, so that a selected cluster of eigenvalues appears in the leading positions on the diagonal of the upper triangular matrix T, and the leading columns of Q form an orthonormal basis of the corresponding right invariant subspace.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} job - specifies whether condition numbers are required for the cluster of eigenvalues (S) or the invariant subspace (SEP): `'none'`: none; `'eigenvalues'`: for eigenvalues only (S); `'subspace'`: for invariant subspace only (SEP); `'both'`: for both eigenvalues and invariant subspace (S and SEP).
* @param {string} compq - `'update'`: update the matrix Q of Schur vectors; `'none'`: do not update Q.
* @param {Uint8Array} SELECT - sELECT specifies the eigenvalues in the selected cluster.
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - the order of the matrix T.
* @param {Complex128Array} T - on entry, the upper triangular matrix T. On exit, T is overwritten by the reordered matrix T, with the selected eigenvalues as the leading diagonal elements.
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} Q - on entry, if `compq === 'update'`, the matrix Q of Schur vectors. On exit, if `compq === 'update'`, Q has been postmultiplied by the unitary transformation matrix which reorders T; the leading M columns of Q form an orthonormal basis for the specified invariant subspace.
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Complex128Array} W - the reordered eigenvalues of T, in the same order as they appear on the diagonal of T.
* @param {integer} strideW - stride length for `W`
* @param {Int32Array} M - the dimension of the specified invariant subspace. 0 <= M <= N.
* @param {Float64Array} s - if `job === 'eigenvalues'` or `job === 'both'`, S is a lower bound on the reciprocal condition number for the selected cluster of eigenvalues.
* @param {Float64Array} sep - if `job === 'subspace'` or `job === 'both'`, SEP is the estimated reciprocal condition number of the specified invariant subspace.
* @param {(Complex128Array|null)} WORK - caller-provided workspace of at least `LWMIN` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} third argument must be one of the following: "none", "update"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument is invalid (rejected when `LDQ < 1 || ( compq === "update" && LDQ < N )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function ztrsen( order, job, compq, SELECT, strideSELECT, N, T, LDT, Q, LDQ, W, strideW, M, s, sep, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( compq !== 'none' && compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "none", "update". Value: `%s`.', compq ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDT ) );
	}
	if ( LDQ < 1 || ( compq === 'update' && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument is invalid (rejected when `LDQ < 1 || ( compq === "update" && LDQ < N )`). Value: `%d`.', LDQ ) );
	}
	const st1 = ( order === 'column-major' ) ? 1 : LDT;
	const st2 = ( order === 'column-major' ) ? LDT : 1;
	const sq1 = ( order === 'column-major' ) ? 1 : LDQ;
	const sq2 = ( order === 'column-major' ) ? LDQ : 1;
	const oselect = stride2offset( N, strideSELECT );
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		// Fortran LWORK: 1 if JOB = 'N'; M*(N-M) if JOB = 'E'; 2*M*(N-M) if JOB = 'V' or 'B',
		// where M is the number of selected eigenvalues.
		let nsel = 0;
		for ( let i = 0; i < N; i++ ) {
			if ( SELECT[ oselect + ( i * strideSELECT ) ] ) {
				nsel += 1;
			}
		}
		const mult = ( job === 'eigenvalues' ) ? 1 : ( ( job === 'subspace' || job === 'both' ) ? 2 : 0 );
		WORK = new Complex128Array( max( 1, mult * nsel * ( N - nsel ) ) );
	}
	if ( job !== 'none' && job !== 'eigenvalues' && job !== 'subspace' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	return base( job, compq, SELECT, strideSELECT, oselect, N, T, st1, st2, 0, Q, sq1, sq2, 0, W, strideW, ow, M, s, sep, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztrsen;
