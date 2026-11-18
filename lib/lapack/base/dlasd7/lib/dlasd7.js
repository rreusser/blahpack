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
* Merges two sets of singular values together into a single sorted set and deflates.
*
* ## Notes
*
* -   `N = nl + nr + 1` and `M = N + sqre`.
* -   `d`, `DSIGMA`, `IDX`, `IDXP`, `IDXQ`, and `PERM` have length `N`; `z`, `ZW`, `VF`, `VFW`, `VL`, and `VLW` have length `M`.
* -   `GIVCOL` and `GIVNUM` are `N`-by-2 matrices.
*
* @private
* @param {string} order - storage layout of `GIVCOL` and `GIVNUM` ('row-major' or 'column-major')
* @param {integer} icompq - specifies whether singular vectors are to be computed (0: singular values only, 1: compact form)
* @param {integer} nl - row dimension of the upper block
* @param {integer} nr - row dimension of the lower block
* @param {integer} sqre - 0: square lower block; 1: rectangular
* @param {Float64Array} d - singular values
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} z - updating row vector
* @param {integer} strideZ - stride length for `z`
* @param {Float64Array} ZW - workspace for `z`
* @param {integer} strideZW - stride length for `ZW`
* @param {Float64Array} VF - first components of right singular vectors
* @param {integer} strideVF - stride length for `VF`
* @param {Float64Array} VFW - workspace for `VF`
* @param {integer} strideVFW - stride length for `VFW`
* @param {Float64Array} VL - last components of right singular vectors
* @param {integer} strideVL - stride length for `VL`
* @param {Float64Array} VLW - workspace for `VL`
* @param {integer} strideVLW - stride length for `VLW`
* @param {number} alpha - diagonal element associated with the added row
* @param {number} beta - off-diagonal element associated with the added row
* @param {Float64Array} DSIGMA - output singular values in secular equation
* @param {integer} strideDSIGMA - stride length for `DSIGMA`
* @param {Int32Array} IDX - permutation to sort D
* @param {integer} strideIDX - stride length for `IDX`
* @param {Int32Array} IDXP - permutation to place deflated values at end
* @param {integer} strideIDXP - stride length for `IDXP`
* @param {Int32Array} IDXQ - permutation sorting each sub-problem
* @param {integer} strideIDXQ - stride length for `IDXQ`
* @param {Int32Array} PERM - permutations from deflation and sorting
* @param {integer} stridePERM - stride length for `PERM`
* @param {Int32Array} GIVCOL - pairs of columns for Givens rotations (`N`-by-2)
* @param {PositiveInteger} LDGIVCOL - leading dimension of `GIVCOL`
* @param {Float64Array} GIVNUM - C and S values for Givens rotations (`N`-by-2)
* @param {PositiveInteger} LDGIVNUM - leading dimension of `GIVNUM`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} `LDGIVCOL` must be greater than or equal to `max(1,N)` (column-major) or 2 (row-major)
* @throws {RangeError} `LDGIVNUM` must be greater than or equal to `max(1,N)` (column-major) or 2 (row-major)
* @returns {Object} object with fields: `info`, `K`, `givptr`, `c`, `s`
*/
function dlasd7( order, icompq, nl, nr, sqre, d, strideD, z, strideZ, ZW, strideZW, VF, strideVF, VFW, strideVFW, VL, strideVL, VLW, strideVLW, alpha, beta, DSIGMA, strideDSIGMA, IDX, strideIDX, IDXP, strideIDXP, IDXQ, strideIDXQ, PERM, stridePERM, GIVCOL, LDGIVCOL, GIVNUM, LDGIVNUM ) {
	let sgc1, sgc2, sgn1, sgn2;

	const N = nl + nr + 1;
	const M = N + sqre;
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( order === 'column-major' && LDGIVCOL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirty-third argument must be greater than or equal to max(1,N). Value: `%d`.', LDGIVCOL ) );
	}
	if ( order === 'row-major' && LDGIVCOL < 2 ) {
		throw new RangeError( format( 'invalid argument. Thirty-third argument must be greater than or equal to 2. Value: `%d`.', LDGIVCOL ) );
	}
	if ( order === 'column-major' && LDGIVNUM < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirty-fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDGIVNUM ) );
	}
	if ( order === 'row-major' && LDGIVNUM < 2 ) {
		throw new RangeError( format( 'invalid argument. Thirty-fifth argument must be greater than or equal to 2. Value: `%d`.', LDGIVNUM ) );
	}
	if ( order === 'column-major' ) {
		sgc1 = 1;
		sgc2 = LDGIVCOL;
		sgn1 = 1;
		sgn2 = LDGIVNUM;
	} else {
		sgc1 = LDGIVCOL;
		sgc2 = 1;
		sgn1 = LDGIVNUM;
		sgn2 = 1;
	}
	const od = stride2offset( N, strideD );
	const oz = stride2offset( M, strideZ );
	const ozw = stride2offset( M, strideZW );
	const ovf = stride2offset( M, strideVF );
	const ovfw = stride2offset( M, strideVFW );
	const ovl = stride2offset( M, strideVL );
	const ovlw = stride2offset( M, strideVLW );
	const odsigma = stride2offset( N, strideDSIGMA );
	const oidx = stride2offset( N, strideIDX );
	const oidxp = stride2offset( N, strideIDXP );
	const oidxq = stride2offset( N, strideIDXQ );
	const operm = stride2offset( N, stridePERM );
	return base( icompq, nl, nr, sqre, d, strideD, od, z, strideZ, oz, ZW, strideZW, ozw, VF, strideVF, ovf, VFW, strideVFW, ovfw, VL, strideVL, ovl, VLW, strideVLW, ovlw, alpha, beta, DSIGMA, strideDSIGMA, odsigma, IDX, strideIDX, oidx, IDXP, strideIDXP, oidxp, IDXQ, strideIDXQ, oidxq, PERM, stridePERM, operm, GIVCOL, sgc1, sgc2, 0, GIVNUM, sgn1, sgn2, 0 );
}


// EXPORTS //

export default dlasd7;
