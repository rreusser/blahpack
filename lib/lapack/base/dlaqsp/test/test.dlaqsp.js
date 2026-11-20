/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsp from './../lib/dlaqsp.js';


// TESTS //

test( 'dlaqsp is a function', function t() {
	assert.strictEqual( typeof dlaqsp, 'function', 'is a function' );
});

test( 'dlaqsp has expected arity', function t() {
	assert.strictEqual( dlaqsp.length, 9, 'has expected arity' );
});

test( 'dlaqsp throws TypeError for an invalid order', function t() {
	const AP = new Float64Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqsp( 'foo', 'upper', 2, AP, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'dlaqsp throws TypeError for an invalid uplo', function t() {
	const AP = new Float64Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqsp( 'column-major', 'invalid', 2, AP, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'dlaqsp throws RangeError for negative N', function t() {
	const AP = new Float64Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqsp( 'column-major', 'upper', -1, AP, S, 1, 1, 1, equed );
	}, RangeError );
});

test( 'dlaqsp throws TypeError for row-major order (packed storage is column-major)', function t() {
	const AP = new Float64Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqsp( 'row-major', 'upper', 2, AP, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'dlaqsp returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const AP = new Float64Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqsp( 'column-major', 'upper', 2, AP, S, 1, 1, 1, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'dlaqsp writes \'yes\' to equed when scaling is applied', function t() {
	const AP = new Float64Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqsp( 'column-major', 'upper', 2, AP, S, 1, 0.01, 1, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'yes', 'equed' );
});
