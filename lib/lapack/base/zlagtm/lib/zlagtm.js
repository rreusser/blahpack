/* eslint-disable max-len, max-params */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a matrix-matrix product of the form `B := alpha*A*X + beta*B` where A is a complex tridiagonal matrix.
*
* @param {string} trans - specifies the operation: `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of X and B)
* @param {number} alpha - real scalar multiplier (must be 0.0, 1.0, or -1.0)
* @param {Complex128Array} DL - sub-diagonal of A (length N-1)
* @param {integer} strideDL - stride for DL (in complex elements)
* @param {Complex128Array} d - diagonal of A (length N)
* @param {integer} strideD - stride for d (in complex elements)
* @param {Complex128Array} DU - super-diagonal of A (length N-1)
* @param {integer} strideDU - stride for DU (in complex elements)
* @param {Complex128Array} X - input matrix (N x NRHS)
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {number} beta - real scalar multiplier for B (0.0, 1.0, or -1.0)
* @param {Complex128Array} B - input/output matrix (N x NRHS)
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlagtm( trans, N, nrhs, alpha, DL, strideDL, d, strideD, DU, strideDU, X, LDX, beta, B, LDB ) {
	var odl;
	var odu;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var od;

	sx1 = 1;
	sx2 = LDX;
	sb1 = 1;
	sb2 = LDB;
	odl = stride2offset( N, strideDL );
	od = stride2offset( N, strideD );
	odu = stride2offset( N, strideDU );
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	base( trans, N, nrhs, alpha, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, X, sx1, sx2, 0, beta, B, sb1, sb2, 0 );
}


// EXPORTS //

export default zlagtm;
