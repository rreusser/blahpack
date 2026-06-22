/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlapll from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import parallel from './fixtures/parallel.json' with { type: 'json' };
import orthogonal from './fixtures/orthogonal.json' with { type: 'json' };
import general from './fixtures/general.json' with { type: 'json' };
import n_equals_1 from './fixtures/n_equals_1.json' with { type: 'json' };
import n_equals_2 from './fixtures/n_equals_2.json' with { type: 'json' };
import nearly_parallel from './fixtures/nearly_parallel.json' with { type: 'json' };

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
	assert.strictEqual( typeof dlapll, 'function' );
} );

test( 'attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof dlapll.ndarray, 'function' );
} );

test( 'base export is a function', function t() {
	assert.strictEqual( typeof base, 'function' );
} );

test( 'base: parallel vectors (ssmin ~ 0)', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = parallel;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var y = new Float64Array( [ 2.0, 4.0, 6.0, 8.0 ] );

	base( 4, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: orthogonal vectors (ssmin = 1)', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = orthogonal;
	var x = new Float64Array( [ 1.0, 0.0, 0.0 ] );
	var y = new Float64Array( [ 0.0, 1.0, 0.0 ] );

	base( 3, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: general vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = general;
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var y = new Float64Array( [ 4.0, 5.0, 6.0 ] );

	base( 3, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: N=1 quick return (ssmin = 0)', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = n_equals_1;
	var x = new Float64Array( [ 5.0 ] );
	var y = new Float64Array( [ 3.0 ] );

	base( 1, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: N=0 quick return (ssmin = 0)', function t() {
	var ssmin = new Float64Array( [ 999.0 ] );
	var x = new Float64Array( 0 );
	var y = new Float64Array( 0 );

	base( 0, x, 1, 0, y, 1, 0, ssmin );
	assert.strictEqual( ssmin[ 0 ], 0.0 );
} );

test( 'base: N=2', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = n_equals_2;
	var x = new Float64Array( [ 3.0, 4.0 ] );
	var y = new Float64Array( [ 1.0, 2.0 ] );

	base( 2, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: nearly parallel vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = nearly_parallel;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.001 ] );

	base( 5, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ssmin' );
} );

test( 'base: non-unit stride', function t() {
	var ssminRef = new Float64Array( 1 );
	var ssmin = new Float64Array( 1 );
	var xRef = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var yRef = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 1.0, 99.0, 2.0, 99.0, 3.0 ] );
	var y = new Float64Array( [ 4.0, 99.0, 5.0, 99.0, 6.0 ] );

	base( 3, xRef, 1, 0, yRef, 1, 0, ssminRef );
	base( 3, x, 2, 0, y, 2, 0, ssmin );
	assertClose( ssmin[ 0 ], ssminRef[ 0 ], 1e-14, 'non-unit stride ssmin' );
} );

test( 'base: offset', function t() {
	var ssminRef = new Float64Array( 1 );
	var ssmin = new Float64Array( 1 );
	var xRef = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var yRef = new Float64Array( [ 4.0, 5.0, 6.0 ] );
	var x = new Float64Array( [ 99.0, 1.0, 2.0, 3.0 ] );
	var y = new Float64Array( [ 99.0, 4.0, 5.0, 6.0 ] );

	base( 3, xRef, 1, 0, yRef, 1, 0, ssminRef );
	base( 3, x, 1, 1, y, 1, 1, ssmin );
	assertClose( ssmin[ 0 ], ssminRef[ 0 ], 1e-14, 'offset ssmin' );
} );

test( 'base: identical vectors (ssmin ~ 0)', function t() {
	var ssmin = new Float64Array( 1 );
	var x = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var y = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );

	base( 4, x, 1, 0, y, 1, 0, ssmin );

	// Identical vectors are linearly dependent, ssmin should be ~0
	assert.ok( ssmin[ 0 ] < 1e-14, 'identical vectors: ssmin ~ 0, got ' + ssmin[ 0 ] );
} );

test( 'base: negative values', function t() {
	var ssmin = new Float64Array( 1 );
	var x = new Float64Array( [ -1.0, -2.0, -3.0 ] );
	var y = new Float64Array( [ 3.0, 2.0, 1.0 ] );

	base( 3, x, 1, 0, y, 1, 0, ssmin );

	// Just verify it returns a non-negative value
	assert.ok( ssmin[ 0 ] >= 0.0, 'ssmin is non-negative' );
	assert.ok( ssmin[ 0 ] < 10.0, 'ssmin is reasonable' );
} );

test( 'base: large vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var x = new Float64Array( 100 );
	var y = new Float64Array( 100 );
	var i;

	for ( i = 0; i < 100; i += 1 ) {
		x[ i ] = Math.sin( i + 1.0 );
		y[ i ] = Math.cos( i + 1.0 );
	}
	base( 100, x, 1, 0, y, 1, 0, ssmin );

	// Sin and cos are not parallel; ssmin should be positive
	assert.ok( ssmin[ 0 ] > 0.0, 'large vectors: ssmin > 0' );
} );

test( 'ndarray: parallel vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = parallel;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var y = new Float64Array( [ 2.0, 4.0, 6.0, 8.0 ] );

	dlapll.ndarray( 4, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ndarray ssmin' );
} );

test( 'ndarray: general vectors', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = general;
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var y = new Float64Array( [ 4.0, 5.0, 6.0 ] );

	dlapll.ndarray( 3, x, 1, 0, y, 1, 0, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'ndarray ssmin' );
} );

test( 'main: parallel vectors (BLAS-style API)', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = parallel;
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var y = new Float64Array( [ 2.0, 4.0, 6.0, 8.0 ] );

	dlapll( 4, x, 1, y, 1, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'main ssmin' );
} );

test( 'main: general vectors (BLAS-style API)', function t() {
	var ssmin = new Float64Array( 1 );
	var tc = general;
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var y = new Float64Array( [ 4.0, 5.0, 6.0 ] );

	dlapll( 3, x, 1, y, 1, ssmin );
	assertClose( ssmin[ 0 ], tc.ssmin, 1e-14, 'main ssmin' );
} );

test( 'main: N=1 quick return', function t() {
	var ssmin = new Float64Array( 1 );
	var x = new Float64Array( [ 5.0 ] );
	var y = new Float64Array( [ 3.0 ] );

	dlapll( 1, x, 1, y, 1, ssmin );
	assert.strictEqual( ssmin[ 0 ], 0.0 );
} );
