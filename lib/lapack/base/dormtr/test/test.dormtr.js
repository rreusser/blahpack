/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormtr from './../lib/dormtr.js';


// TESTS //

test( 'dormtr is a function', function t() {
	assert.strictEqual( typeof dormtr, 'function', 'is a function' );
});

test( 'dormtr has expected arity', function t() {
	assert.strictEqual( dormtr.length, 14, 'has expected arity' );
});

test( 'dormtr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormtr( 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'dormtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dormtr( 'left', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'dormtr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormtr( 'left', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'dormtr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormtr( 'left', 'upper', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'dormtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormtr( 'left', 'upper', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
