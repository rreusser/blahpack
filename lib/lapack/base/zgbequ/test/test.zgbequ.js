/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbequ from './../lib/zgbequ.js';


// TESTS //

test( 'zgbequ is a function', function t() {
	assert.strictEqual( typeof zgbequ, 'function', 'is a function' );
});

test( 'zgbequ has expected arity', function t() {
	assert.strictEqual( zgbequ.length, 14, 'has expected arity' );
});

test( 'zgbequ throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		const rowcnd = new Float64Array( 1 );
		const colcnd = new Float64Array( 1 );
		const amax = new Float64Array( 1 );
		zgbequ( 'column-major', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, rowcnd, colcnd, amax );
	}, RangeError );
});

test( 'zgbequ throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const rowcnd = new Float64Array( 1 );
		const colcnd = new Float64Array( 1 );
		const amax = new Float64Array( 1 );
		zgbequ( 'column-major', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, rowcnd, colcnd, amax );
	}, RangeError );
});
