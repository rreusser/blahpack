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

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


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
* @throws {TypeError} first argument must be one of the following: "both", "none", "permute", "scale"
* @throws {TypeError} second argument must be a valid operation side
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`)
* @throws {RangeError} fifth argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`)
* @throws {RangeError} ninth argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zgebak( job, side, N, ilo, ihi, SCALE, strideSCALE, offsetSCALE, M, V, strideV1, strideV2, offsetV ) { // eslint-disable-line max-len, max-params
	if ( job !== 'both' && job !== 'none' && job !== 'permute' && job !== 'scale' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "both", "none", "permute", "scale". Value: `%s`.', job ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ilo < 1 || ilo > max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`). Value: `%d`.', ilo ) );
	}
	if ( ihi < min( ilo, N ) || ihi > N ) {
		throw new RangeError( format( 'invalid argument. Fifth argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`). Value: `%d`.', ihi ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	return base( job, side, N, ilo, ihi, SCALE, strideSCALE, offsetSCALE, M, V, strideV1, strideV2, offsetV ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgebak;
