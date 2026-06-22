/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_gerpvgrw from './../lib/zla_gerpvgrw.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'zla_gerpvgrw: is a function', function t() {
	assert.strictEqual( typeof zla_gerpvgrw, 'function', 'is a function' );
});

test( 'zla_gerpvgrw: has expected arity', function t() {
	assert.strictEqual( zla_gerpvgrw.length, 6, 'has expected arity' );
});

test( 'zla_gerpvgrw: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		zla_gerpvgrw( -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zla_gerpvgrw: throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function f() {
		zla_gerpvgrw( 3, 3, new Complex128Array( 9 ), 2, new Complex128Array( 9 ), 3 );
	}, RangeError );
});

test( 'zla_gerpvgrw: throws RangeError for LDAF < max(1,N)', function t() {
	assert.throws( function f() {
		zla_gerpvgrw( 3, 3, new Complex128Array( 9 ), 3, new Complex128Array( 9 ), 2 );
	}, RangeError );
});

test( 'zla_gerpvgrw: N=0 returns 1', function t() {
	var r = zla_gerpvgrw( 0, 0, new Complex128Array( 0 ), 1, new Complex128Array( 0 ), 1 );
	assert.strictEqual( r, 1.0 );
});

test( 'zla_gerpvgrw: 2x2 unit ratio', function t() {
	var A = new Complex128Array( [ 2, 0, 0, 0, 0, 0, 3, 0 ] );
	var AF = new Complex128Array( [ 2, 0, 0, 0, 0, 0, 3, 0 ] );
	var r = zla_gerpvgrw( 2, 2, A, 2, AF, 2 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: 2x2 with growth', function t() {
	var A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	var AF = new Complex128Array( [ 5, 0, 0, 0, 0, 0, 1, 0 ] );
	var r = zla_gerpvgrw( 2, 2, A, 2, AF, 2 );
	approxEqual( r, 0.2, 1e-12, 'rpvgrw' );
});
