/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbrfs from './../lib/dgbrfs.js';


// TESTS //

test( 'dgbrfs is a function', function t() {
	assert.strictEqual( typeof dgbrfs, 'function', 'is a function' );
});

test( 'dgbrfs has expected arity', function t() {
	assert.strictEqual( dgbrfs.length, 18, 'has expected arity' );
});

test( 'dgbrfs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgbrfs( 'invalid', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dgbrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgbrfs( 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgbrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgbrfs( 'no-transpose', new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
