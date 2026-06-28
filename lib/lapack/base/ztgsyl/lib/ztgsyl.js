// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the generalized Sylvester equation using a level-3 blocked algorithm.
*
* @param {string} trans - trans
* @param {integer} ijob - ijob
* @param {PositiveInteger} M - M
* @param {PositiveInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} C - C
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Complex128Array} D - D
* @param {PositiveInteger} LDD - leading dimension of `D`
* @param {Complex128Array} E - E
* @param {PositiveInteger} LDE - leading dimension of `E`
* @param {Complex128Array} F - F
* @param {PositiveInteger} LDF - leading dimension of `F`
* @param {Float64Array} scale - scale
* @param {Float64Array} dif - dif
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWork - strideWork
* @param {integer} lwork - lwork
* @param {Int32Array} IWORK - IWORK
* @param {integer} strideIWork - strideIWork
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function ztgsyl( trans, ijob, M, N, A, LDA, B, LDB, C, LDC, D, LDD, E, LDE, F, LDF, scale, dif, WORK, strideWork, lwork, IWORK, strideIWork ) { // eslint-disable-line max-len, max-params
	var oiwork;
	var owork;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var sd1;
	var sd2;
	var se1;
	var se2;
	var sf1;
	var sf2;

	sa1 = 1;
	sa2 = LDA;
	sb1 = 1;
	sb2 = LDB;
	sc1 = 1;
	sc2 = LDC;
	sd1 = 1;
	sd2 = LDD;
	se1 = 1;
	se2 = LDE;
	sf1 = 1;
	sf2 = LDF;
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * M * N);
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, M + N + 2 );
		IWORK = new Int32Array( minIwork );
		strideIWork = 1;
	}
	owork = stride2offset( N, strideWork );
	oiwork = stride2offset( N, strideIWork );
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	if ( LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( LDD < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,M). Value: `%d`.', LDD ) );
	}
	if ( LDE < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDE ) );
	}
	if ( LDF < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDF ) );
	}
	return base( trans, ijob, M, N, A, sa1, sa2, 0, B, sb1, sb2, 0, C, sc1, sc2, 0, D, sd1, sd2, 0, E, se1, se2, 0, F, sf1, sf2, 0, scale, dif, WORK, strideWork, owork, lwork, IWORK, strideIWork, oiwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsyl;
