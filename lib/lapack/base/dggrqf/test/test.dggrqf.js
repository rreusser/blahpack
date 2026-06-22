/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggrqf from './../lib/dggrqf.js';


// TESTS //

test( 'dggrqf is a function', function t() {
	assert.strictEqual( typeof dggrqf, 'function', 'is a function' );
});

test( 'dggrqf has expected arity', function t() {
	assert.strictEqual( dggrqf.length, 11, 'has expected arity' );
});

test( 'dggrqf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dggrqf( -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dggrqf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggrqf( new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
