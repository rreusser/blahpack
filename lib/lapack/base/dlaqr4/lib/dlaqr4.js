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
import base, { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes the eigenvalues of a Hessenberg matrix, and optionally the matrices from the Schur decomposition.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {boolean} wantt - = `true` : the full Schur form T is required; = `false`: only eigenvalues are required.
* @param {boolean} wantz - = `true` : the matrix of Schur vectors Z is required; = `false`: Schur vectors are not required.
* @param {NonNegativeInteger} N - the order of the matrix H.
* @param {integer} ilo - it is assumed that H is already upper triangular in rows and columns 1:ILO-1 and IHI+1:N and, if ILO > 1, H(ILO,ILO-1) is zero.
* @param {NonNegativeInteger} ihi - it is assumed that H is already upper triangular in rows and columns 1:ILO-1 and IHI+1:N and, if ILO > 1, H(ILO,ILO-1) is zero.
* @param {Float64Array} H - on entry, the upper Hessenberg matrix H. On exit, if INFO = 0 and WANTT is `true`, then H contains the upper quasi-triangular matrix T from the Schur decomposition (the Schur form); 2-by-2 diagonal blocks (corresponding to complex conjugate pairs of eigenvalues) are returned in standard form, with H(i,i) = H(i+1,i+1) and H(i+1,i)*H(i,i+1) < 0.
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Float64Array} WR - the real and imaginary parts, respectively, of the computed eigenvalues of H(ILO:IHI,ILO:IHI) are stored in WR(ILO:IHI) and WI(ILO:IHI).
* @param {integer} strideWR - stride length for `WR`
* @param {Float64Array} WI - the real and imaginary parts, respectively, of the computed eigenvalues of H(ILO:IHI,ILO:IHI) are stored in WR(ILO:IHI) and WI(ILO:IHI).
* @param {integer} strideWI - stride length for `WI`
* @param {integer} iloz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= ILO.
* @param {integer} ihiz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= ILO.
* @param {Float64Array} Z - if WANTZ is `false`, then Z is not referenced.
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Float64Array|null)} WORK - workspace of at least `max( 1, N )` elements (the reference's minimum), or `null` to allocate the reference's optimum (`max( 3*NSR/2, LWKOPT of DLAQR2 for the window NWR+1 )`)
* @throws {TypeError} first argument must be a valid order
* @returns {integer} info status code
*/
function dlaqr4( order, wantt, wantz, N, ilo, ihi, H, LDH, WR, strideWR, WI, strideWI, iloz, ihiz, Z, LDZ, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const owr = stride2offset( ihi, strideWR );
	const owi = stride2offset( ihi, strideWI );
	if ( WORK === null || WORK === void 0 ) {
		// The reference's optimum LWKOPT (its workspace query), and at least its minimum max(1,N):
		WORK = new Float64Array( max( max( 1, N ), computeOptimalWorkSize( N, ilo, ihi ) ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'column-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	return base( wantt, wantz, N, ilo, ihi, H, sh1, sh2, 0, WR, strideWR, owr, WI, strideWI, owi, iloz, ihiz, Z, sz1, sz2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqr4;
