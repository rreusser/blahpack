/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqhp from './../lib/zlaqhp.js';


// TESTS //

test( 'zlaqhp is a function', function t() {
	assert.strictEqual( typeof zlaqhp, 'function', 'is a function' );
});

test( 'zlaqhp has expected arity', function t() {
	assert.strictEqual( zlaqhp.length, 9, 'has expected arity' );
});

test( 'zlaqhp throws TypeError for an invalid order', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqhp( 'foo', 'upper', 2, AP, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqhp throws TypeError for an invalid uplo', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqhp( 'column-major', 'invalid', 2, AP, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqhp throws RangeError for negative N', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqhp( 'column-major', 'upper', -1, AP, S, 1, 1, 1, equed );
	}, RangeError );
});

test( 'zlaqhp throws TypeError for row-major order (packed storage is column-major)', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqhp( 'row-major', 'upper', 2, AP, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqhp returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'column-major', 'upper', 2, AP, S, 1, 1, 1, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'zlaqhp writes \'yes\' to equed when scaling is applied', function t() {
	const AP = new Complex128Array( 3 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'column-major', 'upper', 2, AP, S, 1, 0.01, 1, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'yes', 'equed' );
});
