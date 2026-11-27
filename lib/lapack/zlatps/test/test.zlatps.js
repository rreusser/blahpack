/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlatps from './../lib/zlatps.js';


// TESTS //

test( 'zlatps is a function', function t() {
	assert.strictEqual( typeof zlatps, 'function', 'is a function' );
});

test( 'zlatps has expected arity', function t() {
	assert.strictEqual( zlatps.length, 12, 'has expected arity' );
});

test( 'zlatps throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlatps( 'column-major', 'invalid', 'no-transpose', 'non-unit', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlatps throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlatps( 'column-major', 'upper', 'invalid', 'non-unit', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlatps throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlatps( 'column-major', 'upper', 'no-transpose', 'invalid', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlatps throws TypeError for invalid normin', function t() {
	assert.throws( function throws() {
		zlatps( 'column-major', 'upper', 'no-transpose', 'non-unit', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlatps throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlatps( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', -1, new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zlatps throws TypeError for row-major order (packed storage is column-major only)', function t() {
	const AP = new Complex128Array( 3 );
	const x = new Complex128Array( 2 );
	const scale = new Float64Array( 1 );
	const CNORM = new Float64Array( 2 );
	assert.throws( function throws() {
		zlatps( 'row-major', 'upper', 'no-transpose', 'non-unit', 'no', 2, AP, x, 1, scale, CNORM, 1 );
	}, {
		'name': 'TypeError',
		'message': 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `row-major`.'
	});
	assert.deepStrictEqual( Array.from( scale ), [ 0.0 ], 'scale is untouched' );
	assert.deepStrictEqual( Array.from( CNORM ), [ 0.0, 0.0 ], 'CNORM is untouched' );
});
