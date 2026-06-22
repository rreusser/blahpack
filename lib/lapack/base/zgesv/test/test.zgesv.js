/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgesv from './../lib/zgesv.js';


// TESTS //

test( 'zgesv is a function', function t() {
	assert.strictEqual( typeof zgesv, 'function', 'is a function' );
});

test( 'zgesv has expected arity', function t() {
	assert.strictEqual( zgesv.length, 8, 'has expected arity' );
});

test( 'zgesv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgesv( -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgesv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgesv( new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
