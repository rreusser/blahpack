/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsptrf from './../../dsptrf/lib/ndarray.js';
import dspcon from './../lib/ndarray.js';


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
		for ( i = 0; i <= j; i++ ) {
			p = ( ( j * ( j + 1 ) ) / 2 ) + i;
			s += Math.abs( AP[ p ] );
		}
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
	function lp( ii, jj ) {
		return ( jj * ( ( 2 * N ) - jj - 1 ) / 2 ) + ii;
	}
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i < j; i++ ) {
			p = lp( j, i );
			s += Math.abs( AP[ p ] );
		}
		for ( i = j; i < N; i++ ) {
			p = lp( i, j );
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
	assert.strictEqual( typeof dspcon, 'function', 'main export is a function' );
});

test( 'dspcon: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspcon( 'invalid', 2, new Float64Array( 3 ), 1, 0, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Float64Array( 4 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dspcon: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspcon( 'upper', -1, new Float64Array( 3 ), 1, 0, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Float64Array( 4 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'dspcon: N=0 quick return', function t() {
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dspcon( 'upper', 0, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, 1.0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'dspcon: anorm=0 returns rcond=0 (upper)', function t() {
	var N = 3;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var IPIV = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, 0.0, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dspcon: identity 3x3 upper (rcond=1)', function t() {
	var N = 3;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var i;
	for ( i = 0; i < N; i++ ) {
		AP[ ( ( i * ( i + 1 ) ) / 2 ) + i ] = 1.0;
	}
	var anorm = packedNorm1Upper( AP, N );
	var IPIV = new Int32Array( N );
	dsptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dspcon: identity 4x4 lower (rcond=1)', function t() {
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var i;
	for ( i = 0; i < N; i++ ) {
		AP[ ( i * ( ( 2 * N ) - i + 1 ) ) / 2 ] = 1.0;
	}
	var anorm = packedNorm1Lower( AP, N );
	var IPIV = new Int32Array( N );
	dsptrf( 'lower', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dspcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dspcon: diagonal 4x4 upper', function t() {
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var diag = [ 4.0, 3.0, 2.0, 1.0 ];
	var i;
	for ( i = 0; i < N; i++ ) {
		AP[ ( ( i * ( i + 1 ) ) / 2 ) + i ] = diag[ i ];
	}
	var anorm = packedNorm1Upper( AP, N );
	var IPIV = new Int32Array( N );
	dsptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dspcon: diagonal 4x4 lower', function t() {
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var diag = [ 4.0, 3.0, 2.0, 1.0 ];
	var i;
	for ( i = 0; i < N; i++ ) {
		AP[ ( i * ( ( 2 * N ) - i + 1 ) ) / 2 ] = diag[ i ];
	}
	var anorm = packedNorm1Lower( AP, N );
	var IPIV = new Int32Array( N );
	dsptrf( 'lower', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dspcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dspcon: indefinite tridiag 3x3 upper', function t() {
	// A = [[2,1,0],[1,-3,1],[0,1,2]] symmetric indefinite
	var N = 3;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	AP[ 0 ] = 2.0;
	AP[ 1 ] = 1.0;
	AP[ 2 ] = -3.0;
	AP[ 3 ] = 0.0;
	AP[ 4 ] = 1.0;
	AP[ 5 ] = 2.0;
	var anorm = packedNorm1Upper( AP, N );
	var IPIV = new Int32Array( N );
	dsptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dspcon: 4x4 SPD lower', function t() {
	// A = [[4,1,0,0],[1,4,1,0],[0,1,4,1],[0,0,1,4]] in lower packed.
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
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
	var IPIV = new Int32Array( N );
	dsptrf( 'lower', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dspcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.1 && rcond[ 0 ] <= 1.0 );
});

test( 'dspcon: 4x4 indefinite upper (forces 2x2 pivots)', function t() {
	// Off-diagonal-heavy matrix that triggers 2x2 Bunch-Kaufman pivots.
	// A = [[0,1,0,0],[1,0,0,0],[0,0,0,1],[0,0,1,0]] is symmetric, has
	// 2x2 pivots in dsptrf.
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	// Upper packed: (0,0)=0,(0,1)=1,(1,1)=0,(0,2)=0,(1,2)=0,(2,2)=0,(0,3)=0,(1,3)=0,(2,3)=1,(3,3)=0
	AP[ 1 ] = 1.0;
	AP[ 8 ] = 1.0;
	var anorm = packedNorm1Upper( AP, N );
	var IPIV = new Int32Array( N );
	dsptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dspcon: 4x4 indefinite lower (forces 2x2 pivots)', function t() {
	var N = 4;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	function lp( ii, jj ) {
		return ( jj * ( ( 2 * N ) - jj - 1 ) / 2 ) + ii;
	}
	AP[ lp( 1, 0 ) ] = 1.0;
	AP[ lp( 3, 2 ) ] = 1.0;
	var anorm = packedNorm1Lower( AP, N );
	var IPIV = new Int32Array( N );
	dsptrf( 'lower', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dspcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dspcon: singular matrix - zero diagonal in factored D (upper)', function t() {
	// Construct factored AP/IPIV with zero diagonal and 1x1 pivots so
	// dspcon's nonsingular check kicks in and returns rcond=0.
	var N = 3;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	// Zero matrix, 1x1 pivots IPIV[k]=k mean A is treated as already factored
	// with D = 0 on the diagonal, so it's reported singular.
	var IPIV = new Int32Array( N ); // All zeros >= 0 means 1x1 pivots (kp=0 for all).
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, 1.0, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dspcon: singular matrix - zero diagonal in factored D (lower)', function t() {
	var N = 3;
	var AP = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	var IPIV = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dspcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, 1.0, rcond, new Float64Array( 2 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dspcon: N=1 simple', function t() {
	var N = 1;
	var AP = new Float64Array( 1 );
	AP[ 0 ] = 5.0;
	var IPIV = new Int32Array( 1 );
	dsptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = dspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, 5.0, rcond, new Float64Array( 2 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-12 ) );
});
