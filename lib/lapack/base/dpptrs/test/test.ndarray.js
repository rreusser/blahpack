/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-statements-per-line, require-jsdoc, stdlib/jsdoc-private-annotation, node/no-sync, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpptrs from './../lib/ndarray.js';

// FIXTURES //

import upper_single_rhs from './fixtures/upper_single_rhs.json' with { type: 'json' };
import lower_single_rhs from './fixtures/lower_single_rhs.json' with { type: 'json' };
import lower_multi_rhs from './fixtures/lower_multi_rhs.json' with { type: 'json' };
import upper_multi_rhs_3 from './fixtures/upper_multi_rhs_3.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
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

// TESTS //

test( 'dpptrs is a function', function t() {
	assert.equal( typeof dpptrs, 'function' );
});

test( 'dpptrs: upper, single RHS (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var b;

	tc = upper_single_rhs;
	ap = new Float64Array( [ 2.0, 1.0, 2.0, 0.5, 1.25, 2.68095132369090194 ] );
	b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	info = dpptrs( 'upper', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dpptrs: lower, single RHS (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var b;

	tc = lower_single_rhs;
	ap = new Float64Array( [ 2.0, 1.0, 0.5, 2.0, 1.25, 2.68095132369090194 ] );
	b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	info = dpptrs( 'lower', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dpptrs: lower, multiple RHS (NRHS=2, 3x3)', function t() {
	var info;
	var tc;
	var ap;
	var b;

	tc = lower_multi_rhs;
	ap = new Float64Array( [ 2.0, 1.0, 0.5, 2.0, 1.25, 2.68095132369090194 ] );
	b = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	info = dpptrs( 'lower', 3, 2, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dpptrs: upper, multiple RHS (NRHS=3, 3x3) - compute inverse', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var ap;
	var b;

	tc = upper_multi_rhs_3;
	ap = new Float64Array( [ 2.0, 1.0, 2.0, 0.5, 1.25, 2.68095132369090194 ] );
	b = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
	info = dpptrs( 'upper', 3, 3, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dpptrs: N=0 quick return', function t() {
	var info;
	var ap;
	var b;

	ap = new Float64Array( [ 1.0 ] );
	b = new Float64Array( [ 1.0 ] );
	info = dpptrs( 'upper', 0, 1, ap, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dpptrs: NRHS=0 quick return', function t() {
	var info;
	var ap;
	var b;

	ap = new Float64Array( [ 2.0, 1.0, 0.5, 2.0, 1.25, 2.68095132369090194 ] );
	b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	info = dpptrs( 'lower', 3, 0, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	assert.equal( b[ 0 ], 1.0 );
	assert.equal( b[ 1 ], 2.0 );
	assert.equal( b[ 2 ], 3.0 );
});

test( 'dpptrs: 1x1 system', function t() {
	var info;
	var tc;
	var ap;
	var b;

	tc = one_by_one;
	ap = new Float64Array( [ 2.0 ] );
	b = new Float64Array( [ 6.0 ] );
	info = dpptrs( 'lower', 1, 1, ap, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0 );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dpptrs: upper, 4x4 system', function t() {
	var info;
	var tc;
	var ap;
	var b;

	tc = upper_4x4;
	ap = new Float64Array([
		3.16227766016837952,
		0.632455532033675882,
		3.40587727318528000,
		0.948683298050513768,
		0.117444043902940706,
		3.75315958847365350,
		0.316227766016837941,
		1.11571841707793662,
		0.418038583293883048,
		4.29888545516983367
	]);
	b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	info = dpptrs( 'upper', 4, 1, ap, 1, 0, b, 1, 4, 0 );
	assert.equal( info, 0 );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dpptrs: lower, 4x4 system', function t() {
	var info;
	var tc;
	var ap;
	var b;

	tc = lower_4x4;
	ap = new Float64Array([
		3.16227766016837952,
		0.632455532033675882,
		0.948683298050513768,
		0.316227766016837941,
		3.40587727318528000,
		0.117444043902940706,
		1.11571841707793662,
		3.75315958847365350,
		0.418038583293883104,
		4.29888545516983367
	]);
	b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	info = dpptrs( 'lower', 4, 1, ap, 1, 0, b, 1, 4, 0 );
	assert.equal( info, 0 );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dpptrs: works with non-zero AP offset', function t() {
	var info;
	var tc;
	var ap;
	var b;

	tc = upper_single_rhs;
	ap = new Float64Array( [ 99.0, 99.0, 99.0, 2.0, 1.0, 2.0, 0.5, 1.25, 2.68095132369090194 ] ); // eslint-disable-line max-len
	b = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	info = dpptrs( 'upper', 3, 1, ap, 1, 3, b, 1, 3, 0 );
	assert.equal( info, 0 );
	assertArrayClose( b, tc.x, 1e-14, 'x' );
});

test( 'dpptrs: works with non-zero B offset', function t() {
	var info;
	var tc;
	var ap;
	var b;

	tc = lower_single_rhs;
	ap = new Float64Array( [ 2.0, 1.0, 0.5, 2.0, 1.25, 2.68095132369090194 ] );
	b = new Float64Array( [ 99.0, 99.0, 1.0, 2.0, 3.0 ] );
	info = dpptrs( 'lower', 3, 1, ap, 1, 0, b, 1, 3, 2 );
	assert.equal( info, 0 );
	assertArrayClose( [ b[ 2 ], b[ 3 ], b[ 4 ] ], tc.x, 1e-14, 'x' );
	assert.equal( b[ 0 ], 99.0 );
	assert.equal( b[ 1 ], 99.0 );
});

test( 'dpptrs: works with non-unit B strides (row-major)', function t() {
	var expected;
	var info;
	var tc;
	var ap;
	var b;

	tc = lower_multi_rhs;
	ap = new Float64Array( [ 2.0, 1.0, 0.5, 2.0, 1.25, 2.68095132369090194 ] );
	b = new Float64Array( [ 1.0, 0.0, 0.0, 1.0, 0.0, 0.0 ] );
	info = dpptrs( 'lower', 3, 2, ap, 1, 0, b, 2, 1, 0 );
	assert.equal( info, 0 );
	expected = tc.x;
	assertArrayClose([ b[ 0 ], b[ 2 ], b[ 4 ] ], [ expected[ 0 ], expected[ 1 ], expected[ 2 ] ], 1e-14, 'col1'); // eslint-disable-line max-len
	assertArrayClose([ b[ 1 ], b[ 3 ], b[ 5 ] ], [ expected[ 3 ], expected[ 4 ], expected[ 5 ] ], 1e-14, 'col2'); // eslint-disable-line max-len
});
