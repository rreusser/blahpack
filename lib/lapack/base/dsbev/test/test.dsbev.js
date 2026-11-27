/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbev from './../lib/dsbev.js';


// TESTS //

test( 'dsbev is a function', function t() {
	assert.strictEqual( typeof dsbev, 'function', 'is a function' );
});

test( 'dsbev has expected arity', function t() {
	assert.strictEqual( dsbev.length, 12, 'has expected arity' );
});

test( 'dsbev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsbev( 'invalid', 2, 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsbev throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsbev( 'row-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsbev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsbev( 'row-major', 'no-vectors', 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsbev (row-major, upper) returns the known spectrum of the second-difference matrix and matches column-major', function t() {
	const N = 4;
	let info;
	let lam;
	let r;
	let i;
	let j;
	let k;

	// A = tridiag( -1, 2, -1 ) has eigenvalues 2 - 2*cos( k*pi/(N+1) ), k = 1..N:
	const expected = [];
	for ( k = 1; k <= N; k++ ) {
		expected.push( 2.0 - ( 2.0 * Math.cos( k * Math.PI / ( N + 1 ) ) ) );
	}

	// Row-major band storage: row 0 = superdiagonal, row 1 = diagonal; LDAB = N...
	const ABr = new Float64Array( [ 0.0, -1.0, -1.0, -1.0, 2.0, 2.0, 2.0, 2.0 ] );
	const wr = new Float64Array( N );
	const Zr = new Float64Array( N * N );
	info = dsbev( 'row-major', 'compute-vectors', 'upper', N, 1, ABr, N, wr, 1, Zr, N, null );
	assert.strictEqual( info, 0, 'returns 0' );
	for ( k = 0; k < N; k++ ) {
		assert.ok( Math.abs( wr[ k ] - expected[ k ] ) <= 1e-14, 'eigenvalue ' + k );
	}

	// Residual ||A z - lambda z|| for each eigenvector (Z is row-major: column k holds eigenvector k):
	for ( k = 0; k < N; k++ ) {
		lam = wr[ k ];
		for ( i = 0; i < N; i++ ) {
			r = ( 2.0 - lam ) * Zr[ ( i * N ) + k ];
			if ( i > 0 ) {
				r -= Zr[ ( ( i - 1 ) * N ) + k ];
			}
			if ( i < N - 1 ) {
				r -= Zr[ ( ( i + 1 ) * N ) + k ];
			}
			assert.ok( Math.abs( r ) <= 1e-14, 'residual ' + i + ',' + k );
		}
	}

	// Same matrix in column-major band storage (LDAB = kd+1) gives the transposed, bit-identical result:
	const ABc = new Float64Array( [ 0.0, 2.0, -1.0, 2.0, -1.0, 2.0, -1.0, 2.0 ] );
	const wc = new Float64Array( N );
	const Zc = new Float64Array( N * N );
	info = dsbev( 'column-major', 'compute-vectors', 'upper', N, 1, ABc, 2, wc, 1, Zc, N, new Float64Array( ( 3 * N ) - 2 ) );
	assert.strictEqual( info, 0, 'returns 0' );
	assert.deepStrictEqual( wr, wc, 'eigenvalues match column-major' );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			assert.strictEqual( Zr[ ( i * N ) + j ], Zc[ ( j * N ) + i ], 'Z(' + i + ',' + j + ')' );
		}
	}
});
