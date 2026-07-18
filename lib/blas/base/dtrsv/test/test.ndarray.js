/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrsv from './../lib/ndarray.js';
const ndarray = dtrsv;

// FIXTURES //

import upper_n_nonunit from './fixtures/upper_n_nonunit.json' with { type: 'json' };
import lower_n_nonunit from './fixtures/lower_n_nonunit.json' with { type: 'json' };
import upper_t_nonunit from './fixtures/upper_t_nonunit.json' with { type: 'json' };
import lower_t_nonunit from './fixtures/lower_t_nonunit.json' with { type: 'json' };
import upper_n_unit from './fixtures/upper_n_unit.json' with { type: 'json' };
import lower_n_unit from './fixtures/lower_n_unit.json' with { type: 'json' };
import upper_t_unit from './fixtures/upper_t_unit.json' with { type: 'json' };
import lower_t_unit from './fixtures/lower_t_unit.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };
import neg_stride from './fixtures/neg_stride.json' with { type: 'json' };
import upper_n_nonunit_4x4 from './fixtures/upper_n_nonunit_4x4.json' with { type: 'json' };
import n_one_unit from './fixtures/n_one_unit.json' with { type: 'json' };
import upper_n_zeros from './fixtures/upper_n_zeros.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// Helper: create upper triangular 3x3 matrix [2 3 4; 0 5 6; 0 0 7] in col-major
/**
* UpperA3.
*
* @private
* @returns {*} result
*/
function upperA3() {
	//     col0  col1  col2
	return new Float64Array([
		2.0,
		0.0,
		0.0,  // col 0
		3.0,
		5.0,
		0.0,  // col 1
		4.0,
		6.0,
		7.0   // col 2
	]);
}

// Helper: create lower triangular 3x3 matrix [2 0 0; 3 5 0; 4 6 7] in col-major
/**
* LowerA3.
*
* @private
* @returns {*} result
*/
function lowerA3( ) {
	return new Float64Array([
		2.0,
		3.0,
		4.0,  // col 0
		0.0,
		5.0,
		6.0,  // col 1
		0.0,
		0.0,
		7.0   // col 2
	]);
}

// TESTS //

test( 'dtrsv: upper, no-transpose, non-unit diag (N=3)', function t() {
	const tc = upper_n_nonunit;
	const A = upperA3();

	// B = A * [1,2,3] = [20, 28, 21]
	const x = new Float64Array([ 20.0, 28.0, 21.0 ]);
	dtrsv( 'upper', 'no-transpose', 'non-unit', 3, A, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: lower, no-transpose, non-unit diag (N=3)', function t() {
	const tc = lower_n_nonunit;
	const A = lowerA3();

	// B = A * [1,2,3] = [2, 13, 37]
	const x = new Float64Array([ 2.0, 13.0, 37.0 ]);
	dtrsv( 'lower', 'no-transpose', 'non-unit', 3, A, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: upper, transpose, non-unit diag (N=3)', function t() {
	const tc = upper_t_nonunit;
	const A = upperA3();

	// B = A^T * [1,2,3] = [2, 13, 37]
	const x = new Float64Array([ 2.0, 13.0, 37.0 ]);
	dtrsv( 'upper', 'transpose', 'non-unit', 3, A, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: lower, transpose, non-unit diag (N=3)', function t() {
	const tc = lower_t_nonunit;
	const A = lowerA3();

	// B = A^T * [1,2,3] = [20, 28, 21]
	const x = new Float64Array([ 20.0, 28.0, 21.0 ]);
	dtrsv( 'lower', 'transpose', 'non-unit', 3, A, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: upper, no-transpose, unit diag (N=3)', function t() {
	const tc = upper_n_unit;

	// Unit diag: A = [1 3 4; 0 1 6; 0 0 1], diag values set to 99 (should be ignored) // eslint-disable-line max-len
	const A = new Float64Array([
		99.0,
		0.0,
		0.0,
		3.0,
		99.0,
		0.0,
		4.0,
		6.0,
		99.0
	]);

	// B = A*[1,2,3] = [19, 20, 3]
	const x = new Float64Array([ 19.0, 20.0, 3.0 ]);
	dtrsv( 'upper', 'no-transpose', 'unit', 3, A, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: lower, no-transpose, unit diag (N=3)', function t() {
	const tc = lower_n_unit;

	// Unit diag: A = [1 0 0; 3 1 0; 4 6 1]
	const A = new Float64Array([
		99.0,
		3.0,
		4.0,
		0.0,
		99.0,
		6.0,
		0.0,
		0.0,
		99.0
	]);

	// B = A*[1,2,3] = [1, 5, 19]
	const x = new Float64Array([ 1.0, 5.0, 19.0 ]);
	dtrsv( 'lower', 'no-transpose', 'unit', 3, A, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: upper, transpose, unit diag (N=3)', function t() {
	const tc = upper_t_unit;

	// Unit diag: A = [1 3 4; 0 1 6; 0 0 1]

	// A^T = [1 0 0; 3 1 0; 4 6 1]
	const A = new Float64Array([
		99.0,
		0.0,
		0.0,
		3.0,
		99.0,
		0.0,
		4.0,
		6.0,
		99.0
	]);

	// B = A^T*[1,2,3] = [1, 5, 19]
	const x = new Float64Array([ 1.0, 5.0, 19.0 ]);
	dtrsv( 'upper', 'transpose', 'unit', 3, A, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: lower, transpose, unit diag (N=3)', function t() {
	const tc = lower_t_unit;

	// Unit diag: A = [1 0 0; 3 1 0; 4 6 1]

	// A^T = [1 3 4; 0 1 6; 0 0 1]
	const A = new Float64Array([
		99.0,
		3.0,
		4.0,
		0.0,
		99.0,
		6.0,
		0.0,
		0.0,
		99.0
	]);

	// B = A^T*[1,2,3] = [19, 20, 3]
	const x = new Float64Array([ 19.0, 20.0, 3.0 ]);
	dtrsv( 'lower', 'transpose', 'unit', 3, A, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: N=0 quick return', function t() {

	const A = new Float64Array([ 1.0 ]);
	const x = new Float64Array([ 99.0 ]);
	const out = dtrsv( 'upper', 'no-transpose', 'non-unit', 0, A, 1, 1, 0, x, 1, 0 );
	assert.equal( x[ 0 ], 99.0 );
	assert.equal( out, x );
});

test( 'dtrsv: N=1, non-unit diag', function t() {
	const tc = n_one;
	const A = new Float64Array([ 5.0 ]);
	const x = new Float64Array([ 15.0 ]);
	dtrsv( 'upper', 'no-transpose', 'non-unit', 1, A, 1, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: non-unit stride (incx=2)', function t() {
	const tc = stride;
	const A = upperA3();

	// B at stride 2: positions 0,2,4 hold [20,28,21]
	const x = new Float64Array([ 20.0, 0.0, 28.0, 0.0, 21.0, 0.0 ]);
	dtrsv( 'upper', 'no-transpose', 'non-unit', 3, A, 1, 3, 0, x, 2, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: negative stride (incx=-1)', function t() {
	const tc = neg_stride;
	const A = lowerA3();

	// With incx=-1, x stored in reverse: x[2]=b(1), x[1]=b(2), x[0]=b(3)
	const x = new Float64Array([ 37.0, 13.0, 2.0 ]);

	// Negative stride: strideX=-1, offsetX = (N-1)*|strideX| = 2
	dtrsv( 'lower', 'no-transpose', 'non-unit', 3, A, 1, 3, 0, x, -1, 2 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: upper, no-transpose, non-unit (4x4)', function t() {
	const tc = upper_n_nonunit_4x4;

	// A (upper, col-major 4x4):

	//   [1  2  3  4]

	//   [0  5  6  7]

	//   [0  0  8  9]

	//   [0  0  0 10]
	const A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,  // col 0
		2.0,
		5.0,
		0.0,
		0.0,  // col 1
		3.0,
		6.0,
		8.0,
		0.0,  // col 2
		4.0,
		7.0,
		9.0,
		10.0  // col 3
	]);

	// B = A*[1,1,1,1] = [10, 18, 17, 10]
	const x = new Float64Array([ 10.0, 18.0, 17.0, 10.0 ]);
	dtrsv( 'upper', 'no-transpose', 'non-unit', 4, A, 1, 4, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: N=1, unit diag', function t() {
	const tc = n_one_unit;
	const A = new Float64Array([ 99.0 ]);
	const x = new Float64Array([ 7.0 ]);
	dtrsv( 'lower', 'transpose', 'unit', 1, A, 1, 1, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: upper, no-transpose with zero RHS entries', function t() {
	const tc = upper_n_zeros;
	const A = upperA3();

	// B = [0, 0, 21]
	const x = new Float64Array([ 0.0, 0.0, 21.0 ]);
	dtrsv( 'upper', 'no-transpose', 'non-unit', 3, A, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dtrsv: returns x', function t() {

	const A = new Float64Array([ 2.0 ]);
	const x = new Float64Array([ 4.0 ]);
	const out = dtrsv( 'upper', 'no-transpose', 'non-unit', 1, A, 1, 1, 0, x, 1, 0 );
	assert.equal( out, x );
});

test( 'dtrsv: with offsetA', function t() {
	// Place the 3x3 upper triangular matrix at offset 2 in A
	const A = new Float64Array([
		0.0,
		0.0,          // padding
		2.0,
		0.0,
		0.0,     // col 0
		3.0,
		5.0,
		0.0,     // col 1
		4.0,
		6.0,
		7.0      // col 2
	]);
	const x = new Float64Array([ 20.0, 28.0, 21.0 ]);
	dtrsv( 'upper', 'no-transpose', 'non-unit', 3, A, 1, 3, 2, x, 1, 0 );
	assertArrayClose( x, [ 1.0, 2.0, 3.0 ], 1e-14, 'x' );
});

test( 'dtrsv: with offsetX', function t() {
	const A = upperA3();
	const x = new Float64Array([ 0.0, 0.0, 20.0, 28.0, 21.0 ]);
	dtrsv( 'upper', 'no-transpose', 'non-unit', 3, A, 1, 3, 0, x, 1, 2 );
	assertArrayClose( [ x[2], x[3], x[4] ], [ 1.0, 2.0, 3.0 ], 1e-14, 'x' );
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	const x = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function f() {
		ndarray( 'foo', 'no-transpose', 'non-unit', 3, upperA3(), 1, 3, 0, x, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid trans', function t() {
	const x = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'foo', 'non-unit', 3, upperA3(), 1, 3, 0, x, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid diag', function t() {
	const x = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'foo', 3, upperA3(), 1, 3, 0, x, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	const x = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', -1, upperA3(), 1, 3, 0, x, 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for strideX=0', function t() {
	const x = new Float64Array( [ 1, 2, 3 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', 3, upperA3(), 1, 3, 0, x, 0, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: N=0 early return', function t() {

	const x = new Float64Array( [ 99 ] );
	const out = ndarray( 'upper', 'no-transpose', 'non-unit', 0, new Float64Array( 1 ), 1, 1, 0, x, 1, 0 ); // eslint-disable-line max-len
	assert.equal( out, x );
	assert.equal( x[ 0 ], 99 );
});

// The blocked kernel folds `trans` into logical strides and selects a form by
// stride magnitude, so the blocked substitution regions are reached by varying
// uplo x trans x layout. N=9 exercises the four-wide main loops plus the
// scalar remainder in every region. A is diagonally dominant so the solve is
// well conditioned.

/**
* Solves a triangular system with plain substitution loops.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - triangular matrix
* @param {integer} sa1 - stride of the first dimension of A
* @param {integer} sa2 - stride of the second dimension of A
* @param {Float64Array} b - right-hand side
* @returns {Float64Array} solution
*/
function naiveTrsv( uplo, trans, diag, N, A, sa1, sa2, b ) { // eslint-disable-line max-params
	let stored, aij, aii, sum, i, j;

	/**
	* Returns the (i,j) entry of op(A), or zero outside the stored triangle.
	*
	* @private
	* @param {NonNegativeInteger} i - row index
	* @param {NonNegativeInteger} j - column index
	* @returns {number} entry
	*/
	function opA( i, j ) { // eslint-disable-line no-shadow
		if ( trans === 'no-transpose' ) {
			stored = ( uplo === 'upper' ) ? ( i <= j ) : ( i >= j );
			aij = stored ? A[ ( i * sa1 ) + ( j * sa2 ) ] : 0.0;
		} else {
			stored = ( uplo === 'upper' ) ? ( j <= i ) : ( j >= i );
			aij = stored ? A[ ( j * sa1 ) + ( i * sa2 ) ] : 0.0;
		}
		if ( i === j && diag === 'unit' ) {
			return 1.0;
		}
		return aij;
	}

	const out = new Float64Array( N );
	// op(A) is lower triangular when (upper, transpose) or (lower, no-transpose):
	const low = ( uplo === 'upper' ) ? ( trans === 'transpose' ) : ( trans === 'no-transpose' );
	if ( low ) {
		for ( i = 0; i < N; i++ ) {
			sum = b[ i ];
			for ( j = 0; j < i; j++ ) {
				sum -= opA( i, j ) * out[ j ];
			}
			aii = opA( i, i );
			out[ i ] = sum / aii;
		}
	} else {
		for ( i = N - 1; i >= 0; i-- ) {
			sum = b[ i ];
			for ( j = i + 1; j < N; j++ ) {
				sum -= opA( i, j ) * out[ j ];
			}
			aii = opA( i, i );
			out[ i ] = sum / aii;
		}
	}
	return out;
}

test( 'ndarray: blocked paths, N=9, all uplo x trans x diag x layout', function t() {
	let expected, layout, trans, uplo, diag, sa1, sa2, msg, A, b, x, i, u, v, w;
	let d;
	const N = 9;
	const uplos = [ 'upper', 'lower' ];
	const transes = [ 'no-transpose', 'transpose' ];
	const diags = [ 'non-unit', 'unit' ];
	const layouts = [ 'col', 'row' ];

	for ( u = 0; u < uplos.length; u++ ) {
		for ( v = 0; v < transes.length; v++ ) {
			for ( d = 0; d < diags.length; d++ ) {
				for ( w = 0; w < layouts.length; w++ ) {
					uplo = uplos[ u ];
					trans = transes[ v ];
					diag = diags[ d ];
					layout = layouts[ w ];
					sa1 = ( layout === 'col' ) ? 1 : N;
					sa2 = ( layout === 'col' ) ? N : 1;

					// Diagonally dominant A keeps the solve well conditioned:
					A = new Float64Array( N * N );
					for ( i = 0; i < N * N; i++ ) {
						A[ i ] = 0.25 * Math.sin( i + 1.0 );
					}
					for ( i = 0; i < N; i++ ) {
						A[ ( i * sa1 ) + ( i * sa2 ) ] = 4.0 + ( 0.5 * Math.cos( i ) );
					}
					b = new Float64Array( N );
					for ( i = 0; i < N; i++ ) {
						b[ i ] = Math.cos( i + 0.5 );
					}
					x = new Float64Array( b );
					expected = naiveTrsv( uplo, trans, diag, N, A, sa1, sa2, b );
					ndarray( uplo, trans, diag, N, A, sa1, sa2, 0, x, 1, 0 );
					msg = uplo + '/' + trans + '/' + diag + '/' + layout;
					assertArrayClose( x, expected, 1.0e-10, msg );
				}
			}
		}
	}
});
