/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zptsv from './../lib/zptsv.js';


// TESTS //

test( 'zptsv is a function', function t() {
	assert.strictEqual( typeof zptsv, 'function', 'is a function' );
});

test( 'zptsv has expected arity', function t() {
	assert.strictEqual( zptsv.length, 9, 'has expected arity' );
});

test( 'zptsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zptsv( 'column-major', -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zptsv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zptsv( 'column-major', new Float64Array( 4 ), -1, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
