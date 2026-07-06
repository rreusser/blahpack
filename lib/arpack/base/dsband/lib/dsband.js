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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes converged approximations to eigenvalues of `A*z = lambda*B*z` for banded symmetric `A` and `B`, and optionally the corresponding eigenvectors.
*
* @param {boolean} rvec - whether to compute Ritz vectors
* @param {string} howmny - `'all'` or `'select'` (only `'all'` is implemented)
* @param {Int32Array} select - selection array (length ncv)
* @param {Float64Array} d - Ritz values (length nev; out)
* @param {Float64Array} Z - Ritz vectors (N-by-nev, column-major; out)
* @param {integer} ldz - leading dimension of `Z`
* @param {number} sigma - the shift (modes 3, 4, 5)
* @param {NonNegativeInteger} N - order of the problem
* @param {Float64Array} AB - matrix A in band storage (leading dimension `lda`)
* @param {Float64Array} MB - matrix M in band storage (leading dimension `lda`)
* @param {integer} lda - leading dimension of `AB`, `MB`, and `RFAC`
* @param {Float64Array} RFAC - band LU workspace/output (leading dimension `lda`)
* @param {integer} kl - number of subdiagonals
* @param {integer} ku - number of superdiagonals
* @param {string} which - which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, `'BE'`)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {integer} nev - number of eigenvalues to compute
* @param {number} tol - relative accuracy for Ritz value convergence
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} ncv - number of Lanczos vectors
* @param {Float64Array} V - Lanczos basis (N-by-ncv, column-major; out)
* @param {integer} ldv - leading dimension of `V`
* @param {Int32Array} iparam - input/output parameters (length 11; in/out)
* @param {Float64Array} workd - reverse-communication workspace (length >= 3*N)
* @param {Float64Array} workl - private workspace (length >= ncv^2 + 8*ncv)
* @param {integer} lworkl - length of `workl`
* @param {Int32Array} iwork - integer pivot workspace (length >= N)
* @param {integer} infoIn - nonzero on entry to signal a user-supplied initial residual
* @throws {TypeError} sixteenth argument must be `standard` or `generalized`
* @throws {TypeError} fifteenth argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`
* @throws {RangeError} eighth argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @throws {RangeError} workl array must have sufficient length
* @returns {integer} INFO
*
* @example
* var Int32Array = require( '@stdlib/array/int32' );
* var Float64Array = require( '@stdlib/array/float64' );
*
* // dsband runs the full Lanczos iteration internally; see the package README
* // for a complete banded example.
* var resid = new Float64Array( 4 );
* var d = new Float64Array( 2 );
*/
function dsband( rvec, howmny, select, d, Z, ldz, sigma, N, AB, MB, lda, RFAC, kl, ku, which, bmat, nev, tol, resid, ncv, V, ldv, iparam, workd, workl, lworkl, iwork, infoIn ) {
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Sixteenth argument must be one of `standard` or `generalized`. Value: `%s`.', bmat ) );
	}
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' && which !== 'BE' ) {
		throw new TypeError( format( 'invalid argument. Fifteenth argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`. Value: `%s`.', which ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workd || workd.length < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements. Provided length: %d.', 3 * N, ( workd ) ? workd.length : 0 ) );
	}
	if ( !workl || workl.length < ( ( ncv * ncv ) + ( 8 * ncv ) ) ) {
		throw new RangeError( format( 'invalid argument. workl array must have at least %d elements. Provided length: %d.', ( ncv * ncv ) + ( 8 * ncv ), ( workl ) ? workl.length : 0 ) );
	}
	return base( rvec, howmny, select, 1, 0, d, 1, 0, Z, 1, ldz, 0, sigma, N, AB, 1, lda, 0, MB, 1, lda, 0, RFAC, 1, lda, 0, kl, ku, which, bmat, nev, tol, resid, 1, 0, ncv, V, 1, ldv, 0, iparam, 1, 0, workd, 1, 0, workl, 1, 0, lworkl, iwork, 1, 0, infoIn );
}


// EXPORTS //

export default dsband;
