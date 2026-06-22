
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a complex block reflector from RZ factorization to a general matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - specifies the operation type
* @param {string} trans - specifies the operation type
* @param {string} direct - specifies the operation type
* @param {string} storev - specifies the operation type
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} K - number of superdiagonals
* @param {integer} l - l
* @param {Float64Array} V - input matrix
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Float64Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} C - input matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} WORK - output matrix
* @param {PositiveInteger} LDWORK - leading dimension of `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} Second argument must be a valid operation side
* @throws {TypeError} Third argument must be a valid transpose operation
* @throws {TypeError} Fourth argument must be `'backward'`
* @throws {TypeError} Fifth argument must be `'rowwise'`
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be a nonnegative integer
* @throws {RangeError} `LDV` must be valid for the given order
* @throws {RangeError} `LDT` must be valid for the given order
* @throws {RangeError} `LDC` must be valid for the given order
* @throws {RangeError} `LDWORK` must be valid for the given order
* @returns {Complex128Array} `C`
*/
function zlarzb( order, side, trans, direct, storev, M, N, K, l, V, LDV, T, LDT, C, LDC, WORK, LDWORK ) { // eslint-disable-line max-len, max-params
	var swork1;
	var swork2;
	var sv1;
	var sv2;
	var st1;
	var st2;
	var sc1;
	var sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( direct !== 'backward' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be `backward`. Value: `%s`.', direct ) );
	}
	if ( storev !== 'rowwise' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be `rowwise`. Value: `%s`.', storev ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'row-major' && LDV < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' && LDV < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDV ) );
	}
	if ( order === 'row-major' && LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && LDT < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' && LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( order === 'row-major' && LDWORK < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDWORK ) );
	}
	if ( order === 'column-major' && LDWORK < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDWORK ) );
	}
	if ( order === 'column-major' ) {
		sv1 = 1;
		sv2 = LDV;
		st1 = 1;
		st2 = LDT;
		sc1 = 1;
		sc2 = LDC;
		swork1 = 1;
		swork2 = LDWORK;
	} else {
		sv1 = LDV;
		sv2 = 1;
		st1 = LDT;
		st2 = 1;
		sc1 = LDC;
		sc2 = 1;
		swork1 = LDWORK;
		swork2 = 1;
	}
	base( side, trans, direct, storev, M, N, K, l, V, sv1, sv2, 0, T, st1, st2, 0, C, sc1, sc2, 0, WORK, swork1, swork2, 0 ); // eslint-disable-line max-len
	return C;
}


// EXPORTS //

export default zlarzb;
