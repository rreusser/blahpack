/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlagtm from './../lib/dlagtm.js';


// TESTS //

test( 'dlagtm is a function', function t() {
	assert.strictEqual( typeof dlagtm, 'function', 'is a function' );
});

test( 'dlagtm has expected arity', function t() {
	assert.strictEqual( dlagtm.length, 15, 'has expected arity' );
});

test( 'dlagtm throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlagtm( 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlagtm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlagtm( 'no-transpose', -1, 2, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlagtm throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dlagtm( 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
