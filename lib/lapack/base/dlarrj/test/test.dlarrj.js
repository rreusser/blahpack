/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrj from './../lib/dlarrj.js';


// TESTS //

test( 'dlarrj is a function', function t() {
	assert.strictEqual( typeof dlarrj, 'function', 'is a function' );
});

test( 'dlarrj has expected arity', function t() {
	assert.strictEqual( dlarrj.length, 19, 'has expected arity' );
});

test( 'dlarrj throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarrj( -1, 2, 1, new Float64Array( 4 ), 1, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, 2 );
	}, RangeError );
});
