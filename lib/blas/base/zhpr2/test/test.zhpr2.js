/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpr2 from './../lib/zhpr2.js';


// TESTS //

test( 'zhpr2 is a function', function t() {
	assert.strictEqual( typeof zhpr2, 'function', 'is a function' );
});

test( 'zhpr2 has expected arity', function t() {
	assert.strictEqual( zhpr2.length, 9, 'has expected arity' );
});

test( 'zhpr2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpr2( 'invalid', new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhpr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpr2( 'upper', -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
