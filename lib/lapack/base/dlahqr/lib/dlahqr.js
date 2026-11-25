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
* Computes the eigenvalues and Schur factorization of an upper Hessenberg matrix, using the double-shift/single-shift QR algorithm.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} wantt - = `true` : the full Schur form T is required; = `false`: only eigenvalues are required.
* @param {boolean} wantz - = `true` : the matrix of Schur vectors Z is required; = `false`: Schur vectors are not required.
* @param {NonNegativeInteger} N - the order of the matrix H.
* @param {integer} ilo - it is assumed that H is already upper quasi-triangular in rows and columns IHI+1:N, and that H(ILO,ILO-1) = 0 (unless ILO = 1).
* @param {integer} ihi - it is assumed that H is already upper quasi-triangular in rows and columns IHI+1:N, and that H(ILO,ILO-1) = 0 (unless ILO = 1).
* @param {Float64Array} H - on entry, the upper Hessenberg matrix H. On exit, if INFO is zero and if WANTT is `true`, H is upper quasi-triangular in rows and columns ILO:IHI, with any 2-by-2 diagonal blocks in standard form.
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Float64Array} WR - the real and imaginary parts, respectively, of the computed eigenvalues ILO to IHI are stored in the corresponding elements of WR and WI.
* @param {integer} strideWR - stride length for `WR`
* @param {Float64Array} WI - the real and imaginary parts, respectively, of the computed eigenvalues ILO to IHI are stored in the corresponding elements of WR and WI.
* @param {integer} strideWI - stride length for `WI`
* @param {integer} iloz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= ILO.
* @param {integer} ihiz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= ILO.
* @param {Float64Array} Z - if WANTZ is `true`, on entry Z must contain the current matrix Z of transformations accumulated by DHSEQR, and on exit Z has been updated; transformations are applied only to the submatrix Z(ILOZ:IHIZ,ILO:IHI).
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @throws {TypeError} first argument must be a valid order
* @returns {integer} info status code
*/
function dlahqr( order, wantt, wantz, N, ilo, ihi, H, LDH, WR, strideWR, WI, strideWI, iloz, ihiz, Z, LDZ ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const owr = stride2offset( N, strideWR );
	const owi = stride2offset( N, strideWI );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'column-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'row-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( order === 'column-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, sh1, sh2, 0, WR, strideWR, owr, WI, strideWI, owi, iloz, ihiz, Z, sz1, sz2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlahqr;
