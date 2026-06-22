
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes unitary matrices U, V, and Q such that A and B have triangular form suitable for GSVD.
*
* This is the preprocessing step for computing the Generalized Singular Value
* Decomposition (GSVD) of a complex matrix pair (A, B).
*
* @param {string} jobu - `'compute-U'` or `'none'`
* @param {string} jobv - `'compute-V'` or `'none'`
* @param {string} jobq - `'compute-Q'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Complex128Array} A - M-by-N matrix A (overwritten on exit)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - P-by-N matrix B (overwritten on exit)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {number} tola - tolerance for A
* @param {number} tolb - tolerance for B
* @param {Array} K - output array; K[0] set to the numerical rank of A(:,1:N-L)
* @param {Array} l - output array; l[0] set to the numerical rank of B
* @param {Complex128Array} U - M-by-M unitary matrix (if jobu=`'compute-U'`)
* @param {integer} strideU1 - stride of the first dimension of U
* @param {integer} strideU2 - stride of the second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Complex128Array} V - P-by-P unitary matrix (if jobv=`'compute-V'`)
* @param {integer} strideV1 - stride of the first dimension of V
* @param {integer} strideV2 - stride of the second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Complex128Array} Q - N-by-N unitary matrix (if jobq=`'compute-Q'`)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Int32Array} IWORK - integer workspace array of length N
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @param {Float64Array} RWORK - real workspace array of length >= 2*N
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @param {Complex128Array} TAU - complex workspace array of length >= min(M,N)
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK
* @throws {TypeError} first argument must be `'compute-U'` or `'none'`
* @throws {TypeError} second argument must be `'compute-V'` or `'none'`
* @throws {TypeError} third argument must be `'compute-Q'` or `'none'`
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
*
* var A = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
* var B = new Complex128Array( [ 5.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0 ] );
* var U = new Complex128Array( 4 );
* var V = new Complex128Array( 4 );
* var Q = new Complex128Array( 4 );
* var IWORK = new Int32Array( 2 );
* var RWORK = new Float64Array( 4 );
* var TAU = new Complex128Array( 2 );
* var WORK = new Complex128Array( 100 );
* var K = [ 0 ];
* var L = [ 0 ];
*
* zggsvp3( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, A, 1, 2, 0, B, 1, 2, 0, 1e-8, 1e-8, K, L, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 100 );
*/
function zggsvp3( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWORK, offsetIWORK, RWORK, strideRWORK, offsetRWORK, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params, max-statements
	if ( jobu !== 'none' && jobu !== 'compute-U' ) {
		throw new TypeError( format( 'invalid argument. First argument must be `\'compute-U\'` or `\'none\'`. Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'none' && jobv !== 'compute-V' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be `\'compute-V\'` or `\'none\'`. Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'none' && jobq !== 'compute-Q' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be `\'compute-Q\'` or `\'none\'`. Value: `%s`.', jobq ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', p ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( jobu, jobv, jobq, M, p, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, K, l, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, IWORK, strideIWORK, offsetIWORK, RWORK, strideRWORK, offsetRWORK, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zggsvp3;
