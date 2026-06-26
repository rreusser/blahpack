/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpptrf from '../../zpptrf/lib/base.js';
import zpptri from './../lib/ndarray.js';

// FIXTURES //

import upper_3 from './fixtures/upper_3.json' with { type: 'json' };
import lower_3 from './fixtures/lower_3.json' with { type: 'json' };
import upper_4 from './fixtures/upper_4.json' with { type: 'json' };
import lower_4 from './fixtures/lower_4.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import singular_upper from './fixtures/singular_upper.json' with { type: 'json' };
import singular_lower from './fixtures/singular_lower.json' with { type: 'json' };
var ndarray = zpptri;

// FUNCTIONS //

/**
* Converts a Float64Array to an array.
*
* @private
* @param {Float64Array} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out;
	var i;

	out = [];
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual value
* @param {Array} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;

	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Creates a Complex128Array from interleaved real/imaginary doubles.
*
* @private
* @param {Array} arr - interleaved real/imaginary values
* @returns {Complex128Array} complex array
*/
function c128( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}

// TESTS //

test( 'zpptri is a function', function t() {
	assert.equal( typeof zpptri, 'function' );
});

test( 'zpptri: upper, 3x3 HPD matrix', function t() {
	var info;
	var tc;
	var ap;
	var av;

	tc = upper_3;
	ap = c128( [ 10.0, 0.0, 3.0, -1.0, 8.0, 0.0, 1.0, 2.0, 2.0, -1.0, 6.0, 0.0 ] );
	info = zpptrf( 'upper', 3, ap, 1, 0 );
	assert.equal( info, 0, 'zpptrf should succeed' );
	info = zpptri( 'upper', 3, ap, 1, 0 );
	assert.equal( info, 0, 'info' );
	av = toArray( new Float64Array( ap.buffer, ap.byteOffset, 12 ) );
	assertArrayClose( av, tc.ap, 1e-14, 'ap' );
});

test( 'zpptri: lower, 3x3 HPD matrix', function t() {
	var info;
	var tc;
	var ap;
	var av;

	tc = lower_3;
	ap = c128( [ 10.0, 0.0, 3.0, 1.0, 1.0, -2.0, 8.0, 0.0, 2.0, 1.0, 6.0, 0.0 ] );
	info = zpptrf( 'lower', 3, ap, 1, 0 );
	assert.equal( info, 0, 'zpptrf should succeed' );
	info = zpptri( 'lower', 3, ap, 1, 0 );
	assert.equal( info, 0, 'info' );
	av = toArray( new Float64Array( ap.buffer, ap.byteOffset, 12 ) );
	assertArrayClose( av, tc.ap, 1e-14, 'ap' );
});

test( 'zpptri: upper, 4x4 HPD matrix', function t() {
	var info;
	var tc;
	var ap;
	var av;

	tc = upper_4;
	ap = c128([
		14.0,
		0.0,
		4.0,
		-2.0,
		12.0,
		0.0,
		2.0,
		1.0,
		3.0,
		-1.0,
		10.0,
		0.0,
		1.0,
		-3.0,
		2.0,
		2.0,
		1.0,
		-1.0,
		9.0,
		0.0
	]);
	info = zpptrf( 'upper', 4, ap, 1, 0 );
	assert.equal( info, 0, 'zpptrf should succeed' );
	info = zpptri( 'upper', 4, ap, 1, 0 );
	assert.equal( info, 0, 'info' );
	av = toArray( new Float64Array( ap.buffer, ap.byteOffset, 20 ) );
	assertArrayClose( av, tc.ap, 1e-14, 'ap' );
});

test( 'zpptri: lower, 4x4 HPD matrix', function t() {
	var info;
	var tc;
	var ap;
	var av;

	tc = lower_4;
	ap = c128([
		14.0,
		0.0,
		4.0,
		2.0,
		2.0,
		-1.0,
		1.0,
		3.0,
		12.0,
		0.0,
		3.0,
		1.0,
		2.0,
		-2.0,
		10.0,
		0.0,
		1.0,
		1.0,
		9.0,
		0.0
	]);
	info = zpptrf( 'lower', 4, ap, 1, 0 );
	assert.equal( info, 0, 'zpptrf should succeed' );
	info = zpptri( 'lower', 4, ap, 1, 0 );
	assert.equal( info, 0, 'info' );
	av = toArray( new Float64Array( ap.buffer, ap.byteOffset, 20 ) );
	assertArrayClose( av, tc.ap, 1e-14, 'ap' );
});

test( 'zpptri: N=0 quick return', function t() {
	var info;
	var ap;

	ap = c128( [ 99.0, 99.0 ] );
	info = zpptri( 'upper', 0, ap, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zpptri: N=1', function t() {
	var info;
	var tc;
	var ap;
	var av;

	tc = n1;
	ap = c128( [ 9.0, 0.0 ] );
	info = zpptrf( 'upper', 1, ap, 1, 0 );
	assert.equal( info, 0, 'zpptrf should succeed' );
	info = zpptri( 'upper', 1, ap, 1, 0 );
	assert.equal( info, 0, 'info' );
	av = toArray( new Float64Array( ap.buffer, ap.byteOffset, 2 ) );
	assertArrayClose( av, tc.ap, 1e-14, 'ap' );
});

test( 'zpptri: singular upper (info=2)', function t() {
	var info;
	var tc;
	var ap;

	tc = singular_upper;
	ap = c128( [ 3.0, 0.0, 1.0, 2.0, 0.0, 0.0, 4.0, 1.0, 2.0, -1.0, 5.0, 0.0 ] );
	info = zpptri( 'upper', 3, ap, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zpptri: singular lower (info=3)', function t() {
	var info;
	var tc;
	var ap;

	tc = singular_lower;
	ap = c128( [ 3.0, 0.0, 1.0, 2.0, 4.0, 1.0, 5.0, 0.0, 2.0, -1.0, 0.0, 0.0 ] );
	info = zpptri( 'lower', 3, ap, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zpptri: works with non-zero offset', function t() {
	var info;
	var tc;
	var ap;
	var av;

	tc = upper_3;
	ap = c128([
		99.0,
		99.0,
		77.0,
		77.0,
		10.0,
		0.0,
		3.0,
		-1.0,
		8.0,
		0.0,
		1.0,
		2.0,
		2.0,
		-1.0,
		6.0,
		0.0
	]);
	info = zpptrf( 'upper', 3, ap, 1, 2 );
	assert.equal( info, 0, 'zpptrf should succeed' );
	info = zpptri( 'upper', 3, ap, 1, 2 );
	assert.equal( info, 0, 'info' );
	av = toArray( new Float64Array( ap.buffer, ap.byteOffset, 16 ) );
	assert.equal( av[ 0 ], 99.0 );
	assert.equal( av[ 1 ], 99.0 );
	assert.equal( av[ 2 ], 77.0 );
	assert.equal( av[ 3 ], 77.0 );
	assertArrayClose( av.slice( 4 ), tc.ap, 1e-14, 'ap' );
});

test( 'zpptri: ndarray API validates uplo argument', function t() {
	var ap;

	ap = c128( [ 1.0, 0.0 ] );
	assert.throws( function throws() {
		ndarray( 'invalid', 1, ap, 1, 0 );
	}, /invalid argument/ );
});
