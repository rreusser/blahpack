/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpftrf from './../lib/dpftrf.js';


// TESTS //

test( 'dpftrf is a function', function t() {
	assert.strictEqual( typeof dpftrf, 'function', 'is a function' );
});

test( 'dpftrf has expected arity', function t() {
	assert.strictEqual( dpftrf.length, 4, 'has expected arity' );
});

test( 'dpftrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpftrf( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpftrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpftrf( 2, 'upper', -1, new Float64Array( 4 ) );
	}, RangeError );
});
