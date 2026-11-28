/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgesvd from './../lib/zgesvd.js';


// TESTS //

test( 'zgesvd is a function', function t() {
	assert.strictEqual( typeof zgesvd, 'function', 'is a function' );
});

test( 'zgesvd has expected arity', function t() {
	assert.strictEqual( zgesvd.length, 15, 'has expected arity' );
});

test( 'zgesvd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgesvd( 'invalid', 'all-columns', 'all-rows', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zgesvd throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgesvd( 'row-major', 'all-columns', 'all-rows', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgesvd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgesvd( 'row-major', 'all-columns', 'all-rows', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgesvd allocates the optimal WORK and an RWORK when passed null (70x40, fast QR path), and A = U*S*V^H', function t() {
	const M = 70;
	const N = 40;
	const A = new Complex128Array( M * N );
	const Av = reinterpret( A, 0 );
	const A0 = new Float64Array( 2 * M * N );
	const s = new Float64Array( N );
	const U = new Complex128Array( M * N );
	const Uv = reinterpret( U, 0 );
	const VT = new Complex128Array( N * N );
	const Vv = reinterpret( VT, 0 );
	let seed = 7;
	let sr;
	let si;
	let ur;
	let ui;
	let vr;
	let vi;
	let i;
	let j;
	let k;
	for ( i = 0; i < 2 * M * N; i++ ) {
		seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
		Av[ i ] = ( seed / 2147483648 ) - 0.5;
		A0[ i ] = Av[ i ];
	}
	const info = zgesvd( 'column-major', 'economy', 'economy', M, N, A, M, s, 1, U, M, VT, N, null, null );
	assert.strictEqual( info, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				ur = Uv[ 2 * ( i + ( k * M ) ) ] * s[ k ];
				ui = Uv[ ( 2 * ( i + ( k * M ) ) ) + 1 ] * s[ k ];
				vr = Vv[ 2 * ( k + ( j * N ) ) ];
				vi = Vv[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
				sr += ( ur * vr ) - ( ui * vi );
				si += ( ur * vi ) + ( ui * vr );
			}
			assert.ok( Math.abs( sr - A0[ 2 * ( i + ( j * M ) ) ] ) < 1e-12 && Math.abs( si - A0[ ( 2 * ( i + ( j * M ) ) ) + 1 ] ) < 1e-12, 'A = U*S*V^H at (' + i + ',' + j + ')' );
		}
	}
});
