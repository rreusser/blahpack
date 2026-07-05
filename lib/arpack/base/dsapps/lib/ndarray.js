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
* Applies `np` implicit shifts to the symmetric Arnoldi/Lanczos factorization via bulge chasing.
*
* @param {NonNegativeInteger} n - problem size (dimension of the matrix `A`)
* @param {NonNegativeInteger} kev - number of wanted eigenvalues; on exit, the order of the updated factorization
* @param {NonNegativeInteger} np - number of implicit shifts to apply
* @param {Float64Array} shift - shifts to apply (length `np`)
* @param {integer} strideShift - stride length for `shift`
* @param {NonNegativeInteger} offsetShift - starting index for `shift`
* @param {Float64Array} v - Arnoldi vectors, `n` by `kev+np`
* @param {integer} strideV1 - stride of the first (row) dimension of `v`
* @param {integer} strideV2 - stride of the second (column) dimension of `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
* @param {Float64Array} h - symmetric tridiagonal matrix in 2-column layout (subdiagonal in column 0, diagonal in column 1), `kev+np` by 2
* @param {integer} strideH1 - stride of the first (row) dimension of `h`
* @param {integer} strideH2 - stride of the second (column) dimension of `h`
* @param {NonNegativeInteger} offsetH - starting index for `h`
* @param {Float64Array} resid - residual vector (length `n`); updated in place
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} offsetResid - starting index for `resid`
* @param {Float64Array} q - workspace to accumulate the rotations, `kev+np` by `kev+np`
* @param {integer} strideQ1 - stride of the first (row) dimension of `q`
* @param {integer} strideQ2 - stride of the second (column) dimension of `q`
* @param {NonNegativeInteger} offsetQ - starting index for `q`
* @param {Float64Array} workd - workspace array (length >= `2*n`)
* @param {integer} strideWorkd - stride length for `workd`
* @param {NonNegativeInteger} offsetWorkd - starting index for `workd`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var v = new Float64Array( 5 * 3 );
* var i;
* for ( i = 0; i < v.length; i++ ) {
*     v[ i ] = ( i + 1 ) * 0.1;
* }
*
* var h = new Float64Array( [ 0.0, 1.0, 0.5, 3.0, 1.0, 2.0 ] ); // 3x2, column-major
* var resid = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
* var shift = new Float64Array( [ 1.75 ] );
* var q = new Float64Array( 3 * 3 );
* var workd = new Float64Array( 10 );
*
* dsapps( 5, 2, 1, shift, 1, 0, v, 1, 5, 0, h, 1, 3, 0, resid, 1, 0, q, 1, 3, 0, workd, 1, 0 );
*/
function dsapps( n, kev, np, shift, strideShift, offsetShift, v, strideV1, strideV2, offsetV, h, strideH1, strideH2, offsetH, resid, strideResid, offsetResid, q, strideQ1, strideQ2, offsetQ, workd, strideWorkd, offsetWorkd ) {
	if ( n < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', n ) );
	}
	if ( kev < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', kev ) );
	}
	if ( np < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', np ) );
	}
	if ( !workd || ( workd.length - offsetWorkd ) < ( 2 * n ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements from offset %d. Provided length: %d.', 2 * n, offsetWorkd, ( workd ) ? workd.length : 0 ) );
	}
	return base( n, kev, np, shift, strideShift, offsetShift, v, strideV1, strideV2, offsetV, h, strideH1, strideH2, offsetH, resid, strideResid, offsetResid, q, strideQ1, strideQ2, offsetQ, workd, strideWorkd, offsetWorkd );
}


// EXPORTS //

export default dsapps;
