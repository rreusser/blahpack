/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgtcon from './../lib/dgtcon.js';


// TESTS //

test( 'dgtcon is a function', function t() {
	assert.strictEqual( typeof dgtcon, 'function', 'is a function' );
});

test( 'dgtcon has expected arity', function t() {
	assert.strictEqual( dgtcon.length, 18, 'has expected arity' );
});

test( 'dgtcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dgtcon( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgtcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgtcon( 'one-norm', -1, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
