/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhbev from './../lib/zhbev.js';


// TESTS //

test( 'zhbev is a function', function t() {
	assert.strictEqual( typeof zhbev, 'function', 'is a function' );
});

test( 'zhbev has expected arity', function t() {
	assert.strictEqual( zhbev.length, 15, 'has expected arity' );
});

test( 'zhbev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhbev( 'invalid', 2, 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhbev throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhbev( 'row-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhbev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhbev( 'row-major', 2, 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
