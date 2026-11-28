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
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import strided from './strided.js';
import { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Performs the orthogonal similarity transformation of a Hessenberg matrix to detect and deflate fully converged eigenvalues from a trailing principal submatrix (aggressive early deflation).
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {boolean} wantt - if `true`, then the Hessenberg matrix H is fully updated so that the quasi-triangular Schur factor may be computed (in cooperation with the calling subroutine).
* @param {boolean} wantz - if `true`, then the orthogonal matrix Z is updated so so that the orthogonal Schur factor may be computed (in cooperation with the calling subroutine).
* @param {NonNegativeInteger} N - the order of the matrix H and (if WANTZ is `true`) the order of the orthogonal matrix Z.
* @param {integer} ktop - it is assumed that either KTOP = 1 or H(KTOP,KTOP-1)=0.
* @param {NonNegativeInteger} kbot - it is assumed without a check that either KBOT = N or H(KBOT+1,KBOT)=0.
* @param {NonNegativeInteger} nw - deflation window size. 1 <= NW <= (KBOT-KTOP+1).
* @param {Float64Array} H - on input the initial N-by-N section of H stores the Hessenberg matrix undergoing aggressive early deflation.
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {integer} iloz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= IHIZ <= N.
* @param {integer} ihiz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= IHIZ <= N.
* @param {Float64Array} Z - iF WANTZ is `true`, then on output, the orthogonal similarity transformation mentioned above has been accumulated into Z(ILOZ:IHIZ,ILOZ:IHIZ) from the right.
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Int32Array} ns - output (length-1 array): the number of unconverged (ie approximate) eigenvalues returned in SR and SI that may be used as shifts by the calling subroutine
* @param {Int32Array} nd - output (length-1 array): the number of converged eigenvalues uncovered by this subroutine
* @param {Float64Array} SR - on output, the real and imaginary parts of approximate eigenvalues that may be used for shifts are stored in SR(KBOT-ND-NS+1) through SR(KBOT-ND) and SI(KBOT-ND-NS+1) through SI(KBOT-ND), respectively.
* @param {integer} strideSR - stride length for `SR`
* @param {Float64Array} SI - on output, the real and imaginary parts of approximate eigenvalues that may be used for shifts are stored in SR(KBOT-ND-NS+1) through SR(KBOT-ND) and SI(KBOT-ND-NS+1) through SI(KBOT-ND), respectively.
* @param {integer} strideSI - stride length for `SI`
* @param {Float64Array} V - an NW-by-NW work array.
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {integer} nh - the number of columns of T.
* @param {Float64Array} T - the leading dimension of T just as declared in the calling subroutine.
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {integer} nv - the number of rows of work array WV available for workspace.
* @param {Float64Array} WV - the leading dimension of W just as declared in the calling subroutine.
* @param {PositiveInteger} LDWV - leading dimension of `WV`
* @param {(Float64Array|null)} WORK - workspace of length at least `2*JW` (`JW = min(nw, kbot-ktop+1)`, the reference's `2*NW`), or `null` to allocate the reference's optimum (`JW + JW*32 + 4160` for `JW > 2`)
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} twenty-first argument must be greater than or equal to `max( 1, nw )` (row-major)
* @throws {RangeError} twenty-fourth argument must be greater than or equal to `max( 1, nw )` (row-major)
* @throws {RangeError} twenty-seventh argument must be greater than or equal to `max( 1, nw )` (row-major)
* @returns {Float64Array} `WV`
*/
function dlaqr2( order, wantt, wantz, N, ktop, kbot, nw, H, LDH, iloz, ihiz, Z, LDZ, ns, nd, SR, strideSR, SI, strideSI, V, LDV, nh, T, LDT, nv, WV, LDWV, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const sv1 = ( order === 'column-major' ) ? 1 : LDV;
	const sv2 = ( order === 'column-major' ) ? LDV : 1;
	const st1 = ( order === 'column-major' ) ? 1 : LDT;
	const st2 = ( order === 'column-major' ) ? LDT : 1;
	const swv1 = ( order === 'column-major' ) ? 1 : LDWV;
	const swv2 = ( order === 'column-major' ) ? LDWV : 1;
	const osr = stride2offset( kbot, strideSR );
	const osi = stride2offset( kbot, strideSI );
	if ( WORK === null || WORK === void 0 ) {
		// The reference's optimum LWKOPT (with the JS callees' optima), and at least its minimum 2*JW:
		WORK = new Float64Array( max( max( 1, 2 * min( nw, kbot - ktop + 1 ) ), computeOptimalWorkSize( nw, ktop, kbot ) ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'row-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( order === 'row-major' && LDV < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument must be greater than or equal to max(1,nw). Value: `%d`.', LDV ) );
	}
	if ( order === 'row-major' && LDT < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fourth argument must be greater than or equal to max(1,nw). Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDWV < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-seventh argument must be greater than or equal to max(1,nw). Value: `%d`.', LDWV ) );
	}
	return strided( wantt, wantz, N, ktop, kbot, nw, H, sh1, sh2, 0, iloz, ihiz, Z, sz1, sz2, 0, ns, nd, SR, strideSR, osr, SI, strideSI, osi, V, sv1, sv2, 0, nh, T, st1, st2, 0, nv, WV, swv1, swv2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqr2;
