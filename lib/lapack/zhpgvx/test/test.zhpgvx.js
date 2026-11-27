/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpgvx from './../lib/zhpgvx.js';


// TESTS //

test( 'zhpgvx is a function', function t() {
	assert.strictEqual( typeof zhpgvx, 'function', 'is a function' );
});

test( 'zhpgvx has expected arity', function t() {
	assert.strictEqual( zhpgvx.length, 23, 'has expected arity' );
});

test( 'zhpgvx throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		zhpgvx( 'invalid', 2, 2, 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhpgvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		zhpgvx( 'row-major', 2, 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhpgvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		zhpgvx( 'row-major', 2, 'no-vectors', 'all', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});
