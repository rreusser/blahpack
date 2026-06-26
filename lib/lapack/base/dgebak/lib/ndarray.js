

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Back-transforms eigenvectors after balancing by dgebal.
*
* Forms the right or left eigenvectors of a real general matrix by backward
* transformation on the computed eigenvectors of the balanced matrix output
* by dgebal.
*
* ## Notes
*
* -   ILO and IHI are 1-based (matching Fortran convention from dgebal output).
* -   JOB must be the same as the argument JOB supplied to dgebal.
*
* @param {string} job - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} side - `'right'` for right eigenvectors, `'left'` for left eigenvectors
* @param {NonNegativeInteger} N - number of rows of the matrix V
* @param {integer} ilo - index determined by dgebal (1-based)
* @param {integer} ihi - index determined by dgebal (1-based)
* @param {Float64Array} SCALE - permutation and scaling factors from dgebal
* @param {integer} strideSCALE - stride length for `SCALE`
* @param {NonNegativeInteger} offsetSCALE - starting index for `SCALE`
* @param {NonNegativeInteger} M - number of columns of the matrix V
* @param {Float64Array} V - matrix of eigenvectors to be transformed (overwritten on exit)
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @throws {TypeError} Second argument must be a valid operation side
* @returns {integer} status code (0 = success)
*/
function dgebak( job, side, N, ilo, ihi, SCALE, strideSCALE, offsetSCALE, M, V, strideV1, strideV2, offsetV ) { // eslint-disable-line max-len, max-params
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	return base( job, side, N, ilo, ihi, SCALE, strideSCALE, offsetSCALE, M, V, strideV1, strideV2, offsetV ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgebak;
