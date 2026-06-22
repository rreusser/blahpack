/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dnrm2 from './../lib/ndarray.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'dnrm2: main export is a function', function t() {
	assert.strictEqual( typeof dnrm2, 'function', 'is a function' );
});

test( 'dnrm2: N=0 returns 0', function t() {
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var r = dnrm2( 0, x, 1, 0 );
	assert.strictEqual( r, 0.0 );
});

test( 'dnrm2: negative N throws RangeError', function t() {
	var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	assert.throws( function f() {
		dnrm2( -1, x, 1, 0 );
	}, RangeError );
});

test( 'dnrm2: N=1 returns absolute value', function t() {
	var x = new Float64Array( [ -7.0 ] );
	var r = dnrm2( 1, x, 1, 0 );
	approxEqual( r, 7.0, 1e-12, 'r' );
});

test( 'dnrm2: N=1 with offset', function t() {
	var x = new Float64Array( [ 0.0, 0.0, -3.5, 0.0 ] );
	var r = dnrm2( 1, x, 1, 2 );
	approxEqual( r, 3.5, 1e-12, 'r' );
});

test( 'dnrm2: 3-4-5 triangle', function t() {
	var x = new Float64Array( [ 3.0, 4.0 ] );
	var r = dnrm2( 2, x, 1, 0 );
	approxEqual( r, 5.0, 1e-12, 'r' );
});

test( 'dnrm2: five elements', function t() {
	// sqrt(1 + 4 + 9 + 16 + 25) = sqrt(55)
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var r = dnrm2( 5, x, 1, 0 );
	approxEqual( r, Math.sqrt( 55.0 ), 1e-12, 'r' );
});

test( 'dnrm2: stride 2 picks every other element', function t() {
	// Pick indices 0, 2, 4 = [3, 4, 0] → 5
	var x = new Float64Array( [ 3.0, 99.0, 4.0, 99.0, 0.0 ] );
	var r = dnrm2( 3, x, 2, 0 );
	approxEqual( r, 5.0, 1e-12, 'r' );
});

test( 'dnrm2: offset skips initial elements', function t() {
	var x = new Float64Array( [ 99.0, 99.0, 3.0, 4.0 ] );
	var r = dnrm2( 2, x, 1, 2 );
	approxEqual( r, 5.0, 1e-12, 'r' );
});

test( 'dnrm2: stride and offset together', function t() {
	// Start at index 1, stride 2: picks indices 1, 3, 5 = [3, 4, 0]
	var x = new Float64Array( [ 99.0, 3.0, 99.0, 4.0, 99.0, 0.0 ] );
	var r = dnrm2( 3, x, 2, 1 );
	approxEqual( r, 5.0, 1e-12, 'r' );
});

test( 'dnrm2: all zeros returns 0', function t() {
	var x = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	var r = dnrm2( 4, x, 1, 0 );
	assert.strictEqual( r, 0.0 );
});

test( 'dnrm2: negative values', function t() {
	var x = new Float64Array( [ -3.0, -4.0 ] );
	var r = dnrm2( 2, x, 1, 0 );
	approxEqual( r, 5.0, 1e-12, 'r' );
});

test( 'dnrm2: mixed positive and negative', function t() {
	// sqrt(1 + 4 + 9 + 16) = sqrt(30)
	var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
	var r = dnrm2( 4, x, 1, 0 );
	approxEqual( r, Math.sqrt( 30.0 ), 1e-12, 'r' );
});

test( 'dnrm2: single huge element triggers overflow-safe path (abig)', function t() {
	// One element above TBIG (= 1.998e+146) forces the abig branch.
	var big = 1.0e+200;
	var x = new Float64Array( [ big ] );
	var r = dnrm2( 1, x, 1, 0 );
	approxEqual( r, big, 1e-12, 'r' );
});

test( 'dnrm2: huge plus medium triggers abig+amed combine', function t() {
	// Abig branch with amed contribution merged in.
	var big = 1.0e+200;
	var x = new Float64Array( [ big, 3.0, 4.0 ] );
	var r = dnrm2( 3, x, 1, 0 );

	// Should be approximately big (medium values negligible at this scale).
	approxEqual( r, big, 1e-12, 'r' );
});

test( 'dnrm2: two huge elements', function t() {
	var big = 1.0e+200;
	var x = new Float64Array( [ big, big ] );
	var r = dnrm2( 2, x, 1, 0 );
	approxEqual( r, big * Math.sqrt( 2.0 ), 1e-12, 'r' );
});

test( 'dnrm2: single tiny element triggers underflow-safe path (asml)', function t() {
	// One element below TSML (= 1.49e-154) forces the asml branch.
	var tiny = 1.0e-200;
	var x = new Float64Array( [ tiny ] );
	var r = dnrm2( 1, x, 1, 0 );
	approxEqual( r, tiny, 1e-12, 'r' );
});

test( 'dnrm2: two tiny elements', function t() {
	var tiny = 1.0e-200;
	var x = new Float64Array( [ tiny, tiny ] );
	var r = dnrm2( 2, x, 1, 0 );
	approxEqual( r, tiny * Math.sqrt( 2.0 ), 1e-12, 'r' );
});

test( 'dnrm2: tiny plus medium triggers asml+amed combine', function t() {
	// Combined branch where asml > 0 and amed > 0; medium dominates.
	var tiny = 1.0e-200;
	var x = new Float64Array( [ tiny, 3.0, 4.0 ] );
	var r = dnrm2( 3, x, 1, 0 );
	approxEqual( r, 5.0, 1e-12, 'r' );
});

test( 'dnrm2: tiny plus medium where tiny dominates ymax', function t() {
	// Asml > amed branch (asml/SSML > sqrt(amed))
	// Make medium very small and tiny large enough to dominate.
	var tiny = 1.0e-160; // just below TSML (1.49e-154), large for an asml.
	var x = new Float64Array( [ tiny, 1e-100, 1e-100 ] );
	var r = dnrm2( 3, x, 1, 0 );

	// Medium part: sqrt(2)*1e-100; asml part: tiny. medium dominates.
	approxEqual( r, Math.sqrt( 2.0 ) * 1e-100, 1e-12, 'r' );
});

test( 'dnrm2: mixed tiny and big where only abig matters', function t() {
	// Abig branch with no amed.
	var tiny = 1.0e-200;
	var big = 1.0e+200;
	var x = new Float64Array( [ big, tiny ] );
	var r = dnrm2( 2, x, 1, 0 );
	approxEqual( r, big, 1e-12, 'r' );
});

test( 'dnrm2: NaN propagates', function t() {
	var x = new Float64Array( [ 1.0, NaN, 3.0 ] );
	var r = dnrm2( 3, x, 1, 0 );
	assert.ok( r !== r, 'result should be NaN' );
});

test( 'dnrm2: large vector with same values', function t() {
	// sqrt(N) * v
	var N = 100;
	var v = 0.5;
	var i;
	var x = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		x[ i ] = v;
	}
	var r = dnrm2( N, x, 1, 0 );
	approxEqual( r, Math.sqrt( N ) * v, 1e-12, 'r' );
});

test( 'dnrm2: stride with offset and large N', function t() {
	// Stride 3, offset 1, N=4. Elements at indices 1,4,7,10 in [0,3,99,4,99,99,0,99,99,99,0]
	var x = new Float64Array( [ 99.0, 3.0, 99.0, 99.0, 4.0, 99.0, 99.0, 0.0, 99.0, 99.0, 0.0 ] );
	var r = dnrm2( 4, x, 3, 1 );
	approxEqual( r, 5.0, 1e-12, 'r' );
});
