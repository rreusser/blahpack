/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgtsv from './../lib/dgtsv.js';


// TESTS //

test( 'dgtsv is a function', function t() {
	assert.strictEqual( typeof dgtsv, 'function', 'is a function' );
});

test( 'dgtsv has expected arity', function t() {
	assert.strictEqual( dgtsv.length, 10, 'has expected arity' );
});

test( 'dgtsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgtsv( -1, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgtsv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgtsv( new Float64Array( 4 ), -1, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
