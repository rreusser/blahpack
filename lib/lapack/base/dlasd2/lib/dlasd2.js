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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Merges the two sets of singular values together into a single sorted set, then tries to deflate.
*
* @param {string} order - storage layout (`row-major` or `column-major`)
* @param {integer} NL - row dimension of the upper block (>= 1)
* @param {integer} NR - row dimension of the lower block (>= 1)
* @param {integer} SQRE - 0 if lower block is square, 1 if rectangular
* @param {Int32Array} K - output array; `K[0]` set to dimension of non-deflated matrix
* @param {Float64Array} D - singular values (length N)
* @param {integer} strideD - stride length for `D`
* @param {Float64Array} Z - updating row vector (length N)
* @param {integer} strideZ - stride length for `Z`
* @param {number} ALPHA - diagonal element associated with the added row
* @param {number} BETA - off-diagonal element associated with the added row
* @param {Float64Array} U - left singular vectors (N x N)
* @param {PositiveInteger} LDU - leading dimension of U
* @param {Float64Array} VT - right singular vectors (M x M)
* @param {PositiveInteger} LDVT - leading dimension of VT
* @param {Float64Array} DSIGMA - output singular values (length N)
* @param {integer} strideDSIGMA - stride length for `DSIGMA`
* @param {Float64Array} U2 - output left singular vectors copy (N x N)
* @param {PositiveInteger} LDU2 - leading dimension of U2
* @param {Float64Array} VT2 - output right singular vectors copy (M x M)
* @param {PositiveInteger} LDVT2 - leading dimension of VT2
* @param {Int32Array} IDXP - permutation array (length N)
* @param {integer} strideIDXP - stride length for `IDXP`
* @param {Int32Array} IDX - permutation array (length N)
* @param {integer} strideIDX - stride length for `IDX`
* @param {Int32Array} IDXC - permutation array (length N)
* @param {integer} strideIDXC - stride length for `IDXC`
* @param {Int32Array} IDXQ - permutation array (length N)
* @param {integer} strideIDXQ - stride length for `IDXQ`
* @param {Int32Array} COLTYP - column type array (length max(N,4))
* @param {integer} strideCOLTYP - stride length for `COLTYP`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 on success
*/
function dlasd2( order, NL, NR, SQRE, K, D, strideD, Z, strideZ, ALPHA, BETA, U, LDU, VT, LDVT, DSIGMA, strideDSIGMA, U2, LDU2, VT2, LDVT2, IDXP, strideIDXP, IDX, strideIDX, IDXC, strideIDXC, IDXQ, strideIDXQ, COLTYP, strideCOLTYP ) {
	let sv21, sv22, su1, su2, sv1, sv2, s21, s22;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const od = stride2offset( NL + NR + 1, strideD );
	const oz = stride2offset( NL + NR + 1, strideZ );
	const odsigma = stride2offset( NL + NR + 1, strideDSIGMA );
	const oidxp = stride2offset( NL + NR + 1, strideIDXP );
	const oidx = stride2offset( NL + NR + 1, strideIDX );
	const oidxc = stride2offset( NL + NR + 1, strideIDXC );
	const oidxq = stride2offset( NL + NR + 1, strideIDXQ );
	const ocoltyp = stride2offset( NL + NR + 1, strideCOLTYP );
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'column-major' ) {
		su1 = 1;
		su2 = LDU;
		sv1 = 1;
		sv2 = LDVT;
		s21 = 1;
		s22 = LDU2;
		sv21 = 1;
		sv22 = LDVT2;
	} else {
		su1 = LDU;
		su2 = 1;
		sv1 = LDVT;
		sv2 = 1;
		s21 = LDU2;
		s22 = 1;
		sv21 = LDVT2;
		sv22 = 1;
	}
	return base( NL, NR, SQRE, K, D, strideD, od, Z, strideZ, oz, ALPHA, BETA, U, su1, su2, 0, VT, sv1, sv2, 0, DSIGMA, strideDSIGMA, odsigma, U2, s21, s22, 0, VT2, sv21, sv22, 0, IDXP, strideIDXP, oidxp, IDX, strideIDX, oidx, IDXC, strideIDXC, oidxc, IDXQ, strideIDXQ, oidxq, COLTYP, strideCOLTYP, ocoltyp );
}


// EXPORTS //

export default dlasd2;
