/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dptrfs from './../lib/ndarray.js';
import dpttrf from '../../dpttrf/lib/base.js';
import dpttrs from '../../dpttrs/lib/base.js';

// FIXTURES //

import basic_5x5 from './fixtures/basic_5x5.json' with { type: 'json' };
import multi_rhs_2 from './fixtures/multi_rhs_2.json' with { type: 'json' };
import n_eq_1 from './fixtures/n_eq_1.json' with { type: 'json' };
import perturbed from './fixtures/perturbed.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dptrfs: basic_5x5', function t() {
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = basic_5x5;
	d = new Float64Array( [ 4, 3, 2, 3, 4 ] );
	e = new Float64Array( [ 2, -1.5, 0.5, -0.75 ] );
	df = new Float64Array( d );
	ef = new Float64Array( e );
	b = new Float64Array( [ 8, 3.5, 5, 9.75, 17 ] );
	x = new Float64Array( b );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 10 );
	dpttrf( 5, df, 1, 0, ef, 1, 0 );
	dpttrs( 5, 1, df, 1, 0, ef, 1, 0, x, 1, 5, 0 );
	info = dptrfs( 5, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 5, 0, x, 1, 5, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( ferr ), tc.ferr, 0.5, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-14, 'berr' );
});

test( 'dptrfs: multi_rhs_2', function t() {
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = multi_rhs_2;
	d = new Float64Array( [ 4, 3, 2, 3, 4 ] );
	e = new Float64Array( [ 2, -1.5, 0.5, -0.75 ] );
	df = new Float64Array( d );
	ef = new Float64Array( e );
	b = new Float64Array( [ 8, 3.5, 5, 9.75, 17, 28, 17.5, 1, 6.75, 2.5 ] );
	x = new Float64Array( b );
	ferr = new Float64Array( 2 );
	berr = new Float64Array( 2 );
	work = new Float64Array( 10 );
	dpttrf( 5, df, 1, 0, ef, 1, 0 );
	dpttrs( 5, 2, df, 1, 0, ef, 1, 0, x, 1, 5, 0 );
	info = dptrfs( 5, 2, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 5, 0, x, 1, 5, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( ferr ), tc.ferr, 0.5, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dptrfs: n_eq_1', function t() {
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = n_eq_1;
	d = new Float64Array( [ 5 ] );
	e = new Float64Array( 0 );
	df = new Float64Array( d );
	ef = new Float64Array( 0 );
	b = new Float64Array( [ 15 ] );
	x = new Float64Array( b );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 2 );
	dpttrf( 1, df, 1, 0, ef, 1, 0 );
	dpttrs( 1, 1, df, 1, 0, ef, 1, 0, x, 1, 1, 0 );
	info = dptrfs( 1, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( ferr ), tc.ferr, 0.5, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-14, 'berr' );
});

test( 'dptrfs: n_eq_0', function t() {
	var ferr;
	var berr;
	var work;
	var info;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	d = new Float64Array( 0 );
	e = new Float64Array( 0 );
	df = new Float64Array( 0 );
	ef = new Float64Array( 0 );
	b = new Float64Array( 0 );
	x = new Float64Array( 0 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 0 );
	info = dptrfs( 0, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.equal( ferr[ 0 ], 0.0, 'ferr zeroed' );
	assert.equal( berr[ 0 ], 0.0, 'berr zeroed' );
});

test( 'dptrfs: nrhs_eq_0', function t() {
	var ferr;
	var berr;
	var work;
	var info;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	d = new Float64Array( [ 4, 3, 2, 3, 4 ] );
	e = new Float64Array( [ 2, -1.5, 0.5, -0.75 ] );
	df = new Float64Array( d );
	ef = new Float64Array( e );
	b = new Float64Array( 5 );
	x = new Float64Array( 5 );
	ferr = new Float64Array( 0 );
	berr = new Float64Array( 0 );
	work = new Float64Array( 10 );
	info = dptrfs( 5, 0, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 5, 0, x, 1, 5, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dptrfs: perturbed', function t() {
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = perturbed;
	d = new Float64Array( [ 4, 3, 2, 3, 4 ] );
	e = new Float64Array( [ 2, -1.5, 0.5, -0.75 ] );
	df = new Float64Array( d );
	ef = new Float64Array( e );
	b = new Float64Array( [ 8, 3.5, 5, 9.75, 17 ] );
	x = new Float64Array( b );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 10 );
	dpttrf( 5, df, 1, 0, ef, 1, 0 );
	dpttrs( 5, 1, df, 1, 0, ef, 1, 0, x, 1, 5, 0 );
	x[ 0 ] += 1e-10;
	x[ 2 ] -= 1e-10;
	x[ 4 ] += 1e-10;
	info = dptrfs( 5, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 5, 0, x, 1, 5, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-14, 'x' );
	assert.ok( berr[ 0 ] < 1e-14, 'berr is small' );
});
