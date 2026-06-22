/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_gerpvgrw from './../lib/dla_gerpvgrw.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'dla_gerpvgrw: is a function', function t() {
	assert.strictEqual( typeof dla_gerpvgrw, 'function', 'is a function' );
});

test( 'dla_gerpvgrw: has expected arity', function t() {
	assert.strictEqual( dla_gerpvgrw.length, 6, 'has expected arity' );
});

test( 'dla_gerpvgrw: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		dla_gerpvgrw( -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dla_gerpvgrw: throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function f() {
		dla_gerpvgrw( 3, 3, new Float64Array( 9 ), 2, new Float64Array( 9 ), 3 );
	}, RangeError );
});

test( 'dla_gerpvgrw: throws RangeError for LDAF < max(1,N)', function t() {
	assert.throws( function f() {
		dla_gerpvgrw( 3, 3, new Float64Array( 9 ), 3, new Float64Array( 9 ), 2 );
	}, RangeError );
});

test( 'dla_gerpvgrw: N=0 returns 1', function t() {
	var r = dla_gerpvgrw( 0, 0, new Float64Array( 0 ), 1, new Float64Array( 0 ), 1 );
	assert.strictEqual( r, 1.0 );
});

test( 'dla_gerpvgrw: 2x2 unit ratio', function t() {
	var A = new Float64Array( [ 2, 0, 0, 3 ] );
	var AF = new Float64Array( [ 2, 0, 0, 3 ] );
	var r = dla_gerpvgrw( 2, 2, A, 2, AF, 2 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gerpvgrw: 2x2 with growth', function t() {
	var A = new Float64Array( [ 1, 0, 0, 1 ] );
	var AF = new Float64Array( [ 5, 0, 0, 1 ] );
	var r = dla_gerpvgrw( 2, 2, A, 2, AF, 2 );
	approxEqual( r, 0.2, 1e-12, 'rpvgrw' );
});
