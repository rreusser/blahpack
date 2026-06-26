
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues of a real upper Hessenberg matrix H, and.
* optionally the matrices T and Z from the Schur decomposition
* H = Z _ T _ Z**T, where T is an upper quasi-triangular matrix (the
* Schur form) and Z is the orthogonal matrix of Schur vectors.
*
* JOB = 'E': compute eigenvalues only.
* JOB = 'S': compute eigenvalues and the Schur form T.
*
* COMPZ = 'N': no Schur vectors are computed.
* COMPZ = 'I': Z is initialized to the identity matrix and the matrix Z
*              of Schur vectors of H is returned.
* COMPZ = 'V': Z must contain an orthogonal matrix Q on entry, and the
*              product Q*Z is returned.
*
* ILO and IHI are 1-based indices (Fortran convention). The active block
* is H(ILO:IHI, ILO:IHI). Elements outside this block are assumed already
* upper triangular. Normally ILO=1 and IHI=N.
*
* On exit, if INFO = 0, WR and WI contain the real and imaginary parts
* of the computed eigenvalues. Complex eigenvalues occur in conjugate
* pairs in consecutive entries. If JOB = 'S', the eigenvalues are stored
* in the same order as on the diagonal of T.
*
* INFO = 0: success.
* INFO > 0: dhseqr failed to compute all eigenvalues. Elements
*           INFO+1:IHI of WR and WI contain those eigenvalues which
*           have been successfully computed.
*
* @param {string} job - `'eigenvalues'` or `'schur'`
* @param {string} compz - `'none'`, `'initialize'`, or `'update'`
* @param {NonNegativeInteger} N - order of the matrix H
* @param {integer} ilo - first row/col of the active block (1-based)
* @param {integer} ihi - last row/col of the active block (1-based)
* @param {Float64Array} H - upper Hessenberg matrix (N-by-N)
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Float64Array} WR - output array for real parts of eigenvalues
* @param {integer} strideWR - stride length for `WR`
* @param {NonNegativeInteger} offsetWR - starting index for `WR`
* @param {Float64Array} WI - output array for imaginary parts of eigenvalues
* @param {integer} strideWI - stride length for `WI`
* @param {NonNegativeInteger} offsetWI - starting index for `WI`
* @param {Float64Array} Z - Schur vectors matrix (N-by-N)
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} work - workspace array (minimum `max(1,N)` elements from `offsetWork`)
* @param {integer} strideWork - stride length for `work`
* @param {NonNegativeInteger} offsetWork - starting index for `work`
* @throws {TypeError} first argument must be a valid job value
* @throws {TypeError} second argument must be a valid compz value
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} work array must be large enough
* @returns {integer} info - 0 on success, >0 if failed to converge
*/
function dhseqr( job, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, Z, strideZ1, strideZ2, offsetZ, work, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var minWork;
	if ( job !== 'eigenvalues' && job !== 'schur' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job value. Value: `%s`.', job ) );
	}
	if ( compz !== 'none' && compz !== 'initialize' && compz !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid compz value. Value: `%s`.', compz ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Minimum workspace: max(1,N). For the small-N embedded path (N < NL=49),
	// dlaqr0 is called on an NL-by-NL matrix using an internal NL-element
	// Scratch buffer, so the caller only needs max(1,N) elements.
	minWork = Math.max( 1, N );
	if ( !work || ( work.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. work array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( work ) ? work.length : 0 ) );
	}
	return base( job, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, Z, strideZ1, strideZ2, offsetZ, work, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dhseqr;
