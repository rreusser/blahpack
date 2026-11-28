/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztfsm from './../lib/ztfsm.js';


// TESTS //

test( 'ztfsm is a function', function t() {
	assert.strictEqual( typeof ztfsm, 'function', 'is a function' );
});

test( 'ztfsm has expected arity', function t() {
	assert.strictEqual( ztfsm.length, 13, 'has expected arity' );
});

test( 'ztfsm throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		ztfsm( 'column-major', 2, 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztfsm throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztfsm( 'column-major', 2, 'left', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztfsm throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztfsm( 'column-major', 2, 'left', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztfsm throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztfsm( 'column-major', 2, 'left', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztfsm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztfsm( 'column-major', 'conjugate-transpose', 'left', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztfsm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztfsm( 'column-major', 'conjugate-transpose', 'left', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztfsm throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztfsm( 'invalid', 'no-transpose', 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, 1.0, new Float64Array( 6 ), 1, new Float64Array( 8 ), 2 );
	}, TypeError );
});

test( 'ztfsm throws RangeError for invalid LDB', function t() {
	assert.throws( function throws() {
		ztfsm( 'column-major', 'no-transpose', 'left', 'upper', 'no-transpose', 'non-unit', 3, 2, 1.0, new Float64Array( 12 ), 1, new Float64Array( 12 ), 2 );
	}, RangeError );
	assert.throws( function throws() {
		ztfsm( 'row-major', 'no-transpose', 'left', 'upper', 'no-transpose', 'non-unit', 2, 3, 1.0, new Float64Array( 6 ), 1, new Float64Array( 12 ), 2 );
	}, RangeError );
});
