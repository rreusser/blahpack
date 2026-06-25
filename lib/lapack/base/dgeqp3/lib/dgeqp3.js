
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// VARIABLES //

var DEFAULT_NB = 32;


// MAIN //

/**
* Computes a QR factorization with column pivoting of a real M-by-N matrix:.
*   A_P = Q_R
* using Level 3 BLAS.
*
* When `WORK` is `null`, this wrapper auto-allocates a workspace of size
* `max(1, 2*N + (N+1)*NB)` elements (with `NB = 32`). Prefer passing a
* caller-owned buffer for batched use.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input/output matrix (M-by-N, column-major)
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Int32Array} JPVT - column permutation (1-based on exit)
* @param {integer} strideJPVT - stride for JPVT
* @param {Float64Array} TAU - output reflector scalars (length >= min(M,N))
* @param {integer} strideTAU - stride for TAU
* @param {(Float64Array|null)} WORK - caller-provided workspace, or null to auto-allocate
* @param {integer} strideWork - stride for WORK
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a valid leading dimension
* @returns {integer} info status code
*/
function dgeqp3( M, N, A, LDA, JPVT, strideJPVT, TAU, strideTAU, WORK, strideWork ) { // eslint-disable-line max-len, max-params
	var lwork;
	var ojpvt;
	var otau;
	var ow;
	var sa1;
	var sa2;

	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	sa1 = 1;
	sa2 = LDA;
	ojpvt = stride2offset( N, strideJPVT );
	otau = stride2offset( Math.min( M, N ), strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		lwork = max( 1, ( 2 * N ) + ( ( N + 1 ) * DEFAULT_NB ) );
		WORK = new Float64Array( lwork );
		strideWork = 1;
	}
	ow = stride2offset( N, strideWork );
	return base( M, N, A, sa1, sa2, 0, JPVT, strideJPVT, ojpvt, TAU, strideTAU, otau, WORK, strideWork, ow );
}


// EXPORTS //

export default dgeqp3;
