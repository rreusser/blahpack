
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reorders the real Schur factorization of a real matrix A = Q_T_Q**T.
* so that a selected cluster of eigenvalues appears in the leading diagonal
* blocks of the upper quasi-triangular matrix T, and the leading columns
* of Q form an orthonormal basis of the corresponding right invariant subspace.
*
* Optionally computes the reciprocal condition numbers of the cluster (S)
* and of the invariant subspace (SEP).
*
* @param {string} job - `'none'`, `'eigenvalues'`, `'subspace'`, or `'both'`
* @param {string} compq - `'update'` or `'none'`
* @param {Uint8Array|Array} SELECT - boolean array of length N indicating selected eigenvalues
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - starting index for SELECT
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Float64Array} T - N-by-N upper quasi-triangular matrix (Schur form)
* @param {integer} strideT1 - stride of the first dimension of T
* @param {integer} strideT2 - stride of the second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} Q - N-by-N orthogonal matrix of Schur vectors
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Float64Array} WR - output: real parts of eigenvalues
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - starting index for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - starting index for WI
* @param {Float64Array} M - output: M[0] = dimension of selected subspace
* @param {Float64Array} s - output: s[0] = reciprocal condition number of selected cluster
* @param {Float64Array} sep - output: sep[0] = reciprocal condition number of subspace
* @param {Float64Array} WORK - workspace of length lwork
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - length of WORK (-1 for query)
* @param {Int32Array} IWORK - integer workspace of length liwork
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {integer} liwork - length of IWORK (-1 for query)
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info (0 = success, 1 = reordering failed)
*/
function dtrsen( job, compq, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, WR, strideWR, offsetWR, WI, strideWI, offsetWI, M, s, sep, WORK, strideWork, offsetWork, lwork, IWORK, strideIWork, offsetIWork, liwork ) { // eslint-disable-line max-len, max-params
	if ( job !== 'none' && job !== 'eigenvalues' && job !== 'subspace' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job value. Value: `%s`.', job ) );
	}
	if ( compq !== 'none' && compq !== 'initialize' && compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid compq value. Value: `%s`.', compq ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. 21th argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	return base( job, compq, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, WR, strideWR, offsetWR, WI, strideWI, offsetWI, M, s, sep, WORK, strideWork, offsetWork, lwork, IWORK, strideIWork, offsetIWork, liwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrsen;
