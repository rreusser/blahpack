/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgetrf from './../lib/dgetrf.js';


// TESTS //

test( 'dgetrf is a function', function t() {
	assert.strictEqual( typeof dgetrf, 'function', 'is a function' );
});

test( 'dgetrf has expected arity', function t() {
	assert.strictEqual( dgetrf.length, 7, 'has expected arity' );
});

test( 'dgetrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgetrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgetrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgetrf( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgetrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgetrf( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
