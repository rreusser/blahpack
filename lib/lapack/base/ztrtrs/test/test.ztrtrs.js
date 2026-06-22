/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrtrs from './../lib/ztrtrs.js';


// TESTS //

test( 'ztrtrs is a function', function t() {
	assert.strictEqual( typeof ztrtrs, 'function', 'is a function' );
});

test( 'ztrtrs has expected arity', function t() {
	assert.strictEqual( ztrtrs.length, 10, 'has expected arity' );
});

test( 'ztrtrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztrtrs( 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrtrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztrtrs( 'row-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrtrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztrtrs( 'row-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrtrs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztrtrs( 'row-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrtrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztrtrs( 'row-major', 'upper', 'no-transpose', 'non-unit', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztrtrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		ztrtrs( 'row-major', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
