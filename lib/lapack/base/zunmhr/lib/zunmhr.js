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
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - side
* @param {string} trans - trans
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - TAU
* @param {integer} strideTAU - strideTAU
* @param {Complex128Array} C - C
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {(Complex128Array|null)} WORK - workspace array; `null` requests internal allocation
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zunmhr( order, side, trans, M, N, ilo, ihi, A, LDA, TAU, strideTAU, C, LDC, WORK ) { // eslint-disable-line max-len, max-params
	let nb, nh, nw;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sc1 = ( order === 'column-major' ) ? 1 : LDC;
	const sc2 = ( order === 'column-major' ) ? LDC : 1;
	const otau = stride2offset( N, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		// Auto-allocate WORK sized for the BLOCKED zunmqr delegate (K = nh =
		// IHI-ILO reflectors): the unblocked path needs nw = max(1,N) for
		// side='left' (max(1,M) for 'right'); the blocked path (NB < nh) also
		// stores the block reflector T, needing nw*NB + (NB+1)*NB. Sizing to the
		// unblocked nw would under-allocate and leak NaN into C on the blocked path.
		nb = 32;
		nh = ihi - ilo;
		nw = ( side === 'left' ) ? max( 1, N ) : max( 1, M );
		WORK = new Complex128Array( ( nb >= nh ) ? nw : ( ( nw * nb ) + ( ( nb + 1 ) * nb ) ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' && LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	return base( side, trans, M, N, ilo, ihi, A, sa1, sa2, 0, TAU, strideTAU, otau, C, sc1, sc2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zunmhr;
