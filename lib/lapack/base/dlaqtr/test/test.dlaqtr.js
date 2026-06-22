/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function, vars-on-top */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqtr from './../lib/dlaqtr.js';


// TESTS //

test( 'dlaqtr is a function', function t() {
	assert.strictEqual( typeof dlaqtr, 'function', 'is a function' );
});

test( 'dlaqtr has expected arity', function t() {
	assert.strictEqual( dlaqtr.length, 13, 'has expected arity' );
});

test( 'dlaqtr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlaqtr( 'invalid', false, true, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 0, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlaqtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqtr( 'row-major', false, true, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 0, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dlaqtr throws RangeError for invalid LDT (row-major)', function t() {
	assert.throws( function throws() {
		dlaqtr( 'row-major', false, true, 3, new Float64Array( 9 ), 1, new Float64Array( 4 ), 1, 0, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dlaqtr column-major path executes (N=1 trivial)', function t() {
	var T = new Float64Array( [ 2.0 ] );
	var b = new Float64Array( 1 );
	var x = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var out;
	x[ 0 ] = 6.0;
	out = dlaqtr( 'column-major', false, true, 1, T, 1, b, 1, 0, x, 1, WORK, 1 );
	assert.strictEqual( out.info, 0 );
	assert.ok( Math.abs( x[ 0 ] - 3.0 ) < 1e-12 );
});

test( 'dlaqtr row-major path executes (N=1 trivial)', function t() {
	var T = new Float64Array( [ 2.0 ] );
	var b = new Float64Array( 1 );
	var x = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var out;
	x[ 0 ] = 6.0;
	out = dlaqtr( 'row-major', false, true, 1, T, 1, b, 1, 0, x, 1, WORK, 1 );
	assert.strictEqual( out.info, 0 );
	assert.ok( Math.abs( x[ 0 ] - 3.0 ) < 1e-12 );
});
