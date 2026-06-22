/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zherk from './../lib/zherk.js';


// TESTS //

test( 'zherk is a function', function t() {
	assert.strictEqual( typeof zherk, 'function', 'is a function' );
});

test( 'zherk has expected arity', function t() {
	assert.strictEqual( zherk.length, 11, 'has expected arity' );
});

test( 'zherk throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zherk( 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zherk throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zherk( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zherk throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zherk( 'row-major', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zherk throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zherk( 'row-major', 'upper', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zherk throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zherk( 'row-major', 'upper', 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
