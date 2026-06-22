/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpbequ from './../lib/zpbequ.js';


// TESTS //

test( 'zpbequ is a function', function t() {
	assert.strictEqual( typeof zpbequ, 'function', 'is a function' );
});

test( 'zpbequ has expected arity', function t() {
	assert.strictEqual( zpbequ.length, 7, 'has expected arity' );
});

test( 'zpbequ throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpbequ( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1 );
	}, TypeError );
});

test( 'zpbequ throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpbequ( 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
