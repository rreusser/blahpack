/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqrf from './../lib/dgeqrf.js';


// TESTS //

test( 'dgeqrf is a function', function t() {
	assert.strictEqual( typeof dgeqrf, 'function', 'is a function' );
});

test( 'dgeqrf has expected arity', function t() {
	assert.strictEqual( dgeqrf.length, 9, 'has expected arity' );
});

test( 'dgeqrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeqrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgeqrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeqrf( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgeqrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeqrf( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
