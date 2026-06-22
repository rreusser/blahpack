/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgex2 from './../lib/dtgex2.js';


// TESTS //

test( 'dtgex2 is a function', function t() {
	assert.strictEqual( typeof dtgex2, 'function', 'is a function' );
});

test( 'dtgex2 has expected arity', function t() {
	assert.strictEqual( dtgex2.length, 18, 'has expected arity' );
});

test( 'dtgex2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtgex2( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'dtgex2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgex2( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});
