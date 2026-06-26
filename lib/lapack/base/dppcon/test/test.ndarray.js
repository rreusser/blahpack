/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpptrf from './../../dpptrf/lib/ndarray.js';
import dppcon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// 1-norm of a symmetric N-by-N matrix in upper packed storage.
function packedNorm1Upper( AP, N ) {
	var maxs = 0.0;
	var s;
	var i;
	var j;
	var p;
	for ( j = 0; j < N; j++ ) {
		s = 0.0;

		// Column j: rows i=0..j stored at AP[ j*(j+1)/2 + i ]
		for ( i = 0; i <= j; i++ ) {
			p = ( ( j * ( j + 1 ) ) / 2 ) + i;
			s += Math.abs( AP[ p ] );
		}
		// Rows i=j+1..N-1: A(i,j) == A(j,i), stored at AP[ i*(i+1)/2 + j ]
		for ( i = j + 1; i < N; i++ ) {
			p = ( ( i * ( i + 1 ) ) / 2 ) + j;
			s += Math.abs( AP[ p ] );
		}
		if ( s > maxs ) {
			maxs = s;
		}
	}
	return maxs;
}

// 1-norm of a symmetric N-by-N matrix in lower packed storage.
function packedNorm1Lower( AP, N ) {
	var maxs = 0.0;
	var s;
	var i;
	var j;
	var p;

	// Lower-packed addressing: AP[ j*(2*N - j - 1)/2 + i ] for i >= j
	function idxLower( ii, jj ) {
		return ( jj * ( ( 2 * N ) - jj - 1 ) / 2 ) + ii;
	}
	for ( j = 0; j < N; j++ ) {
		s = 0.0;

		// Rows i < j: A(i,j) == A(j,i), stored at AP[idxLower(j,i)]
		for ( i = 0; i < j; i++ ) {
			p = idxLower( j, i );
			s += Math.abs( AP[ p ] );
		}
		for ( i = j; i < N; i++ ) {
			p = idxLower( i, j );
			s += Math.abs( AP[ p ] );
		}
		if ( s > maxs ) {
			maxs = s;
		}
	}
	return maxs;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dppcon, 'function', 'main export is a function' );
});

test( 'dppcon: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dppcon( 'invalid', 2, new Float64Array( 3 ), 1, 0, 1.0, new Float64Array( 1 ), new Float64Array( 6 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dppcon: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dppcon( 'upper', -1, new Float64Array( 3 ), 1, 0, 1.0, new Float64Array( 1 ), new Float64Array( 6 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'dppcon: N=0 quick return', function t() {
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dppcon( 'upper', 0, new Float64Array( 0 ), 1, 0, 0.0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'dppcon: anorm=0 returns rcond=0 (upper)', function t() {
	var N = 3;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dppcon( 'upper', N, AP, 1, 0, 0.0, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dppcon: identity 3x3 upper (rcond=1)', function t() {
	var N = 3;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var i;
	for ( i = 0; i < N; i++ ) {
		AP[ ( ( i * ( i + 1 ) ) / 2 ) + i ] = 1.0;
	}
	var anorm = packedNorm1Upper( AP, N );
	dpptrf( 'upper', N, AP, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dppcon( 'upper', N, AP, 1, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dppcon: identity 4x4 lower (rcond=1)', function t() {
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var i;
	var p;
	for ( i = 0; i < N; i++ ) {
		// Diagonal in lower-packed at index (2*N - i + 1)*i/2
		p = ( i * ( ( 2 * N ) - i + 1 ) ) / 2;
		AP[ p ] = 1.0;
	}
	var anorm = packedNorm1Lower( AP, N );
	dpptrf( 'lower', N, AP, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dppcon( 'lower', N, AP, 1, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dppcon: diagonal 4x4 upper', function t() {
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var diag = [ 4.0, 3.0, 2.0, 1.0 ];
	var i;
	for ( i = 0; i < N; i++ ) {
		AP[ ( ( i * ( i + 1 ) ) / 2 ) + i ] = diag[ i ];
	}
	var anorm = packedNorm1Upper( AP, N );
	dpptrf( 'upper', N, AP, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dppcon( 'upper', N, AP, 1, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );

	// kappa(diag) = max/min = 4. rcond = 1/4
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dppcon: diagonal 4x4 lower', function t() {
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var diag = [ 4.0, 3.0, 2.0, 1.0 ];
	var i;
	var p;
	for ( i = 0; i < N; i++ ) {
		p = ( i * ( ( 2 * N ) - i + 1 ) ) / 2;
		AP[ p ] = diag[ i ];
	}
	var anorm = packedNorm1Lower( AP, N );
	dpptrf( 'lower', N, AP, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dppcon( 'lower', N, AP, 1, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dppcon: well-conditioned tridiagonal 3x3 upper', function t() {
	// A = [[4,1,0],[1,4,1],[0,1,4]] symmetric, SPD
	var N = 3;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );

	// Upper: AP indices (i,j) = j*(j+1)/2 + i, i<=j

	// (0,0)=4 idx 0

	// (0,1)=1 idx 1, (1,1)=4 idx 2

	// (0,2)=0 idx 3, (1,2)=1 idx 4, (2,2)=4 idx 5
	AP[ 0 ] = 4.0;
	AP[ 1 ] = 1.0;
	AP[ 2 ] = 4.0;
	AP[ 3 ] = 0.0;
	AP[ 4 ] = 1.0;
	AP[ 5 ] = 4.0;
	var anorm = packedNorm1Upper( AP, N );
	dpptrf( 'upper', N, AP, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dppcon( 'upper', N, AP, 1, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.1 && rcond[ 0 ] <= 1.0 );
});

test( 'dppcon: well-conditioned tridiagonal 4x4 lower', function t() {
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );

	// A = [[4,1,0,0],[1,4,1,0],[0,1,4,1],[0,0,1,4]]

	// Lower-packed: AP[ j*(2N-j-1)/2 + i ] for i>=j
	function lp( ii, jj ) {
		return ( jj * ( ( 2 * N ) - jj - 1 ) / 2 ) + ii;
	}
	AP[ lp( 0, 0 ) ] = 4.0;
	AP[ lp( 1, 0 ) ] = 1.0;
	AP[ lp( 1, 1 ) ] = 4.0;
	AP[ lp( 2, 1 ) ] = 1.0;
	AP[ lp( 2, 2 ) ] = 4.0;
	AP[ lp( 3, 2 ) ] = 1.0;
	AP[ lp( 3, 3 ) ] = 4.0;
	var anorm = packedNorm1Lower( AP, N );
	dpptrf( 'lower', N, AP, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dppcon( 'lower', N, AP, 1, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.1 && rcond[ 0 ] <= 1.0 );
});

test( 'dppcon: ill-conditioned (Hilbert-like) 4x4 upper', function t() {
	// Use shifted Hilbert: A(i,j) = 1/(i+j+1) + small to keep SPD
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			AP[ ( ( j * ( j + 1 ) ) / 2 ) + i ] = 1.0 / ( i + j + 1 );
		}
	}
	var anorm = packedNorm1Upper( AP, N );
	dpptrf( 'upper', N, AP, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dppcon( 'upper', N, AP, 1, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] >= 0.0 && rcond[ 0 ] < 0.01, 'rcond should be small for Hilbert' );
});

test( 'dppcon: 5x5 SPD lower well-conditioned', function t() {
	var N = 5;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	function lp( ii, jj ) {
		return ( jj * ( ( 2 * N ) - jj - 1 ) / 2 ) + ii;
	}
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			if ( i === j ) {
				AP[ lp( i, j ) ] = 5.0;
			} else if ( ( i - j ) === 1 ) {
				AP[ lp( i, j ) ] = 1.0;
			} else {
				AP[ lp( i, j ) ] = 0.0;
			}
		}
	}
	var anorm = packedNorm1Lower( AP, N );
	dpptrf( 'lower', N, AP, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dppcon( 'lower', N, AP, 1, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.3 );
});

test( 'dppcon: N=1 simple', function t() {
	var N = 1;
	var AP = new Float64Array( 1 );
	AP[ 0 ] = 4.0;
	var anorm = 4.0;
	dpptrf( 'upper', N, AP, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dppcon( 'upper', N, AP, 1, 0, anorm, rcond, new Float64Array( 3 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-12 ) );
});
