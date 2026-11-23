/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormql from './../lib/dormql.js';
import dormqlNd from './../lib/ndarray.js';


// FIXTURES //

import ql_factor from './fixtures/ql_factor.json' with { type: 'json' };
import big_ql_factor from './fixtures/big_ql_factor.json' with { type: 'json' };
import blocked_left_notrans from './fixtures/blocked_left_notrans.json' with { type: 'json' };
import blocked_right_notrans from './fixtures/blocked_right_notrans.json' with { type: 'json' };


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'dormql is a function', function t() {
	assert.strictEqual( typeof dormql, 'function', 'is a function' );
});

test( 'dormql has expected arity', function t() {
	assert.strictEqual( dormql.length, 13, 'has expected arity' );
});

test( 'dormql throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormql( 'column-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormql throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormql( 'column-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormql throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormql( 'column-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormql throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormql( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormql throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dormql( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormql: WORK = null allocates the blocked workspace (K=40, both sides)', function t() {
	const sides = [ 'left', 'right' ];
	const fixtures = [ blocked_left_notrans, blocked_right_notrans ];
	const N = 40;
	let info;
	let C;
	let i;
	let s;
	for ( s = 0; s < sides.length; s++ ) {
		C = new Float64Array( N * N );
		for ( i = 0; i < N; i++ ) {
			C[ ( i * N ) + i ] = 1.0;
		}
		info = dormql( 'column-major', sides[ s ], 'no-transpose', N, N, N, new Float64Array( big_ql_factor.A ), N, new Float64Array( big_ql_factor.TAU ), 1, C, N, null );
		assert.equal( info, fixtures[ s ].info, 'INFO' );
		assertArrayClose( C, fixtures[ s ].c, 1e-12, sides[ s ] );
	}
});

test( 'dormql: WORK = null with side=right sizes the workspace by M (M > N)', function t() {
	const M = 6;
	const N = 4;
	const K = 3;
	const C0 = new Float64Array( M * N );
	let expected;
	let Crow;
	let Arow;
	let info;
	let C;
	let i;
	let j;
	for ( i = 0; i < C0.length; i++ ) {
		C0[ i ] = ( ( i * 7 ) % 11 ) - 5.0;
	}

	// Reference: ndarray interface with an ample caller-provided workspace...
	expected = new Float64Array( C0 );
	dormqlNd( 'right', 'transpose', M, N, K, new Float64Array( ql_factor.A ), 1, N, 0, new Float64Array( ql_factor.TAU ), 1, 0, expected, 1, M, 0, new Float64Array( 1000 ), 1, 0 );

	// Column-major wrapper with WORK = null...
	C = new Float64Array( C0 );
	info = dormql( 'column-major', 'right', 'transpose', M, N, K, new Float64Array( ql_factor.A ), N, new Float64Array( ql_factor.TAU ), 1, C, M, null );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( C, expected, 1e-14, 'column-major C' );

	// Row-major wrapper with WORK = null (A is N-by-K, C is M-by-N)...
	Arow = new Float64Array( N * K );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < K; j++ ) {
			Arow[ ( i * K ) + j ] = ql_factor.A[ i + ( j * N ) ];
		}
	}
	Crow = new Float64Array( M * N );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Crow[ ( i * N ) + j ] = C0[ i + ( j * M ) ];
		}
	}
	info = dormql( 'row-major', 'right', 'transpose', M, N, K, Arow, K, new Float64Array( ql_factor.TAU ), 1, Crow, N, null );
	assert.equal( info, 0, 'INFO' );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			assertClose( Crow[ ( i * N ) + j ], expected[ i + ( j * M ) ], 1e-14, 'row-major C[' + i + ',' + j + ']' );
		}
	}
});
