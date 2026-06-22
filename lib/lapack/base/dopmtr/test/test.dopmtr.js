/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dopmtr from './../lib/dopmtr.js';


// TESTS //

test( 'dopmtr is a function', function t() {
	assert.strictEqual( typeof dopmtr, 'function', 'is a function' );
});

test( 'dopmtr has expected arity', function t() {
	assert.strictEqual( dopmtr.length, 10, 'has expected arity' );
});

test( 'dopmtr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dopmtr( 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dopmtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dopmtr( 'left', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dopmtr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dopmtr( 'left', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dopmtr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dopmtr( 'left', 'upper', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dopmtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dopmtr( 'left', 'upper', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
