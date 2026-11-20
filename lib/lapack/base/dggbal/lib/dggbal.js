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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Balances a pair of general real matrices (A, B).
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} job - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrices
* @param {Float64Array} A - first real matrix
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} B - second real matrix
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Int32Array} ilo - output (length-1 array): `ilo`
* @param {Int32Array} ihi - output (length-1 array): iLO and IHI are set to integers such that on exit A(i,j) = 0 and B(i,j) = 0 if i > j and j = 1,...,ILO-1 or i = IHI+1,...,N
* @param {Float64Array} LSCALE - left scaling factors
* @param {integer} strideLSCALE - stride for LSCALE
* @param {Float64Array} RSCALE - right scaling factors
* @param {integer} strideRSCALE - stride for RSCALE
* @param {(Float64Array|null)} WORK - workspace array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "none", "permute", "scale"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )`
* @returns {integer} status code (0 = success)
*/
function dggbal( order, job, N, A, LDA, B, LDB, ilo, ihi, LSCALE, strideLSCALE, RSCALE, strideRSCALE, WORK ) {
	let sa1, sa2, sb1, sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( job !== 'both' && job !== 'none' && job !== 'permute' && job !== 'scale' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "both", "none", "permute", "scale". Value: `%s`.', job ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
	}
	const ol = stride2offset( N, strideLSCALE );
	const or = stride2offset( N, strideRSCALE );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = ( job === 'scale' || job === 'both' ) ? Math.max( 1, 6*N ) : 1;
		WORK = new Float64Array( minWork );
	}
	return base( job, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ilo, ihi, LSCALE, strideLSCALE, ol, RSCALE, strideRSCALE, or, WORK, 1, 0 );
}


// EXPORTS //

export default dggbal;
