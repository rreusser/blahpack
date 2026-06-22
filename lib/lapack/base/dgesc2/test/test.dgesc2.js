/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgesc2 from './../lib/dgesc2.js';


// TESTS //

test( 'dgesc2 is a function', function t() {
	assert.strictEqual( typeof dgesc2, 'function', 'is a function' );
});

test( 'dgesc2 has expected arity', function t() {
	assert.strictEqual( dgesc2.length, 10, 'has expected arity' );
});

test( 'dgesc2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgesc2( -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
