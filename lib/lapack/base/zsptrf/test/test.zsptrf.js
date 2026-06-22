/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsptrf from './../lib/zsptrf.js';


// TESTS //

test( 'zsptrf is a function', function t() {
	assert.strictEqual( typeof zsptrf, 'function', 'is a function' );
});

test( 'zsptrf has expected arity', function t() {
	assert.strictEqual( zsptrf.length, 4, 'has expected arity' );
});

test( 'zsptrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsptrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zsptrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsptrf( 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
