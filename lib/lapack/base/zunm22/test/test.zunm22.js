/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zunm22 from './../lib/zunm22.js';


// TESTS //

test( 'zunm22 is a function', function t() {
	assert.strictEqual( typeof zunm22, 'function', 'is a function' );
});

test( 'zunm22 has expected arity', function t() {
	assert.strictEqual( zunm22.length, 14, 'has expected arity' );
});

test( 'zunm22 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunm22( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'zunm22 throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunm22( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'zunm22 throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunm22( 'row-major', 'left', 'invalid', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'zunm22 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunm22( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'zunm22 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunm22( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});
