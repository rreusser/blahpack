/**
 * Back-transform eigenvectors of a balanced pair of general real matrices.
 *
 * Forms the right or left eigenvectors of a generalized eigenvalue
 * problem by backward transformation on the computed eigenvectors of
 * the balanced pair of matrices output by ZGGBAL.
 *
 * V is a Complex128Array. Strides and offsets are in complex elements.
 *
 *
 * @param {string} job - specifies the type of backward transformation:
 * @param {string} side - `'right'` for right eigenvectors, `'left'` for left eigenvectors
 * @param {NonNegativeInteger} N - number of rows of V
 * @param {integer} ilo - ilo from balancing (1-based)
 * @param {integer} ihi - ihi from balancing (1-based)
 * @param {Float64Array} LSCALE - left scaling/permutation factors from ZGGBAL
 * @param {integer} strideLSCALE - stride for LSCALE
 * @param {NonNegativeInteger} offsetLSCALE - starting index for LSCALE
 * @param {Float64Array} RSCALE - right scaling/permutation factors from ZGGBAL
 * @param {integer} strideRSCALE - stride for RSCALE
 * @param {NonNegativeInteger} offsetRSCALE - starting index for RSCALE
 * @param {NonNegativeInteger} M - number of columns of V
 * @param {Complex128Array} V - eigenvector matrix (modified in-place)
 * @param {integer} strideV1 - stride of the first dimension of V (complex elements)
 * @param {integer} strideV2 - stride of the second dimension of V (complex elements)
 * @param {NonNegativeInteger} offsetV - starting index for V (complex elements)
 * @throws {TypeError} Second argument must be a valid operation side
 * @returns {integer} status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Back-transform eigenvectors of a balanced pair of general real matrices.
*
* @param {string} job - specifies the type of backward transformation:
* @param {string} side - `'right'` for right eigenvectors, `'left'` for left eigenvectors
* @param {NonNegativeInteger} N - number of rows of V
* @param {integer} ilo - ilo from balancing (1-based)
* @param {integer} ihi - ihi from balancing (1-based)
* @param {Float64Array} LSCALE - left scaling/permutation factors from ZGGBAL
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - starting index for LSCALE
* @param {Float64Array} RSCALE - right scaling/permutation factors from ZGGBAL
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - starting index for RSCALE
* @param {NonNegativeInteger} M - number of columns of V
* @param {Complex128Array} V - eigenvector matrix (modified in-place)
* @param {integer} strideV1 - stride of the first dimension of V (complex elements)
* @param {integer} strideV2 - stride of the second dimension of V (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (complex elements)
* @throws {TypeError} first argument must be a valid job type
* @throws {TypeError} second argument must be a valid operation side
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} twelfth argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zggbak( job, side, N, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, M, V, strideV1, strideV2, offsetV ) {
	if ( job !== 'none' && job !== 'permute' && job !== 'scale' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job type. Value: `%s`.', job ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( job, side, N, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, M, V, strideV1, strideV2, offsetV );
}


// EXPORTS //

export default zggbak;
