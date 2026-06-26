/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlacn2 from './../lib/ndarray.js';


// HELPERS //

function applyA( A, x, y, N ) {
	var i;
	var j;
	var s;
	for ( i = 0; i < N; i++ ) {
		s = 0.0;
		for ( j = 0; j < N; j++ ) {
			s += A[ ( i * N ) + j ] * x[ j ];
		}
		y[ i ] = s;
	}
}

function applyAT( A, x, y, N ) {
	var i;
	var j;
	var s;
	for ( i = 0; i < N; i++ ) {
		s = 0.0;
		for ( j = 0; j < N; j++ ) {
			s += A[ ( j * N ) + i ] * x[ j ];
		}
		y[ i ] = s;
	}
}

function drive( N, A, V, X, ISGN, EST, KASE, ISAVE ) {
	var iters;
	var tmp;
	var i;

	iters = 0;
	tmp = new Float64Array( N );
	while ( true ) {
		dlacn2( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
		if ( KASE[ 0 ] === 0 ) {
			break;
		}
		iters += 1;
		if ( KASE[ 0 ] === 1 ) {
			applyA( A, X, tmp, N );
		} else {
			applyAT( A, X, tmp, N );
		}
		for ( i = 0; i < N; i++ ) {
			X[ i ] = tmp[ i ];
		}
		if ( iters > 100 ) {
			throw new Error( 'iter cap' );
		}
	}
	return iters;
}

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlacn2, 'function', 'main export is a function' );
});

test( 'dlacn2: N=0 quick return', function t() {
	var ISAVE = new Int32Array( 3 );
	var ISGN = new Int32Array( 1 );
	var KASE = new Int32Array( 1 );
	var EST = new Float64Array( 1 );
	var V = new Float64Array( 1 );
	var X = new Float64Array( 1 );
	dlacn2( 0, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( KASE[ 0 ], 0 );
});

test( 'dlacn2: throws RangeError for negative N', function t() {
	var ISAVE = new Int32Array( 3 );
	var ISGN = new Int32Array( 1 );
	var KASE = new Int32Array( 1 );
	var EST = new Float64Array( 1 );
	var V = new Float64Array( 1 );
	var X = new Float64Array( 1 );
	assert.throws( function throws() {
		dlacn2( -1, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	}, RangeError );
});

test( 'dlacn2: N=1 quick return inside main loop', function t() {
	var N = 1;
	var A = [ 7.0 ];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( close( EST[ 0 ], 7.0, 1e-12 ), 'est = ||A||_1 for 1x1' );
	assert.strictEqual( KASE[ 0 ], 0 );
});

test( 'dlacn2: identity 3x3', function t() {
	var N = 3;
	var A = [
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( close( EST[ 0 ], 1.0, 1e-9 ), 'est ~ 1' );
});

test( 'dlacn2: diag(1,2,3,4) 4x4', function t() {
	var N = 4;
	var A = [
		1.0, 0.0, 0.0, 0.0,
		0.0, 2.0, 0.0, 0.0,
		0.0, 0.0, 3.0, 0.0,
		0.0, 0.0, 0.0, 4.0
	];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] >= 1.0 && EST[ 0 ] <= 4.0 + 1e-9 );
});

test( 'dlacn2: diag(1..5) 5x5', function t() {
	var N = 5;
	var A = new Array( N * N );
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	var i;
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = 0.0;
	}
	for ( i = 0; i < N; i++ ) {
		A[ ( i * N ) + i ] = i + 1;
	}
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] >= 1.0 && EST[ 0 ] <= 5.0 + 1e-9 );
});

test( 'dlacn2: dense 3x3', function t() {
	var N = 3;
	var A = [
		1.0, 2.0, 3.0,
		4.0, 5.0, 6.0,
		7.0, 8.0, 9.0
	];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 18.0 + 1e-9 );
});

test( 'dlacn2: upper triangular 4x4', function t() {
	var N = 4;
	var A = [
		1.0, 1.0, 1.0, 1.0,
		0.0, 1.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 0.0, 1.0
	];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 4.0 + 1e-9 );
});

test( 'dlacn2: sign-cycling path', function t() {
	var N = 4;
	var A = [
		1.0, -1.0, 1.0, -1.0,
		1.0, 1.0, -1.0, -1.0,
		1.0, -1.0, -1.0, 1.0,
		1.0, 1.0, 1.0, 1.0
	];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] > 0.0 );
	assert.strictEqual( KASE[ 0 ], 0 );
});

test( 'dlacn2: large 8x8 to exercise iteration cap', function t() {
	var N = 8;
	var A = new Array( N * N );
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ ( i * N ) + j ] = 1.0 + ( ( ( i * 7 ) + ( j * 3 ) ) % 5 );
		}
	}
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'dlacn2: zero matrix', function t() {
	var N = 3;
	var A = [
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0
	];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( close( EST[ 0 ], 0.0, 1e-12 ) );
});

test( 'dlacn2: matrix with negative entries', function t() {
	var N = 4;
	var A = [
		-2.0, -1.0, -1.0, -1.0,
		-1.0, -2.0, -1.0, -1.0,
		-1.0, -1.0, -2.0, -1.0,
		-1.0, -1.0, -1.0, -2.0
	];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'dlacn2: tridiagonal 5x5', function t() {
	var N = 5;
	var A = [
		2.0, 1.0, 0.0, 0.0, 0.0,
		1.0, 2.0, 1.0, 0.0, 0.0,
		0.0, 1.0, 2.0, 1.0, 0.0,
		0.0, 0.0, 1.0, 2.0, 1.0,
		0.0, 0.0, 0.0, 1.0, 2.0
	];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 4.0 + 1e-9 );
});

test( 'dlacn2: constant matrix all-ones (sign cycling)', function t() {
	var N = 4;
	var A = [
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0
	];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'dlacn2: hilbert-like 6x6', function t() {
	var N = 6;
	var A = new Array( N * N );
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ ( i * N ) + j ] = 1.0 / ( i + j + 1 );
		}
	}
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'dlacn2: diag with one large entry', function t() {
	var N = 5;
	var A = [
		1.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 9.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 1.0
	];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	drive( N, A, V, X, ISGN, EST, KASE, ISAVE );
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 9.0 + 1e-9 );
});

test( 'dlacn2: enter with KASE=1, ISAVE[0]=1 (continuation)', function t() {
	var N = 3;
	var V = new Float64Array( N );
	var X = new Float64Array( [ 0.5, -0.5, 1.0 ] );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( [ 1 ] );
	var ISAVE = new Int32Array( [ 1, 0, 0 ] );
	dlacn2( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.ok( EST[ 0 ] > 0.0 );
	assert.strictEqual( KASE[ 0 ], 2 );
	assert.strictEqual( ISGN[ 0 ], 1 );
	assert.strictEqual( ISGN[ 1 ], -1 );
	assert.strictEqual( ISGN[ 2 ], 1 );
});

test( 'dlacn2: enter with KASE=2, ISAVE[0]=2 (continuation)', function t() {
	var N = 3;
	var V = new Float64Array( N );
	var X = new Float64Array( [ 0.1, 1.5, 0.3 ] );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( [ 2 ] );
	var ISAVE = new Int32Array( [ 2, 0, 0 ] );
	dlacn2( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( KASE[ 0 ], 1 );
	assert.strictEqual( X[ 0 ], 0.0 );
	assert.strictEqual( X[ 1 ], 1.0 );
	assert.strictEqual( X[ 2 ], 0.0 );
});

test( 'dlacn2: case-3 cycling path (signs match)', function t() {
	var N = 3;
	var V = new Float64Array( N );
	var X = new Float64Array( [ 0.5, 0.5, 0.5 ] );
	var ISGN = new Int32Array( [ 1, 1, 1 ] );
	var EST = new Float64Array( [ 1.0 ] );
	var KASE = new Int32Array( [ 1 ] );
	var ISAVE = new Int32Array( [ 3, 0, 2 ] );
	dlacn2( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( ISAVE[ 0 ], 5 );
	assert.strictEqual( KASE[ 0 ], 1 );
});

test( 'dlacn2: case-3 EST<=estold falls through to final', function t() {
	var N = 4;
	var V = new Float64Array( N );
	var X = new Float64Array( [ 0.01, -0.01, 0.01, -0.01 ] );
	var ISGN = new Int32Array( [ 1, 1, 1, 1 ] );
	var EST = new Float64Array( [ 1000.0 ] );
	var KASE = new Int32Array( [ 1 ] );
	var ISAVE = new Int32Array( [ 3, 0, 2 ] );
	dlacn2( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( ISAVE[ 0 ], 5 );
	assert.strictEqual( KASE[ 0 ], 1 );
});

test( 'dlacn2: case-3 sign-update branch (to case 4)', function t() {
	var N = 4;
	var V = new Float64Array( N );
	var X = new Float64Array( [ 1.0, -2.0, 3.0, 4.0 ] );
	var ISGN = new Int32Array( [ 1, 1, 1, 1 ] );
	var EST = new Float64Array( [ 0.5 ] );
	var KASE = new Int32Array( [ 1 ] );
	var ISAVE = new Int32Array( [ 3, 0, 2 ] );
	dlacn2( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( ISAVE[ 0 ], 4 );
	assert.strictEqual( KASE[ 0 ], 2 );
});

test( 'dlacn2: case-4 continue branch', function t() {
	var N = 4;
	var V = new Float64Array( N );
	var X = new Float64Array( [ 1.0, 5.0, 2.0, 3.0 ] );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( [ 1.0 ] );
	var KASE = new Int32Array( [ 2 ] );
	var ISAVE = new Int32Array( [ 4, 0, 2 ] );
	dlacn2( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( ISAVE[ 0 ], 3 );
	assert.strictEqual( ISAVE[ 2 ], 3 );
	assert.strictEqual( KASE[ 0 ], 1 );
});

test( 'dlacn2: case-4 fall-through to final after iter==ITMAX', function t() {
	var N = 4;
	var V = new Float64Array( N );
	var X = new Float64Array( [ 1.0, 5.0, 2.0, 3.0 ] );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( [ 1.0 ] );
	var KASE = new Int32Array( [ 2 ] );
	var ISAVE = new Int32Array( [ 4, 0, 5 ] );
	dlacn2( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( ISAVE[ 0 ], 5 );
	assert.strictEqual( KASE[ 0 ], 1 );
});

test( 'dlacn2: case-5 temp>EST update', function t() {
	var N = 3;
	var V = new Float64Array( N );
	var X = new Float64Array( [ 100.0, 100.0, 100.0 ] );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( [ 1.0 ] );
	var KASE = new Int32Array( [ 1 ] );
	var ISAVE = new Int32Array( [ 5, 0, 0 ] );
	dlacn2( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( KASE[ 0 ], 0 );
	assert.ok( EST[ 0 ] > 60.0 );
	assert.strictEqual( V[ 0 ], 100.0 );
});

test( 'dlacn2: case-5 temp<=EST (no update)', function t() {
	var N = 3;
	var V = new Float64Array( N );
	var X = new Float64Array( [ 0.1, 0.1, 0.1 ] );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( [ 1000.0 ] );
	var KASE = new Int32Array( [ 1 ] );
	var ISAVE = new Int32Array( [ 5, 0, 0 ] );
	dlacn2( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( KASE[ 0 ], 0 );
	assert.strictEqual( EST[ 0 ], 1000.0 );
});

test( 'dlacn2: with non-unit strides', function t() {
	var N = 3;
	var A = [
		2.0, 0.0, 0.0,
		0.0, 3.0, 0.0,
		0.0, 0.0, 1.0
	];
	var sV = 2;
	var sX = 2;
	var sI = 2;
	var sS = 2;
	var V = new Float64Array( N * sV );
	var X = new Float64Array( N * sX );
	var ISGN = new Int32Array( N * sI );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 * sS );
	var tmp = new Float64Array( N );
	var iters = 0;
	var i;
	var xx;
	while ( true ) {
		dlacn2( N, V, sV, 0, X, sX, 0, ISGN, sI, 0, EST, KASE, ISAVE, sS, 0 );
		if ( KASE[ 0 ] === 0 ) {
			break;
		}
		iters += 1;
		xx = new Float64Array( N );
		for ( i = 0; i < N; i++ ) {
			xx[ i ] = X[ i * sX ];
		}
		if ( KASE[ 0 ] === 1 ) {
			applyA( A, xx, tmp, N );
		} else {
			applyAT( A, xx, tmp, N );
		}
		for ( i = 0; i < N; i++ ) {
			X[ i * sX ] = tmp[ i ];
		}
		if ( iters > 100 ) {
			throw new Error( 'iter cap' );
		}
	}
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 3.0 + 1e-9 );
});
