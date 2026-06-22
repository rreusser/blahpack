/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlapmr from './../lib/dlapmr.js';


// TESTS //

test( 'dlapmr is a function', function t() {
	assert.strictEqual( typeof dlapmr, 'function', 'is a function' );
});

test( 'dlapmr has expected arity', function t() {
	assert.strictEqual( dlapmr.length, 7, 'has expected arity' );
});

test( 'dlapmr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlapmr( 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});

test( 'dlapmr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlapmr( 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
