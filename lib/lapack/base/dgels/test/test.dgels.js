/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgels from './../lib/dgels.js';


// TESTS //

test( 'dgels is a function', function t() {
	assert.strictEqual( typeof dgels, 'function', 'is a function' );
});

test( 'dgels has expected arity', function t() {
	assert.strictEqual( dgels.length, 11, 'has expected arity' );
});

test( 'dgels throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgels( 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgels throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgels( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgels throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgels( 'row-major', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgels throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgels( 'row-major', 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgels throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgels( 'row-major', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
