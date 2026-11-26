/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zggev from './../lib/zggev.js';


// TESTS //

test( 'zggev is a function', function t() {
	assert.strictEqual( typeof zggev, 'function', 'is a function' );
});

test( 'zggev has expected arity', function t() {
	assert.strictEqual( zggev.length, 18, 'has expected arity' );
});

test( 'zggev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zggev( 'invalid', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zggev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zggev( 'row-major', 'no-vectors', 'no-vectors', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zggev throws RangeError when jobvl = compute-vectors and 1 <= LDVL < N', function t() {
	assert.throws( function throws() {
		zggev( 'column-major', 'compute-vectors', 'no-vectors', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, null, null );
	}, RangeError );
});

test( 'zggev throws RangeError when jobvr = compute-vectors and 1 <= LDVR < N', function t() {
	assert.throws( function throws() {
		zggev( 'column-major', 'no-vectors', 'compute-vectors', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, null, null );
	}, RangeError );
});

test( 'zggev: N=40 (> NB=32) with work = null matches the optimal explicit work bit-for-bit', function t() {
	const N = 40;
	const A0 = new Float64Array( 2 * N * N );
	const B0 = new Float64Array( 2 * N * N );
	let seed = 4242;
	let i;
	for ( i = 0; i < 2 * N * N; i++ ) {
		seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
		A0[ i ] = ( seed / 2147483648 ) - 0.5;
		seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
		B0[ i ] = ( seed / 2147483648 ) - 0.5;
	}
	const runs = [ null, new Complex128Array( N + ( N * 32 ) + 4160 ) ].map( function run( work ) {
		const out = {
			'ALPHA': new Complex128Array( N ),
			'BETA': new Complex128Array( N ),
			'VL': new Complex128Array( N * N ),
			'VR': new Complex128Array( N * N )
		};
		out.info = zggev( 'column-major', 'compute-vectors', 'compute-vectors', N, new Complex128Array( A0 ), N, new Complex128Array( B0 ), N, out.ALPHA, 1, out.BETA, 1, out.VL, N, out.VR, N, work, null );
		return out;
	});
	assert.strictEqual( runs[ 0 ].info, 0, 'info' );
	assert.strictEqual( runs[ 1 ].info, 0, 'info' );
	assert.deepStrictEqual( new Float64Array( runs[ 0 ].ALPHA.buffer ), new Float64Array( runs[ 1 ].ALPHA.buffer ), 'ALPHA' );
	assert.deepStrictEqual( new Float64Array( runs[ 0 ].BETA.buffer ), new Float64Array( runs[ 1 ].BETA.buffer ), 'BETA' );
	assert.deepStrictEqual( new Float64Array( runs[ 0 ].VL.buffer ), new Float64Array( runs[ 1 ].VL.buffer ), 'VL' );
	assert.deepStrictEqual( new Float64Array( runs[ 0 ].VR.buffer ), new Float64Array( runs[ 1 ].VR.buffer ), 'VR' );
});
