/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartgp from './../lib/index.js';


// VARIABLES //

var EPS = 2.220446049250313e-16;


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlartgp, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlartgp.ndarray, 'function', 'has ndarray method' );
});

test( 'main export: classic 3-4-5 triangle', function t() {
	var result = dlartgp( 3.0, 4.0 );
	assert.ok( Math.abs( result.c - 0.6 ) < EPS, 'c = 0.6' );
	assert.ok( Math.abs( result.s - 0.8 ) < EPS, 's = 0.8' );
	assert.ok( Math.abs( result.r - 5.0 ) < EPS, 'r = 5' );
	assert.ok( result.r >= 0.0, 'r non-negative' );
});

test( 'main export: both negative yields non-negative r', function t() {
	var result = dlartgp( -3.0, -4.0 );
	assert.ok( result.r >= 0.0, 'r non-negative' );
	assert.ok( Math.abs( result.r - 5.0 ) < EPS, 'r = 5' );
	assert.ok( Math.abs( result.c - ( -0.6 ) ) < EPS, 'c = -0.6' );
	assert.ok( Math.abs( result.s - ( -0.8 ) ) < EPS, 's = -0.8' );
});

test( 'main export: g = 0 sets s = 0', function t() {
	var result = dlartgp( 7.0, 0.0 );
	assert.strictEqual( result.c, 1.0 );
	assert.strictEqual( result.s, 0.0 );
	assert.strictEqual( result.r, 7.0 );
});

test( 'main export: f = 0 sets c = 0', function t() {
	var result = dlartgp( 0.0, 7.0 );
	assert.strictEqual( result.c, 0.0 );
	assert.strictEqual( result.s, 1.0 );
	assert.strictEqual( result.r, 7.0 );
});

test( 'ndarray method writes to provided Float64Array', function t() {
	var result;
	var out = new Float64Array( 3 );
	result = dlartgp.ndarray( 3.0, 4.0, out );
	assert.strictEqual( result, out );
	assert.ok( Math.abs( out[ 0 ] - 0.6 ) < EPS );
	assert.ok( Math.abs( out[ 1 ] - 0.8 ) < EPS );
	assert.ok( Math.abs( out[ 2 ] - 5.0 ) < EPS );
});
