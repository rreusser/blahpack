/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlapll from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import parallel from './fixtures/parallel.json' with { type: 'json' };
import orthogonal from './fixtures/orthogonal.json' with { type: 'json' };
import general from './fixtures/general.json' with { type: 'json' };
import n_equals_1 from './fixtures/n_equals_1.json' with { type: 'json' };
import n_equals_2 from './fixtures/n_equals_2.json' with { type: 'json' };
import nearly_parallel from './fixtures/nearly_parallel.json' with { type: 'json' };
import imaginary from './fixtures/imaginary.json' with { type: 'json' };
import identical from './fixtures/identical.json' with { type: 'json' };
import large_n from './fixtures/large_n.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlapll, 'function' );
} );

test( 'attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlapll.ndarray, 'function' );
} );

test( 'base export is a function', function t() {
	assert.strictEqual( typeof base, 'function' );
} );

test( 'base: parallel complex vectors (ssmin ~ 0)', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = parallel;
	var x = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	var y = new Complex128Array( [ 2, 4, 6, 8, 10, 12, 14, 16 ] );

	base( 4, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-12, 'ssmin' );
} );

test( 'base: orthogonal complex vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = orthogonal;
	var x = new Complex128Array( [ 1, 0, 0, 0, 0, 0 ] );
	var y = new Complex128Array( [ 0, 0, 1, 0, 0, 0 ] );

	base( 3, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: general complex vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = general;
	var x = new Complex128Array( [ 1, 2, 3, -1, 0.5, 4 ] );
	var y = new Complex128Array( [ 2, -3, -1, 5, 4, 0.5 ] );

	base( 3, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: N=1 quick return (ssmin = 0)', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = n_equals_1;
	var x = new Complex128Array( [ 5, 3 ] );
	var y = new Complex128Array( [ 2, 7 ] );

	base( 1, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: N=0 quick return (ssmin = 0)', function t() {
	var ssmin = new Float64Array( [ 999.0 ] );
	var x = new Complex128Array( 0 );
	var y = new Complex128Array( 0 );

	base( 0, x, 1, 0, y, 1, 0, ssmin );
	assert.strictEqual( ssmin[ 0 ], 0.0 );
} );

test( 'base: N=2', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = n_equals_2;
	var x = new Complex128Array( [ 3, 1, 4, -2 ] );
	var y = new Complex128Array( [ 1, 0.5, 2, 3 ] );

	base( 2, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: nearly parallel complex vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = nearly_parallel;
	var x = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5 ] );
	var y = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5.001 ] );

	base( 5, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-10, 'ssmin' );
} );

test( 'base: purely imaginary vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = imaginary;
	var x = new Complex128Array( [ 0, 1, 0, 2, 0, 3 ] );
	var y = new Complex128Array( [ 0, 4, 0, 5, 0, 6 ] );

	base( 3, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: identical complex vectors (ssmin ~ 0)', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = identical;
	var x = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );
	var y = new Complex128Array( [ 1, 1, 2, 2, 3, 3, 4, 4 ] );

	base( 4, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-12, 'ssmin' );
} );

test( 'base: large N with sin/cos', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = large_n;
	var xd = [];
	var yd = [];
	var i;

	for ( i = 1; i <= 10; i += 1 ) {
		xd.push( Math.sin( i ) );
		xd.push( Math.cos( i ) );
		yd.push( Math.cos( i * 0.7 ) );
		yd.push( Math.sin( i * 1.3 ) );
	}

	base( 10, new Complex128Array( xd ), 1, 0, new Complex128Array( yd ), 1, 0, ssmin ); // eslint-disable-line max-len
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: non-unit stride', function t() {
	var ssminRef = new Float64Array( 1 );
	var ssmin = new Float64Array( 1 );
	var xRef = new Complex128Array( [ 1, 2, 3, -1, 0.5, 4 ] );
	var yRef = new Complex128Array( [ 2, -3, -1, 5, 4, 0.5 ] );

	// Interleave with padding: stride 2 means skip one complex element
	var x = new Complex128Array( [ 1, 2, 99, 99, 3, -1, 99, 99, 0.5, 4 ] ); // eslint-disable-line max-len
	var y = new Complex128Array( [ 2, -3, 99, 99, -1, 5, 99, 99, 4, 0.5 ] ); // eslint-disable-line max-len

	base( 3, xRef, 1, 0, yRef, 1, 0, ssminRef );
	base( 3, x, 2, 0, y, 2, 0, ssmin );
	assertClose( ssmin[ 0 ], ssminRef[ 0 ], 1e-14, 'non-unit stride ssmin' );
} );

test( 'base: offset', function t() {
	var ssminRef = new Float64Array( 1 );
	var ssmin = new Float64Array( 1 );
	var xRef = new Complex128Array( [ 1, 2, 3, -1, 0.5, 4 ] );
	var yRef = new Complex128Array( [ 2, -3, -1, 5, 4, 0.5 ] );
	var x = new Complex128Array( [ 99, 99, 1, 2, 3, -1, 0.5, 4 ] );
	var y = new Complex128Array( [ 99, 99, 2, -3, -1, 5, 4, 0.5 ] );

	base( 3, xRef, 1, 0, yRef, 1, 0, ssminRef );
	base( 3, x, 1, 1, y, 1, 1, ssmin );
	assertClose( ssmin[ 0 ], ssminRef[ 0 ], 1e-14, 'offset ssmin' );
} );

test( 'base: negative values', function t() {
	var ssmin = new Float64Array( 1 );
	var x = new Complex128Array( [ -1, -2, -3, -4, -5, -6 ] );
	var y = new Complex128Array( [ 3, 2, 1, 0, -1, -2 ] );

	base( 3, x, 1, 0, y, 1, 0, ssmin );

	// Verify it returns a non-negative value
	assert.ok( ssmin[ 0 ] >= 0.0, 'ssmin is non-negative' );
	assert.ok( ssmin[ 0 ] < 20.0, 'ssmin is reasonable' );
} );

test( 'ndarray: parallel complex vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = parallel;
	var x = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	var y = new Complex128Array( [ 2, 4, 6, 8, 10, 12, 14, 16 ] );

	zlapll.ndarray( 4, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-12, 'ndarray ssmin' );
} );

test( 'ndarray: general complex vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = general;
	var x = new Complex128Array( [ 1, 2, 3, -1, 0.5, 4 ] );
	var y = new Complex128Array( [ 2, -3, -1, 5, 4, 0.5 ] );

	zlapll.ndarray( 3, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ndarray ssmin' );
} );

test( 'main: parallel complex vectors (BLAS-style API)', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = parallel;
	var x = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	var y = new Complex128Array( [ 2, 4, 6, 8, 10, 12, 14, 16 ] );

	zlapll( 4, x, 1, y, 1, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-12, 'main ssmin' );
} );

test( 'main: general complex vectors (BLAS-style API)', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = general;
	var x = new Complex128Array( [ 1, 2, 3, -1, 0.5, 4 ] );
	var y = new Complex128Array( [ 2, -3, -1, 5, 4, 0.5 ] );

	zlapll( 3, x, 1, y, 1, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'main ssmin' );
} );

test( 'main: N=1 quick return', function t() {
	var ssmin = new Float64Array( 1 );
	var x = new Complex128Array( [ 5, 3 ] );
	var y = new Complex128Array( [ 2, 7 ] );

	zlapll( 1, x, 1, y, 1, ssmin );
	assert.strictEqual( ssmin[ 0 ], 0.0 );
} );
