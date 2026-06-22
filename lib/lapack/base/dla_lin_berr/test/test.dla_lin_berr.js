/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_lin_berr from './../lib/dla_lin_berr.js';


// TESTS //

test( 'dla_lin_berr is a function', function t() {
	assert.strictEqual( typeof dla_lin_berr, 'function', 'is a function' );
});

test( 'dla_lin_berr has expected arity', function t() {
	assert.strictEqual( dla_lin_berr.length, 8, 'has expected arity' );
});

test( 'dla_lin_berr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_lin_berr( -1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 1 ) );
	}, /invalid argument/ );
});

test( 'dla_lin_berr throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dla_lin_berr( 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 1 ) );
	}, /invalid argument/ );
});

test( 'dla_lin_berr throws RangeError when LDRES < max(1,N)', function t() {
	assert.throws( function throws() {
		dla_lin_berr( 3, 3, 1, new Float64Array( 9 ), 2, new Float64Array( 9 ), 3, new Float64Array( 1 ) );
	}, /invalid argument/ );
});

test( 'dla_lin_berr throws RangeError when LDAYB < max(1,N)', function t() {
	assert.throws( function throws() {
		dla_lin_berr( 3, 3, 1, new Float64Array( 9 ), 3, new Float64Array( 9 ), 2, new Float64Array( 1 ) );
	}, /invalid argument/ );
});

test( 'dla_lin_berr computes the backward error (column-major, LD=N)', function t() {
	var nrhs = 2;
	var berr = new Float64Array( nrhs );
	var res = new Float64Array([
		1e-5,
		2e-5,
		3e-5,
		4e-5,
		5e-5,
		6e-5
	]);
	var ayb = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var N = 3;
	dla_lin_berr( N, N, nrhs, res, N, ayb, N, berr );
	assert.ok( Math.abs( berr[ 0 ] - 1e-5 ) < 1e-17, 'col 0' );
	assert.ok( Math.abs( berr[ 1 ] - 1e-5 ) < 1e-17, 'col 1' );
});

test( 'dla_lin_berr: zero denominator rows are skipped', function t() {
	var nrhs = 1;
	var berr = new Float64Array( nrhs );
	var res = new Float64Array( [ 1.0, 2.0 ] );
	var ayb = new Float64Array( [ 0.0, 4.0 ] );
	var N = 2;
	dla_lin_berr( N, N, nrhs, res, N, ayb, N, berr );
	assert.ok( Math.abs( berr[ 0 ] - 0.5 ) < 1e-15, 'col 0 = 2/4' );
});

test( 'dla_lin_berr: N=0 quick return', function t() {
	var berr = new Float64Array( [ 42.0 ] );
	dla_lin_berr( 0, 0, 1, new Float64Array( 0 ), 1, new Float64Array( 0 ), 1, berr );
	assert.strictEqual( berr[ 0 ], 42.0, 'berr untouched' );
});

test( 'dla_lin_berr: nrhs=0 quick return', function t() {
	var berr = new Float64Array( [ 42.0 ] );
	dla_lin_berr( 3, 3, 0, new Float64Array( 3 ), 3, new Float64Array( 3 ), 3, berr );
	assert.strictEqual( berr[ 0 ], 42.0, 'berr untouched' );
});
