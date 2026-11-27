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
import base from './base.js';


// FUNCTIONS //

/**
* Returns the starting index of a pointer-indexed array whose logical length cannot be derived from the routine arguments.
*
* ## Notes
*
* -   `PRMPTR`, `PERM`, `GIVPTR`, `q`, and `QPTR` describe the whole divide-and-conquer tree (DLAED0 sizes them from the full problem size), while `N` is only the size of the current subproblem, so their Fortran dimensions (`N lg N`, `N**2`, `N+2`) cannot be evaluated from the arguments. The logical vector is therefore taken to span the entire buffer: for a negative stride, the first element is the last element reachable from the end of the buffer.
*
* @private
* @param {Collection} x - input array
* @param {integer} stride - stride length
* @returns {NonNegativeInteger} starting index
*/
function spanOffset( x, stride ) {
	if ( stride >= 0 || x.length === 0 ) {
		return 0;
	}
	return stride2offset( Math.floor( ( x.length - 1 ) / -stride ) + 1, stride );
}


// MAIN //

/**
* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.
*
* ## Notes
*
* -   `N` is the size of the current subproblem; `z` and `ZTEMP` have length `N`.
* -   The tree-indexed arrays (`PRMPTR`, `PERM`, `GIVPTR`, `q`, `QPTR`) are addressed through stored pointers, so their length is not derivable from `N`; for a negative stride, their first element is the last element reachable from the end of the buffer.
*
* @param {Layout} order - storage layout of `GIVCOL` and `GIVNUM` ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - size of the current subproblem
* @param {integer} tlvls - total number of merging levels in the divide-and-conquer tree
* @param {integer} curlvl - current level in the merge routine
* @param {integer} curpbm - current problem in the current level
* @param {Int32Array} PRMPTR - pointers into `PERM` (1-based)
* @param {integer} stridePRMPTR - stride length for `PRMPTR`
* @param {Int32Array} PERM - permutations from deflation and sorting (1-based)
* @param {integer} stridePERM - stride length for `PERM`
* @param {Int32Array} GIVPTR - pointers into `GIVCOL` (1-based)
* @param {integer} strideGIVPTR - stride length for `GIVPTR`
* @param {Int32Array} GIVCOL - 2-by-* matrix of column pairs for Givens rotations (1-based)
* @param {PositiveInteger} LDGIVCOL - leading dimension of `GIVCOL`
* @param {Float64Array} GIVNUM - 2-by-* matrix of Givens rotation C and S values
* @param {PositiveInteger} LDGIVNUM - leading dimension of `GIVNUM`
* @param {Float64Array} q - eigenblocks from previous levels
* @param {integer} strideQ - stride length for `q`
* @param {Int32Array} QPTR - pointers into `q` (1-based)
* @param {integer} strideQPTR - stride length for `QPTR`
* @param {Float64Array} z - output updating vector, length `N`
* @param {integer} strideZ - stride length for `z`
* @param {Float64Array} ZTEMP - workspace, length `N`
* @param {integer} strideZTEMP - stride length for `ZTEMP`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} thirteenth argument must be greater than or equal to 2
* @throws {RangeError} fifteenth argument must be greater than or equal to 2
* @returns {integer} status code (0 = success)
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dlaeda from '@rreusser/blahpack/lapack/dlaeda';
*
* const QPTR = new Int32Array( [ 1, 5, 9 ] );
* const q = new Float64Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0 ] );
* const z = new Float64Array( 4 );
* const ZTEMP = new Float64Array( 4 );
* const PRMPTR = new Int32Array( 4 );
* const PERM = new Int32Array( 4 );
* const GIVPTR = new Int32Array( 4 );
* const GIVCOL = new Int32Array( 8 );
* const GIVNUM = new Float64Array( 8 );
*
* const info = dlaeda( 'column-major', 4, 1, 1, 0, PRMPTR, 1, PERM, 1, GIVPTR, 1, GIVCOL, 2, GIVNUM, 2, q, 1, QPTR, 1, z, 1, ZTEMP, 1 );
* // returns 0
* // z => <Float64Array>[ 0.0, 1.0, 1.0, 0.0 ]
*/
function dlaeda( order, N, tlvls, curlvl, curpbm, PRMPTR, stridePRMPTR, PERM, stridePERM, GIVPTR, strideGIVPTR, GIVCOL, LDGIVCOL, GIVNUM, LDGIVNUM, q, strideQ, QPTR, strideQPTR, z, strideZ, ZTEMP, strideZTEMP ) {
	let sgc1, sgc2, sgn1, sgn2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && LDGIVCOL < 2 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to 2. Value: `%d`.', LDGIVCOL ) );
	}
	if ( order === 'column-major' && LDGIVNUM < 2 ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to 2. Value: `%d`.', LDGIVNUM ) );
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
	const oprmptr = spanOffset( PRMPTR, stridePRMPTR );
	const operm = spanOffset( PERM, stridePERM );
	const ogivptr = spanOffset( GIVPTR, strideGIVPTR );
	const oq = spanOffset( q, strideQ );
	const oqptr = spanOffset( QPTR, strideQPTR );
	const oz = stride2offset( N, strideZ );
	const oztemp = stride2offset( N, strideZTEMP );
	return base( N, tlvls, curlvl, curpbm, PRMPTR, stridePRMPTR, oprmptr, PERM, stridePERM, operm, GIVPTR, strideGIVPTR, ogivptr, GIVCOL, sgc1, sgc2, 0, GIVNUM, sgn1, sgn2, 0, q, strideQ, oq, QPTR, strideQPTR, oqptr, z, strideZ, oz, ZTEMP, strideZTEMP, oztemp );
}


// EXPORTS //

export default dlaeda;
