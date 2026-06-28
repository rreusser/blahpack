

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues of a complex upper Hessenberg matrix H, and.
* optionally the matrices T and Z from the Schur decomposition
* H = Z _ T _ Z^H, where T is an upper triangular matrix (the Schur form)
* and Z is the unitary matrix of Schur vectors.
*
* JOB = 'E': compute eigenvalues only.
* JOB = 'S': compute eigenvalues and the Schur form T.
*
* COMPZ = 'N': no Schur vectors are computed.
* COMPZ = 'I': Z is initialized to the identity matrix and the matrix Z
*              of Schur vectors of H is returned.
* COMPZ = 'V': Z must contain a unitary matrix Q on entry, and the
*              product Q*Z is returned.
*
* ILO and IHI are 1-based indices (Fortran convention). The active block
* is H(ILO:IHI, ILO:IHI). Elements outside this block are assumed already
* upper triangular. Normally ILO=1 and IHI=N.
*
* On exit, if INFO = 0, W contains the computed eigenvalues.
* If JOB = 'S', the eigenvalues are stored in the same order as on the
* diagonal of T.
*
* INFO = 0: success.
* INFO > 0: zhseqr failed to compute all eigenvalues. Elements
*           INFO+1:IHI of W contain those eigenvalues which
*           have been successfully computed.
*
* @param {string} job - `'eigenvalues'` or `'schur'`
* @param {string} compz - `'none'`, `'initialize'`, or `'update'`
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - first row/col of the active block (1-based)
* @param {integer} ihi - last row/col of the active block (1-based)
* @param {Complex128Array} H - upper Hessenberg matrix (N-by-N)
* @param {integer} strideH1 - stride of the first dimension of `H` (complex elements)
* @param {integer} strideH2 - stride of the second dimension of `H` (complex elements)
* @param {NonNegativeInteger} offsetH - starting index for `H` (complex elements)
* @param {Complex128Array} w - output array for eigenvalues
* @param {integer} strideW - stride length for `w` (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for `w` (complex elements)
* @param {Complex128Array} Z - Schur vectors matrix (N-by-N)
* @param {integer} strideZ1 - stride of the first dimension of `Z` (complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - offset for WORK
* @param {integer} lwork - workspace length
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 on success, >0 if failed to converge
*/
function zhseqr( job, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len, max-params
	if ( job !== 'eigenvalues' && job !== 'schur' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job value. Value: `%s`.', job ) );
	}
	if ( compz !== 'none' && compz !== 'initialize' && compz !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid compz value. Value: `%s`.', compz ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( job, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhseqr;
