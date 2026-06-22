/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpptrf from './../lib/dpptrf.js';


// TESTS //

test( 'dpptrf is a function', function t() {
	assert.strictEqual( typeof dpptrf, 'function', 'is a function' );
});

test( 'dpptrf has expected arity', function t() {
	assert.strictEqual( dpptrf.length, 3, 'has expected arity' );
});

test( 'dpptrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpptrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpptrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpptrf( 'upper', -1, new Float64Array( 4 ) );
	}, RangeError );
});
