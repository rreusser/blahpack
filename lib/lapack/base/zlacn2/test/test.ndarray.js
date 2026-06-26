
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zlacn2 from './../lib/index.js';

// HELPERS //

/**
* Run the zlacn2 reverse communication loop for a given complex matrix A.
*
* @private
* @param {number} N - matrix order
* @param {Float64Array} Av - matrix A stored column-major as interleaved re/im Float64
* @param {string} [mode] - 'ndarray' to use ndarray API, else uses base via ndarray passthrough
* @returns {Object} - { est, iterations }
*/
function runEstimate( N, Av, mode ) {
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	var EST = new Float64Array( 1 );
	var V = new Complex128Array( N );
	var X = new Complex128Array( N );
	var tmp = new Complex128Array( N );
	var iter = 0;
	var one = new Complex128( 1.0, 0.0 );
	var zero = new Complex128( 0.0, 0.0 );

	KASE[ 0 ] = 0;
	EST[ 0 ] = 0.0;

	while ( true ) {
		zlacn2.ndarray( N, V, 1, 0, X, 1, 0, EST, KASE, ISAVE, 1, 0 );
		if ( KASE[ 0 ] === 0 ) {
			break;
		}
		iter += 1;
		if ( iter > 20 ) {
			break;
		}
		if ( KASE[ 0 ] === 1 ) {
			// tmp = A * X
			zgemv( 'no-transpose', N, N, one, new Complex128Array( Av.buffer ), 1, N, 0, X, 1, 0, zero, tmp, 1, 0 );

			// Copy tmp -> X
			copyCV( tmp, X, N );
		} else {
			// tmp = A^H * X
			zgemv( 'conjugate-transpose', N, N, one, new Complex128Array( Av.buffer ), 1, N, 0, X, 1, 0, zero, tmp, 1, 0 );
			copyCV( tmp, X, N );
		}
	}
	return { 'est': EST[ 0 ], 'iterations': iter };
}

/**
* Copy complex array src to dst.
*/
function copyCV( src, dst, N ) {
	var sv = reinterpret( src, 0 );
	var dv = reinterpret( dst, 0 );
	var i;
	for ( i = 0; i < N * 2; i++ ) {
		dv[ i ] = sv[ i ];
	}
}

/**
* Build a column-major Float64Array for a complex matrix from a 2D array of [re, im] pairs.
* entries[i][j] = [re, im] for row i, col j.
*/
function buildMatrix( N, entries ) {
	var A = new Float64Array( N * N * 2 );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ ( j * N + i ) * 2 ] = entries[ i ][ j ][ 0 ];
			A[ ( j * N + i ) * 2 + 1 ] = entries[ i ][ j ][ 1 ];
		}
	}
	return A;
}

// TESTS //

test( 'zlacn2: main export is a function', function t() {
	assert.strictEqual( typeof zlacn2, 'function' );
});

test( 'zlacn2: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlacn2.ndarray, 'function' );
});

test( 'zlacn2: 3x3 identity matrix (1-norm = 1)', function t() {
	var entries = [
		[ [1, 0], [0, 0], [0, 0] ],
		[ [0, 0], [1, 0], [0, 0] ],
		[ [0, 0], [0, 0], [1, 0] ]
	];
	var A = buildMatrix( 3, entries );
	var result = runEstimate( 3, A );

	// Fortran fixture: est=1.0, iterations=4
	assert.ok( Math.abs( result.est - 1.0 ) < 1e-10, 'est should be 1.0, got ' + result.est );
	assert.strictEqual( result.iterations, 4 );
});

test( 'zlacn2: 1x1 complex matrix (3+4i), 1-norm = 5', function t() {
	var A = new Float64Array( [ 3.0, 4.0 ] );
	var result = runEstimate( 1, A );

	// Fortran fixture: est=5.0, iterations=1
	assert.ok( Math.abs( result.est - 5.0 ) < 1e-10, 'est should be 5.0, got ' + result.est );
	assert.strictEqual( result.iterations, 1 );
});

test( 'zlacn2: 4x4 complex diagonal matrix, 1-norm = 5', function t() {
	// Diag = [(1,2), (3,4), (0,1), (2,0)]
	// |diag| = [sqrt(5), 5, 1, 2] => max = 5
	var entries = [
		[ [1, 2], [0, 0], [0, 0], [0, 0] ],
		[ [0, 0], [3, 4], [0, 0], [0, 0] ],
		[ [0, 0], [0, 0], [0, 1], [0, 0] ],
		[ [0, 0], [0, 0], [0, 0], [2, 0] ]
	];
	var A = buildMatrix( 4, entries );
	var result = runEstimate( 4, A );

	// Fortran fixture: est=5.0, iterations=5
	assert.ok( Math.abs( result.est - 5.0 ) < 1e-10, 'est should be 5.0, got ' + result.est );
	assert.strictEqual( result.iterations, 5 );
});

test( 'zlacn2: 3x3 dense complex matrix', function t() {
	// A = [[1+i, 2-i, 0], [0, 3+2i, -1+i], [4-3i, 0, 2+i]]
	var entries = [
		[ [1, 1], [2, -1], [0, 0] ],
		[ [0, 0], [3, 2], [-1, 1] ],
		[ [4, -3], [0, 0], [2, 1] ]
	];
	var A = buildMatrix( 3, entries );
	var result = runEstimate( 3, A );

	// Fortran fixture: est=5.84161925296377937, iterations=5
	assert.ok( Math.abs( result.est - 5.84161925296377937 ) < 1e-10, 'est should be ~5.8416, got ' + result.est );
	assert.strictEqual( result.iterations, 5 );
});

test( 'zlacn2: 5x5 upper triangular complex matrix', function t() {
	var entries = [
		[ [2, 1], [1, 0], [0, 1], [1, 1], [0, 0] ],
		[ [0, 0], [3, -1], [2, 0], [0, 0], [1, 2] ],
		[ [0, 0], [0, 0], [1, 1], [1, -1], [0, 0] ],
		[ [0, 0], [0, 0], [0, 0], [4, 0], [2, 1] ],
		[ [0, 0], [0, 0], [0, 0], [0, 0], [1, -2] ]
	];
	var A = buildMatrix( 5, entries );
	var result = runEstimate( 5, A );

	// Fortran fixture: est=6.82842712474618985, iterations=5
	assert.ok( Math.abs( result.est - 6.82842712474618985 ) < 1e-10, 'est should be ~6.828, got ' + result.est );
	assert.strictEqual( result.iterations, 5 );
});

test( 'zlacn2: KASE=0 initializes X to 1/N and sets KASE=1', function t() {
	// Test the initial call directly
	var N = 3;
	var V = new Complex128Array( N );
	var X = new Complex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	var xv;
	var i;

	KASE[ 0 ] = 0;
	zlacn2.ndarray( N, V, 1, 0, X, 1, 0, EST, KASE, ISAVE, 1, 0 );

	assert.strictEqual( KASE[ 0 ], 1, 'KASE should be 1 after init' );
	assert.strictEqual( ISAVE[ 0 ], 1, 'ISAVE[0] should be 1' );

	xv = reinterpret( X, 0 );
	for ( i = 0; i < N; i++ ) {
		assert.ok( Math.abs( xv[ i * 2 ] - 1.0 / N ) < 1e-15, 'X[' + i + '] real should be 1/N' );
		assert.ok( Math.abs( xv[ i * 2 + 1 ] ) < 1e-15, 'X[' + i + '] imag should be 0' );
	}
});

test( 'zlacn2: N=1 returns immediately after first A*X multiplication', function t() {
	// For N=1, after KASE=0 init, user does A*X, then next call returns KASE=0
	var N = 1;
	var V = new Complex128Array( N );
	var X = new Complex128Array( N );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	var xv;

	KASE[ 0 ] = 0;

	// First call: init
	zlacn2.ndarray( N, V, 1, 0, X, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( KASE[ 0 ], 1 );

	// Simulate A*X where A = (3+4i), X = (1+0i)
	xv = reinterpret( X, 0 );
	xv[ 0 ] = 3.0;
	xv[ 1 ] = 4.0;

	// Second call: should return KASE=0 with est = |3+4i| = 5
	zlacn2.ndarray( N, V, 1, 0, X, 1, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( KASE[ 0 ], 0, 'KASE should be 0 for N=1 after first multiply' );
	assert.ok( Math.abs( EST[ 0 ] - 5.0 ) < 1e-10, 'EST should be 5.0' );
});

test( 'zlacn2: estimate is a lower bound for the true 1-norm', function t() {
	// For any matrix, zlacn2 produces a lower bound on the 1-norm.
	// True 1-norm = max column sum of absolute values.
	// Test with a known matrix where we can compute the true 1-norm.
	var entries = [
		[ [1, 1], [2, -1], [0, 0] ],
		[ [0, 0], [3, 2], [-1, 1] ],
		[ [4, -3], [0, 0], [2, 1] ]
	];
	var A = buildMatrix( 3, entries );
	var result = runEstimate( 3, A );

	// Compute true 1-norm (max column sum of |a_ij|)
	var colSums = [ 0, 0, 0 ];
	var i;
	var j;
	var re;
	var im;
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			re = entries[ i ][ j ][ 0 ];
			im = entries[ i ][ j ][ 1 ];
			colSums[ j ] += Math.sqrt( re * re + im * im );
		}
	}
	var trueNorm = Math.max.apply( null, colSums );

	// Estimate should be <= true norm (it's a lower bound in general, but often exact)
	assert.ok( result.est <= trueNorm + 1e-10, 'estimate should not exceed true 1-norm' );
	assert.ok( result.est > 0, 'estimate should be positive' );
});

test( 'zlacn2: works with stride and offset for ISAVE', function t() {
	// Use stride=2 and offset=1 for ISAVE to test non-trivial stride/offset
	var N = 3;
	var entries = [
		[ [1, 0], [0, 0], [0, 0] ],
		[ [0, 0], [1, 0], [0, 0] ],
		[ [0, 0], [0, 0], [1, 0] ]
	];
	var Av = buildMatrix( N, entries );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 7 ); // offset=1, stride=2 => indices 1,3,5
	var EST = new Float64Array( 1 );
	var V = new Complex128Array( N );
	var X = new Complex128Array( N );
	var tmp = new Complex128Array( N );
	var one = new Complex128( 1.0, 0.0 );
	var zero = new Complex128( 0.0, 0.0 );
	var iter = 0;
	var A = new Complex128Array( Av.buffer );

	KASE[ 0 ] = 0;

	while ( true ) {
		zlacn2.ndarray( N, V, 1, 0, X, 1, 0, EST, KASE, ISAVE, 2, 1 );
		if ( KASE[ 0 ] === 0 ) {
			break;
		}
		iter += 1;
		if ( iter > 20 ) {
			break;
		}
		if ( KASE[ 0 ] === 1 ) {
			zgemv( 'no-transpose', N, N, one, A, 1, N, 0, X, 1, 0, zero, tmp, 1, 0 );
			copyCV( tmp, X, N );
		} else {
			zgemv( 'conjugate-transpose', N, N, one, A, 1, N, 0, X, 1, 0, zero, tmp, 1, 0 );
			copyCV( tmp, X, N );
		}
	}
	assert.ok( Math.abs( EST[ 0 ] - 1.0 ) < 1e-10, 'est should be 1.0 for identity' );
});

test( 'zlacn2: works with non-unit stride for V and X', function t() {
	// Use stride=2 for V and X (only use every other element)
	var N = 1;
	var V = new Complex128Array( 3 ); // stride=2, only index 0 used for N=1
	var X = new Complex128Array( 3 );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	var xv;

	KASE[ 0 ] = 0;
	zlacn2.ndarray( N, V, 2, 0, X, 2, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( KASE[ 0 ], 1 );

	// Set X[0] = 7+0i (simulating A*X where A=(7,0))
	xv = reinterpret( X, 0 );
	xv[ 0 ] = 7.0;
	xv[ 1 ] = 0.0;

	zlacn2.ndarray( N, V, 2, 0, X, 2, 0, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( KASE[ 0 ], 0 );
	assert.ok( Math.abs( EST[ 0 ] - 7.0 ) < 1e-10, 'est should be 7.0' );
});

test( 'zlacn2: works with offset for V and X', function t() {
	// Use offset=1 for both V and X
	var N = 1;
	var V = new Complex128Array( 3 );
	var X = new Complex128Array( 3 );
	var EST = new Float64Array( 1 );
	var KASE = new Int32Array( 1 );
	var ISAVE = new Int32Array( 3 );
	var xv;

	KASE[ 0 ] = 0;
	zlacn2.ndarray( N, V, 1, 1, X, 1, 1, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( KASE[ 0 ], 1 );

	// Check that X[1] (offset=1) was set to 1/N=1.0
	xv = reinterpret( X, 0 );
	assert.ok( Math.abs( xv[ 2 ] - 1.0 ) < 1e-15, 'X at offset 1 real should be 1.0' );
	assert.ok( Math.abs( xv[ 3 ] ) < 1e-15, 'X at offset 1 imag should be 0' );

	// Set X[1] = 2+3i (simulating A*X where A=(2+3i))
	xv[ 2 ] = 2.0;
	xv[ 3 ] = 3.0;

	zlacn2.ndarray( N, V, 1, 1, X, 1, 1, EST, KASE, ISAVE, 1, 0 );
	assert.strictEqual( KASE[ 0 ], 0 );
	assert.ok( Math.abs( EST[ 0 ] - Math.sqrt( 13 ) ) < 1e-10, 'est should be sqrt(13)' );
});

test( 'zlacn2: cycling detection works (EST does not increase)', function t() {
	// Use a 2x2 matrix where the estimate stabilizes quickly
	// A = [[1,0],[0,1]] (identity) — estimate should converge to 1 quickly
	var entries = [
		[ [1, 0], [0, 0] ],
		[ [0, 0], [1, 0] ]
	];
	var A = buildMatrix( 2, entries );
	var result = runEstimate( 2, A );
	assert.ok( Math.abs( result.est - 1.0 ) < 1e-10, 'est should be 1.0' );

	// Cycling detection should terminate iterations
	assert.ok( result.iterations <= 20, 'should terminate' );
});

test( 'zlacn2: purely imaginary matrix', function t() {
	// A = [[0+3i, 0], [0, 0+7i]]
	// 1-norm = max(3, 7) = 7
	var entries = [
		[ [0, 3], [0, 0] ],
		[ [0, 0], [0, 7] ]
	];
	var A = buildMatrix( 2, entries );
	var result = runEstimate( 2, A );
	assert.ok( Math.abs( result.est - 7.0 ) < 1e-10, 'est should be 7.0, got ' + result.est );
});

test( 'zlacn2: scaled identity matrix', function t() {
	// A = 100*I (3x3). 1-norm = 100
	var entries = [
		[ [100, 0], [0, 0], [0, 0] ],
		[ [0, 0], [100, 0], [0, 0] ],
		[ [0, 0], [0, 0], [100, 0] ]
	];
	var A = buildMatrix( 3, entries );
	var result = runEstimate( 3, A );
	assert.ok( Math.abs( result.est - 100.0 ) < 1e-8, 'est should be 100.0, got ' + result.est );
});
