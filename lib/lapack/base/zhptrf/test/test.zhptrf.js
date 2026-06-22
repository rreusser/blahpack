/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhptrf from './../lib/zhptrf.js';


// TESTS //

test( 'zhptrf is a function', function t() {
	assert.strictEqual( typeof zhptrf, 'function', 'is a function' );
});

test( 'zhptrf has expected arity', function t() {
	assert.strictEqual( zhptrf.length, 4, 'has expected arity' );
});

test( 'zhptrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhptrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhptrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhptrf( 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
