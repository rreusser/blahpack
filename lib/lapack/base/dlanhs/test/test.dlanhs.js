/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlanhs from './../lib/dlanhs.js';


// TESTS //

test( 'dlanhs is a function', function t() {
	assert.strictEqual( typeof dlanhs, 'function', 'is a function' );
});

test( 'dlanhs has expected arity', function t() {
	assert.strictEqual( dlanhs.length, 7, 'has expected arity' );
});

test( 'dlanhs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlanhs( 'invalid', 'max', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlanhs throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlanhs( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlanhs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlanhs( 'row-major', 'max', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
