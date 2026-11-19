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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {integer} ijob - ijob
* @param {integer} nitmax - nitmax
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} mmax - mmax
* @param {NonNegativeInteger} minp - minp
* @param {integer} nbmin - nbmin
* @param {number} abstol - abstol
* @param {number} reltol - reltol
* @param {number} pivmin - pivmin
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Float64Array} e - e
* @param {integer} strideE - strideE
* @param {Float64Array} E2 - E2
* @param {integer} strideE2 - strideE2
* @param {Int32Array} NVAL - NVAL
* @param {integer} strideNVAL - strideNVAL
* @param {Float64Array} AB - AB
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} c - c
* @param {integer} strideC - strideC
* @param {Int32Array} mout - mout
* @param {Int32Array} NAB - NAB
* @param {PositiveInteger} LDNAB - leading dimension of `NAB`
* @param {(Float64Array|null)} WORK - WORK
* @param {(Int32Array|null)} IWORK - IWORK
* @throws {TypeError} first argument must be a valid order
* @returns {integer} info status code
*/
function dlaebz( order, ijob, nitmax, N, mmax, minp, nbmin, abstol, reltol, pivmin, d, strideD, e, strideE, E2, strideE2, NVAL, strideNVAL, AB, LDAB, c, strideC, mout, NAB, LDNAB, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const snab1 = ( order === 'column-major' ) ? 1 : LDNAB;
	const snab2 = ( order === 'column-major' ) ? LDNAB : 1;
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N, strideE );
	const oe2 = stride2offset( N, strideE2 );
	const onval = stride2offset( N, strideNVAL );
	const oc = stride2offset( N, strideC );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, mmax );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, mmax );
		IWORK = new Int32Array( minIwork );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, 2 ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,2). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && LDNAB < max( 1, 2 ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument must be greater than or equal to max(1,2). Value: `%d`.', LDNAB ) );
	}
	if ( order === 'column-major' && LDNAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDNAB ) );
	}
	return base( ijob, nitmax, N, mmax, minp, nbmin, abstol, reltol, pivmin, d, strideD, od, e, strideE, oe, E2, strideE2, oe2, NVAL, strideNVAL, onval, AB, sab1, sab2, 0, c, strideC, oc, mout, NAB, snab1, snab2, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaebz;
