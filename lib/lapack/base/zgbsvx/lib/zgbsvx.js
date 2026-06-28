
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex system A*X = B where A is general band, with equilibration, condition estimation, and error bounds.
*
* @param {string} fact - fact
* @param {string} trans - trans
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} kl - kl
* @param {NonNegativeInteger} ku - ku
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Complex128Array} AB - AB
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Complex128Array} AFB - AFB
* @param {PositiveInteger} LDAFB - leading dimension of `AFB`
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {string} equed - equed
* @param {Float64Array} r - r
* @param {integer} strideR - strideR
* @param {Float64Array} c - c
* @param {integer} strideC - strideC
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - FERR
* @param {integer} strideFERR - strideFERR
* @param {Float64Array} BERR - BERR
* @param {integer} strideBERR - strideBERR
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {Float64Array} RWORK - RWORK
* @param {integer} strideRWORK - strideRWORK
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} output array
*/
function zgbsvx( fact, trans, N, kl, ku, nrhs, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, equed, r, strideR, c, strideC, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK ) { // eslint-disable-line max-len, max-params
	var orwork;
	var oberr;
	var oferr;
	var oipiv;
	var owork;
	var safb1;
	var safb2;
	var sab1;
	var sab2;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var oc;
	var or;

	sab1 = 1;
	sab2 = LDAB;
	safb1 = 1;
	safb2 = LDAFB;
	sb1 = 1;
	sb2 = LDB;
	sx1 = 1;
	sx2 = LDX;
	oipiv = stride2offset( N, strideIPIV );
	or = stride2offset( N, strideR );
	oc = stride2offset( N, strideC );
	oferr = stride2offset( nrhs, strideFERR );
	oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, Math.max( 1, N) );
		RWORK = new Float64Array( minRwork );
		strideRWORK = 1;
	}
	owork = stride2offset( 2 * N, strideWORK );
	orwork = stride2offset( N, strideRWORK );
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( LDAFB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAFB ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( fact !== 'not-factored' && fact !== 'equilibrate' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `fact` value. Value: `%s`.', fact ) );
	}
	if ( equed !== 'row' && equed !== 'both' && equed !== 'column' ) {
		throw new TypeError( format( 'invalid argument. Thirteenth argument must be a valid `equed` value. Value: `%s`.', equed ) );
	}
	return base( fact, trans, N, kl, ku, nrhs, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, IPIV, strideIPIV, oipiv, equed, r, strideR, or, c, strideC, oc, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWORK, owork, RWORK, strideRWORK, orwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgbsvx;
