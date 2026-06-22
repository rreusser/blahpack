/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbsv from './../lib/zgbsv.js';


// TESTS //

test( 'zgbsv is a function', function t() {
	assert.strictEqual( typeof zgbsv, 'function', 'is a function' );
});

test( 'zgbsv has expected arity', function t() {
	assert.strictEqual( zgbsv.length, 10, 'has expected arity' );
});

test( 'zgbsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgbsv( -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgbsv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgbsv( new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
