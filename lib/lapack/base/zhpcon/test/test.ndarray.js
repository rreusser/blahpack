/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhptrf from './../../zhptrf/lib/ndarray.js';
import zhpcon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// 1-norm of a Hermitian N-by-N matrix in upper packed storage (Complex128Array).
function packedNorm1HermUpper( AP, N ) {
	var v = reinterpret( AP, 0 );
	var maxs = 0.0;
	var s;
	var i;
	var j;
	var k;
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i <= j; i++ ) {
			k = ( ( ( j * ( j + 1 ) ) / 2 ) + i ) * 2;
			s += Math.sqrt( ( v[ k ] * v[ k ] ) + ( v[ k + 1 ] * v[ k + 1 ] ) );
		}
		for ( i = j + 1; i < N; i++ ) {
			k = ( ( ( i * ( i + 1 ) ) / 2 ) + j ) * 2;
			s += Math.sqrt( ( v[ k ] * v[ k ] ) + ( v[ k + 1 ] * v[ k + 1 ] ) );
		}
		if ( s > maxs ) {
			maxs = s;
		}
	}
	return maxs;
}

function packedNorm1HermLower( AP, N ) {
	var v = reinterpret( AP, 0 );
	var maxs = 0.0;
	var s;
	var i;
	var j;
	var k;
	function lp( ii, jj ) {
		return ( jj * ( ( 2 * N ) - jj - 1 ) / 2 ) + ii;
	}
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i < j; i++ ) {
			k = lp( j, i ) * 2;
			s += Math.sqrt( ( v[ k ] * v[ k ] ) + ( v[ k + 1 ] * v[ k + 1 ] ) );
		}
		for ( i = j; i < N; i++ ) {
			k = lp( i, j ) * 2;
			s += Math.sqrt( ( v[ k ] * v[ k ] ) + ( v[ k + 1 ] * v[ k + 1 ] ) );
		}
		if ( s > maxs ) {
			maxs = s;
		}
	}
	return maxs;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zhpcon, 'function', 'main export is a function' );
});

test( 'zhpcon: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpcon( 'invalid', 2, new Complex128Array( 3 ), 1, 0, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1, 0 );
	}, TypeError );
});

test( 'zhpcon: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpcon( 'upper', -1, new Complex128Array( 3 ), 1, 0, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1, 0 );
	}, RangeError );
});

test( 'zhpcon: N=0 quick return', function t() {
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = zhpcon( 'upper', 0, new Complex128Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, 1.0, rcond, new Complex128Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'zhpcon: anorm=0 returns rcond=0 (upper)', function t() {
	var N = 3;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var IPIV = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = zhpcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, 0.0, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zhpcon: identity 3x3 upper (rcond=1)', function t() {
	var N = 3;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var v = reinterpret( AP, 0 );
	var i;
	for ( i = 0; i < N; i++ ) {
		v[ ( ( ( i * ( i + 1 ) ) / 2 ) + i ) * 2 ] = 1.0;
	}
	var anorm = packedNorm1HermUpper( AP, N );
	var IPIV = new Int32Array( N );
	zhptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zhpcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'zhpcon: identity 4x4 lower (rcond=1)', function t() {
	var N = 4;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var v = reinterpret( AP, 0 );
	var i;
	function lp( ii, jj ) {
		return ( jj * ( ( 2 * N ) - jj - 1 ) / 2 ) + ii;
	}
	for ( i = 0; i < N; i++ ) {
		v[ lp( i, i ) * 2 ] = 1.0;
	}
	var anorm = packedNorm1HermLower( AP, N );
	var IPIV = new Int32Array( N );
	zhptrf( 'lower', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zhpcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'zhpcon: real diagonal 4x4 upper', function t() {
	var N = 4;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var v = reinterpret( AP, 0 );
	var diag = [ 4.0, 3.0, 2.0, 1.0 ];
	var i;
	for ( i = 0; i < N; i++ ) {
		v[ ( ( ( i * ( i + 1 ) ) / 2 ) + i ) * 2 ] = diag[ i ];
	}
	var anorm = packedNorm1HermUpper( AP, N );
	var IPIV = new Int32Array( N );
	zhptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zhpcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'zhpcon: real diagonal 4x4 lower', function t() {
	var N = 4;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var v = reinterpret( AP, 0 );
	var diag = [ 4.0, 3.0, 2.0, 1.0 ];
	var i;
	function lp( ii, jj ) {
		return ( jj * ( ( 2 * N ) - jj - 1 ) / 2 ) + ii;
	}
	for ( i = 0; i < N; i++ ) {
		v[ lp( i, i ) * 2 ] = diag[ i ];
	}
	var anorm = packedNorm1HermLower( AP, N );
	var IPIV = new Int32Array( N );
	zhptrf( 'lower', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zhpcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'zhpcon: HPD 3x3 upper with complex off-diagonals', function t() {
	// Hermitian positive-definite. In upper packed:
	// (0,0)=10, (0,1)=2+i, (1,1)=8, (0,2)=3-2i, (1,2)=1+i, (2,2)=6
	var N = 3;
	var AP = new Complex128Array( new Float64Array( [
		10, 0,
		2, 1,
		8, 0,
		3, -2,
		1, 1,
		6, 0
	] ) );
	var anorm = packedNorm1HermUpper( AP, N );
	var IPIV = new Int32Array( N );
	zhptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zhpcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'zhpcon: Hermitian indefinite 3x3 lower', function t() {
	// Real-valued indefinite Hermitian (== real symmetric). diag = [2,-3,2]
	var N = 3;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var v = reinterpret( AP, 0 );
	function lp( ii, jj ) {
		return ( jj * ( ( 2 * N ) - jj - 1 ) / 2 ) + ii;
	}
	v[ lp( 0, 0 ) * 2 ] = 2.0;
	v[ lp( 1, 0 ) * 2 ] = 1.0;
	v[ lp( 2, 0 ) * 2 ] = 0.0;
	v[ lp( 1, 1 ) * 2 ] = -3.0;
	v[ lp( 2, 1 ) * 2 ] = 1.0;
	v[ lp( 2, 2 ) * 2 ] = 2.0;
	var anorm = packedNorm1HermLower( AP, N );
	var IPIV = new Int32Array( N );
	zhptrf( 'lower', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zhpcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'zhpcon: HPD 4x4 upper', function t() {
	var N = 4;
	var AP = new Complex128Array( new Float64Array( [
		20, 0,
		3, 1,
		15, 0,
		1, -2,
		2, 3,
		12, 0,
		4, 1,
		1, -1,
		3, 2,
		10, 0
	] ) );
	var anorm = packedNorm1HermUpper( AP, N );
	var IPIV = new Int32Array( N );
	zhptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zhpcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'zhpcon: 4x4 indefinite upper (forces 2x2 pivots)', function t() {
	// Off-diagonal heavy real (Hermitian) matrix that triggers 2x2 pivots.
	var N = 4;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var v = reinterpret( AP, 0 );
	v[ 1 * 2 ] = 1.0;
	v[ 8 * 2 ] = 1.0;
	var anorm = packedNorm1HermUpper( AP, N );
	var IPIV = new Int32Array( N );
	zhptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zhpcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'zhpcon: singular matrix - zero diagonal in factored D (upper)', function t() {
	var N = 3;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var IPIV = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = zhpcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, 1.0, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zhpcon: singular matrix - zero diagonal in factored D (lower)', function t() {
	var N = 3;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var IPIV = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = zhpcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, 1.0, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zhpcon: N=1 simple', function t() {
	var N = 1;
	var AP = new Complex128Array( 1 );
	var v = reinterpret( AP, 0 );
	v[ 0 ] = 5.0;
	var IPIV = new Int32Array( 1 );
	zhptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zhpcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, 5.0, rcond, new Complex128Array( 2 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-12 ) );
});
