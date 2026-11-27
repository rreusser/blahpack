
/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhsein from './../lib/zhsein.js';


// TESTS //

test( 'zhsein is a function', function t() {
	assert.strictEqual( typeof zhsein, 'function', 'is a function' );
});

test( 'zhsein has expected arity', function t() {
	assert.strictEqual( zhsein.length, 23, 'has expected arity' );
});

test( 'zhsein throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		m[ 0 ] = 2;
		zhsein( 'invalid', 'left', 'no-source', 'no-init', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, m, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zhsein throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		m[ 0 ] = 2;
		zhsein( 'row-major', 'invalid', 'no-source', 'no-init', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, m, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zhsein throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		m[ 0 ] = 2;
		zhsein( 'row-major', 'left', 'no-source', 'no-init', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, m, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2 );
	}, RangeError );
});

