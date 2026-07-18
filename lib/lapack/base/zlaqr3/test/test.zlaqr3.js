/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlaqr3 from './../lib/zlaqr3.js';


// TESTS //

test( 'zlaqr3 is a function', function t() {
	assert.strictEqual( typeof zlaqr3, 'function', 'is a function' );
});

test( 'zlaqr3 has expected arity', function t() {
	assert.strictEqual( zlaqr3.length, 26, 'has expected arity' );
});

test( 'zlaqr3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaqr3( true, true, -1, 1, 0, 0, new Complex128Array( 4 ), 2, 1, 0, new Complex128Array( 4 ), 2, 0, 0, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zlaqr3 throws RangeError for invalid LDH', function t() {
	assert.throws( function throws() {
		zlaqr3( true, true, 2, 1, 0, 0, new Complex128Array( 4 ), 1, 1, 0, new Complex128Array( 4 ), 2, 0, 0, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zlaqr3 returns `{ns, nd}` for trivial empty deflation window (nw=0)', function t() {

	const N = 2;
	const H = new Complex128Array( N * N );
	const Z = new Complex128Array( N * N );
	const SH = new Complex128Array( N );
	const V = new Complex128Array( N * N );
	const T = new Complex128Array( N * N );
	const WV = new Complex128Array( N * N );
	const WORK = new Float64Array( N );

	const out = zlaqr3( true, true, N, 1, N, 0, H, N, 1, N, Z, N, 0, 0, SH, 1, V, N, N, T, N, N, WV, N, WORK, 1 );
	assert.strictEqual( typeof out, 'object', 'returns an object' );
	assert.strictEqual( out.ns, 0, 'ns is 0' );
	assert.strictEqual( out.nd, 0, 'nd is 0' );
});
