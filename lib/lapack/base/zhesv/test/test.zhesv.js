/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhesv from './../lib/zhesv.js';


// TESTS //

test( 'zhesv is a function', function t() {
	assert.strictEqual( typeof zhesv, 'function', 'is a function' );
});

test( 'zhesv has expected arity', function t() {
	assert.strictEqual( zhesv.length, 12, 'has expected arity' );
});

test( 'zhesv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhesv( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zhesv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhesv( 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'zhesv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zhesv( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
