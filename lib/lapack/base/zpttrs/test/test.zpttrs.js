/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpttrs from './../lib/zpttrs.js';


// TESTS //

test( 'zpttrs is a function', function t() {
	assert.strictEqual( typeof zpttrs, 'function', 'is a function' );
});

test( 'zpttrs has expected arity', function t() {
	assert.strictEqual( zpttrs.length, 9, 'has expected arity' );
});

test( 'zpttrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpttrs( 'invalid', new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpttrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpttrs( 'upper', -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zpttrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zpttrs( 'upper', new Float64Array( 4 ), -1, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
