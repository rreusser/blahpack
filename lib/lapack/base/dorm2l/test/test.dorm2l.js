/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorm2l from './../lib/dorm2l.js';


// TESTS //

test( 'dorm2l is a function', function t() {
	assert.strictEqual( typeof dorm2l, 'function', 'is a function' );
});

test( 'dorm2l has expected arity', function t() {
	assert.strictEqual( dorm2l.length, 13, 'has expected arity' );
});

test( 'dorm2l throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dorm2l( 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dorm2l throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dorm2l( 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dorm2l throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorm2l( 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorm2l throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorm2l( 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorm2l throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorm2l( 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
