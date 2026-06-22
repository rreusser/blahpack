/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsytrf from './../lib/zsytrf.js';


// TESTS //

test( 'zsytrf is a function', function t() {
	assert.strictEqual( typeof zsytrf, 'function', 'is a function' );
});

test( 'zsytrf has expected arity', function t() {
	assert.strictEqual( zsytrf.length, 9, 'has expected arity' );
});

test( 'zsytrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 1, 1, 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zsytrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytrf( 'upper', -1, new Float64Array( 4 ), 1, 1, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
