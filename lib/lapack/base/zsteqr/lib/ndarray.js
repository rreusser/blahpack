/**
 * Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
 * tridiagonal matrix using the implicit QL or QR method. The eigenvector
 * matrix Z is complex (Complex128Array).
 *
 * The tridiagonal matrix T is defined by its diagonal D and subdiagonal E.
 *
 * ## Notes
 *
 * -   COMPZ = 'N': compute eigenvalues only (Z is not referenced)
 *
 * -   COMPZ = 'V': compute eigenvalues and eigenvectors of the original
 * symmetric matrix. On entry, Z must contain the unitary matrix used
 * to reduce the original matrix to tridiagonal form.
 *
 * -   COMPZ = 'I': compute eigenvalues and eigenvectors of the tridiagonal
 * matrix. Z is initialized to the identity matrix.
 *
 * -   On exit, if INFO = 0, D contains the eigenvalues in ascending order
 * and Z contains the orthonormal eigenvectors of the matrix.
 *
 *
 * @param {string} compz - specifies whether eigenvectors are computed
 * @param {NonNegativeInteger} N - order of the matrix
 * @param {Float64Array} d - diagonal elements of the tridiagonal matrix (length N)
 * @param {integer} strideD - stride length for `d`
 * @param {NonNegativeInteger} offsetD - starting index for `d`
 * @param {Float64Array} e - subdiagonal elements of the tridiagonal matrix (length N-1)
 * @param {integer} strideE - stride length for `e`
 * @param {NonNegativeInteger} offsetE - starting index for `e`
 * @param {Complex128Array} Z - unitary matrix Z (N-by-N)
 * @param {integer} strideZ1 - stride of the first dimension of `Z` (in complex elements)
 * @param {integer} strideZ2 - stride of the second dimension of `Z` (in complex elements)
 * @param {NonNegativeInteger} offsetZ - starting index for `Z` (in complex elements)
 * @param {Float64Array} WORK - workspace array (length >= 2*(N-1))
 * @param {integer} strideWork - stride length for `WORK`
 * @param {NonNegativeInteger} offsetWork - starting index for `WORK`
 * @returns {integer} INFO - 0 if successful, >0 if INFO eigenvalues did not converge
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
*
* @param {string} compz - specifies whether eigenvectors are computed
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of the tridiagonal matrix (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements of the tridiagonal matrix (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Complex128Array} Z - unitary matrix Z (N-by-N)
* @param {integer} strideZ1 - stride of the first dimension of `Z` (in complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (in complex elements)
* @param {Float64Array} WORK - workspace array (length >= 2*(N-1))
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {TypeError} first argument must be a valid `compz` value
* @returns {integer} INFO - 0 if successful, >0 if INFO eigenvalues did not converge
*/
function zsteqr( compz, N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ) {
	if ( compz !== 'none' && compz !== 'update' && compz !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `compz` value. Value: `%s`.', compz ) );
	}
	return base( compz, N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zsteqr;
