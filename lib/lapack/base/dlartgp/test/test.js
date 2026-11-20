/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartgp from './../lib/index.js';


// VARIABLES //

const EPS = 2.220446049250313e-16;


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlartgp, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlartgp.ndarray, 'function', 'has ndarray method' );
});

test( 'main export: classic 3-4-5 triangle', function t() {
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );
	const r = new Float64Array( 1 );
	dlartgp( 3.0, 4.0, cs, sn, r );
	assert.ok( Math.abs( cs[ 0 ] - 0.6 ) < EPS, 'c = 0.6' );
	assert.ok( Math.abs( sn[ 0 ] - 0.8 ) < EPS, 's = 0.8' );
	assert.ok( Math.abs( r[ 0 ] - 5.0 ) < EPS, 'r = 5' );
	assert.ok( r[ 0 ] >= 0.0, 'r non-negative' );
});

test( 'main export: both negative yields non-negative r', function t() {
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );
	const r = new Float64Array( 1 );
	dlartgp( -3.0, -4.0, cs, sn, r );
	assert.ok( r[ 0 ] >= 0.0, 'r non-negative' );
	assert.ok( Math.abs( r[ 0 ] - 5.0 ) < EPS, 'r = 5' );
	assert.ok( Math.abs( cs[ 0 ] - ( -0.6 ) ) < EPS, 'c = -0.6' );
	assert.ok( Math.abs( sn[ 0 ] - ( -0.8 ) ) < EPS, 's = -0.8' );
});

test( 'main export: g = 0 sets s = 0', function t() {
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );
	const r = new Float64Array( 1 );
	dlartgp( 7.0, 0.0, cs, sn, r );
	assert.strictEqual( cs[ 0 ], 1.0 );
	assert.strictEqual( sn[ 0 ], 0.0 );
	assert.strictEqual( r[ 0 ], 7.0 );
});

test( 'main export: f = 0 sets c = 0', function t() {
	const cs = new Float64Array( 1 );
	const sn = new Float64Array( 1 );
	const r = new Float64Array( 1 );
	dlartgp( 0.0, 7.0, cs, sn, r );
	assert.strictEqual( cs[ 0 ], 0.0 );
	assert.strictEqual( sn[ 0 ], 1.0 );
	assert.strictEqual( r[ 0 ], 7.0 );
});

test( 'ndarray method writes to provided Float64Array', function t() {
	const out = new Float64Array( 3 );
	dlartgp.ndarray( 3.0, 4.0, out.subarray( 0, 1 ), out.subarray( 1, 2 ), out.subarray( 2, 3 ) );
	const result = out;
	assert.strictEqual( result, out );
	assert.ok( Math.abs( out[ 0 ] - 0.6 ) < EPS );
	assert.ok( Math.abs( out[ 1 ] - 0.8 ) < EPS );
	assert.ok( Math.abs( out[ 2 ] - 5.0 ) < EPS );
});
