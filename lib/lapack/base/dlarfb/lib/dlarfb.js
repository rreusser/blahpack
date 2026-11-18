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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a real block reflector H or its transpose H.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} M - rows of C
* @param {NonNegativeInteger} N - columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} V - input matrix
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Float64Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} C - input matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} WORK - input matrix
* @param {PositiveInteger} LDWORK - leading dimension of `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function dlarfb( order, side, trans, direct, storev, M, N, K, V, LDV, T, LDT, C, LDC, WORK, LDWORK ) {
	let sv1, sv2, st1, st2, sc1, sc2, sw1, sw2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( LDWORK < max( 1, ( order === 'column-major' ) ? ( ( side === 'left' ) ? N : M ) : K ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be >= max(1,N or M (column-major, per side) or K (row-major)). Value: `%d`.', LDWORK ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' && LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( LDT < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be >= max(1,K). Value: `%d`.', LDT ) );
	}
	if ( LDV < max( 1, ( ( storev === 'columnwise' ) === ( order === 'column-major' ) ) ? ( ( side === 'left' ) ? M : N ) : K ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be >= max(1,M, N or K, per side, storev and order). Value: `%d`.', LDV ) );
	}
	if ( direct !== 'forward' && direct !== 'backward' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid `direct` value. Value: `%s`.', direct ) );
	}
	if ( storev !== 'columnwise' && storev !== 'rowwise' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be a valid `storev` value. Value: `%s`.', storev ) );
	}
	if ( order === 'column-major' ) {
		sv1 = 1;
		sv2 = LDV;
		st1 = 1;
		st2 = LDT;
		sc1 = 1;
		sc2 = LDC;
		sw1 = 1;
		sw2 = LDWORK;
	} else {
		sv1 = LDV;
		sv2 = 1;
		st1 = LDT;
		st2 = 1;
		sc1 = LDC;
		sc2 = 1;
		sw1 = LDWORK;
		sw2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, LDWORK * Math.max( K, ( side === 'left' ) ? N : M ) ); // LDWORK-by-K (column-major) or (N or M)-by-LDWORK (row-major)
		WORK = new Float64Array( minWork );
	}
	return base( side, trans, direct, storev, M, N, K, V, sv1, sv2, 0, T, st1, st2, 0, C, sc1, sc2, 0, WORK, sw1, sw2, 0 );
}


// EXPORTS //

export default dlarfb;
