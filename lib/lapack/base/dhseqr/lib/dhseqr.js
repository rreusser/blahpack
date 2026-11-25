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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues of a Hessenberg matrix H and, optionally, the matrices T and Z from the Schur decomposition H = Z T Zᵀ.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('eigenvalues'|'schur')} job - `'eigenvalues'`: compute eigenvalues only; `'schur'`: compute eigenvalues and the Schur form T.
* @param {('none'|'initialize'|'update')} compz - `'none'`: no Schur vectors are computed; `'initialize'`: Z is initialized to the unit matrix and the matrix Z of Schur vectors of H is returned; `'update'`: Z must contain an orthogonal matrix Q on entry, and the product Q*Z is returned.
* @param {NonNegativeInteger} N - the order of the matrix H.
* @param {integer} ilo - it is assumed that H is already upper triangular in rows and columns 1:ILO-1 and IHI+1:N.
* @param {integer} ihi - it is assumed that H is already upper triangular in rows and columns 1:ILO-1 and IHI+1:N.
* @param {Float64Array} H - on entry, the upper Hessenberg matrix H. On exit, if INFO = 0 and `job === 'schur'`, then H contains the upper quasi-triangular matrix T from the Schur decomposition (the Schur form); 2-by-2 diagonal blocks (corresponding to complex conjugate pairs of eigenvalues) are returned in standard form, with H(i,i) = H(i+1,i+1) and H(i+1,i)*H(i,i+1) < 0.
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Float64Array} WR - the real and imaginary parts, respectively, of the computed eigenvalues.
* @param {integer} strideWR - stride length for `WR`
* @param {Float64Array} WI - the real and imaginary parts, respectively, of the computed eigenvalues.
* @param {integer} strideWI - stride length for `WI`
* @param {Float64Array} Z - if `compz === 'none'`, Z is not referenced.
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Float64Array|null)} work - =null] - caller-provided workspace, or `null` to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "eigenvalues", "schur"
* @throws {TypeError} third argument must be one of the following: "initialize", "none", "update"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`)
* @throws {RangeError} sixth argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} fourteenth argument is invalid (rejected when `LDZ < 1 || ( ( compz === "initialize" || compz === "update" ) && LDZ < max( 1, N ) )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dhseqr( order, job, compz, N, ilo, ihi, H, LDH, WR, strideWR, WI, strideWI, Z, LDZ, work ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( job !== 'eigenvalues' && job !== 'schur' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "eigenvalues", "schur". Value: `%s`.', job ) );
	}
	if ( compz !== 'initialize' && compz !== 'none' && compz !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "initialize", "none", "update". Value: `%s`.', compz ) );
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
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDH ) );
	}
	if ( LDZ < 1 || ( ( compz === 'initialize' || compz === 'update' ) && LDZ < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `LDZ < 1 || ( ( compz === "initialize" || compz === "update" ) && LDZ < max( 1, N ) )`). Value: `%d`.', LDZ ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const owr = stride2offset( N, strideWR );
	const owi = stride2offset( N, strideWI );
	if ( work === null || work === undefined ) {
		// Auto-allocate the minimum caller-owned workspace. `max(1,N)` is the
		// documented minimum LWORK for the dlaqr0 path and produces correct
		// results (a larger buffer only improves dlaqr0 performance). This
		// replaces the former `lwork = -1` workspace query, which no longer
		// exists under the caller-owns-WORK convention.
		work = new Float64Array( max( 1, N ) );
	}
	return base( job, compz, N, ilo, ihi, H, sh1, sh2, 0, WR, strideWR, owr, WI, strideWI, owi, Z, sz1, sz2, 0, work, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dhseqr;
