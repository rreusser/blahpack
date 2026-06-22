/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpftrf from './../lib/zpftrf.js';


// TESTS //

test( 'zpftrf is a function', function t() {
	assert.strictEqual( typeof zpftrf, 'function', 'is a function' );
});

test( 'zpftrf has expected arity', function t() {
	assert.strictEqual( zpftrf.length, 4, 'has expected arity' );
});

test( 'zpftrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpftrf( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zpftrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpftrf( 2, 'upper', -1, new Float64Array( 4 ) );
	}, RangeError );
});
