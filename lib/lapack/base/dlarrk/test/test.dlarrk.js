/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrk from './../lib/dlarrk.js';


// TESTS //

test( 'dlarrk is a function', function t() {
	assert.strictEqual( typeof dlarrk, 'function', 'is a function' );
});

test( 'dlarrk has expected arity', function t() {
	assert.strictEqual( dlarrk.length, 12, 'has expected arity' );
});

test( 'dlarrk throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarrk( -1, 1, 0.0, 1.0, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 1e-18, 1e-12, new Float64Array( 1 ), new Float64Array( 1 ) );
	}, RangeError );
});

test( 'dlarrk computes eigenvalue of 1x1 matrix', function t() {
	var werr;
	var info;
	var e2;
	var d;
	var w;

	d = new Float64Array( [ 3.0 ] );
	e2 = new Float64Array( [ 0.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 1, 1, 0.0, 6.0, d, 1, e2, 1, 1e-18, 1e-12, w, werr );
	assert.equal( info, 0, 'info' );
	assert.ok( Math.abs( w[ 0 ] - 3.0 ) < 1e-8, 'eigenvalue near 3.0' );
});
