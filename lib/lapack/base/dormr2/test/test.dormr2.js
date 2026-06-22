/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormr2 from './../lib/dormr2.js';


// TESTS //

test( 'dormr2 is a function', function t() {
	assert.strictEqual( typeof dormr2, 'function', 'is a function' );
});

test( 'dormr2 has expected arity', function t() {
	assert.strictEqual( dormr2.length, 13, 'has expected arity' );
});

test( 'dormr2 throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormr2( 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dormr2 throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormr2( 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dormr2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormr2( 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dormr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormr2( 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dormr2 throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dormr2( 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
