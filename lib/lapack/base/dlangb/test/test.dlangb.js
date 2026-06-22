/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlangb from './../lib/dlangb.js';


// TESTS //

test( 'dlangb is a function', function t() {
	assert.strictEqual( typeof dlangb, 'function', 'is a function' );
});

test( 'dlangb has expected arity', function t() {
	assert.strictEqual( dlangb.length, 8, 'has expected arity' );
});

test( 'dlangb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlangb( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlangb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlangb( 'max', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
