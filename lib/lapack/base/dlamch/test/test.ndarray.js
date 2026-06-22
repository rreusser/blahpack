/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import dlamch from './../lib/index.js';

test( 'dlamch: main export is a function', function t() {
	assert.strictEqual( typeof dlamch, 'function' );
});

test( 'dlamch: epsilon (E)', function t() {
	var eps = dlamch( 'epsilon' );
	assert.ok( eps > 0 );
	assert.ok( eps < 1e-15 );
	assert.equal( eps, 1.1102230246251565e-16 );
});

test( 'dlamch: safe minimum (S)', function t() {
	var sfmin = dlamch( 'safe-minimum' );
	assert.ok( sfmin > 0 );
	assert.ok( sfmin < 1e-300 );
});

test( 'dlamch: base (B)', function t() {
	assert.equal( dlamch( 'base' ), 2 );
});

test( 'dlamch: precision (P)', function t() {
	var prec = dlamch( 'precision' );
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

test( 'dlamch: unrecognized character returns 0', function t() {
	assert.strictEqual( dlamch( 'X' ), 0.0 );
	assert.strictEqual( dlamch( 'Z' ), 0.0 );
});
