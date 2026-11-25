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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Back-transforms eigenvectors after balancing by dgebal.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} job - specifies the type of backward transformation required: `'none'`: do nothing, return immediately; `'permute'`: do backward transformation for permutation only; `'scale'`: do backward transformation for scaling only; `'both'`: do backward transformations for both permutation and scaling. JOB must be the same as the argument JOB supplied to DGEBAL.
* @param {string} side - `'right'`: V contains right eigenvectors; `'left'`: V contains left eigenvectors.
* @param {NonNegativeInteger} N - the number of rows of the matrix V.
* @param {integer} ilo - the integers ILO and IHI determined by DGEBAL. 1 <= ILO <= IHI <= N, if N > 0.
* @param {integer} ihi - the integers ILO and IHI determined by DGEBAL. 1 <= ILO <= IHI <= N, if N > 0.
* @param {Float64Array} SCALE - details of the permutation and scaling factors, as returned by DGEBAL.
* @param {integer} strideSCALE - stride length for `SCALE`
* @param {NonNegativeInteger} M - the number of columns of the matrix V.
* @param {Float64Array} V - on entry, the matrix of right or left eigenvectors to be transformed, as returned by DHSEIN or DTREVC. On exit, V is overwritten by the transformed eigenvectors.
* @param {PositiveInteger} LDV - leading dimension of `V`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "none", "permute", "scale"
* @throws {TypeError} third argument must be a valid operation side
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`)
* @throws {RangeError} sixth argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`)
* @throws {RangeError} ninth argument must be a nonnegative integer
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, M )` (row-major)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dgebak( order, job, side, N, ilo, ihi, SCALE, strideSCALE, M, V, LDV ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( job !== 'both' && job !== 'none' && job !== 'permute' && job !== 'scale' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "both", "none", "permute", "scale". Value: `%s`.', job ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ilo < 1 || ilo > max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`). Value: `%d`.', ilo ) );
	}
	if ( ihi < min( ilo, N ) || ihi > N ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`). Value: `%d`.', ihi ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( order === 'column-major' && ( LDV < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDV ) );
	}
	if ( order === 'row-major' && ( LDV < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDV ) );
	}
	const sv1 = ( order === 'column-major' ) ? 1 : LDV;
	const sv2 = ( order === 'column-major' ) ? LDV : 1;
	const oscale = stride2offset( N, strideSCALE );
	return base( job, side, N, ilo, ihi, SCALE, strideSCALE, oscale, M, V, sv1, sv2, 0 );
}


// EXPORTS //

export default dgebak;
