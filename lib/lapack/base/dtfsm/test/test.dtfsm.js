/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtfsm from './../lib/dtfsm.js';


// TESTS //

test( 'dtfsm is a function', function t() {
	assert.strictEqual( typeof dtfsm, 'function', 'is a function' );
});

test( 'dtfsm has expected arity', function t() {
	assert.strictEqual( dtfsm.length, 11, 'has expected arity' );
});

test( 'dtfsm throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dtfsm( 2, 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtfsm throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtfsm( 2, 'left', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtfsm throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtfsm( 2, 'left', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtfsm throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtfsm( 2, 'left', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtfsm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtfsm( 2, 'left', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtfsm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtfsm( 2, 'left', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
