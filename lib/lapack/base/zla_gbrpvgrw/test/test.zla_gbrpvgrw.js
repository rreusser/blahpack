/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_gbrpvgrw from './../lib/zla_gbrpvgrw.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'zla_gbrpvgrw: is a function', function t() {
	assert.strictEqual( typeof zla_gbrpvgrw, 'function', 'is a function' );
});

test( 'zla_gbrpvgrw: has expected arity', function t() {
	assert.strictEqual( zla_gbrpvgrw.length, 9, 'has expected arity' );
});

test( 'zla_gbrpvgrw: throws TypeError for invalid order', function t() {
	assert.throws( function f() {
		zla_gbrpvgrw( 'invalid', 2, 0, 0, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zla_gbrpvgrw: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		zla_gbrpvgrw( 'column-major', -1, 0, 0, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zla_gbrpvgrw: throws RangeError for LDAB < max(1,N)', function t() {
	assert.throws( function f() {
		zla_gbrpvgrw( 'column-major', 4, 0, 0, 4, new Complex128Array( 16 ), 2, new Complex128Array( 16 ), 4 );
	}, RangeError );
});

test( 'zla_gbrpvgrw: throws RangeError for LDAFB < max(1,N)', function t() {
	assert.throws( function f() {
		zla_gbrpvgrw( 'column-major', 4, 0, 0, 4, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 2 );
	}, RangeError );
});

test( 'zla_gbrpvgrw: N=0 returns 1', function t() {
	var r = zla_gbrpvgrw( 'column-major', 0, 0, 0, 0, new Complex128Array( 0 ), 1, new Complex128Array( 0 ), 1 );
	assert.strictEqual( r, 1.0 );
});

test( 'zla_gbrpvgrw: column-major diagonal unit ratio', function t() {
	// 3x3 diagonal-only (kl=0, ku=0). LDAB=LDAFB=3 (>= N), but the routine accesses
	// Only row 0 since kd=ku=0.
	var AB = new Complex128Array( [ 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0 ] );
	var AFB = new Complex128Array( [ 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0 ] );
	var r = zla_gbrpvgrw( 'column-major', 3, 0, 0, 3, AB, 3, AFB, 3 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gbrpvgrw: row-major diagonal unit ratio', function t() {
	// Same diagonal-only case but specified as row-major. With kl=ku=0, LDAB=1 in
	// The natural sense, but we must satisfy LDAB >= N. Use LDAB=N=3.
	var AB = new Complex128Array( [ 2, 0, 3, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
	var AFB = new Complex128Array( [ 2, 0, 3, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
	var r = zla_gbrpvgrw( 'row-major', 3, 0, 0, 3, AB, 3, AFB, 3 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gbrpvgrw: column-major with growth', function t() {
	// LDAB=N=3 (must satisfy LDAB >= max(1,N)). Diagonal stored at row 0 of each col.
	var AB = new Complex128Array([
		1, 0, 0, 0, 0, 0,
		1, 0, 0, 0, 0, 0,
		1, 0, 0, 0, 0, 0
	]);
	var AFB = new Complex128Array([
		5, 0, 0, 0, 0, 0,
		1, 0, 0, 0, 0, 0,
		1, 0, 0, 0, 0, 0
	]);
	var r = zla_gbrpvgrw( 'column-major', 3, 0, 0, 3, AB, 3, AFB, 3 );
	approxEqual( r, 0.2, 1e-12, 'rpvgrw' );
});
