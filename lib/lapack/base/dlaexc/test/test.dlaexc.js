/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaexc from './../lib/dlaexc.js';


// TESTS //

test( 'dlaexc is a function', function t() {
	assert.strictEqual( typeof dlaexc, 'function', 'is a function' );
});

test( 'dlaexc has expected arity', function t() {
	assert.strictEqual( dlaexc.length, 11, 'has expected arity' );
});

test( 'dlaexc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaexc( 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
