/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlabrd from './../lib/dlabrd.js';


// TESTS //

test( 'dlabrd is a function', function t() {
	assert.strictEqual( typeof dlabrd, 'function', 'is a function' );
});

test( 'dlabrd has expected arity', function t() {
	assert.strictEqual( dlabrd.length, 18, 'has expected arity' );
});

test( 'dlabrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlabrd( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlabrd throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlabrd( 'row-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlabrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlabrd( 'row-major', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
