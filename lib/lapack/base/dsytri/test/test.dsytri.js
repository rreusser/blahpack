/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytri from './../lib/dsytri.js';
import ndarray from './../lib/ndarray.js';
import _4x4_indef_2x2_upper from './fixtures/4x4_indef_2x2_upper.json' with { type: 'json' };
import _4x4_indef_2x2_lower from './fixtures/4x4_indef_2x2_lower.json' with { type: 'json' };


// FUNCTIONS //

/**
* Converts Fortran 1-based IPIV to JS 0-based IPIV, placing entries at a given stride.
*
* @private
* @param {Array} ipiv - Fortran 1-based pivot indices
* @param {NonNegativeInteger} N - number of pivots
* @param {PositiveInteger} stride - output stride
* @returns {Int32Array} 0-based pivot indices
*/
function convertIPIV( ipiv, N, stride ) {
	let i;
	const out = new Int32Array( N * stride );
	for ( i = 0; i < N; i++ ) {
		out[ i * stride ] = ( ipiv[ i ] >= 0 ) ? ipiv[ i ] - 1 : ~( ( -ipiv[ i ] ) - 1 );
	}
	return out;
}

/**
* Copies a column-major N-by-N matrix into storage with the given layout and leading dimension.
*
* @private
* @param {Array} arr - column-major flat data
* @param {NonNegativeInteger} N - matrix order
* @param {string} order - target layout
* @param {PositiveInteger} LDA - target leading dimension
* @returns {Float64Array} matrix storage
*/
function toLayout( arr, N, order, LDA ) {
	let i;
	let j;
	const out = new Float64Array( LDA * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( order === 'column-major' ) {
				out[ i + ( j * LDA ) ] = arr[ i + ( j * N ) ];
			} else {
				out[ ( i * LDA ) + j ] = arr[ i + ( j * N ) ];
			}
		}
	}
	return out;
}

/**
* Runs the layout wrapper and the ndarray interface on the same data and checks they agree and match the fixture.
*
* @private
* @param {Object} tc - fixture
* @param {string} uplo - triangle
* @param {string} order - layout
* @param {PositiveInteger} LDA - leading dimension
* @param {boolean} nullWork - whether to pass `null` for WORK
*/
function compareWithNdarray( tc, uplo, order, LDA, nullWork ) {
	let expected;
	let idx;
	let i;
	let j;
	const N = 4;
	const A1 = toLayout( tc.a_fact, N, order, LDA );
	const A2 = toLayout( tc.a_fact, N, order, LDA );
	const ipiv1 = convertIPIV( tc.ipiv, N, 2 );
	const ipiv2 = convertIPIV( tc.ipiv, N, 2 );
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const info1 = dsytri( order, uplo, N, A1, LDA, ipiv1, 2, ( nullWork ) ? null : new Float64Array( N ) );
	const info2 = ndarray( uplo, N, A2, sa1, sa2, 0, ipiv2, 2, 0, new Float64Array( N ), 1, 0 );
	assert.equal( info1, tc.info, 'info' );
	assert.equal( info2, tc.info, 'info (ndarray)' );
	for ( i = 0; i < A1.length; i++ ) {
		assert.strictEqual( A1[ i ], A2[ i ], 'A[' + i + '] matches ndarray' );
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( ( uplo === 'upper' && i > j ) || ( uplo === 'lower' && i < j ) ) {
				continue;
			}
			idx = ( i * sa1 ) + ( j * sa2 );
			expected = tc.a[ i + ( j * N ) ];
			assert.ok( Math.abs( A1[ idx ] - expected ) <= 1e-14 * Math.max( 1.0, Math.abs( expected ) ), 'A(' + i + ',' + j + ') matches fixture' );
		}
	}
}


// TESTS //

test( 'dsytri is a function', function t() {
	assert.strictEqual( typeof dsytri, 'function', 'is a function' );
});

test( 'dsytri has expected arity', function t() {
	assert.strictEqual( dsytri.length, 8, 'has expected arity' );
});

test( 'dsytri throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytri( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsytri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytri( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsytri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytri( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsytri matches ndarray (column-major, upper, null WORK)', function t() {
	compareWithNdarray( _4x4_indef_2x2_upper, 'upper', 'column-major', 4, true );
});

test( 'dsytri matches ndarray (column-major, lower, LDA > N, provided WORK)', function t() {
	compareWithNdarray( _4x4_indef_2x2_lower, 'lower', 'column-major', 6, false );
});

test( 'dsytri matches ndarray (row-major, upper, LDA > N, provided WORK)', function t() {
	compareWithNdarray( _4x4_indef_2x2_upper, 'upper', 'row-major', 5, false );
});

test( 'dsytri matches ndarray (row-major, lower, null WORK)', function t() {
	compareWithNdarray( _4x4_indef_2x2_lower, 'lower', 'row-major', 4, true );
});

test( 'dsytri throws RangeError for LDA < N', function t() {
	assert.throws( function throws() {
		dsytri( 'column-major', 'upper', 4, new Float64Array( 16 ), 3, new Int32Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsytri throws RangeError for an undersized WORK', function t() {
	const tc = _4x4_indef_2x2_upper;
	assert.throws( function throws() {
		dsytri( 'column-major', 'upper', 4, toLayout( tc.a_fact, 4, 'column-major', 4 ), 4, convertIPIV( tc.ipiv, 4, 1 ), 1, new Float64Array( 3 ) );
	}, RangeError );
});
