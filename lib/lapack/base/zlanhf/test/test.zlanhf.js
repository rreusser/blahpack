/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlanhf from './../lib/zlanhf.js';


// TESTS //

test( 'zlanhf is a function', function t() {
	assert.strictEqual( typeof zlanhf, 'function', 'is a function' );
});

test( 'zlanhf has expected arity', function t() {
	assert.strictEqual( zlanhf.length, 6, 'has expected arity' );
});

test( 'zlanhf throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlanhf( 'invalid', 'no-transpose', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});


test( 'zlanhf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlanhf( 'max', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlanhf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlanhf( 'max', 'no-transpose', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
