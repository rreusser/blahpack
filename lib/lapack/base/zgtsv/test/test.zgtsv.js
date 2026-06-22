/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgtsv from './../lib/zgtsv.js';


// TESTS //

test( 'zgtsv is a function', function t() {
	assert.strictEqual( typeof zgtsv, 'function', 'is a function' );
});

test( 'zgtsv has expected arity', function t() {
	assert.strictEqual( zgtsv.length, 10, 'has expected arity' );
});

test( 'zgtsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgtsv( -1, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgtsv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgtsv( new Float64Array( 4 ), -1, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
