/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dptrfs from './../lib/dptrfs.js';


// TESTS //

test( 'dptrfs is a function', function t() {
	assert.strictEqual( typeof dptrfs, 'function', 'is a function' );
});

test( 'dptrfs has expected arity', function t() {
	assert.strictEqual( dptrfs.length, 20, 'has expected arity' );
});

test( 'dptrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dptrfs( -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dptrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dptrfs( new Float64Array( 4 ), -1, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
