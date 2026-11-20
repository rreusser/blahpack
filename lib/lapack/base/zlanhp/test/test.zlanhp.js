/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlanhp from './../lib/zlanhp.js';


// TESTS //

test( 'zlanhp is a function', function t() {
	assert.strictEqual( typeof zlanhp, 'function', 'is a function' );
});

test( 'zlanhp has expected arity', function t() {
	assert.strictEqual( zlanhp.length, 6, 'has expected arity' );
});

test( 'zlanhp throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlanhp( 'column-major', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlanhp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlanhp( 'column-major', 'max', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlanhp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlanhp( 'column-major', 'max', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
