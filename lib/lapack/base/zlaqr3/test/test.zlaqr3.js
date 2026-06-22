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
	assert.strictEqual( zlaqr3.length, 27, 'has expected arity' );
});

test( 'zlaqr3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaqr3( true, true, -1, 1, 0, 0, new Complex128Array( 4 ), 2, 1, 0, new Complex128Array( 4 ), 2, 0, 0, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, new Float64Array( 4 ), 1, 4 );
	}, RangeError );
});

test( 'zlaqr3 throws RangeError for invalid LDH', function t() {
	assert.throws( function throws() {
		zlaqr3( true, true, 2, 1, 0, 0, new Complex128Array( 4 ), 1, 1, 0, new Complex128Array( 4 ), 2, 0, 0, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, new Float64Array( 4 ), 1, 4 );
	}, RangeError );
});

test( 'zlaqr3 returns `{ns, nd}` for trivial empty deflation window (nw=0)', function t() {
	var H;
	var Z;
	var SH;
	var V;
	var T;
	var WV;
	var WORK;
	var out;
	var N;

	N = 2;
	H = new Complex128Array( N * N );
	Z = new Complex128Array( N * N );
	SH = new Complex128Array( N );
	V = new Complex128Array( N * N );
	T = new Complex128Array( N * N );
	WV = new Complex128Array( N * N );
	WORK = new Float64Array( N );

	out = zlaqr3( true, true, N, 1, N, 0, H, N, 1, N, Z, N, 0, 0, SH, 1, V, N, N, T, N, N, WV, N, WORK, 1, N );
	assert.strictEqual( typeof out, 'object', 'returns an object' );
	assert.strictEqual( out.ns, 0, 'ns is 0' );
	assert.strictEqual( out.nd, 0, 'nd is 0' );
});
