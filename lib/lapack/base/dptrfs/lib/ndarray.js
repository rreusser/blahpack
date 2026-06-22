
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a real symmetric positive definite.
* tridiagonal system A*X = B, and provides error bounds and backward
* error estimates for the solution.
*
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Float64Array} d - original diagonal elements of A, length N
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - original off-diagonal elements of A, length N-1
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} DF - factored diagonal from dpttrf, length N
* @param {integer} strideDF - stride for `DF`
* @param {NonNegativeInteger} offsetDF - starting index for `DF`
* @param {Float64Array} EF - factored off-diagonal from dpttrf, length N-1
* @param {integer} strideEF - stride for `EF`
* @param {NonNegativeInteger} offsetEF - starting index for `EF`
* @param {Float64Array} B - right hand side matrix (N x NRHS)
* @param {integer} strideB1 - row stride of `B`
* @param {integer} strideB2 - column stride of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} X - solution matrix (N x NRHS), refined in-place
* @param {integer} strideX1 - row stride of `X`
* @param {integer} strideX2 - column stride of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} FERR - forward error bound for each RHS, length NRHS
* @param {integer} strideFERR - stride for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - backward error for each RHS, length NRHS
* @param {integer} strideBERR - stride for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Float64Array} WORK - workspace of length 2*N
* @param {integer} strideWORK - stride for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} info - 0 on success
*/
function dptrfs( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dptrfs;
