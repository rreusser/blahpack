
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reorders the real Schur factorization of a real matrix A = Q_T_Q^T, so that.
* the diagonal block of T with row index IFST is moved to row ILST.
*
* The real Schur form T is reordered by an orthogonal similarity transformation
* Z^T _ T _ Z, and optionally the matrix Q of Schur vectors is updated by
* postmultiplication with Z.
*
* T must be in Schur canonical form (as output by DHSEQR), that is, block
* upper triangular with 1-by-1 and 2-by-2 diagonal blocks; each 2-by-2
* diagonal block has its diagonal elements equal and its off-diagonal elements
* of opposite sign.
*
* Note: IFST and ILST are 1-based (Fortran convention). They may be adjusted
* on return when they point to the second row of a 2-by-2 block.
*
* @param {string} compq - `'update'` to update Q, `'none'` to not update Q
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Float64Array} T - the upper quasi-triangular matrix
* @param {integer} strideT1 - stride of the first dimension of T
* @param {integer} strideT2 - stride of the second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} Q - orthogonal matrix (updated if compq=`'update'`)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {integer} ifst - row index of the block to move (1-based)
* @param {integer} ilst - target row index (1-based)
* @param {Float64Array} WORK - workspace of length N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} { info, ifst, ilst }
*/
function dtrexc( compq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, ifst, ilst, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( compq !== 'none' && compq !== 'initialize' && compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid compq value. Value: `%s`.', compq ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( compq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, ifst, ilst, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrexc;
