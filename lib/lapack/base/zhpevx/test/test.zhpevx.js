/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpevx from './../lib/zhpevx.js';


// TESTS //

test( 'zhpevx is a function', function t() {
	assert.strictEqual( typeof zhpevx, 'function', 'is a function' );
});

test( 'zhpevx has expected arity', function t() {
	assert.strictEqual( zhpevx.length, 19, 'has expected arity' );
});

test( 'zhpevx throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhpevx( 'invalid', 2, 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhpevx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpevx( 'row-major', 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhpevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpevx( 'row-major', 2, 2, 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
