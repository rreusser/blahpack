
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a complex system A * X = B where A is.
* tridiagonal and provides error bounds.
*
* @param {string} trans - 'no-transpose', 'transpose', or 'conjugate-transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} DL - sub-diagonal of A (length N-1)
* @param {integer} strideDL - stride for DL (complex elements)
* @param {Complex128Array} d - diagonal of A (length N)
* @param {integer} strideD - stride for d (complex elements)
* @param {Complex128Array} DU - super-diagonal of A (length N-1)
* @param {integer} strideDU - stride for DU (complex elements)
* @param {Complex128Array} DLF - factored sub-diagonal from zgttrf
* @param {integer} strideDLF - stride for DLF (complex elements)
* @param {Complex128Array} DF - factored diagonal from zgttrf
* @param {integer} strideDF - stride for DF (complex elements)
* @param {Complex128Array} DUF - factored super-diagonal from zgttrf
* @param {integer} strideDUF - stride for DUF (complex elements)
* @param {Complex128Array} DU2 - second superdiagonal from zgttrf
* @param {integer} strideDU2 - stride for DU2 (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgttrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {Complex128Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of B (complex elements)
* @param {Complex128Array} X - solution matrix, refined on output
* @param {PositiveInteger} LDX - leading dimension of X (complex elements)
* @param {Float64Array} FERR - output forward error bounds
* @param {integer} strideFERR - stride for FERR
* @param {Float64Array} BERR - output backward error bounds
* @param {integer} strideBERR - stride for BERR
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace
* @param {integer} strideRWork - stride for RWORK
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function zgtrfs( trans, N, nrhs, DL, strideDL, d, strideD, DU, strideDU, DLF, strideDLF, DF, strideDF, DUF, strideDUF, DU2, strideDU2, IPIV, strideIPIV, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWork, RWORK, strideRWork ) { // eslint-disable-line max-len, max-params
	var orwork;
	var oberr;
	var oferr;
	var oipiv;
	var owork;
	var odlf;
	var odu2;
	var oduf;
	var odf;
	var odl;
	var odu;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var od;

	sb1 = 1;
	sb2 = LDB;
	sx1 = 1;
	sx2 = LDX;
	odl = stride2offset( N, strideDL );
	od = stride2offset( N, strideD );
	odu = stride2offset( N, strideDU );
	odlf = stride2offset( N, strideDLF );
	odf = stride2offset( N, strideDF );
	oduf = stride2offset( N, strideDUF );
	odu2 = stride2offset( N, strideDU2 );
	oipiv = stride2offset( N, strideIPIV );
	oferr = stride2offset( N, strideFERR );
	oberr = stride2offset( N, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
		strideRWork = 1;
	}
	owork = stride2offset( N, strideWork );
	orwork = stride2offset( N, strideRWork );
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	return base( trans, N, nrhs, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DLF, strideDLF, odlf, DF, strideDF, odf, DUF, strideDUF, oduf, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWork, owork, RWORK, strideRWork, orwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgtrfs;
