/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generate one of the complex unitary matrices Q or P^H determined by ZGEBRD.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} vect - `'apply-Q'` to generate Q, `'apply-P'` to generate P^H
* @param {NonNegativeInteger} M - number of rows of the matrix Q or P^H
* @param {NonNegativeInteger} N - number of columns of the matrix Q or P^H
* @param {NonNegativeInteger} K - number of columns/rows in original matrix
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - input array
* @param {integer} strideTAU - `TAU` stride length
* @param {Complex128Array} WORK - input array
* @param {integer} strideWork - `WORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zungbr( order, vect, M, N, K, A, LDA, TAU, strideTAU, WORK, strideWork ) {
	let sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( vect !== 'apply-Q' && vect !== 'apply-P' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `vect` value. Value: `%s`.', vect ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	const ot = stride2offset( N, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		// Auto-allocation must cover the BLOCKED zungqr/zunglq delegate (~dim*NB),
		// not the reference's adaptive `min(M,N)` lower bound (our kernels hardcode
		// NB and do not adapt it down). Mirror the same vect/(M,K)/(K,N) branch as
		// base.js:
		const NB = 32;
		let minWork;
		if ( vect === 'apply-Q' ) {
			if ( M >= K ) {
				minWork = ( K > NB ) ? max( 1, N * NB ) : max( 1, N );
			} else {
				minWork = ( M > 1 ) ? ( ( M - 1 > NB ) ? max( 1, ( M - 1 ) * NB ) : max( 1, M - 1 ) ) : 1;
			}
		} else if ( K < N ) {
			minWork = ( K > NB ) ? max( 1, M * NB ) : max( 1, M );
		} else {
			minWork = ( N > 1 ) ? ( ( N - 1 > NB ) ? max( 1, ( N - 1 ) * NB ) : max( 1, N - 1 ) ) : 1;
		}
		minWork = max( 1, Math.min( M, N ), minWork );
		WORK = new Complex128Array( minWork );
		strideWork = 1;
	}
	const ow = stride2offset( N, strideWork );
	return base(vect, M, N, K, A, sa1, sa2, 0, TAU, strideTAU, ot, WORK, strideWork, ow );
}


// EXPORTS //

export default zungbr;
