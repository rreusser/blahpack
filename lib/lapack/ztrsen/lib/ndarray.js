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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reorders the Schur factorization of a complex matrix A = Q_T_Q**H so that a.
* selected cluster of eigenvalues appears in the leading positions on the
* diagonal of the upper triangular matrix T, and the leading columns of Q form
* an orthonormal basis of the corresponding right invariant subspace.
*
* Optionally computes the reciprocal condition numbers of the cluster of
* eigenvalues (S) and/or the invariant subspace (SEP).
*
* @param {('none'|'eigenvalues'|'subspace'|'both')} job - `'none'`, `'eigenvalues'`, `'subspace'`, or `'both'`
* @param {('none'|'update')} compq - `'update'` or `'none'`
* @param {Uint8Array} SELECT - boolean array of length N
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - starting index for SELECT
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Complex128Array} T - N-by-N upper triangular matrix, modified in place
* @param {integer} strideT1 - stride of first dimension of T (in complex elements)
* @param {integer} strideT2 - stride of second dimension of T (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} Q - N-by-N unitary matrix, modified if compq=`'update'`
* @param {integer} strideQ1 - stride of first dimension of Q (in complex elements)
* @param {integer} strideQ2 - stride of second dimension of Q (in complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for Q (in complex elements)
* @param {Complex128Array} W - output: reordered eigenvalues
* @param {integer} strideW - stride for W (in complex elements)
* @param {NonNegativeInteger} offsetW - starting index for W (in complex elements)
* @param {Int32Array} M - output: M[0] = dimension of selected subspace
* @param {Float64Array} s - output: s[0] = reciprocal condition number for eigenvalues
* @param {Float64Array} sep - output: sep[0] = reciprocal condition for subspace
* @param {Complex128Array} WORK - workspace (length `>= 1` for `job='none'`, `>= max(1, M*(N-M))` for `job='eigenvalues'`, `>= max(1, 2*M*(N-M))` for `job='subspace'` or `job='both'`, in complex elements)
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @throws {TypeError} first argument must be one of the following: "both", "eigenvalues", "none", "subspace"
* @throws {TypeError} second argument must be one of the following: "none", "update"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info (0 = success)
*/
function ztrsen( job, compq, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, W, strideW, offsetW, M, s, sep, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( job !== 'both' && job !== 'eigenvalues' && job !== 'none' && job !== 'subspace' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "both", "eigenvalues", "none", "subspace". Value: `%s`.', job ) );
	}
	if ( compq !== 'none' && compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "none", "update". Value: `%s`.', compq ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}

	// Caller owns the workspace. Reference LWMIN, in complex elements, with
	// `M` the number of selected eigenvalues: `job='none'` needs `1`;
	// `job='eigenvalues'` needs `max(1,M*(N-M))` (the Sylvester solution);
	// `job='subspace'` and `job='both'` need `max(1,2*M*(N-M))` (zlacn2's X
	// and V).
	let nsel = 0;
	for ( let k = 0; k < N; k++ ) {
		if ( SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
			nsel += 1;
		}
	}
	const nn = nsel * ( N - nsel );
	let need = 1;
	if ( job === 'eigenvalues' ) {
		need = Math.max( 1, nn );
	} else if ( job === 'subspace' || job === 'both' ) {
		need = Math.max( 1, 2 * nn );
	}
	if ( !WORK || ( WORK.length - offsetWork ) < need ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( job, compq, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, W, strideW, offsetW, M, s, sep, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztrsen;
