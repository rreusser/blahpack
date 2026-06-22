/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpttrs from './../lib/dpttrs.js';


// TESTS //

test( 'dpttrs is a function', function t() {
	assert.strictEqual( typeof dpttrs, 'function', 'is a function' );
});

test( 'dpttrs has expected arity', function t() {
	assert.strictEqual( dpttrs.length, 8, 'has expected arity' );
});

test( 'dpttrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpttrs( -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dpttrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dpttrs( new Float64Array( 4 ), -1, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
