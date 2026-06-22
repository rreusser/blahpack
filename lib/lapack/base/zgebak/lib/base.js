

// MODULES //

import zdscal from './../../../../blas/base/zdscal/lib/base.js';
import zswap from './../../../../blas/base/zswap/lib/base.js';


// MAIN //

/**
* Back-transforms eigenvectors after balancing by zgebal.
*
* Forms the right or left eigenvectors of a complex general matrix by backward
* transformation on the computed eigenvectors of the balanced matrix output
* by zgebal.
*
* ## Notes
*
* -   ILO and IHI are 1-based (matching Fortran convention from zgebal output).
* -   JOB must be the same as the argument JOB supplied to zgebal.
* -   V is a Complex128Array; strideV1, strideV2, and offsetV are in complex elements.
* -   SCALE is a Float64Array of real scaling/permutation factors from zgebal.
*
* @private
* @param {string} job - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} side - `'right'` for right eigenvectors, `'left'` for left eigenvectors
* @param {NonNegativeInteger} N - number of rows of the matrix V
* @param {integer} ilo - index determined by zgebal (1-based)
* @param {integer} ihi - index determined by zgebal (1-based)
* @param {Float64Array} SCALE - permutation and scaling factors from zgebal
* @param {integer} strideSCALE - stride length for `SCALE`
* @param {NonNegativeInteger} offsetSCALE - starting index for `SCALE`
* @param {NonNegativeInteger} M - number of columns of the matrix V
* @param {Complex128Array} V - matrix of eigenvectors to be transformed (overwritten on exit)
* @param {integer} strideV1 - stride of the first dimension of `V` (in complex elements)
* @param {integer} strideV2 - stride of the second dimension of `V` (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for `V` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zgebak( job, side, N, ilo, ihi, SCALE, strideSCALE, offsetSCALE, M, V, strideV1, strideV2, offsetV ) { // eslint-disable-line max-len, max-params
	var rightv;
	var leftv;
	var ii;
	var s;
	var i;
	var k;

	rightv = ( side === 'right' );
	leftv = ( side === 'left' );

	// Quick return if possible:
	if ( N === 0 || M === 0 || job === 'none' ) {
		return 0;
	}

	// Convert ILO and IHI from 1-based to 0-based:
	var ilo0 = ilo - 1;
	var ihi0 = ihi - 1;

	// Backward balance (scaling):
	if ( ilo0 !== ihi0 ) {
		if ( job === 'scale' || job === 'both' ) {
			if ( rightv ) {
				// For right eigenvectors, scale row i by SCALE(i):
				for ( i = ilo0; i <= ihi0; i++ ) {
					s = SCALE[ offsetSCALE + i * strideSCALE ];
					zdscal( M, s, V, strideV2, offsetV + i * strideV1 );
				}
			}
			if ( leftv ) {
				// For left eigenvectors, scale row i by 1/SCALE(i):
				for ( i = ilo0; i <= ihi0; i++ ) {
					s = 1.0 / SCALE[ offsetSCALE + i * strideSCALE ];
					zdscal( M, s, V, strideV2, offsetV + i * strideV1 );
				}
			}
		}
	}

	// Backward permutation:
	// For II = 1 to N (1-based), process rows outside [ILO, IHI]:
	//   - rows below ILO are visited in reverse: i = ILO - II
	//   - rows above IHI are visited in order: i = II
	if ( job === 'permute' || job === 'both' ) {
		if ( rightv ) {
			for ( ii = 0; ii < N; ii++ ) {
				i = ii;
				if ( i >= ilo0 && i <= ihi0 ) {
					continue;
				}
				if ( i < ilo0 ) {
					// Fortran: I = ILO - II (with 1-based II)
					// In 0-based: i = (ilo-1) - (ii+1) = ilo0 - ii - 1
					i = ilo0 - ii - 1;
				}
				k = SCALE[ offsetSCALE + i * strideSCALE ] | 0;
				// Convert k from 1-based Fortran to 0-based:
				k = k - 1;
				if ( k === i ) {
					continue;
				}
				zswap( M, V, strideV2, offsetV + i * strideV1, V, strideV2, offsetV + k * strideV1 );
			}
		}
		if ( leftv ) {
			for ( ii = 0; ii < N; ii++ ) {
				i = ii;
				if ( i >= ilo0 && i <= ihi0 ) {
					continue;
				}
				if ( i < ilo0 ) {
					i = ilo0 - ii - 1;
				}
				k = SCALE[ offsetSCALE + i * strideSCALE ] | 0;
				k = k - 1;
				if ( k === i ) {
					continue;
				}
				zswap( M, V, strideV2, offsetV + i * strideV1, V, strideV2, offsetV + k * strideV1 );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zgebak;
