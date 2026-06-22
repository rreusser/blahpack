/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaed2 from './../lib/dlaed2.js';


// TESTS //

test( 'dlaed2 is a function', function t() {
	assert.strictEqual( typeof dlaed2, 'function', 'is a function' );
});

test( 'dlaed2 has expected arity', function t() {
	assert.strictEqual( dlaed2.length, 15, 'has expected arity' );
});

test( 'dlaed2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaed2( -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
