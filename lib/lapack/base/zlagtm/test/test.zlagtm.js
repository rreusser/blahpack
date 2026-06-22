/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlagtm from './../lib/zlagtm.js';


// TESTS //

test( 'zlagtm is a function', function t() {
	assert.strictEqual( typeof zlagtm, 'function', 'is a function' );
});

test( 'zlagtm has expected arity', function t() {
	assert.strictEqual( zlagtm.length, 15, 'has expected arity' );
});

test( 'zlagtm throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlagtm( 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlagtm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlagtm( 'no-transpose', -1, 2, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlagtm throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zlagtm( 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
