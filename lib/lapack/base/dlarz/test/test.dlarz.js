/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarz from './../lib/dlarz.js';


// TESTS //

test( 'dlarz is a function', function t() {
	assert.strictEqual( typeof dlarz, 'function', 'is a function' );
});

test( 'dlarz has expected arity', function t() {
	assert.strictEqual( dlarz.length, 12, 'has expected arity' );
});

test( 'dlarz throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlarz( 'invalid', 'left', 2, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarz throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlarz( 'row-major', 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarz throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlarz( 'row-major', 'left', -1, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarz throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarz( 'row-major', 'left', 2, -1, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarz throws RangeError for too-small LDC (row-major)', function t() {
	assert.throws( function throws() {
		dlarz( 'row-major', 'left', 2, 3, 1, new Float64Array( 4 ), 1, 1.0, new Float64Array( 6 ), 2, new Float64Array( 3 ), 1 );
	}, RangeError );
});

test( 'dlarz throws RangeError for too-small LDC (column-major)', function t() {
	assert.throws( function throws() {
		dlarz( 'column-major', 'left', 3, 2, 1, new Float64Array( 4 ), 1, 1.0, new Float64Array( 6 ), 2, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dlarz applies reflector with column-major layout', function t() {
	var WORK;
	var C;
	var v;
	C = new Float64Array( [ 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 ] ); // eslint-disable-line max-len
	v = new Float64Array( [ 0.5, 0.25 ] );
	WORK = new Float64Array( 4 );
	dlarz( 'column-major', 'left', 4, 4, 2, v, 1, 1.5, C, 4, WORK, 1 );
	assert.ok( C[ 0 ] !== 1, 'C modified' );
});

test( 'dlarz returns C', function t() {
	var WORK;
	var C;
	var v;
	C = new Float64Array( 9 );
	v = new Float64Array( [ 0.0 ] );
	WORK = new Float64Array( 3 );
	assert.strictEqual( dlarz( 'column-major', 'left', 3, 3, 0, v, 1, 0.0, C, 3, WORK, 1 ), C, 'returns C' );
});
