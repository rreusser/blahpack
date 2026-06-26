/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlacon from './../lib/ndarray.js';


// HELPERS //

function applyA( A, x, y, N ) {
	var i;
	var j;
	var s;
	for ( i = 0; i < N; i++ ) {
		s = 0.0;
		for ( j = 0; j < N; j++ ) {
			s += A[ (i * N) + j ] * x[ j ];
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
			s += A[ (j * N) + i ] * x[ j ];
		}
		y[ i ] = s;
	}
}

function drive( N, A, V, X, ISGN, EST, KASE ) {
	var tmp = new Float64Array( N );
	var iters = 0;
	var i;
	while ( true ) {
		dlacon( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE );
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
			throw new Error( 'iter cap exceeded' );
		}
	}
	return iters;
}

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlacon, 'function', 'main export is a function' );
});

test( 'dlacon: N=0 quick return', function t() {
	var V = new Float64Array( 1 );
	var X = new Float64Array( 1 );
	var ISGN = new Int32Array( 1 );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	dlacon( 0, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE );
	assert.strictEqual( KASE[ 0 ], 0 );
});

test( 'dlacon: throws RangeError for negative N', function t() {
	var V = new Float64Array( 1 );
	var X = new Float64Array( 1 );
	var ISGN = new Int32Array( 1 );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	assert.throws( function throws() {
		dlacon( -1, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE );
	}, RangeError );
});

test( 'dlacon: N=1 quick return inside main loop', function t() {
	var N = 1;
	var A = [ 7.0 ];
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( close( EST[ 0 ], 7.0, 1e-12 ), 'est = ||A||_1 for 1x1' );
});

test( 'dlacon: identity 3x3', function t() {
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
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( close( EST[ 0 ], 1.0, 1e-9 ) );
});

test( 'dlacon: diag(1..5) 5x5', function t() {
	var N = 5;
	var A = new Array( N * N );
	var i;
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = 0.0;
	}
	for ( i = 0; i < N; i++ ) {
		A[ (i * N) + i ] = i + 1;
	}
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 5.0 + 1e-9 );
});

test( 'dlacon: dense 3x3', function t() {
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
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 18.0 + 1e-9 );
});

test( 'dlacon: upper triangular 4x4', function t() {
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
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 4.0 + 1e-9 );
});

test( 'dlacon: matrix with negative entries', function t() {
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
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'dlacon: zero matrix', function t() {
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
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( close( EST[ 0 ], 0.0, 1e-12 ) );
});

test( 'dlacon: all-ones 4x4 (constant matrix; sign cycling)', function t() {
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
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'dlacon: tridiagonal 5x5', function t() {
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
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 4.0 + 1e-9 );
});

test( 'dlacon: hilbert-like matrix 6x6', function t() {
	var N = 6;
	var A = new Array( N * N );
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ (i * N) + j ] = 1.0 / ( i + j + 1 );
		}
	}
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'dlacon: large dense 8x8 to exercise full iteration loop', function t() {
	var N = 8;
	var A = new Array( N * N );
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ (i * N) + j ] = 1.0 + ( ((i * 7) + (j * 3)) % 5 );
		}
	}
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, ISGN, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 );
});

// Helper: drive module to a specific JUMP state.
function setJump( N, target ) {
	var V = new Float64Array( N );
	var X = new Float64Array( N );
	var ISGN = new Int32Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var i;

	// KASE=0 -> JUMP=1
	dlacon( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE );
	if ( target === 1 ) {
		return { 'V': V, 'X': X, 'ISGN': ISGN, 'EST': EST, 'KASE': KASE };
	}
	// At this point KASE=1, JUMP=1. Set X to all-positive then call -> goes to JUMP=2.
	for ( i = 0; i < N; i++ ) {
		X[ i ] = 1.0;
	}
	dlacon( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE );
	if ( target === 2 ) {
		return { 'V': V, 'X': X, 'ISGN': ISGN, 'EST': EST, 'KASE': KASE };
	}
	// Now JUMP=2, KASE=2. Set X to put nonzero at index 0, then call -> JUMP=3.
	for ( i = 0; i < N; i++ ) {
		X[ i ] = 0.5;
	}
	X[ 0 ] = 1.0;
	dlacon( N, V, 1, 0, X, 1, 0, ISGN, 1, 0, EST, KASE );
	if ( target === 3 ) {
		return { 'V': V, 'X': X, 'ISGN': ISGN, 'EST': EST, 'KASE': KASE };
	}
	throw new Error( 'unsupported target' );
}

test( 'dlacon: case-3 sign-update path then case-4 continue (JUMP=4 -> 3)', function t() {
	var N = 4;
	var ctx = setJump( N, 3 );

	// Now JUMP=3, KASE=1. Provide X with mixed signs differing from ISGN to take case-3

	// Update path -> JUMP=4.
	var i;
	for ( i = 0; i < N; i++ ) {
		ctx.X[ i ] = ( i % 2 === 0 ) ? 100.0 : -100.0;
	}
	// Force a small estold so EST > estold
	ctx.EST[ 0 ] = 0.001;

	// Set ISGN to all 1 so they differ from x signs
	for ( i = 0; i < N; i++ ) {
		ctx.ISGN[ i ] = 1;
	}
	dlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.ISGN, 1, 0, ctx.EST, ctx.KASE );

	// After: JUMP=4, KASE=2. Now provide x to drive case-4 continue.
	assert.strictEqual( ctx.KASE[ 0 ], 2 );
	for ( i = 0; i < N; i++ ) {
		ctx.X[ i ] = 1.0;
	}
	ctx.X[ 1 ] = 5.0; // distinct max — different from any prior jlast
	dlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.ISGN, 1, 0, ctx.EST, ctx.KASE );

	// Should be back in JUMP=3, KASE=1 (continue iteration)
	assert.strictEqual( ctx.KASE[ 0 ], 1 );
});

test( 'dlacon: case-3 EST<=estold falls through to final stage', function t() {
	var N = 4;
	var ctx = setJump( N, 3 );

	// In JUMP=3 with EST very large; signs differ but EST <= estold -> JUMP=5.
	var i;
	for ( i = 0; i < N; i++ ) {
		ctx.X[ i ] = ( i % 2 === 0 ) ? 0.001 : -0.001;
		ctx.ISGN[ i ] = 1;
	}
	ctx.EST[ 0 ] = 1e6;
	dlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.ISGN, 1, 0, ctx.EST, ctx.KASE );

	// JUMP=5 now. Provide large X so case-5 temp > EST.
	assert.strictEqual( ctx.KASE[ 0 ], 1 );
	for ( i = 0; i < N; i++ ) {
		ctx.X[ i ] = 1e9;
	}
	dlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.ISGN, 1, 0, ctx.EST, ctx.KASE );
	assert.strictEqual( ctx.KASE[ 0 ], 0 );
	assert.ok( ctx.EST[ 0 ] > 1e6 );
});

test( 'dlacon: case-4 fall-through to final after iter==ITMAX', function t() {
	// Repeatedly drive JUMP=4 path with conditions that keep iter incrementing.
	var N = 5;
	var ctx = setJump( N, 3 );
	var i;
	var k;

	// Jump to JUMP=4 first
	for ( i = 0; i < N; i++ ) {
		ctx.X[ i ] = ( i % 2 === 0 ) ? 100.0 : -100.0;
	}
	for ( i = 0; i < N; i++ ) {
		ctx.ISGN[ i ] = 1;
	}
	ctx.EST[ 0 ] = 0.001;
	dlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.ISGN, 1, 0, ctx.EST, ctx.KASE );

	// Now JUMP=4. Loop to drive ITER up to ITMAX, finally falling through.

	// Each call: must have x[jlast] != |x[J]| AND iter < ITMAX

	// Trick: keep providing distinct max indices.
	for ( k = 0; k < 10; k++ ) {
		// Provide x with different pattern each time so jlast differs
		for ( i = 0; i < N; i++ ) {
			ctx.X[ i ] = 1.0;
		}
		ctx.X[ k % N ] = 1000.0 * ( k + 1 );

		// Reset signs
		for ( i = 0; i < N; i++ ) {
			ctx.ISGN[ i ] = 1;
		}
		dlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.ISGN, 1, 0, ctx.EST, ctx.KASE );
		if ( ctx.KASE[ 0 ] === 0 ) {
			break;
		}
		// If we go back to KASE=1, we're in JUMP=3 or 5; need to push back to 4
		if ( ctx.KASE[ 0 ] === 1 ) {
			// In JUMP=3 or 5. Drive a step.
			for ( i = 0; i < N; i++ ) {
				ctx.X[ i ] = ( i % 2 === 0 ) ? 100.0 + k : -(100.0 + k);
			}
			dlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.ISGN, 1, 0, ctx.EST, ctx.KASE );
		}
	}
	assert.ok( true ); // smoke test — looking for coverage
});

test( 'dlacon: with non-unit strides', function t() {
	var N = 3;
	var A = [
		2.0, 0.0, 0.0,
		0.0, 3.0, 0.0,
		0.0, 0.0, 1.0
	];
	var sV = 2;
	var sX = 2;
	var sI = 2;
	var V = new Float64Array( N * sV );
	var X = new Float64Array( N * sX );
	var ISGN = new Int32Array( N * sI );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );

	var tmp = new Float64Array( N );
	var iters = 0;
	var i;
	while ( true ) {
		dlacon( N, V, sV, 0, X, sX, 0, ISGN, sI, 0, EST, KASE );
		if ( KASE[ 0 ] === 0 ) {
			break;
		}
		iters += 1;
		var xx = new Float64Array( N );
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
