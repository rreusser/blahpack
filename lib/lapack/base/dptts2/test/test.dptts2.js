/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dptts2 from './../lib/dptts2.js';


// TESTS //

test( 'dptts2 is a function', function t() {
	assert.strictEqual( typeof dptts2, 'function', 'is a function' );
});

test( 'dptts2 has expected arity', function t() {
	assert.strictEqual( dptts2.length, 8, 'has expected arity' );
});

test( 'dptts2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dptts2( -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dptts2 throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dptts2( new Float64Array( 4 ), -1, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
