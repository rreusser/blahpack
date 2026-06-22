

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeql2 from './../lib/dgeql2.js';


// TESTS //

test( 'dgeql2 is a function', function t() {
	assert.strictEqual( typeof dgeql2, 'function', 'is a function' );
});

test( 'dgeql2 has expected arity', function t() {
	assert.strictEqual( dgeql2.length, 9, 'has expected arity' );
});

test( 'dgeql2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgeql2( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgeql2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgeql2( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgeql2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeql2( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

