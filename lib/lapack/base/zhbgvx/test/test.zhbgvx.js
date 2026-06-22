/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhbgvx from './../lib/zhbgvx.js';


// TESTS //

test( 'zhbgvx is a function', function t() {
	assert.strictEqual( typeof zhbgvx, 'function', 'is a function' );
});

test( 'zhbgvx has expected arity', function t() {
	assert.strictEqual( zhbgvx.length, 30, 'has expected arity' );
});

test( 'zhbgvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhbgvx( 2, 2, 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhbgvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhbgvx( 2, 2, 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
