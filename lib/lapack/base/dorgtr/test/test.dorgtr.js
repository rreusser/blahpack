/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgtr from './../lib/dorgtr.js';


// TESTS //

test( 'dorgtr is a function', function t() {
	assert.strictEqual( typeof dorgtr, 'function', 'is a function' );
});

test( 'dorgtr has expected arity', function t() {
	assert.strictEqual( dorgtr.length, 9, 'has expected arity' );
});

test( 'dorgtr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgtr( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dorgtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dorgtr( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dorgtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgtr( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
