/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgerfs from './../lib/dgerfs.js';


// TESTS //

test( 'dgerfs is a function', function t() {
	assert.strictEqual( typeof dgerfs, 'function', 'is a function' );
});

test( 'dgerfs has expected arity', function t() {
	assert.strictEqual( dgerfs.length, 21, 'has expected arity' );
});

test( 'dgerfs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgerfs( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgerfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgerfs( 'no-transpose', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgerfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgerfs( 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
