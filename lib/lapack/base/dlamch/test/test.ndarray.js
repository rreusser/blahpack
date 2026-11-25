/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import dlamch from './../lib/ndarray.js';
import base from './../lib/base.js';

test( 'dlamch: main export is a function', function t() {
	assert.strictEqual( typeof dlamch, 'function' );
});

test( 'dlamch: epsilon (E)', function t() {
	const eps = dlamch( 'epsilon' );
	assert.ok( eps > 0 );
	assert.ok( eps < 1e-15 );
	assert.equal( eps, 1.1102230246251565e-16 );
});

test( 'dlamch: safe minimum (S)', function t() {
	const sfmin = dlamch( 'safe-minimum' );
	assert.ok( sfmin > 0 );
	assert.ok( sfmin < 1e-300 );
});

test( 'dlamch: base (B)', function t() {
	assert.equal( dlamch( 'base' ), 2 );
});

test( 'dlamch: precision (P)', function t() {
	const prec = dlamch( 'precision' );
	assert.equal( prec, 2 * dlamch( 'epsilon' ) );
});

test( 'dlamch: number of digits (N)', function t() {
	assert.equal( dlamch( 'digits' ), 53 );
});

test( 'dlamch: rounding mode (R)', function t() {
	assert.equal( dlamch( 'rounding' ), 1.0 );
});

test( 'dlamch: min exponent (M)', function t() {
	assert.equal( dlamch( 'min-exponent' ), -1021 );
});

test( 'dlamch: underflow threshold (U)', function t() {
	assert.ok( dlamch( 'underflow' ) > 0 );
});

test( 'dlamch: max exponent (L)', function t() {
	assert.equal( dlamch( 'max-exponent' ), 1024 );
});

test( 'dlamch: overflow threshold (O)', function t() {
	assert.equal( dlamch( 'overflow' ), 1.7976931348623157e+308 );
});

test( 'dlamch: case-insensitive', function t() {
	assert.equal( dlamch( 'epsilon' ), dlamch( 'epsilon' ) );
	assert.equal( dlamch( 'safe-minimum' ), dlamch( 'safe-minimum' ) );
});

test( 'dlamch throws TypeError when the machine parameter is not one of the canonical strings (ticket 0092)', function t() {
	const values = [ 5, null, void 0, true, {}, [ 'epsilon' ], 'e', 'E', 'Epsilon', 'scale', 'X' ];
	let i;
	for ( i = 0; i < values.length; i++ ) {
		assert.throws( function throws() {
			dlamch( values[ i ] );
		}, {
			'name': 'TypeError',
			'message': /^invalid argument\. First argument must be one of the following: "epsilon", .*\. Value: `/
		}, 'throws for ' + String( values[ i ] ) );
	}
});

test( 'dlamch base: a parameter it has no value for returns 0, as the reference does', function t() {
	// DLAMCH returns ZERO for any letter it does not recognize. The public
	// entry points reject such a value (ticket 0092); base.js keeps the
	// reference fallback.
	assert.strictEqual( base( 'X' ), 0.0 );
	assert.strictEqual( base( 'Z' ), 0.0 );
});
