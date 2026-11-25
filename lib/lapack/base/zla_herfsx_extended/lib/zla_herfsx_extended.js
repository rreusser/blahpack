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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution using extra-precise iterative refinement for Hermitian indefinite matrices.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {integer} prec_type - requested residual precision (ignored; see base.js)
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - original Hermitian matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - factored form of `A`
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {Int32Array} IPIV - pivot indices
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {boolean} colequ - whether column equilibration was performed on `A`
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride length for `c`
* @param {Complex128Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} Y - initial/improved solution
* @param {PositiveInteger} LDY - leading dimension of `Y`
* @param {Float64Array} BERR_OUT - componentwise backward error
* @param {integer} strideBERR_OUT - stride length for `berrOut`
* @param {integer} n_norms - number of error bound components
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds
* @param {PositiveInteger} LDERR_BNDS_NORM - leading dimension of `errBndsNorm`
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds
* @param {PositiveInteger} LDERR_BNDS_COMP - leading dimension of `errBndsComp`
* @param {Complex128Array} RES - workspace residual
* @param {integer} strideRES - stride length for `RES`
* @param {Float64Array} AYB - real workspace
* @param {integer} strideAYB - stride length for `AYB`
* @param {Complex128Array} DY - correction workspace
* @param {integer} strideDY - stride length for `DY`
* @param {Complex128Array} Y_TAIL - double-double tail of `Y`
* @param {integer} strideY_TAIL - stride length for `yTail`
* @param {number} rcond - reciprocal condition number
* @param {integer} ithresh - maximum refinement iterations
* @param {number} rthresh - convergence ratio threshold
* @param {number} dz_ub - componentwise update upper bound
* @param {boolean} ignore_cwise - whether to ignore componentwise convergence
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} sixteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} sixteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @throws {RangeError} eighteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} eighteenth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @returns {integer} status code (`0` on success)
*/
function zlaHerfsxExtended( order, prec_type, uplo, N, nrhs, A, LDA, AF, LDAF, IPIV, strideIPIV, colequ, c, strideC, B, LDB, Y, LDY, BERR_OUT, strideBERR_OUT, n_norms, ERR_BNDS_NORM, LDERR_BNDS_NORM, ERR_BNDS_COMP, LDERR_BNDS_COMP, RES, strideRES, AYB, strideAYB, DY, strideDY, Y_TAIL, strideY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	let saf1, saf2, sen1, sen2, sec1, sec2, sa1, sa2, sb1, sb2, sy1, sy2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAF ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' && ( LDY < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDY ) );
	}
	if ( order === 'row-major' && ( LDY < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDY ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		saf1 = 1;
		saf2 = LDAF;
		sb1 = 1;
		sb2 = LDB;
		sy1 = 1;
		sy2 = LDY;
		sen1 = 1;
		sen2 = LDERR_BNDS_NORM;
		sec1 = 1;
		sec2 = LDERR_BNDS_COMP;
	} else {
		sa1 = LDA;
		sa2 = 1;
		saf1 = LDAF;
		saf2 = 1;
		sb1 = LDB;
		sb2 = 1;
		sy1 = LDY;
		sy2 = 1;
		sen1 = LDERR_BNDS_NORM;
		sen2 = 1;
		sec1 = LDERR_BNDS_COMP;
		sec2 = 1;
	}
	return base( prec_type, uplo, N, nrhs, A, sa1, sa2, 0, AF, saf1, saf2, 0, IPIV, strideIPIV, stride2offset( N, strideIPIV ), colequ, c, strideC, stride2offset( N, strideC ), B, sb1, sb2, 0, Y, sy1, sy2, 0, BERR_OUT, strideBERR_OUT, stride2offset( nrhs, strideBERR_OUT ), n_norms, ERR_BNDS_NORM, sen1, sen2, 0, ERR_BNDS_COMP, sec1, sec2, 0, RES, strideRES, stride2offset( N, strideRES ), AYB, strideAYB, stride2offset( N, strideAYB ), DY, strideDY, stride2offset( N, strideDY ), Y_TAIL, strideY_TAIL, stride2offset( N, strideY_TAIL ), rcond, ithresh, rthresh, dz_ub, ignore_cwise );
}


// EXPORTS //

export default zlaHerfsxExtended;
