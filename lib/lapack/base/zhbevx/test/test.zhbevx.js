/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhbevx from './../lib/zhbevx.js';


// TESTS //

test( 'zhbevx is a function', function t() {
	assert.strictEqual( typeof zhbevx, 'function', 'is a function' );
});

test( 'zhbevx has expected arity', function t() {
	assert.strictEqual( zhbevx.length, 27, 'has expected arity' );
});

test( 'zhbevx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhbevx( 2, 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhbevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhbevx( 2, 2, 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
