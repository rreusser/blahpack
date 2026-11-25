/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbev from './../lib/zhbev.js';


// TESTS //

test( 'zhbev is a function', function t() {
	assert.strictEqual( typeof zhbev, 'function', 'is a function' );
});

test( 'zhbev has expected arity', function t() {
	assert.strictEqual( zhbev.length, 13, 'has expected arity' );
});

test( 'zhbev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhbev( 'invalid', 2, 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhbev throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhbev( 'row-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhbev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhbev( 'row-major', 'no-vectors', 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhbev (row-major, upper) returns the known spectrum of a Hermitian tridiagonal matrix and matches column-major', function t() {
	const N = 4;
	let info;
	let lam;
	let re;
	let im;
	let i;
	let j;
	let k;

	// A = tridiag( i, 2, -i ) (Hermitian; superdiagonal -i) is unitarily similar, via a diagonal phase scaling, to tridiag( 1, 2, 1 ), so its eigenvalues are 2 - 2*cos( k*pi/(N+1) ), k = 1..N:
	const expected = [];
	for ( k = 1; k <= N; k++ ) {
		expected.push( 2.0 - ( 2.0 * Math.cos( k * Math.PI / ( N + 1 ) ) ) );
	}

	// Row-major band storage (interleaved re/im): row 0 = superdiagonal A(j-1,j) = -i, row 1 = diagonal; LDAB = N...
	const ABr = new Complex128Array( [ 0, 0, 0, -1, 0, -1, 0, -1, 2, 0, 2, 0, 2, 0, 2, 0 ] );
	const wr = new Float64Array( N );
	const Zr = new Complex128Array( N * N );
	info = zhbev( 'row-major', 'compute-vectors', 'upper', N, 1, ABr, N, wr, 1, Zr, N, null, null );
	assert.strictEqual( info, 0, 'returns 0' );
	for ( k = 0; k < N; k++ ) {
		assert.ok( Math.abs( wr[ k ] - expected[ k ] ) <= 1e-14, 'eigenvalue ' + k );
	}

	// Residual ( A - lambda I ) z for each eigenvector (Z row-major: column k is eigenvector k). Row i of A z: (-i)*z(i+1) from the superdiagonal, (+i)*z(i-1) from the subdiagonal:
	const zr = reinterpret( Zr, 0 );
	for ( k = 0; k < N; k++ ) {
		lam = wr[ k ];
		for ( i = 0; i < N; i++ ) {
			re = ( 2.0 - lam ) * zr[ 2 * ( ( i * N ) + k ) ];
			im = ( 2.0 - lam ) * zr[ ( 2 * ( ( i * N ) + k ) ) + 1 ];
			if ( i > 0 ) {
				// (+i)*(a+bi) = -b + ai
				re -= zr[ ( 2 * ( ( ( i - 1 ) * N ) + k ) ) + 1 ];
				im += zr[ 2 * ( ( ( i - 1 ) * N ) + k ) ];
			}
			if ( i < N - 1 ) {
				// (-i)*(a+bi) = b - ai
				re += zr[ ( 2 * ( ( ( i + 1 ) * N ) + k ) ) + 1 ];
				im -= zr[ 2 * ( ( ( i + 1 ) * N ) + k ) ];
			}
			assert.ok( Math.abs( re ) <= 1e-14 && Math.abs( im ) <= 1e-14, 'residual ' + i + ',' + k );
		}
	}

	// Same matrix in column-major band storage (LDAB = kd+1) gives the transposed, bit-identical result:
	const ABc = new Complex128Array( [ 0, 0, 2, 0, 0, -1, 2, 0, 0, -1, 2, 0, 0, -1, 2, 0 ] );
	const wc = new Float64Array( N );
	const Zc = new Complex128Array( N * N );
	info = zhbev( 'column-major', 'compute-vectors', 'upper', N, 1, ABc, 2, wc, 1, Zc, N, new Complex128Array( N ), new Float64Array( ( 3 * N ) - 2 ) );
	assert.strictEqual( info, 0, 'returns 0' );
	assert.deepStrictEqual( wr, wc, 'eigenvalues match column-major' );
	const zc = reinterpret( Zc, 0 );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			assert.strictEqual( zr[ 2 * ( ( i * N ) + j ) ], zc[ 2 * ( ( j * N ) + i ) ], 'Re Z(' + i + ',' + j + ')' );
			assert.strictEqual( zr[ ( 2 * ( ( i * N ) + j ) ) + 1 ], zc[ ( 2 * ( ( j * N ) + i ) ) + 1 ], 'Im Z(' + i + ',' + j + ')' );
		}
	}
});
