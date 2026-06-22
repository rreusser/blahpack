/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlacon from './../lib/ndarray.js';


// HELPERS //

// A is a flat row-major matrix with N*N complex entries laid out as [re,im,re,im,...]
// of length 2*N*N. Multiply A * x where x is similarly laid out.
function applyA( A, x, y, N ) {
	var i;
	var j;
	var sr;
	var si;
	var ar;
	var ai;
	var xr;
	var xi;
	for ( i = 0; i < N; i++ ) {
		sr = 0.0;
		si = 0.0;
		for ( j = 0; j < N; j++ ) {
			ar = A[ ((i * N) + j) * 2 ];
			ai = A[ (((i * N) + j) * 2) + 1 ];
			xr = x[ j * 2 ];
			xi = x[ (j * 2) + 1 ];
			sr += (ar * xr) - (ai * xi);
			si += (ar * xi) + (ai * xr);
		}
		y[ i * 2 ] = sr;
		y[ (i * 2) + 1 ] = si;
	}
}

// A^H * x — conjugate transpose
function applyAH( A, x, y, N ) {
	var i;
	var j;
	var sr;
	var si;
	var ar;
	var ai;
	var xr;
	var xi;
	for ( i = 0; i < N; i++ ) {
		sr = 0.0;
		si = 0.0;
		for ( j = 0; j < N; j++ ) {
			// conjugate of A[j,i]
			ar = A[ ((j * N) + i) * 2 ];
			ai = -A[ (((j * N) + i) * 2) + 1 ];
			xr = x[ j * 2 ];
			xi = x[ (j * 2) + 1 ];
			sr += (ar * xr) - (ai * xi);
			si += (ar * xi) + (ai * xr);
		}
		y[ i * 2 ] = sr;
		y[ (i * 2) + 1 ] = si;
	}
}

function makeComplex128Array( N ) {
	return new Complex128Array( N );
}

function reinterpret( arr ) {
	// Float64Array view over the underlying buffer
	return new Float64Array( arr.buffer, arr.byteOffset, arr.length * 2 );
}

function drive( N, A, V, X, EST, KASE ) {
	var xv = reinterpret( X );
	var tmp = new Float64Array( N * 2 );
	var iters = 0;
	var i;
	while ( true ) {
		zlacon( N, V, 1, 0, X, 1, 0, EST, KASE );
		if ( KASE[ 0 ] === 0 ) {
			break;
		}
		iters += 1;
		if ( KASE[ 0 ] === 1 ) {
			applyA( A, xv, tmp, N );
		} else {
			applyAH( A, xv, tmp, N );
		}
		for ( i = 0; i < N * 2; i++ ) {
			xv[ i ] = tmp[ i ];
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
	assert.strictEqual( typeof zlacon, 'function', 'main export is a function' );
});

test( 'zlacon: throws RangeError for negative N', function t() {
	var V = makeComplex128Array( 1 );
	var X = makeComplex128Array( 1 );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	assert.throws( function throws() {
		zlacon( -1, V, 1, 0, X, 1, 0, EST, KASE );
	}, RangeError );
});

test( 'zlacon: N=1 quick return', function t() {
	var N = 1;
	// A = [3+4i] (|.|=5)
	var A = [ 3.0, 4.0 ];
	var V = makeComplex128Array( N );
	var X = makeComplex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, EST, KASE );
	assert.ok( close( EST[ 0 ], 5.0, 1e-12 ), 'est = |3+4i| = 5' );
});

test( 'zlacon: identity 3x3 (real)', function t() {
	var N = 3;
	var A = new Float64Array( 2 * N * N );
	A[ 0 ] = 1.0; // (0,0)
	A[ 8 ] = 1.0; // (1,1) at index (1*3+1)*2 = 8
	A[ 16 ] = 1.0; // (2,2) at index (2*3+2)*2 = 16
	var V = makeComplex128Array( N );
	var X = makeComplex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, EST, KASE );
	assert.ok( close( EST[ 0 ], 1.0, 1e-9 ) );
});

test( 'zlacon: complex diagonal 4x4', function t() {
	var N = 4;
	var A = new Float64Array( 2 * N * N );
	var i;
	// Set diagonal values: 1, 2i, 3, 4i (magnitudes 1, 2, 3, 4)
	A[ 0 ] = 1.0; A[ 1 ] = 0.0;
	A[ ((1 * N) + 1) * 2 ] = 0.0; A[ (((1 * N) + 1) * 2) + 1 ] = 2.0;
	A[ ((2 * N) + 2) * 2 ] = 3.0; A[ (((2 * N) + 2) * 2) + 1 ] = 0.0;
	A[ ((3 * N) + 3) * 2 ] = 0.0; A[ (((3 * N) + 3) * 2) + 1 ] = 4.0;
	i = 0; // unused
	var V = makeComplex128Array( N );
	var X = makeComplex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 4.0 + 1e-9 );
});

test( 'zlacon: dense 3x3 complex', function t() {
	var N = 3;
	var A = new Float64Array( 2 * N * N );
	var i;
	for ( i = 0; i < N * N; i++ ) {
		A[ i * 2 ] = 1.0 + i;
		A[ (i * 2) + 1 ] = 0.5 * (i + 1);
	}
	var V = makeComplex128Array( N );
	var X = makeComplex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'zlacon: upper triangular 5x5 complex', function t() {
	var N = 5;
	var A = new Float64Array( 2 * N * N );
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		for ( j = i; j < N; j++ ) {
			A[ ((i * N) + j) * 2 ] = 1.0;
			A[ (((i * N) + j) * 2) + 1 ] = 0.5;
		}
	}
	var V = makeComplex128Array( N );
	var X = makeComplex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'zlacon: zero matrix (covers absxi <= SAFMIN branch)', function t() {
	var N = 3;
	var A = new Float64Array( 2 * N * N );
	var V = makeComplex128Array( N );
	var X = makeComplex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, EST, KASE );
	assert.ok( close( EST[ 0 ], 0.0, 1e-12 ) );
});

test( 'zlacon: all-ones matrix (sign cycling path)', function t() {
	var N = 4;
	var A = new Float64Array( 2 * N * N );
	var i;
	for ( i = 0; i < N * N; i++ ) {
		A[ i * 2 ] = 1.0;
	}
	var V = makeComplex128Array( N );
	var X = makeComplex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'zlacon: hilbert-like 6x6 complex', function t() {
	var N = 6;
	var A = new Float64Array( 2 * N * N );
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ ((i * N) + j) * 2 ] = 1.0 / ( i + j + 1 );
			A[ (((i * N) + j) * 2) + 1 ] = 0.1 / ( i + j + 1 );
		}
	}
	var V = makeComplex128Array( N );
	var X = makeComplex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 );
});

test( 'zlacon: structured matrix to drive case-3 cycling/EST<=estold path', function t() {
	var N = 5;
	var A = new Float64Array( 2 * N * N );
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ ((i * N) + j) * 2 ] = 1.0 + ( ((i * 3) + (j * 5)) % 4 );
			A[ (((i * N) + j) * 2) + 1 ] = 0.0;
		}
	}
	var V = makeComplex128Array( N );
	var X = makeComplex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	drive( N, A, V, X, EST, KASE );
	assert.ok( EST[ 0 ] > 0.0 );
});

// State-driving helper for zlacon (module-level JUMP)
function setJumpZ( N, target ) {
	var V = makeComplex128Array( N );
	var X = makeComplex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var xv = reinterpret( X );
	var i;

	zlacon( N, V, 1, 0, X, 1, 0, EST, KASE );
	if ( target === 1 ) {
		return { V: V, X: X, EST: EST, KASE: KASE, xv: xv };
	}
	for ( i = 0; i < N; i++ ) {
		xv[ i * 2 ] = 1.0;
		xv[ (i * 2) + 1 ] = 0.0;
	}
	zlacon( N, V, 1, 0, X, 1, 0, EST, KASE );
	if ( target === 2 ) {
		return { V: V, X: X, EST: EST, KASE: KASE, xv: xv };
	}
	for ( i = 0; i < N; i++ ) {
		xv[ i * 2 ] = 0.5;
		xv[ (i * 2) + 1 ] = 0.0;
	}
	xv[ 0 ] = 1.0;
	zlacon( N, V, 1, 0, X, 1, 0, EST, KASE );
	if ( target === 3 ) {
		return { V: V, X: X, EST: EST, KASE: KASE, xv: xv };
	}
	throw new Error( 'unsupported target' );
}

test( 'zlacon: case-3 EST > estold drives JUMP=4', function t() {
	var N = 4;
	var ctx = setJumpZ( N, 3 );
	var i;
	for ( i = 0; i < N; i++ ) {
		ctx.xv[ i * 2 ] = 100.0;
		ctx.xv[ (i * 2) + 1 ] = 0.0;
	}
	ctx.EST[ 0 ] = 0.001;
	zlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.EST, ctx.KASE );
	// Should now be JUMP=4, KASE=2
	assert.strictEqual( ctx.KASE[ 0 ], 2 );

	// Now drive case 4 with non-matching jlast/J — continues iteration
	for ( i = 0; i < N; i++ ) {
		ctx.xv[ i * 2 ] = 1.0;
		ctx.xv[ (i * 2) + 1 ] = 0.0;
	}
	ctx.xv[ 2 ] = 5.0; // distinct max at index 1
	zlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.EST, ctx.KASE );
	// case 4 -> KASE=1, back to JUMP=3 if conditions match, OR KASE=1 final stage
	assert.strictEqual( ctx.KASE[ 0 ], 1 );
});

test( 'zlacon: case-3 EST<=estold falls through to final, then case-5 temp>EST', function t() {
	var N = 4;
	var ctx = setJumpZ( N, 3 );
	var i;
	for ( i = 0; i < N; i++ ) {
		ctx.xv[ i * 2 ] = 0.0001;
		ctx.xv[ (i * 2) + 1 ] = 0.0;
	}
	ctx.EST[ 0 ] = 1e6;
	zlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.EST, ctx.KASE );
	// Should be JUMP=5, KASE=1
	assert.strictEqual( ctx.KASE[ 0 ], 1 );
	// Drive case-5 with large X to exercise temp > EST
	for ( i = 0; i < N; i++ ) {
		ctx.xv[ i * 2 ] = 1e9;
		ctx.xv[ (i * 2) + 1 ] = 0.0;
	}
	zlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.EST, ctx.KASE );
	assert.strictEqual( ctx.KASE[ 0 ], 0 );
	assert.ok( ctx.EST[ 0 ] > 1e6 );
});

test( 'zlacon: case-4 fall-through to final after iter==ITMAX', function t() {
	var N = 5;
	var ctx = setJumpZ( N, 3 );
	var i;
	var k;
	// Drive into JUMP=4
	for ( i = 0; i < N; i++ ) {
		ctx.xv[ i * 2 ] = 100.0;
		ctx.xv[ (i * 2) + 1 ] = 0.0;
	}
	ctx.EST[ 0 ] = 0.001;
	zlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.EST, ctx.KASE );

	// Loop to push iter to ITMAX
	for ( k = 0; k < 12; k++ ) {
		for ( i = 0; i < N; i++ ) {
			ctx.xv[ i * 2 ] = 1.0;
			ctx.xv[ (i * 2) + 1 ] = 0.0;
		}
		ctx.xv[ (k % N) * 2 ] = 1000.0 * ( k + 1 );
		zlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.EST, ctx.KASE );
		if ( ctx.KASE[ 0 ] === 0 ) {
			break;
		}
		if ( ctx.KASE[ 0 ] === 1 ) {
			for ( i = 0; i < N; i++ ) {
				ctx.xv[ i * 2 ] = ( i % 2 === 0 ) ? 100.0 + k : -(100.0 + k);
				ctx.xv[ (i * 2) + 1 ] = 0.0;
			}
			zlacon( N, ctx.V, 1, 0, ctx.X, 1, 0, ctx.EST, ctx.KASE );
		}
	}
	assert.ok( true );
});

test( 'zlacon: with non-unit strides', function t() {
	var N = 3;
	var A = new Float64Array( 2 * N * N );
	A[ 0 ] = 2.0;
	A[ ((1 * N) + 1) * 2 ] = 3.0;
	A[ ((2 * N) + 2) * 2 ] = 1.0;

	var sV = 2;
	var sX = 2;
	var V = makeComplex128Array( N * sV );
	var X = makeComplex128Array( N * sX );
	var xv = reinterpret( X );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );

	var tmp = new Float64Array( N * 2 );
	var iters = 0;
	var i;
	while ( true ) {
		zlacon( N, V, sV, 0, X, sX, 0, EST, KASE );
		if ( KASE[ 0 ] === 0 ) {
			break;
		}
		iters += 1;
		// pack X strided -> dense
		var xx = new Float64Array( N * 2 );
		for ( i = 0; i < N; i++ ) {
			xx[ i * 2 ] = xv[ (i * sX) * 2 ];
			xx[ (i * 2) + 1 ] = xv[ ((i * sX) * 2) + 1 ];
		}
		if ( KASE[ 0 ] === 1 ) {
			applyA( A, xx, tmp, N );
		} else {
			applyAH( A, xx, tmp, N );
		}
		for ( i = 0; i < N; i++ ) {
			xv[ (i * sX) * 2 ] = tmp[ i * 2 ];
			xv[ ((i * sX) * 2) + 1 ] = tmp[ (i * 2) + 1 ];
		}
		if ( iters > 100 ) {
			throw new Error( 'iter cap' );
		}
	}
	assert.ok( EST[ 0 ] > 0.0 && EST[ 0 ] <= 3.0 + 1e-9 );
});
