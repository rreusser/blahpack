/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormrq from './../lib/dormrq.js';
import dormrqNd from './../lib/ndarray.js';


// FIXTURES //

import rq_factor from './fixtures/rq_factor.json' with { type: 'json' };
import big_rq_factor from './fixtures/big_rq_factor.json' with { type: 'json' };
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

function getRQFactors() {
	// The fixture holds the first 12 entries of the 4-by-4 (LDA=4) array: K=3 rows of a 3-by-4 RQ factor; column 4 only carries the implicit unit of the last reflector.
	const A = new Float64Array( 16 );
	let j;
	for ( j = 0; j < 12; j++ ) {
		A[ j ] = rq_factor.A[ j ];
	}
	return A;
}


// TESTS //

test( 'dormrq is a function', function t() {
	assert.strictEqual( typeof dormrq, 'function', 'is a function' );
});

test( 'dormrq has expected arity', function t() {
	assert.strictEqual( dormrq.length, 13, 'has expected arity' );
});

test( 'dormrq throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormrq( 'column-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormrq throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormrq( 'column-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormrq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormrq( 'column-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormrq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormrq( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormrq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dormrq( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormrq: WORK = null allocates the blocked workspace (K=40, both sides)', function t() {
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
		info = dormrq( 'column-major', sides[ s ], 'no-transpose', N, N, N, new Float64Array( big_rq_factor.A ), N, new Float64Array( big_rq_factor.TAU ), 1, C, N, null );
		assert.equal( info, fixtures[ s ].info, 'INFO' );
		assertArrayClose( C, fixtures[ s ].c, 1e-12, sides[ s ] );
	}
});

test( 'dormrq: WORK = null with side=right sizes the workspace by M (M > N)', function t() {
	const A = getRQFactors();
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
	dormrqNd( 'right', 'transpose', M, N, K, new Float64Array( A ), 1, 4, 0, new Float64Array( rq_factor.TAU ), 1, 0, expected, 1, M, 0, new Float64Array( 1000 ), 1, 0 );

	// Column-major wrapper with WORK = null...
	C = new Float64Array( C0 );
	info = dormrq( 'column-major', 'right', 'transpose', M, N, K, new Float64Array( A ), 4, new Float64Array( rq_factor.TAU ), 1, C, M, null );
	assert.equal( info, 0, 'INFO' );
	assertArrayClose( C, expected, 1e-14, 'column-major C' );

	// Row-major wrapper with WORK = null (A is K-by-N, C is M-by-N)...
	Arow = new Float64Array( K * N );
	for ( i = 0; i < K; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Arow[ ( i * N ) + j ] = A[ i + ( j * 4 ) ];
		}
	}
	Crow = new Float64Array( M * N );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Crow[ ( i * N ) + j ] = C0[ i + ( j * M ) ];
		}
	}
	info = dormrq( 'row-major', 'right', 'transpose', M, N, K, Arow, N, new Float64Array( rq_factor.TAU ), 1, Crow, N, null );
	assert.equal( info, 0, 'INFO' );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			assertClose( Crow[ ( i * N ) + j ], expected[ i + ( j * M ) ], 1e-14, 'row-major C[' + i + ',' + j + ']' );
		}
	}
});
