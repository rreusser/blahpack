
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Expert driver for solving a complex system of linear equations A*X = B.
* where A is a general band matrix with KL subdiagonals and KU superdiagonals.
*
* Provides equilibration, condition estimation, iterative refinement, and
* error bounds.
*
* FACT controls whether to factor, equilibrate+factor, or use pre-factored:
*   'not-factored' - factor A, no equilibration
*   'equilibrate'  - equilibrate if needed, then factor
*   'factored'     - use pre-factored AFB and IPIV (and pre-computed R,C if equilibrated)
*
* TRANS specifies the system:
*   'no-transpose'         - A _ X = B
_   'transpose'            - A^T _ X = B
*   'conjugate-transpose'  - A^H * X = B
*
* EQUED (input if FACT='factored', output otherwise):
*   'none'   - no equilibration
*   'row'    - row equilibration (A premultiplied by diag(R))
*   'column' - column equilibration (A postmultiplied by diag(C))
*   'both'   - both row and column equilibration
*
* Returns { info, equed, rcond, rpvgrw } where:
*   info: 0=success, i (1-based)=U(i,i) is zero, N+1=singular to working precision
*   equed: equilibration type applied
*   rcond: reciprocal condition number estimate
*   rpvgrw: reciprocal pivot growth factor
*
* @param {string} fact - 'not-factored', 'equilibrate', or 'factored'
* @param {string} trans - 'no-transpose', 'transpose', or 'conjugate-transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AB - band matrix in band storage ((KL+KU+1) x N)
* @param {integer} strideAB1 - stride of first dimension of AB (complex elements)
* @param {integer} strideAB2 - stride of second dimension of AB (complex elements)
* @param {NonNegativeInteger} offsetAB - index offset for AB (complex elements)
* @param {Complex128Array} AFB - factored band matrix ((2*KL+KU+1) x N, output)
* @param {integer} strideAFB1 - stride of first dimension of AFB (complex elements)
* @param {integer} strideAFB2 - stride of second dimension of AFB (complex elements)
* @param {NonNegativeInteger} offsetAFB - index offset for AFB (complex elements)
* @param {Int32Array} IPIV - pivot indices (0-based, output)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {string} equed - equilibration type (input if FACT='factored')
* @param {Float64Array} r - row scale factors
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @param {Complex128Array} B - N-by-NRHS right-hand side (may be scaled on exit)
* @param {integer} strideB1 - stride of first dimension of B (complex elements)
* @param {integer} strideB2 - stride of second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
* @param {Complex128Array} X - N-by-NRHS solution matrix (output)
* @param {integer} strideX1 - stride of first dimension of X (complex elements)
* @param {integer} strideX2 - stride of second dimension of X (complex elements)
* @param {NonNegativeInteger} offsetX - index offset for X (complex elements)
* @param {Float64Array} FERR - forward error bounds (output, length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - backward error bounds (output, length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @param {Complex128Array} WORK - complex workspace (length >= 2*N)
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - index offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace (length >= N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - index offset for RWORK
* @throws {TypeError} Second argument must be a valid transpose operation
* @returns {Object} result with info, equed, rcond, rpvgrw
*/
function zgbsvx( fact, trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, equed, r, strideR, offsetR, c, strideC, offsetC, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( fact, trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, equed, r, strideR, offsetR, c, strideC, offsetC, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgbsvx;
