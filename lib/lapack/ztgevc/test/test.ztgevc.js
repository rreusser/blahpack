/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztgevc from './../lib/ztgevc.js';


// TESTS //

test( 'ztgevc is a function', function t() {
	assert.strictEqual( typeof ztgevc, 'function', 'is a function' );
});

test( 'ztgevc has expected arity', function t() {
	assert.strictEqual( ztgevc.length, 18, 'has expected arity' );
});

test( 'ztgevc throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztgevc( 'invalid', 'left', 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztgevc throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		ztgevc( 'row-major', 'invalid', 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztgevc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztgevc( 'row-major', 'left', 'all', new Float64Array( 4 ), 1, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

