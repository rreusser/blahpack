/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbrfs from './../lib/zgbrfs.js';


// TESTS //

test( 'zgbrfs is a function', function t() {
	assert.strictEqual( typeof zgbrfs, 'function', 'is a function' );
});

test( 'zgbrfs has expected arity', function t() {
	assert.strictEqual( zgbrfs.length, 18, 'has expected arity' );
});

test( 'zgbrfs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zgbrfs( 'invalid', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zgbrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgbrfs( 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgbrfs( 'no-transpose', new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
