
// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunmql from './../lib/ndarray.js';


// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok(Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ]);
	}
}


// TESTS //

test( 'zunmql: main export is a function', function t() {
	assert.strictEqual( typeof zunmql, 'function' );
});

test( 'zunmql: M=0 quick return', function t() {
	const info = zunmql( 'left', 'no-transpose', 0, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0);
	assert.strictEqual( info, 0 );
});

test( 'zunmql: N=0 quick return', function t() {
	const info = zunmql( 'left', 'no-transpose', 1, 0, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0);
	assert.strictEqual( info, 0 );
});

test( 'zunmql: K=0 quick return', function t() {
	const C = new Complex128Array( [ 1, 2, 3, 4 ] );
	const Cv = reinterpret( C, 0 );
	const info = zunmql( 'left', 'no-transpose', 2, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 0 ), 1, 0, C, 1, 1, 0, new Complex128Array( 1 ), 1, 0);
	assert.strictEqual( info, 0 );
	assert.strictEqual( Cv[ 0 ], 1 );
	assert.strictEqual( Cv[ 1 ], 2 );
});

test( 'zunmql: left, no-transpose, 2x1, K=1 (unblocked path)', function t() {
	// Same as zunm2l test: v=[0;1], tau=2 => H=diag(1,-1)
	// C=[5;3], Q*C = H*C = [5;-3]
	const A = new Complex128Array( [ 0, 0, 99, 0 ] );
	const TAU = new Complex128Array( [ 2, 0 ] );
	const C = new Complex128Array( [ 5, 0, 3, 0 ] );
	const WORK = new Complex128Array( 128 );
	const Cv = reinterpret( C, 0 );

	const info = zunmql( 'left', 'no-transpose', 2, 1, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 5, 0, -3, 0 ], 1e-14, 'C' );
});

test( 'zunmql: left, conjugate-transpose, 2x1, K=1', function t() {
	// H = diag(1,-1), real symmetric, so H^H = H
	const A = new Complex128Array( [ 0, 0, 99, 0 ] );
	const TAU = new Complex128Array( [ 2, 0 ] );
	const C = new Complex128Array( [ 5, 0, 3, 0 ] );
	const WORK = new Complex128Array( 128 );
	const Cv = reinterpret( C, 0 );

	const info = zunmql( 'left', 'conjugate-transpose', 2, 1, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 5, 0, -3, 0 ], 1e-14, 'C' );
});

test( 'zunmql: right, no-transpose, 1x2, K=1', function t() {
	// C*Q = C*H = [5, 3] * diag(1,-1) = [5, -3]
	const A = new Complex128Array( [ 0, 0, 99, 0 ] );
	const TAU = new Complex128Array( [ 2, 0 ] );
	const C = new Complex128Array( [ 5, 0, 3, 0 ] );
	const WORK = new Complex128Array( 128 );
	const Cv = reinterpret( C, 0 );

	const info = zunmql( 'right', 'no-transpose', 1, 2, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 5, 0, -3, 0 ], 1e-14, 'C' );
});

test( 'zunmql: right, conjugate-transpose, 1x2, K=1', function t() {
	const A = new Complex128Array( [ 0, 0, 99, 0 ] );
	const TAU = new Complex128Array( [ 2, 0 ] );
	const C = new Complex128Array( [ 5, 0, 3, 0 ] );
	const WORK = new Complex128Array( 128 );
	const Cv = reinterpret( C, 0 );

	const info = zunmql( 'right', 'conjugate-transpose', 1, 2, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 5, 0, -3, 0 ], 1e-14, 'C' );
});

test( 'zunmql: left, no-transpose, 3x2, K=2 (unblocked path)', function t() {
	// Same test as zunm2l: K=2, v0 identity, v1=[0;0;1], tau1=2
	// Q = diag(1,1,-1)
	const A = new Complex128Array( 3 * 2 );
	const Av = reinterpret( A, 0 );
	const TAU = new Complex128Array( 2 );
	const TAUv = reinterpret( TAU, 0 );
	const C = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0 ] );
	const WORK = new Complex128Array( 256 );
	const Cv = reinterpret( C, 0 );

	Av[ 0 ] = 0; Av[ 1 ] = 0;
	Av[ 2 ] = 99; Av[ 3 ] = 0;
	Av[ 4 ] = 0; Av[ 5 ] = 0;
	Av[ 6 ] = 0; Av[ 7 ] = 0;
	Av[ 8 ] = 0; Av[ 9 ] = 0;
	Av[ 10 ] = 99; Av[ 11 ] = 0;

	TAUv[ 0 ] = 0; TAUv[ 1 ] = 0;
	TAUv[ 2 ] = 2; TAUv[ 3 ] = 0;

	const info = zunmql( 'left', 'no-transpose', 3, 2, 2, A, 1, 3, 0, TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 1, 0, 2, 0, -3, 0, 4, 0, 5, 0, -6, 0 ], 1e-14, 'C' );
});

test( 'zunmql: left, no-transpose, complex tau', function t() {
	// M=2, N=1, K=1. v = [1; 1], tau = 1+0i
	// H = I - 1*[1;1]*[1,1] = [0 -1; -1 0]
	// C = [2; 3], H*C = [-3; -2]
	const A = new Complex128Array( [ 1, 0, 99, 0 ] );
	const TAU = new Complex128Array( [ 1, 0 ] );
	const C = new Complex128Array( [ 2, 0, 3, 0 ] );
	const WORK = new Complex128Array( 128 );
	const Cv = reinterpret( C, 0 );

	const info = zunmql( 'left', 'no-transpose', 2, 1, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ -3, 0, -2, 0 ], 1e-14, 'C' );
});

test( 'zunmql: left, no-transpose, blocked path (K=33 > NB=32)', function t() {
	// K=33 forces the blocked code path (NB=32, so nb < K).
	// Use all tau=0 so Q=I and C is unchanged — tests the blocked
	// Machinery without requiring a complex numerical reference.
	const M = 33;
	const N = 2;
	const K = 33;
	const A = new Complex128Array( M * K ); // M x K column-major
	const TAU = new Complex128Array( K );   // all zeros (identity reflectors)
	const C = new Complex128Array( M * N );
	const Cv = reinterpret( C, 0 );
	const WORK = new Complex128Array( 4096 );
	const expected = [];
	let i;

	// Fill C with known values
	for ( i = 0; i < M * N * 2; i++ ) {
		Cv[ i ] = i + 1;
	}
	// Save expected (C unchanged since all tau=0)
	for ( i = 0; i < Cv.length; i++ ) {
		expected.push( Cv[ i ] );
	}

	const info = zunmql( 'left', 'no-transpose', M, N, K, A, 1, M, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), expected, 1e-14, 'C blocked' );
});

test( 'zunmql: left, conjugate-transpose, blocked path (K=33)', function t() {
	// Same but with conjugate-transpose, exercises the backward iteration
	const M = 33;
	const N = 2;
	const K = 33;
	const A = new Complex128Array( M * K );
	const TAU = new Complex128Array( K );
	const C = new Complex128Array( M * N );
	const Cv = reinterpret( C, 0 );
	const WORK = new Complex128Array( 4096 );
	const expected = [];
	let i;

	for ( i = 0; i < M * N * 2; i++ ) {
		Cv[ i ] = i + 1;
	}
	for ( i = 0; i < Cv.length; i++ ) {
		expected.push( Cv[ i ] );
	}

	const info = zunmql( 'left', 'conjugate-transpose', M, N, K, A, 1, M, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), expected, 1e-14, 'C blocked conj-trans' );
});

test( 'zunmql: right, no-transpose, blocked path (K=33)', function t() {
	// side=right exercises the !left branches
	const M = 2;
	const N = 33;
	const K = 33;
	const A = new Complex128Array( N * K );
	const TAU = new Complex128Array( K );
	const C = new Complex128Array( M * N );
	const Cv = reinterpret( C, 0 );
	const WORK = new Complex128Array( 4096 );
	const expected = [];
	let i;

	for ( i = 0; i < M * N * 2; i++ ) {
		Cv[ i ] = i + 1;
	}
	for ( i = 0; i < Cv.length; i++ ) {
		expected.push( Cv[ i ] );
	}

	const info = zunmql( 'right', 'no-transpose', M, N, K, A, 1, N, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), expected, 1e-14, 'C blocked right' );
});
