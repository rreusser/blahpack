/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsptrf from './../../zsptrf/lib/ndarray.js';
import zspcon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// 1-norm of a complex symmetric matrix in upper packed storage (Complex128Array).
function packedNorm1SymUpper( AP, N ) {
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

// 1-norm of a complex symmetric matrix in lower packed storage.
function packedNorm1SymLower( AP, N ) {
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
	assert.strictEqual( typeof zspcon, 'function', 'main export is a function' );
});

test( 'zspcon: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zspcon( 'invalid', 2, new Complex128Array( 3 ), 1, 0, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1, 0 );
	}, TypeError );
});

test( 'zspcon: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zspcon( 'upper', -1, new Complex128Array( 3 ), 1, 0, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1, 0 );
	}, RangeError );
});

test( 'zspcon: N=0 quick return', function t() {
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = zspcon( 'upper', 0, new Complex128Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, 1.0, rcond, new Complex128Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'zspcon: anorm=0 returns rcond=0 (upper)', function t() {
	var N = 3;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var IPIV = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = zspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, 0.0, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zspcon: identity 3x3 upper (rcond=1)', function t() {
	var N = 3;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var v = reinterpret( AP, 0 );
	var i;
	for ( i = 0; i < N; i++ ) {
		v[ ( ( ( i * ( i + 1 ) ) / 2 ) + i ) * 2 ] = 1.0;
	}
	var anorm = packedNorm1SymUpper( AP, N );
	var IPIV = new Int32Array( N );
	zsptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'zspcon: identity 4x4 lower (rcond=1)', function t() {
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
	var anorm = packedNorm1SymLower( AP, N );
	var IPIV = new Int32Array( N );
	zsptrf( 'lower', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zspcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'zspcon: real diagonal 4x4 upper', function t() {
	var N = 4;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var v = reinterpret( AP, 0 );
	var diag = [ 4.0, 3.0, 2.0, 1.0 ];
	var i;
	for ( i = 0; i < N; i++ ) {
		v[ ( ( ( i * ( i + 1 ) ) / 2 ) + i ) * 2 ] = diag[ i ];
	}
	var anorm = packedNorm1SymUpper( AP, N );
	var IPIV = new Int32Array( N );
	zsptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'zspcon: real diagonal 4x4 lower', function t() {
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
	var anorm = packedNorm1SymLower( AP, N );
	var IPIV = new Int32Array( N );
	zsptrf( 'lower', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zspcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'zspcon: complex symmetric 3x3 upper', function t() {
	// Symmetric (NOT Hermitian): A^T = A. Use complex entries.
	// A = [[2+i, 1, 0], [1, 3-i, 1+i], [0, 1+i, 4]]
	var N = 3;
	var AP = new Complex128Array( new Float64Array([
		2, 1,
		1, 0,
		3, -1,
		0, 0,
		1, 1,
		4, 0
	]) );
	var anorm = packedNorm1SymUpper( AP, N );
	var IPIV = new Int32Array( N );
	zsptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'zspcon: complex symmetric 4x4 lower', function t() {
	// Diagonally dominant complex symmetric.
	var N = 4;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var v = reinterpret( AP, 0 );
	function lp( ii, jj ) {
		return ( jj * ( ( 2 * N ) - jj - 1 ) / 2 ) + ii;
	}
	v[ lp( 0, 0 ) * 2 ] = 10.0;
	v[ ( lp( 1, 0 ) * 2 ) + 1 ] = 0.5;
	v[ lp( 1, 1 ) * 2 ] = 8.0;
	v[ lp( 2, 1 ) * 2 ] = 0.5;
	v[ lp( 2, 2 ) * 2 ] = 6.0;
	v[ ( lp( 3, 2 ) * 2 ) + 1 ] = 0.5;
	v[ lp( 3, 3 ) * 2 ] = 5.0;
	var anorm = packedNorm1SymLower( AP, N );
	var IPIV = new Int32Array( N );
	zsptrf( 'lower', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zspcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.1 && rcond[ 0 ] <= 1.0 );
});

test( 'zspcon: 4x4 indefinite upper (forces 2x2 pivots)', function t() {
	// Off-diagonal heavy (real) symmetric matrix that triggers 2x2 pivots.
	var N = 4;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var v = reinterpret( AP, 0 );
	v[ 1 * 2 ] = 1.0;
	v[ 8 * 2 ] = 1.0;
	var anorm = packedNorm1SymUpper( AP, N );
	var IPIV = new Int32Array( N );
	zsptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, anorm, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'zspcon: singular matrix - zero diagonal in factored D (upper)', function t() {
	var N = 3;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var IPIV = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = zspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, 1.0, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zspcon: singular matrix - zero diagonal in factored D (lower)', function t() {
	var N = 3;
	var AP = new Complex128Array( ( N * ( N + 1 ) ) / 2 );
	var IPIV = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = zspcon( 'lower', N, AP, 1, 0, IPIV, 1, 0, 1.0, rcond, new Complex128Array( 2 * N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zspcon: N=1 simple', function t() {
	var N = 1;
	var AP = new Complex128Array( 1 );
	var v = reinterpret( AP, 0 );
	v[ 0 ] = 5.0;
	var IPIV = new Int32Array( 1 );
	zsptrf( 'upper', N, AP, 1, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var info = zspcon( 'upper', N, AP, 1, 0, IPIV, 1, 0, 5.0, rcond, new Complex128Array( 2 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-12 ) );
});
