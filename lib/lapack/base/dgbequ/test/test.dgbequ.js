/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbequ from './../lib/dgbequ.js';


// TESTS //

test( 'dgbequ is a function', function t() {
	assert.strictEqual( typeof dgbequ, 'function', 'is a function' );
});

test( 'dgbequ has expected arity', function t() {
	assert.strictEqual( dgbequ.length, 10, 'has expected arity' );
});

test( 'dgbequ throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgbequ( -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1 );
	}, RangeError );
});

test( 'dgbequ throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgbequ( new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1 );
	}, RangeError );
});
