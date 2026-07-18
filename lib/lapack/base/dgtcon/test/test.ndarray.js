/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgttrf from './../../dgttrf/lib/ndarray.js';
import dgtcon from './../lib/ndarray.js';


// FUNCTIONS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// Builds dense N x N column-major matrix from tridiagonal arrays.
function denseTri( DL, D, DU, N ) {
	let i;
	const A = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		A[ ( i * N ) + i ] = D[ i ];
	}
	for ( i = 0; i < N - 1; i++ ) {
		A[ ( i * N ) + ( i + 1 ) ] = DL[ i ];
		A[ ( ( i + 1 ) * N ) + i ] = DU[ i ];
	}
	return A;
}

function norm1Dense( A, N ) {
	let maxs, s, i, j;
	maxs = 0.0;
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i < N; i++ ) {
			s += Math.abs( A[ ( j * N ) + i ] );
		}
		if ( s > maxs ) {
			maxs = s;
		}
	}
	return maxs;
}

function normInfDense( A, N ) {
	let maxs, s, i, j;
	maxs = 0.0;
	for ( i = 0; i < N; i++ ) {
		s = 0.0;
		for ( j = 0; j < N; j++ ) {
			s += Math.abs( A[ ( j * N ) + i ] );
		}
		if ( s > maxs ) {
			maxs = s;
		}
	}
	return maxs;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dgtcon, 'function', 'main export is a function' );
});

test( 'dgtcon: throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dgtcon( 'invalid', 3, new Float64Array( 2 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 1 ), 1, 0, new Int32Array( 3 ), 1, 0, 1.0, new Float64Array( 1 ), new Float64Array( 6 ), 1, 0, new Int32Array( 3 ), 1, 0 );
	}, TypeError );
});

test( 'dgtcon: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgtcon( 'one-norm', -1, new Float64Array( 2 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 1 ), 1, 0, new Int32Array( 3 ), 1, 0, 1.0, new Float64Array( 1 ), new Float64Array( 6 ), 1, 0, new Int32Array( 3 ), 1, 0 );
	}, RangeError );
});

test( 'dgtcon: N=0 quick return (rcond=1)', function t() {
	const rcond = new Float64Array( 1 );
	const info = dgtcon( 'one-norm', 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, 0.0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'dgtcon: anorm=0 returns rcond=0', function t() {
	const N = 3;
	const DL = new Float64Array( [ 1.0, 1.0 ] );
	const D = new Float64Array( [ 4.0, 4.0, 4.0 ] );
	const DU = new Float64Array( [ 1.0, 1.0 ] );
	const DU2 = new Float64Array( N - 2 );
	const IPIV = new Int32Array( N );
	dgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	const work = new Float64Array( 2 * N );
	const iwork = new Int32Array( N );
	const info = dgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dgtcon: zero diagonal element returns rcond=0', function t() {
	const N = 3;
	const DL = new Float64Array( [ 0.5, 0.5 ] );
	const D = new Float64Array( [ 4.0, 0.0, 4.0 ] );
	const DU = new Float64Array( [ 1.0, 1.0 ] );
	const DU2 = new Float64Array( [ 0.0 ] );
	const IPIV = new Int32Array( N );
	const rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	const work = new Float64Array( 2 * N );
	const iwork = new Int32Array( N );
	const info = dgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, 6.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dgtcon: N=1 (1x1) one-norm', function t() {
	const N = 1;
	const DL = new Float64Array( 0 );
	const D = new Float64Array( [ 5.0 ] );
	const DU = new Float64Array( 0 );
	const DU2 = new Float64Array( 0 );
	const IPIV = new Int32Array( N );
	dgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const rcond = new Float64Array( 1 );
	const work = new Float64Array( 2 * N );
	const iwork = new Int32Array( N );
	const info = dgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, 5.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dgtcon: tridiagonal 5x5 one-norm', function t() {
	const N = 5;
	const DL = new Float64Array( [ -1.0, -1.0, -1.0, -1.0 ] );
	const D = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
	const DU = new Float64Array( [ -1.0, -1.0, -1.0, -1.0 ] );
	const Adense = denseTri( DL, D, DU, N );
	const anorm = norm1Dense( Adense, N );
	const DU2 = new Float64Array( N - 2 );
	const IPIV = new Int32Array( N );
	dgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const rcond = new Float64Array( 1 );
	const work = new Float64Array( 2 * N );
	const iwork = new Int32Array( N );
	const info = dgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dgtcon: tridiagonal 5x5 inf-norm', function t() {
	const N = 5;
	const DL = new Float64Array( [ -1.0, -1.0, -1.0, -1.0 ] );
	const D = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
	const DU = new Float64Array( [ -1.0, -1.0, -1.0, -1.0 ] );
	const Adense = denseTri( DL, D, DU, N );
	const anorm = normInfDense( Adense, N );
	const DU2 = new Float64Array( N - 2 );
	const IPIV = new Int32Array( N );
	dgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const rcond = new Float64Array( 1 );
	const work = new Float64Array( 2 * N );
	const iwork = new Int32Array( N );
	const info = dgtcon( 'inf-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dgtcon: tridiagonal 7x7 one-norm exercises full reverse-comm', function t() {
	let i;
	const N = 7;
	const DL = new Float64Array( N - 1 );
	const D = new Float64Array( N );
	const DU = new Float64Array( N - 1 );
	for ( i = 0; i < N; i++ ) {
		D[ i ] = 3.0;
	}
	for ( i = 0; i < N - 1; i++ ) {
		DL[ i ] = -1.0;
		DU[ i ] = -1.0;
	}
	const Adense = denseTri( DL, D, DU, N );
	const anorm = norm1Dense( Adense, N );
	const DU2 = new Float64Array( N - 2 );
	const IPIV = new Int32Array( N );
	dgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const rcond = new Float64Array( 1 );
	const work = new Float64Array( 2 * N );
	const iwork = new Int32Array( N );
	const info = dgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dgtcon: tridiagonal 7x7 inf-norm', function t() {
	let i;
	const N = 7;
	const DL = new Float64Array( N - 1 );
	const D = new Float64Array( N );
	const DU = new Float64Array( N - 1 );
	for ( i = 0; i < N; i++ ) {
		D[ i ] = 3.0;
	}
	for ( i = 0; i < N - 1; i++ ) {
		DL[ i ] = -1.0;
		DU[ i ] = -1.0;
	}
	const Adense = denseTri( DL, D, DU, N );
	const anorm = normInfDense( Adense, N );
	const DU2 = new Float64Array( N - 2 );
	const IPIV = new Int32Array( N );
	dgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const rcond = new Float64Array( 1 );
	const work = new Float64Array( 2 * N );
	const iwork = new Int32Array( N );
	const info = dgtcon( 'inf-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dgtcon: ill-conditioned 6x6', function t() {
	let i;
	const N = 6;
	const DL = new Float64Array( N - 1 );
	const D = new Float64Array( N );
	const DU = new Float64Array( N - 1 );
	for ( i = 0; i < N; i++ ) {
		D[ i ] = 1.0001;
	}
	for ( i = 0; i < N - 1; i++ ) {
		DL[ i ] = 1.0;
		DU[ i ] = 1.0;
	}
	const Adense = denseTri( DL, D, DU, N );
	const anorm = norm1Dense( Adense, N );
	const DU2 = new Float64Array( N - 2 );
	const IPIV = new Int32Array( N );
	dgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const rcond = new Float64Array( 1 );
	const work = new Float64Array( 2 * N );
	const iwork = new Int32Array( N );
	const info = dgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] >= 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dgtcon: asymmetric tridiagonal 4x4', function t() {
	const N = 4;
	const DL = new Float64Array( [ 0.5, -0.25, 1.5 ] );
	const D = new Float64Array( [ 4.0, 5.0, 6.0, 3.0 ] );
	const DU = new Float64Array( [ 1.0, -2.0, 0.75 ] );
	const Adense = denseTri( DL, D, DU, N );
	const anorm = norm1Dense( Adense, N );
	const DU2 = new Float64Array( N - 2 );
	const IPIV = new Int32Array( N );
	dgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const rcond = new Float64Array( 1 );
	const work = new Float64Array( 2 * N );
	const iwork = new Int32Array( N );
	const info = dgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});
