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
* @param {integer} strideSelect - stride length for `select`
* @param {NonNegativeInteger} offsetSelect - starting index for `select`
* @param {Float64Array} d - Ritz values (length nev; out)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} Z - Ritz vectors (N-by-nev, column-major; out)
* @param {integer} strideZ1 - stride of the first (row) dimension of `Z`
* @param {integer} strideZ2 - stride of the second (column) dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {number} sigma - the shift (modes 3, 4, 5)
* @param {NonNegativeInteger} N - order of the problem
* @param {Float64Array} AB - matrix A in band storage
* @param {integer} strideAB1 - stride of the first (row) dimension of `AB`
* @param {integer} strideAB2 - stride of the second (column) dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} MB - matrix M in band storage
* @param {integer} strideMB1 - stride of the first (row) dimension of `MB`
* @param {integer} strideMB2 - stride of the second (column) dimension of `MB`
* @param {NonNegativeInteger} offsetMB - starting index for `MB`
* @param {Float64Array} RFAC - band LU workspace/output
* @param {integer} strideRFAC1 - stride of the first (row) dimension of `RFAC`
* @param {integer} strideRFAC2 - stride of the second (column) dimension of `RFAC`
* @param {NonNegativeInteger} offsetRFAC - starting index for `RFAC`
* @param {integer} kl - number of subdiagonals
* @param {integer} ku - number of superdiagonals
* @param {string} which - which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, `'BE'`)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {integer} nev - number of eigenvalues to compute
* @param {number} tol - relative accuracy for Ritz value convergence
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} offsetResid - starting index for `resid`
* @param {integer} ncv - number of Lanczos vectors
* @param {Float64Array} V - Lanczos basis (N-by-ncv, column-major; out)
* @param {integer} strideV1 - stride of the first (row) dimension of `V`
* @param {integer} strideV2 - stride of the second (column) dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Int32Array} iparam - input/output parameters (length 11; in/out)
* @param {integer} strideIparam - stride length for `iparam`
* @param {NonNegativeInteger} offsetIparam - starting index for `iparam`
* @param {Float64Array} workd - reverse-communication workspace (length >= 3*N)
* @param {integer} strideWorkd - stride length for `workd`
* @param {NonNegativeInteger} offsetWorkd - starting index for `workd`
* @param {Float64Array} workl - private workspace (length >= ncv^2 + 8*ncv)
* @param {integer} strideWorkl - stride length for `workl`
* @param {NonNegativeInteger} offsetWorkl - starting index for `workl`
* @param {integer} lworkl - length of `workl`
* @param {Int32Array} iwork - integer pivot workspace (length >= N)
* @param {integer} strideIwork - stride length for `iwork`
* @param {NonNegativeInteger} offsetIwork - starting index for `iwork`
* @param {integer} infoIn - nonzero on entry to signal a user-supplied initial residual
* @throws {TypeError} thirtieth argument must be `standard` or `generalized`
* @throws {TypeError} twenty-ninth argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`
* @throws {RangeError} fourteenth argument must be a nonnegative integer
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
function dsband( rvec, howmny, select, strideSelect, offsetSelect, d, strideD, offsetD, Z, strideZ1, strideZ2, offsetZ, sigma, N, AB, strideAB1, strideAB2, offsetAB, MB, strideMB1, strideMB2, offsetMB, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, kl, ku, which, bmat, nev, tol, resid, strideResid, offsetResid, ncv, V, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl, iwork, strideIwork, offsetIwork, infoIn ) {
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Thirtieth argument must be one of `standard` or `generalized`. Value: `%s`.', bmat ) );
	}
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' && which !== 'BE' ) {
		throw new TypeError( format( 'invalid argument. Twenty-ninth argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`. Value: `%s`.', which ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workd || ( workd.length - offsetWorkd ) < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements from offset %d. Provided length: %d.', 3 * N, offsetWorkd, ( workd ) ? workd.length : 0 ) );
	}
	if ( !workl || ( workl.length - offsetWorkl ) < ( ( ncv * ncv ) + ( 8 * ncv ) ) ) {
		throw new RangeError( format( 'invalid argument. workl array must have at least %d elements from offset %d. Provided length: %d.', ( ncv * ncv ) + ( 8 * ncv ), offsetWorkl, ( workl ) ? workl.length : 0 ) );
	}
	return base( rvec, howmny, select, strideSelect, offsetSelect, d, strideD, offsetD, Z, strideZ1, strideZ2, offsetZ, sigma, N, AB, strideAB1, strideAB2, offsetAB, MB, strideMB1, strideMB2, offsetMB, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, kl, ku, which, bmat, nev, tol, resid, strideResid, offsetResid, ncv, V, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl, iwork, strideIwork, offsetIwork, infoIn );
}


// EXPORTS //

export default dsband;
