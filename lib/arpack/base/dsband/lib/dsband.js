/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes converged approximations to eigenvalues of `A*z = lambda*B*z` for banded symmetric `A` and `B`, and optionally the corresponding eigenvectors.
*
* ## Notes
*
* -   `AB`, `MB`, and `RFAC` are `(2*kl+ku+1)`-by-`N` band-storage matrices.
* -   When `workd`, `workl`, or `iwork` is `null`, this wrapper allocates a workspace of the minimum size (`3*N`, `ncv^2 + 8*ncv`, and `N` elements, respectively) as a convenience. Prefer passing caller-owned buffers for repeated use.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {boolean} rvec - whether to compute Ritz vectors
* @param {('all'|'select')} howmny - `'all'` or `'select'` (only `'all'` is implemented)
* @param {Uint8Array} select - selection array (length ncv)
* @param {integer} strideSelect - stride length for `select`
* @param {Float64Array} d - Ritz values (length nev; out)
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} Z - Ritz vectors (N-by-nev; out)
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {number} sigma - the shift (modes 3, 4, 5)
* @param {integer} N - order of the problem
* @param {Float64Array} AB - matrix A in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} MB - matrix M in band storage
* @param {PositiveInteger} LDMB - leading dimension of `MB`
* @param {Float64Array} RFAC - band LU workspace/output
* @param {PositiveInteger} LDRFAC - leading dimension of `RFAC`
* @param {integer} kl - number of subdiagonals
* @param {integer} ku - number of superdiagonals
* @param {('LM'|'SM'|'LA'|'SA'|'BE')} which - which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, `'BE'`)
* @param {('standard'|'generalized')} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {integer} nev - number of eigenvalues to compute
* @param {number} tol - relative accuracy for Ritz value convergence
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {integer} ncv - number of Lanczos vectors
* @param {Float64Array} V - Lanczos basis (N-by-ncv; out)
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Int32Array} iparam - input/output parameters (length 11; in/out)
* @param {integer} strideIparam - stride length for `iparam`
* @param {(Float64Array|null)} workd - reverse-communication workspace (length >= 3*N)
* @param {(Float64Array|null)} workl - private workspace (length >= ncv^2 + 8*ncv)
* @param {integer} lworkl - length of `workl`
* @param {(Int32Array|null)} iwork - integer pivot workspace (length >= N)
* @param {integer} infoIn - nonzero on entry to signal a user-supplied initial residual
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} third argument must be one of the following: "all", "select"
* @throws {TypeError} twentieth argument must be one of the following: "LM", "SM", "LA", "SA", "BE"
* @throws {TypeError} twenty-first argument must be one of the following: "standard", "generalized"
* @throws {RangeError} eleventh argument must be a nonnegative integer
* @throws {RangeError} fifteenth argument must be a valid leading dimension
* @throws {RangeError} seventeenth argument must be a valid leading dimension
* @throws {RangeError} workd array must have sufficient length
* @throws {RangeError} workl array must have sufficient length
* @returns {integer} INFO
*
* @example
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
*
* // dsband runs the full Lanczos iteration internally; see the package README
* // for a complete banded example.
* var resid = new Float64Array( 4 );
* var d = new Float64Array( 2 );
*/
function dsband( order, rvec, howmny, select, strideSelect, d, strideD, Z, LDZ, sigma, N, AB, LDAB, MB, LDMB, RFAC, LDRFAC, kl, ku, which, bmat, nev, tol, resid, strideResid, ncv, V, LDV, iparam, strideIparam, workd, workl, lworkl, iwork, infoIn ) {
	let sab1, sab2, smb1, smb2, srf1, srf2, sz1, sz2, sv1, sv2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( howmny !== 'all' && howmny !== 'select' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "all", "select". Value: `%s`.', howmny ) );
	}
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' && which !== 'BE' ) {
		throw new TypeError( format( 'invalid argument. Twentieth argument must be one of the following: "LM", "SM", "LA", "SA", "BE". Value: `%s`.', which ) );
	}
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Twenty-first argument must be one of the following: "standard", "generalized". Value: `%s`.', bmat ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const nband = ( 2 * kl ) + ku + 1;
	if ( order === 'column-major' ) {
		if ( LDMB < max( 1, nband ) ) {
			throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,2*kl+ku+1). Value: `%d`.', LDMB ) );
		}
		if ( LDRFAC < max( 1, nband ) ) {
			throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,2*kl+ku+1). Value: `%d`.', LDRFAC ) );
		}
		sz1 = 1;
		sz2 = LDZ;
		sab1 = 1;
		sab2 = LDAB;
		smb1 = 1;
		smb2 = LDMB;
		srf1 = 1;
		srf2 = LDRFAC;
		sv1 = 1;
		sv2 = LDV;
	} else {
		if ( LDMB < max( 1, N ) ) {
			throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDMB ) );
		}
		if ( LDRFAC < max( 1, N ) ) {
			throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDRFAC ) );
		}
		sz1 = LDZ;
		sz2 = 1;
		sab1 = LDAB;
		sab2 = 1;
		smb1 = LDMB;
		smb2 = 1;
		srf1 = LDRFAC;
		srf2 = 1;
		sv1 = LDV;
		sv2 = 1;
	}
	if ( workd === null ) {
		workd = new Float64Array( 3 * N );
	}
	if ( workl === null ) {
		workl = new Float64Array( ( ncv * ncv ) + ( 8 * ncv ) );
	}
	if ( iwork === null ) {
		iwork = new Int32Array( max( 1, N ) );
	}
	if ( !workd || workd.length < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements. Provided length: %d.', 3 * N, ( workd ) ? workd.length : 0 ) );
	}
	if ( !workl || workl.length < ( ( ncv * ncv ) + ( 8 * ncv ) ) ) {
		throw new RangeError( format( 'invalid argument. workl array must have at least %d elements. Provided length: %d.', ( ncv * ncv ) + ( 8 * ncv ), ( workl ) ? workl.length : 0 ) );
	}
	const oselect = stride2offset( ncv, strideSelect );
	const od = stride2offset( nev, strideD );
	const oresid = stride2offset( N, strideResid );
	const oiparam = stride2offset( 11, strideIparam );
	return base( rvec, howmny, select, strideSelect, oselect, d, strideD, od, Z, sz1, sz2, 0, sigma, N, AB, sab1, sab2, 0, MB, smb1, smb2, 0, RFAC, srf1, srf2, 0, kl, ku, which, bmat, nev, tol, resid, strideResid, oresid, ncv, V, sv1, sv2, 0, iparam, strideIparam, oiparam, workd, 1, 0, workl, 1, 0, lworkl, iwork, 1, 0, infoIn );
}


// EXPORTS //

export default dsband;
