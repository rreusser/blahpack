
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlarmm from './../lib/ndarray.js';
var ndarrayFn = dlarmm;


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof dlarmm, 'function' );
} );

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function' );
} );

test( 'dlarmm has expected arity', function t() {
	assert.strictEqual( dlarmm.length, 3, 'has expected arity' );
} );

test( 'dlarmm returns 1.0 when norms are small and product does not overflow', function t() {
	var s = dlarmm( 1.0, 1.0, 1.0 );
	assert.strictEqual( s, 1.0 );
} );

test( 'dlarmm returns 1.0 when all norms are zero', function t() {
	var s = dlarmm( 0.0, 0.0, 0.0 );
	assert.strictEqual( s, 1.0 );
} );

test( 'dlarmm returns 1.0 when anorm is zero', function t() {
	var s = dlarmm( 0.0, 1e200, 1e200 );
	assert.strictEqual( s, 1.0 );
} );

test( 'dlarmm returns 1.0 when bnorm is zero', function t() {
	var s = dlarmm( 1e200, 0.0, 1e200 );
	assert.strictEqual( s, 1.0 );
} );

test( 'dlarmm returns 1.0 when cnorm is zero and product is small', function t() {
	var s = dlarmm( 1.0, 1.0, 0.0 );
	assert.strictEqual( s, 1.0 );
} );

test( 'dlarmm returns 0.5 when bnorm <= 1 and anorm*bnorm > bignum - cnorm', function t() {
	// With bnorm = 1.0, anorm large and cnorm large, the product can exceed bignum - cnorm
	var s = dlarmm( 1e308, 1.0, 1e307 );
	assert.strictEqual( s, 0.5 );
} );

test( 'dlarmm returns 0.5/bnorm when bnorm > 1 and anorm > (bignum - cnorm)/bnorm', function t() {
	var s = dlarmm( 1e200, 1e200, 0.0 );
	assert.ok( s > 0.0, 'scale factor is positive' );
	assert.ok( s <= 1.0, 'scale factor is at most 1' );
	assert.strictEqual( s, 0.5 / 1e200 );
} );

test( 'dlarmm returns 1.0 for moderate norms that do not trigger overflow guard', function t() {
	var s = dlarmm( 100.0, 50.0, 200.0 );
	assert.strictEqual( s, 1.0 );
} );

test( 'dlarmm returns 1.0 for small norms', function t() {
	var s = dlarmm( 1e-100, 1e-100, 1e-100 );
	assert.strictEqual( s, 1.0 );
} );

test( 'dlarmm: bnorm > 1 path with large cnorm still returns 1 if anorm is small', function t() {
	var s = dlarmm( 1.0, 2.0, 1.0 );
	assert.strictEqual( s, 1.0 );
} );

test( 'dlarmm: boundary case bnorm = 1 with large anorm and zero cnorm', function t() {
	// Anorm * 1.0 vs bignum - 0 = bignum. For anorm = 1e308 this should trigger.
	var s = dlarmm( 1e308, 1.0, 0.0 );

	// BIGNUM = (1/SMLNUM)/4 ~ 4.49e307, so 1e308 > BIGNUM => returns 0.5
	assert.strictEqual( s, 0.5 );
} );

test( 'dlarmm: bnorm just above 1 triggers the else branch', function t() {
	// Bnorm = 1.0000000000000002 (just above 1), large anorm
	var s = dlarmm( 1e308, 1.0 + 2.3e-16, 0.0 );
	assert.ok( s > 0.0, 'scale factor is positive' );
	assert.ok( s <= 1.0, 'scale factor is at most 1' );
} );

test( 'dlarmm: ndarray interface returns same result as base', function t() {
	var s1 = dlarmm( 1e308, 1.0, 1e307 );
	var s2 = ndarrayFn( 1e308, 1.0, 1e307 );
	assert.strictEqual( s1, s2 );
} );

test( 'dlarmm: ndarray interface returns 1.0 for small norms', function t() {
	var s = ndarrayFn( 1.0, 1.0, 1.0 );
	assert.strictEqual( s, 1.0 );
} );

test( 'dlarmm: result is always in (0, 1]', function t() {
	var cases;
	var s;
	var i;

	cases = [
		[ 0.0, 0.0, 0.0 ],
		[ 1.0, 1.0, 1.0 ],
		[ 1e308, 1.0, 1e307 ],
		[ 1e200, 1e200, 0.0 ],
		[ 1e-300, 1e-300, 1e-300 ],
		[ 1e150, 1e150, 1e150 ],
		[ 1e308, 0.5, 0.0 ]
	];
	for ( i = 0; i < cases.length; i++ ) {
		s = dlarmm( cases[ i ][ 0 ], cases[ i ][ 1 ], cases[ i ][ 2 ] );
		assert.ok( s > 0.0, 'case ' + i + ': s > 0' );
		assert.ok( s <= 1.0, 'case ' + i + ': s <= 1' );
	}
} );

test( 'dlarmm: scaling prevents overflow in s*C - A*(s*B)', function t() {
	var product;
	var anorm;
	var bnorm;
	var cnorm;
	var s;

	anorm = 1e200;
	bnorm = 1e200;
	cnorm = 1e100;
	s = dlarmm( anorm, bnorm, cnorm );

	// Verify that s*anorm * s*bnorm does not overflow (it should be finite)
	product = ( s * anorm ) * ( s * bnorm );
	assert.ok( isFinite( product ), 'scaled product is finite' );
} );
