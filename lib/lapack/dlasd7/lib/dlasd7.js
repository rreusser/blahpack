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
* @param {Layout} order - storage layout of `GIVCOL` and `GIVNUM` ('row-major' or 'column-major')
* @param {integer} icompq - specifies whether singular vectors are to be computed (0: singular values only, 1: compact form)
* @param {integer} nl - row dimension of the upper block
* @param {integer} nr - row dimension of the lower block
* @param {integer} sqre - 0: square lower block; 1: rectangular
* @param {Int32Array} k - output (length-1 array): contains the dimension of the non-deflated matrix, this is the order of the related secular equation
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
* @param {Int32Array} givptr - output (length-1 array): the number of Givens rotations which took place in this subproblem
* @param {Int32Array} GIVCOL - pairs of columns for Givens rotations (`N`-by-2)
* @param {PositiveInteger} LDGIVCOL - leading dimension of `GIVCOL`
* @param {Float64Array} GIVNUM - C and S values for Givens rotations (`N`-by-2)
* @param {PositiveInteger} LDGIVNUM - leading dimension of `GIVNUM`
* @param {Float64Array} c - output (length-1 array): c contains garbage if SQRE =0 and the C-value of a Givens rotation related to the right null space if SQRE = 1
* @param {Float64Array} s - output (length-1 array): s contains garbage if SQRE =0 and the S-value of a Givens rotation related to the right null space if SQRE = 1
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument is invalid (rejected when `icompq < 0 || icompq > 1`)
* @throws {RangeError} third argument is invalid (rejected when `nl < 1`)
* @throws {RangeError} fourth argument is invalid (rejected when `nr < 1`)
* @throws {RangeError} fifth argument is invalid (rejected when `sqre < 0 || sqre > 1`)
* @throws {RangeError} thirty-fifth argument must be greater than or equal to `nl + nr + 1` (column-major)
* @throws {RangeError} thirty-fifth argument must be greater than or equal to `max( 1, 2 )` (row-major)
* @throws {RangeError} thirty-seventh argument must be greater than or equal to `nl + nr + 1` (column-major)
* @throws {RangeError} thirty-seventh argument must be greater than or equal to `max( 1, 2 )` (row-major)
* @throws {RangeError} `LDGIVCOL` must be greater than or equal to `max(1,N)` (column-major) or 2 (row-major)
* @throws {RangeError} `LDGIVNUM` must be greater than or equal to `max(1,N)` (column-major) or 2 (row-major)
* @returns {integer} status code (0 = success)
*/
function dlasd7( order, icompq, nl, nr, sqre, k, d, strideD, z, strideZ, ZW, strideZW, VF, strideVF, VFW, strideVFW, VL, strideVL, VLW, strideVLW, alpha, beta, DSIGMA, strideDSIGMA, IDX, strideIDX, IDXP, strideIDXP, IDXQ, strideIDXQ, PERM, stridePERM, givptr, GIVCOL, LDGIVCOL, GIVNUM, LDGIVNUM, c, s ) {
	let sgc1, sgc2, sgn1, sgn2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( icompq < 0 || icompq > 1 ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `icompq < 0 || icompq > 1`). Value: `%d`.', icompq ) );
	}
	if ( nl < 1 ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `nl < 1`). Value: `%d`.', nl ) );
	}
	if ( nr < 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `nr < 1`). Value: `%d`.', nr ) );
	}
	if ( sqre < 0 || sqre > 1 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument is invalid (rejected when `sqre < 0 || sqre > 1`). Value: `%d`.', sqre ) );
	}
	if ( order === 'column-major' && ( LDGIVCOL < nl + nr + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Thirty-fifth argument must be greater than or equal to %d. Value: `%d`.', nl + nr + 1, LDGIVCOL ) );
	}
	if ( order === 'row-major' && ( LDGIVCOL < max( 1, 2 ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirty-fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', 2, LDGIVCOL ) );
	}
	if ( order === 'column-major' && ( LDGIVNUM < nl + nr + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Thirty-seventh argument must be greater than or equal to %d. Value: `%d`.', nl + nr + 1, LDGIVNUM ) );
	}
	if ( order === 'row-major' && ( LDGIVNUM < max( 1, 2 ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirty-seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', 2, LDGIVNUM ) );
	}
	const N = nl + nr + 1;
	const M = N + sqre;
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
	return base( icompq, nl, nr, sqre, k, d, strideD, od, z, strideZ, oz, ZW, strideZW, ozw, VF, strideVF, ovf, VFW, strideVFW, ovfw, VL, strideVL, ovl, VLW, strideVLW, ovlw, alpha, beta, DSIGMA, strideDSIGMA, odsigma, IDX, strideIDX, oidx, IDXP, strideIDXP, oidxp, IDXQ, strideIDXQ, oidxq, PERM, stridePERM, operm, givptr, GIVCOL, sgc1, sgc2, 0, GIVNUM, sgn1, sgn2, 0, c, s );
}


// EXPORTS //

export default dlasd7;
