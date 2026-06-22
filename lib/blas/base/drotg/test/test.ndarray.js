/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import drotg from './../lib/ndarray.js';

var EPS = 1.0e-14;

/**
* Approx.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {string} msg - assertion message
*/
function approx( actual, expected, msg ) {
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) < EPS, msg + ': got ' + actual + ', expected ~0' ); // eslint-disable-line max-len
	} else {
		assert.ok( Math.abs( actual - expected ) / Math.abs( expected ) < EPS, msg + ': got ' + actual + ', expected ' + expected ); // eslint-disable-line max-len
	}
}

test( 'drotg: main export is a function', function t() {
	assert.strictEqual( typeof drotg, 'function' );
});

test( 'drotg: b=0 (identity rotation)', function t() {
	// [c s; -s c] * [3; 0] = [3; 0], so c=1, s=0, r=3, z=0
	var ab = new Float64Array( [ 3.0, 0.0 ] );
	var cs = new Float64Array( 2 );
	drotg( ab, 1, 0, cs, 1, 0 );
	assert.strictEqual( ab[ 0 ], 3.0 );  // r = a
	assert.strictEqual( ab[ 1 ], 0.0 );  // z = 0
	assert.strictEqual( cs[ 0 ], 1.0 );  // c = 1
	assert.strictEqual( cs[ 1 ], 0.0 );  // s = 0
});

test( 'drotg: a=0 (swap rotation)', function t() {
	// [c s; -s c] * [0; 4] = [r; 0], so c=0, s=1, r=4, z=1
	var ab = new Float64Array( [ 0.0, 4.0 ] );
	var cs = new Float64Array( 2 );
	drotg( ab, 1, 0, cs, 1, 0 );
	assert.strictEqual( ab[ 0 ], 4.0 );  // r = b
	assert.strictEqual( ab[ 1 ], 1.0 );  // z = 1
	assert.strictEqual( cs[ 0 ], 0.0 );  // c = 0
	assert.strictEqual( cs[ 1 ], 1.0 );  // s = 1
});

test( 'drotg: |b| > |a| (a=3, b=4)', function t() {
	// a=3, b=4: |b|>|a|, sigma=sign(b)=+1, r=5, c=3/5=0.6, s=4/5=0.8, z=1/c=5/3
	var ab = new Float64Array( [ 3.0, 4.0 ] );
	var cs = new Float64Array( 2 );
	drotg( ab, 1, 0, cs, 1, 0 );
	approx( ab[ 0 ], 5.0, 'r' );
	approx( ab[ 1 ], 1.0 / 0.6, 'z = 1/c' );
	approx( cs[ 0 ], 0.6, 'c' );
	approx( cs[ 1 ], 0.8, 's' );
});

test( 'drotg: |b| > |a|', function t() {
	// a=1, b=3: r = +sqrt(10) (sigma=sign(b)=+1), c=1/r, s=3/r, z=1/c
	var ab = new Float64Array( [ 1.0, 3.0 ] );
	var cs = new Float64Array( 2 );
	var r = Math.sqrt( 10.0 );
	drotg( ab, 1, 0, cs, 1, 0 );
	approx( ab[ 0 ], r, 'r' );
	approx( cs[ 0 ], 1.0 / r, 'c' );
	approx( cs[ 1 ], 3.0 / r, 's' );
	approx( ab[ 1 ], r, 'z = 1/c = r/1 = r' );
});

test( 'drotg: negative a, |a| > |b|', function t() {
	// a=-5, b=3: sigma=sign(a)=-1, r=-sqrt(34), c=-5/r=5/sqrt(34), s=3/r=-3/sqrt(34), z=s // eslint-disable-line max-len
	var ab = new Float64Array( [ -5.0, 3.0 ] );
	var cs = new Float64Array( 2 );
	var r = -Math.sqrt( 34.0 );
	drotg( ab, 1, 0, cs, 1, 0 );
	approx( ab[ 0 ], r, 'r' );
	approx( cs[ 0 ], -5.0 / r, 'c' );
	approx( cs[ 1 ], 3.0 / r, 's' );
	approx( ab[ 1 ], cs[ 1 ], 'z = s' );
});

test( 'drotg: negative b, |b| >= |a|', function t() {
	// a=2, b=-6: sigma=sign(b)=-1, r=-sqrt(40), c=2/r, s=-6/r, z=1/c
	var ab = new Float64Array( [ 2.0, -6.0 ] );
	var cs = new Float64Array( 2 );
	var r = -Math.sqrt( 40.0 );
	drotg( ab, 1, 0, cs, 1, 0 );
	approx( ab[ 0 ], r, 'r' );
	approx( cs[ 0 ], 2.0 / r, 'c' );
	approx( cs[ 1 ], -6.0 / r, 's' );
	approx( ab[ 1 ], 1.0 / cs[ 0 ], 'z = 1/c' );
});

test( 'drotg: both negative', function t() {
	// a=-3, b=-4: |b|>|a|, sigma=sign(b)=-1, r=-5, c=3/5, s=4/5, z=1/c=5/3
	var ab = new Float64Array( [ -3.0, -4.0 ] );
	var cs = new Float64Array( 2 );
	drotg( ab, 1, 0, cs, 1, 0 );
	approx( ab[ 0 ], -5.0, 'r' );
	approx( cs[ 0 ], 0.6, 'c' );
	approx( cs[ 1 ], 0.8, 's' );
	approx( ab[ 1 ], 1.0 / 0.6, 'z = 1/c' );
});

test( 'drotg: both zero', function t() {
	var ab = new Float64Array( [ 0.0, 0.0 ] );
	var cs = new Float64Array( 2 );
	drotg( ab, 1, 0, cs, 1, 0 );
	assert.strictEqual( ab[ 0 ], 0.0 );
	assert.strictEqual( ab[ 1 ], 0.0 );
	assert.strictEqual( cs[ 0 ], 1.0 );
	assert.strictEqual( cs[ 1 ], 0.0 );
});

test( 'drotg: equal a and b', function t() {
	// a=5, b=5: |b|>=|a| (equal), sigma=sign(b)=+1, r=5*sqrt(2), c=s=1/sqrt(2), z=1/c=sqrt(2) // eslint-disable-line max-len
	var ab = new Float64Array( [ 5.0, 5.0 ] );
	var cs = new Float64Array( 2 );
	var r = 5.0 * Math.sqrt( 2.0 );
	drotg( ab, 1, 0, cs, 1, 0 );
	approx( ab[ 0 ], r, 'r' );
	approx( cs[ 0 ], 5.0 / r, 'c' );
	approx( cs[ 1 ], 5.0 / r, 's' );
	approx( ab[ 1 ], 1.0 / cs[ 0 ], 'z = 1/c' );
});

test( 'drotg: verify c^2 + s^2 = 1', function t() {
	var cases = [
		[ 3.0, 4.0 ],
		[ -7.0, 2.0 ],
		[ 1.0, -1.0 ],
		[ 0.01, 1000.0 ],
		[ 1e100, 1e100 ],
		[ 1e-150, 1e-150 ]
	];
	var ab;
	var cs;
	var i;
	for ( i = 0; i < cases.length; i += 1 ) {
		ab = new Float64Array( cases[ i ] );
		cs = new Float64Array( 2 );
		drotg( ab, 1, 0, cs, 1, 0 );
		approx( ( cs[ 0 ] * cs[ 0 ] ) + ( cs[ 1 ] * cs[ 1 ] ), 1.0, 'c^2+s^2 for case ' + i ); // eslint-disable-line max-len
	}
});

test( 'drotg: verify rotation zeroes b', function t() {
	var cases = [
		[ 3.0, 4.0 ],
		[ -7.0, 2.0 ],
		[ 1.0, -1.0 ],
		[ 100.0, 1.0 ]
	];
	var ab;
	var cs;
	var a;
	var b;
	var i;
	for ( i = 0; i < cases.length; i += 1 ) {
		a = cases[ i ][ 0 ];
		b = cases[ i ][ 1 ];
		ab = new Float64Array( [ a, b ] );
		cs = new Float64Array( 2 );
		drotg( ab, 1, 0, cs, 1, 0 );

		// Second component of rotation should be zero: -s*a + c*b = 0
		approx( ( -cs[ 1 ] * a ) + ( cs[ 0 ] * b ), 0.0, 'rotation zeroes b for case ' + i ); // eslint-disable-line max-len

		// First component should equal r: c*a + s*b = r
		approx( ( cs[ 0 ] * a ) + ( cs[ 1 ] * b ), ab[ 0 ], 'rotation gives r for case ' + i ); // eslint-disable-line max-len
	}
});

test( 'drotg: stride and offset', function t() {
	// a=3, b=4 but stored with stride=2 and offset=1
	var ab = new Float64Array( [ 99.0, 3.0, 99.0, 4.0 ] );
	var cs = new Float64Array( [ 99.0, 0.0, 99.0, 0.0 ] );
	drotg( ab, 2, 1, cs, 2, 1 );
	approx( ab[ 1 ], 5.0, 'r with offset' );
	approx( ab[ 3 ], 1.0 / 0.6, 'z with offset' );
	approx( cs[ 1 ], 0.6, 'c with offset' );
	approx( cs[ 3 ], 0.8, 's with offset' );

	// Untouched elements
	assert.strictEqual( ab[ 0 ], 99.0 );
	assert.strictEqual( ab[ 2 ], 99.0 );
	assert.strictEqual( cs[ 0 ], 99.0 );
	assert.strictEqual( cs[ 2 ], 99.0 );
});
