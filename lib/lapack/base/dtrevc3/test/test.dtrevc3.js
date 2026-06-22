/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrevc3 from './../lib/dtrevc3.js';


// TESTS //

test( 'dtrevc3 is a function', function t() {
	assert.strictEqual( typeof dtrevc3, 'function', 'is a function' );
});

test( 'dtrevc3 has expected arity', function t() {
	assert.strictEqual( dtrevc3.length, 16, 'has expected arity' );
});

test( 'dtrevc3 throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dtrevc3( 'invalid', 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'dtrevc3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrevc3( 'left', 2, new Float64Array( 4 ), 1, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'dtrevc3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtrevc3( 'left', 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
