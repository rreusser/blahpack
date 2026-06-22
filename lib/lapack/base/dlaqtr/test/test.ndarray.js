/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function, vars-on-top */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqtr from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Asserts a single relative-tolerance comparison.
*
* @private
* @param {number} got - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( got, expected, tol, msg ) {
	var bound = tol * Math.max( Math.abs( expected ), 1.0 );
	if ( !( Math.abs( got - expected ) <= bound ) ) {
		throw new Error( msg + ': expected ' + expected + ', got ' + got );
	}
}

/**
* Loads a column-major matrix into a Float64Array using `LDT=4`.
*
* @private
* @param {Array} entries - list of [i, j, value] tuples (1-based)
* @returns {Float64Array} matrix
*/
function buildT( entries ) {
	var T = new Float64Array( 16 );
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		T[ ( entries[ i ][ 0 ] - 1 ) + ( ( entries[ i ][ 1 ] - 1 ) * 4 ) ] = entries[ i ][ 2 ];
	}
	return T;
}


// CONSTANTS //

var TOL = 1e-12;


// TESTS //

test( 'dlaqtr is a function', function t() {
	assert.strictEqual( typeof dlaqtr, 'function', 'is a function' );
});

test( 'dlaqtr: n0_quick', function t() {
	var T = new Float64Array( 16 );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out = dlaqtr( false, true, 0, T, 1, 4, 0, b, 1, 0, 0, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});

test( 'dlaqtr: real_notran_n1', function t() {
	var T = buildT( [ [ 1, 1, 2.0 ] ] );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out;
	x[ 0 ] = 6.0;
	out = dlaqtr( false, true, 1, T, 1, 4, 0, b, 1, 0, 0, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( x[ 0 ], 3.0, TOL, 'X1' );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});

test( 'dlaqtr: real_notran_n3_triangular', function t() {
	var T = buildT( [
		[ 1, 1, 2.0 ], [ 1, 2, 1.0 ], [ 1, 3, 3.0 ],
		[ 2, 2, 3.0 ], [ 2, 3, -1.0 ],
		[ 3, 3, 4.0 ]
	] );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out;
	x[ 0 ] = 10.0; x[ 1 ] = 5.0; x[ 2 ] = 8.0;
	out = dlaqtr( false, true, 3, T, 1, 4, 0, b, 1, 0, 0, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( x[ 0 ], 8.33333333333333259e-1, TOL, 'X1' );
	assertClose( x[ 1 ], 2.33333333333333348, TOL, 'X2' );
	assertClose( x[ 2 ], 2.0, TOL, 'X3' );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});

test( 'dlaqtr: real_trans_n3_triangular', function t() {
	var T = buildT( [
		[ 1, 1, 2.0 ], [ 1, 2, 1.0 ], [ 1, 3, 3.0 ],
		[ 2, 2, 3.0 ], [ 2, 3, -1.0 ],
		[ 3, 3, 4.0 ]
	] );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out;
	x[ 0 ] = 10.0; x[ 1 ] = 5.0; x[ 2 ] = 8.0;
	out = dlaqtr( true, true, 3, T, 1, 4, 0, b, 1, 0, 0, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( x[ 0 ], 5.0, TOL, 'X1' );
	assertClose( x[ 1 ], 0.0, TOL, 'X2' );
	assertClose( x[ 2 ], -1.75, TOL, 'X3' );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});

test( 'dlaqtr: real_notran_n3_2x2block', function t() {
	var T = buildT( [
		[ 1, 1, 5.0 ], [ 1, 2, 2.0 ], [ 1, 3, 1.0 ],
		[ 2, 2, 1.0 ], [ 2, 3, 3.0 ],
		[ 3, 2, -4.0 ], [ 3, 3, 1.0 ]
	] );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out;
	x[ 0 ] = 1.0; x[ 1 ] = 2.0; x[ 2 ] = 3.0;
	out = dlaqtr( false, true, 3, T, 1, 4, 0, b, 1, 0, 0, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( x[ 0 ], 2.46153846153846084e-1, TOL, 'X1' );
	assertClose( x[ 1 ], -5.38461538461538436e-1, TOL, 'X2' );
	assertClose( x[ 2 ], 8.46153846153846145e-1, TOL, 'X3' );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});

test( 'dlaqtr: real_trans_n3_2x2block', function t() {
	var T = buildT( [
		[ 1, 1, 5.0 ], [ 1, 2, 2.0 ], [ 1, 3, 1.0 ],
		[ 2, 2, 1.0 ], [ 2, 3, 3.0 ],
		[ 3, 2, -4.0 ], [ 3, 3, 1.0 ]
	] );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out;
	x[ 0 ] = 1.0; x[ 1 ] = 2.0; x[ 2 ] = 3.0;
	out = dlaqtr( true, true, 3, T, 1, 4, 0, b, 1, 0, 0, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( x[ 0 ], 2.0e-1, TOL, 'X1' );
	assertClose( x[ 1 ], 9.84615384615384559e-1, TOL, 'X2' );
	assertClose( x[ 2 ], -1.53846153846153882e-1, TOL, 'X3' );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});

test( 'dlaqtr: complex_notran_n2', function t() {
	var T = buildT( [ [ 1, 1, 3.0 ], [ 1, 2, 1.0 ], [ 2, 2, 2.0 ] ] );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out;
	b[ 0 ] = 0.5; b[ 1 ] = 0.25;
	x[ 0 ] = 4.0; x[ 1 ] = 3.0;
	x[ 2 ] = 1.0; x[ 3 ] = 2.0;
	out = dlaqtr( false, false, 2, T, 1, 4, 0, b, 1, 0, 1.5, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( x[ 0 ], 8.62702702702702662e-1, TOL, 'X1' );
	assertClose( x[ 1 ], 1.43999999999999995, TOL, 'X2' );
	assertClose( x[ 2 ], 9.62162162162162327e-2, TOL, 'X3' );
	assertClose( x[ 3 ], -8.0e-2, TOL, 'X4' );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});

test( 'dlaqtr: complex_trans_n2', function t() {
	var T = buildT( [ [ 1, 1, 3.0 ], [ 1, 2, 1.0 ], [ 2, 2, 2.0 ] ] );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out;
	b[ 0 ] = 0.5; b[ 1 ] = 0.25;
	x[ 0 ] = 4.0; x[ 1 ] = 3.0;
	x[ 2 ] = 1.0; x[ 3 ] = 2.0;
	out = dlaqtr( true, false, 2, T, 1, 4, 0, b, 1, 0, 1.5, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( x[ 0 ], 1.24324324324324320, TOL, 'X1' );
	assertClose( x[ 1 ], 9.40540540540540371e-2, TOL, 'X2' );
	assertClose( x[ 2 ], 5.40540540540540460e-1, TOL, 'X3' );
	assertClose( x[ 3 ], 9.55675675675675795e-1, TOL, 'X4' );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});

test( 'dlaqtr: complex_notran_n3_2x2', function t() {
	var T = buildT( [
		[ 1, 1, 4.0 ], [ 1, 2, 1.0 ], [ 1, 3, 0.5 ],
		[ 2, 2, 1.0 ], [ 2, 3, 2.0 ],
		[ 3, 2, -3.0 ], [ 3, 3, 1.0 ]
	] );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out;
	b[ 0 ] = 0.3; b[ 1 ] = 0.2; b[ 2 ] = 0.1;
	x[ 0 ] = 1.0; x[ 1 ] = 2.0; x[ 2 ] = 3.0;
	x[ 3 ] = 0.5; x[ 4 ] = 0.25; x[ 5 ] = 0.125;
	out = dlaqtr( false, false, 3, T, 1, 4, 0, b, 1, 0, 0.8, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( x[ 0 ], 2.32793634301344615e-1, TOL, 'X1' );
	assertClose( x[ 1 ], -5.61549049514526999e-1, TOL, 'X2' );
	assertClose( x[ 2 ], 1.43791153602916544, TOL, 'X3' );
	assertClose( x[ 3 ], -1.76902850070340817e-2, TOL, 'X4' );
	assertClose( x[ 4 ], 3.92842528179755179e-1, TOL, 'X5' );
	assertClose( x[ 5 ], 1.53198355715933210e-1, TOL, 'X6' );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});

test( 'dlaqtr: complex_trans_n3_2x2', function t() {
	var T = buildT( [
		[ 1, 1, 4.0 ], [ 1, 2, 1.0 ], [ 1, 3, 0.5 ],
		[ 2, 2, 1.0 ], [ 2, 3, 2.0 ],
		[ 3, 2, -3.0 ], [ 3, 3, 1.0 ]
	] );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out;
	b[ 0 ] = 0.3; b[ 1 ] = 0.2; b[ 2 ] = 0.1;
	x[ 0 ] = 1.0; x[ 1 ] = 2.0; x[ 2 ] = 3.0;
	x[ 3 ] = 0.5; x[ 4 ] = 0.25; x[ 5 ] = 0.125;
	out = dlaqtr( true, false, 3, T, 1, 4, 0, b, 1, 0, 0.8, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( x[ 0 ], 2.39279055313859540e-1, TOL, 'X1' );
	assertClose( x[ 1 ], 1.58305507534774059, TOL, 'X2' );
	assertClose( x[ 2 ], 1.46456094072418899e-2, TOL, 'X3' );
	assertClose( x[ 3 ], 1.42945929148539458e-1, TOL, 'X4' );
	assertClose( x[ 4 ], 2.41266889663022011e-1, TOL, 'X5' );
	assertClose( x[ 5 ], -3.93362350843134256e-1, TOL, 'X6' );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});

test( 'dlaqtr: real_notran_n4_zero_rhs', function t() {
	var T = buildT( [
		[ 1, 1, 2.0 ], [ 1, 2, 1.0 ], [ 1, 3, 0.5 ], [ 1, 4, 0.25 ],
		[ 2, 2, 3.0 ], [ 2, 3, 1.0 ], [ 2, 4, 0.5 ],
		[ 3, 3, 1.0 ], [ 3, 4, 2.0 ],
		[ 4, 3, -3.0 ], [ 4, 4, 1.0 ]
	] );
	var b = new Float64Array( 4 );
	var x = new Float64Array( 8 );
	var WORK = new Float64Array( 4 );
	var out;
	x[ 2 ] = 1.0;
	out = dlaqtr( false, true, 4, T, 1, 4, 0, b, 1, 0, 0, x, 1, 0, WORK, 1, 0 );
	assert.strictEqual( out.info, 0 );
	assertClose( x[ 0 ], -2.97619047619047603e-2, TOL, 'X1' );
	assertClose( x[ 1 ], -1.19047619047619027e-1, TOL, 'X2' );
	assertClose( x[ 2 ], 1.42857142857142849e-1, TOL, 'X3' );
	assertClose( x[ 3 ], 4.28571428571428548e-1, TOL, 'X4' );
	assertClose( out.scale, 1.0, TOL, 'scale' );
});
