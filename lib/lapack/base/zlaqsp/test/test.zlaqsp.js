/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqsp from './../lib/zlaqsp.js';


// TESTS //

test( 'zlaqsp is a function', function t() {
	assert.strictEqual( typeof zlaqsp, 'function', 'is a function' );
});

test( 'zlaqsp has expected arity', function t() {
	assert.strictEqual( zlaqsp.length, 9, 'has expected arity' );
});

test( 'zlaqsp throws TypeError for an invalid order', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqsp( 'foo', 'upper', 2, AP, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqsp throws TypeError for an invalid uplo', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqsp( 'column-major', 'invalid', 2, AP, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqsp throws RangeError for negative N', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqsp( 'column-major', 'upper', -1, AP, S, 1, 1, 1, equed );
	}, RangeError );
});

test( 'zlaqsp throws TypeError for row-major order (packed storage is column-major)', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqsp( 'row-major', 'upper', 2, AP, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqsp returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'column-major', 'upper', 2, AP, S, 1, 1, 1, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'zlaqsp writes \'yes\' to equed when scaling is applied', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'column-major', 'upper', 2, AP, S, 1, 0.01, 1, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'yes', 'equed' );
});
