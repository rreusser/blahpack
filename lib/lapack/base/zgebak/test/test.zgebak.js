/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgebak from './../lib/zgebak.js';


// TESTS //

test( 'zgebak is a function', function t() {
	assert.strictEqual( typeof zgebak, 'function', 'is a function' );
});

test( 'zgebak has expected arity', function t() {
	assert.strictEqual( zgebak.length, 10, 'has expected arity' );
});

test( 'zgebak throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zgebak( 2, 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgebak throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgebak( 2, 'left', -1, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgebak throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgebak( 2, 'left', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
