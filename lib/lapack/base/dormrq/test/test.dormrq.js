/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormrq from './../lib/dormrq.js';


// TESTS //

test( 'dormrq is a function', function t() {
	assert.strictEqual( typeof dormrq, 'function', 'is a function' );
});

test( 'dormrq has expected arity', function t() {
	assert.strictEqual( dormrq.length, 13, 'has expected arity' );
});

test( 'dormrq throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormrq( 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dormrq throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormrq( 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dormrq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormrq( 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dormrq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormrq( 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dormrq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dormrq( 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
