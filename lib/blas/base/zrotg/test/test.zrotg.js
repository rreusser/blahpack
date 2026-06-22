/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import zrotgWrap from './../lib/zrotg.js';
import base from './../lib/base.js';


// CONSTANTS //

var SAFMIN = FLOAT64_SMALLEST_NORMAL;
var RTMIN = Math.sqrt( SAFMIN );


// FUNCTIONS //

/**
* Drives the base zrotg implementation and returns { c, sRe, sIm, rRe, rIm }.
*
* @private
* @param {number} fRe - real part of f
* @param {number} fIm - imaginary part of f
* @param {number} gRe - real part of g
* @param {number} gIm - imaginary part of g
* @returns {Object} result
*/
function call( fRe, fIm, gRe, gIm ) {
	var av;
	var sv;
	var a = new Complex128Array([ fRe, fIm ]);
	var b = new Complex128Array([ gRe, gIm ]);
	var c = new Float64Array( 1 );
	var s = new Complex128Array( 1 );
	base( a, 0, b, 0, c, 0, s, 0 );
	av = reinterpret( a, 0 );
	sv = reinterpret( s, 0 );
	return {
		'c': c[ 0 ],
		'sRe': sv[ 0 ],
		'sIm': sv[ 1 ],
		'rRe': av[ 0 ],
		'rIm': av[ 1 ]
	};
}

/**
* Asserts that two numbers are within tolerance.
*
* @private
* @param {number} actual - actual
* @param {number} expected - expected
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function close( actual, expected, tol, msg ) {
	var d = Math.abs( actual - expected );
	var s = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( d / s <= tol, msg + ': expected ' + expected + ' got ' + actual );
}

/**
* Compute c^2 + |s|^2 (the rotation invariant).
*
* @private
* @param {Object} r - result object with c, sRe, sIm fields
* @returns {number} invariant value (should be ~1)
*/
function inv( r ) {
	return ( r.c * r.c ) + ( r.sRe * r.sRe ) + ( r.sIm * r.sIm );
}


// TESTS //

test( 'zrotg (wrapper) is a function', function t() {
	assert.strictEqual( typeof zrotgWrap, 'function', 'is a function' );
});

test( 'zrotg (wrapper) has expected arity', function t() {
	assert.strictEqual( zrotgWrap.length, 4, 'has expected arity' );
});

test( 'zrotg (wrapper): (3+0i, 4+0i) yields c=0.6, s=0.8+0i', function t() {
	var a = new Complex128Array( [ 3.0, 0.0 ] );
	var b = new Complex128Array( [ 4.0, 0.0 ] );
	var c = new Float64Array( 1 );
	var s = new Complex128Array( 1 );
	zrotgWrap( a, b, c, s );
	var sFlat = reinterpret( s, 0 );
	assert.ok( Math.abs( c[ 0 ] - 0.6 ) < 1e-12, 'c ≈ 0.6, got ' + c[ 0 ] );
	assert.ok( Math.abs( sFlat[ 0 ] - 0.8 ) < 1e-12, 's_re ≈ 0.8, got ' + sFlat[ 0 ] );
});

test( 'zrotg: g==0 returns c=1, s=0, r=f (Case 1)', function t() {
	var r = call( 3, 4, 0, 0 );
	close( r.c, 1.0, 1e-15, 'c' );
	close( r.sRe, 0.0, 1e-15, 's.re' );
	close( r.sIm, 0.0, 1e-15, 's.im' );
	close( r.rRe, 3.0, 1e-15, 'r.re' );
	close( r.rIm, 4.0, 1e-15, 'r.im' );
});

test( 'zrotg: g==0 with complex f preserves f', function t() {
	var r = call( -1.5, 2.5, 0, 0 );
	close( r.c, 1.0, 1e-15, 'c' );
	close( r.rRe, -1.5, 1e-15, 'r.re' );
	close( r.rIm, 2.5, 1e-15, 'r.im' );

	// Identity: c^2 + |s|^2 = 1
	close( inv( r ), 1.0, 1e-15, 'identity' );
});

test( 'zrotg: f==0, g pure real (Case 2a)', function t() {
	var r = call( 0, 0, 3, 0 );
	close( r.c, 0.0, 1e-15, 'c' );
	close( r.sRe, 1.0, 1e-15, 's.re' );
	close( r.sIm, 0.0, 1e-15, 's.im' );
	close( r.rRe, 3.0, 1e-15, 'r.re' );
	close( r.rIm, 0.0, 1e-15, 'r.im' );
});

test( 'zrotg: f==0, g negative real (sign flips)', function t() {
	var r = call( 0, 0, -7, 0 );
	close( r.c, 0.0, 1e-15, 'c' );
	close( r.sRe, -1.0, 1e-15, 's.re' );
	close( r.rRe, 7.0, 1e-15, 'r.re (positive abs)' );
});

test( 'zrotg: f==0, g pure imaginary (Case 2b)', function t() {
	var r = call( 0, 0, 0, 4 );
	close( r.c, 0.0, 1e-15, 'c' );
	close( r.sRe, 0.0, 1e-15, 's.re' );
	close( r.sIm, -1.0, 1e-15, 's.im' );
	close( r.rRe, 4.0, 1e-15, 'r.re' );
});

test( 'zrotg: f==0, g pure negative imaginary', function t() {
	var r = call( 0, 0, 0, -5 );
	close( r.c, 0.0, 1e-15, 'c' );
	close( r.sIm, 1.0, 1e-15, 's.im' );
	close( r.rRe, 5.0, 1e-15, 'r.re' );
});

test( 'zrotg: f==0, g general unscaled (Case 2c)', function t() {
	var r = call( 0, 0, 3, 4 );
	close( r.c, 0.0, 1e-15, 'c' );
	close( r.sRe, 0.6, 1e-15, 's.re' );
	close( r.sIm, -0.8, 1e-15, 's.im' );
	close( r.rRe, 5.0, 1e-15, 'r.re' );
	close( r.rIm, 0.0, 1e-15, 'r.im' );
});

test( 'zrotg: f==0, g general scaled (very small) (Case 2d)', function t() {
	// |g| < RTMIN to force scaled branch.
	var tiny = RTMIN / 2.0;
	var r = call( 0, 0, tiny * 3.0, tiny * 4.0 );

	// |g|=5*tiny -> r should be 5*tiny.
	close( r.c, 0.0, 1e-15, 'c' );
	close( r.rRe / tiny, 5.0, 1e-10, 'r.re/tiny' );
	close( r.sRe, 0.6, 1e-12, 's.re' );
	close( r.sIm, -0.8, 1e-12, 's.im' );
});

test( 'zrotg: f==0, g general scaled (very large) (Case 2d big)', function t() {
	// |g| above the rtmax threshold to force scaled-down branch.
	var big = 1e200;
	var r = call( 0, 0, big * 3.0, big * 4.0 );
	close( r.c, 0.0, 1e-15, 'c' );
	close( r.rRe / big, 5.0, 1e-10, 'r.re/big' );
	close( r.sRe, 0.6, 1e-12, 's.re' );
	close( r.sIm, -0.8, 1e-12, 's.im' );
});

test( 'zrotg: nonzero f and g, real, unscaled (Case 3)', function t() {
	var r = call( 3, 0, 4, 0 );
	close( r.c, 0.6, 1e-15, 'c' );
	close( r.sRe, 0.8, 1e-15, 's.re' );
	close( r.sIm, 0.0, 1e-15, 's.im' );
	close( r.rRe, 5.0, 1e-15, 'r.re' );

	// c^2 + |s|^2 = 1
	close( inv( r ), 1.0, 1e-14, 'identity' );
});

test( 'zrotg: nonzero f and g complex (Case 3)', function t() {
	var expR = Math.sqrt( 194.0 );
	var r = call( 3, 4, 5, 12 );
	var rmag = Math.sqrt( ( r.rRe * r.rRe ) + ( r.rIm * r.rIm ) );
	close( rmag, expR, 1e-14, '|r|' );
	close( inv( r ), 1.0, 1e-14, 'identity' );
});

test( 'zrotg: large f and g, scaled algorithm (Case 3 scaled)', function t() {
	// F and g both large but balanced -> scaled branch.
	var big = 1e200;
	var r = call( big, 0, big, 0 );

	// |f|=|g|=big -> |r| = big*sqrt(2), c = 1/sqrt(2), s = 1/sqrt(2).
	close( r.c, 1.0 / Math.sqrt( 2.0 ), 1e-14, 'c' );
	close( r.sRe, 1.0 / Math.sqrt( 2.0 ), 1e-14, 's.re' );
	close( r.rRe / big, Math.sqrt( 2.0 ), 1e-12, 'r.re/big' );
});

test( 'zrotg: small f and g, scaled algorithm', function t() {
	// F and g both small enough to need scaling.
	var tiny = RTMIN / 4.0;
	var r = call( tiny * 3, 0, tiny * 4, 0 );
	close( r.c, 0.6, 1e-12, 'c' );
	close( r.sRe, 0.8, 1e-12, 's.re' );
	close( r.rRe / tiny, 5.0, 1e-10, 'r.re/tiny' );
});

test( 'zrotg: f much larger than g (separate scaling branch)', function t() {
	// F at 1e200, g at tiny -> scaled algorithm with separate w scale for f.
	var r = call( 1e200, 0, 1e-200, 0 );

	// |r| ~ 1e200; c ~ 1; s ~ tiny.
	close( r.c, 1.0, 1e-10, 'c' );
});

test( 'zrotg: f much smaller than g (scaled, w branch)', function t() {
	// F at 1e-200, g at 1e200 -> need separate scaling for f.
	var r = call( 1e-200, 0, 1e200, 0 );

	// C is tiny (close to 0), |s|~1
	assert.ok( Math.abs( r.c ) < 1e-100, 'c is tiny' );
	close( inv( r ), 1.0, 1e-14, '|s|^2 + c^2 ~ 1' );
});

test( 'zrotg: complex unscaled, large h2 ratio (else branch in unscaled S)', function t() {
	// F tiny relative to g but both inside the unscaled window.
	// F = (1, 0), g = (1e10, 1e10) — h2 = 1 + 2e20, f2 = 1, h2 large.
	var r = call( 1, 0, 1e10, 1e10 );
	close( inv( r ), 1.0, 1e-12, 'identity' );
});

test( 'zrotg: with offsets in arrays', function t() {
	var av;
	var sv;
	var a = new Complex128Array([ 99, 99, 3, 4 ]);
	var b = new Complex128Array([ 99, 99, 99, 99, 5, 12 ]);
	var c = new Float64Array( 5 );
	var s = new Complex128Array( 3 );
	base( a, 1, b, 2, c, 3, s, 1 );
	av = reinterpret( a, 0 );
	sv = reinterpret( s, 0 );

	// F at element 1 in a (real entries 2,3); s at element 1 (real entries 2,3).
	close( ( c[ 3 ] * c[ 3 ] ) + ( sv[ 2 ] * sv[ 2 ] ) + ( sv[ 3 ] * sv[ 3 ] ), 1.0, 1e-14, 'identity' );

	// R magnitude = sqrt(|f|^2 + |g|^2) = sqrt(25 + 169) = sqrt(194).
	close( Math.sqrt( ( av[ 2 ] * av[ 2 ] ) + ( av[ 3 ] * av[ 3 ] ) ), Math.sqrt( 194.0 ), 1e-12, '|r|' );

	// Other slots are untouched.
	close( av[ 0 ], 99, 1e-15, 'a[0] untouched' );
	close( c[ 0 ], 0.0, 1e-15, 'c[0] untouched' );
});

test( 'zrotg: very small f2/h2 ratio (denormal cc branch)', function t() {
	// F extremely small relative to g but both nonzero - exercises the
	// "f2 < h2 * SAFMIN" branch in the unscaled or scaled code paths.
	// Use values where f1/u is tiny so the cc < SAFMIN sub-branch may run.
	var r = call( 1e-300, 0, 1, 0 );

	// |s|~1, c is tiny.
	assert.ok( Math.abs( r.c ) < 1e-100, 'c is tiny' );
	close( inv( r ), 1.0, 1e-14, 'identity' );
});

test( 'zrotg: extreme f underflow forces cc fallback in scaled branch', function t() {
	// f far below SAFMIN region using subnormal values; g normal-scaled.
	var f = SAFMIN * 1e-10;
	var r = call( f, 0, 1.0, 0 );

	// Should still satisfy invariant.
	close( inv( r ), 1.0, 1e-12, 'identity' );
});

test( 'zrotg: nonzero with complex g and small f (scaled w fallback)', function t() {
	var r = call( 1e-200, 1e-200, 2, 3 );
	close( inv( r ), 1.0, 1e-12, 'identity' );
});

test( 'zrotg: f=g balanced general complex', function t() {
	// Generic complex case to verify identity holds.
	var r = call( 1.5, -2.5, -0.7, 0.3 );
	close( inv( r ), 1.0, 1e-14, 'identity' );
});
