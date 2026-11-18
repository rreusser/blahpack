/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zptsvx from './../lib/zptsvx.js';


// TESTS //

test( 'zptsvx is a function', function t() {
	assert.strictEqual( typeof zptsvx, 'function', 'is a function' );
});

test( 'zptsvx has expected arity', function t() {
	assert.strictEqual( zptsvx.length, 17, 'has expected arity' );
});

test( 'zptsvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zptsvx( 'column-major', 2, -1, 2, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zptsvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zptsvx( 'column-major', 2, new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
