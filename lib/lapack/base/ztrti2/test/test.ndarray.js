// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrti2 from './../lib/ndarray.js';

// FIXTURES //

import upper_nonunit from './fixtures/upper_nonunit.json' with { type: 'json' };
import lower_nonunit from './fixtures/lower_nonunit.json' with { type: 'json' };
import upper_unit from './fixtures/upper_unit.json' with { type: 'json' };
import lower_unit from './fixtures/lower_unit.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import upper_nonunit_4 from './fixtures/upper_nonunit_4.json' with { type: 'json' };
import lower_nonunit_4 from './fixtures/lower_nonunit_4.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'ztrti2: upper, non-unit, 3x3', function t() {
	var tc = upper_nonunit;
	// A = [[2+1i, 1+0.5i, 3+1i], [0, 4+2i, 5+1i], [0, 0, 6+3i]] col-major interleaved
	var A = new Complex128Array( [
		2, 1, 0, 0, 0, 0,
		1, 0.5, 4, 2, 0, 0,
		3, 1, 5, 1, 6, 3
	] );
	var info = ztrti2( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'ztrti2: lower, non-unit, 3x3', function t() {
	var tc = lower_nonunit;
	// A = [[2+1i, 0, 0], [1+0.5i, 4+2i, 0], [3+1i, 5+1i, 6+3i]] col-major interleaved
	var A = new Complex128Array( [
		2, 1, 1, 0.5, 3, 1,
		0, 0, 4, 2, 5, 1,
		0, 0, 0, 0, 6, 3
	] );
	var info = ztrti2( 'lower', 'non-unit', 3, A, 1, 3, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'ztrti2: upper, unit diagonal, 3x3', function t() {
	var tc = upper_unit;
	var A = new Complex128Array( [
		99, 99, 0, 0, 0, 0,
		1, 0.5, 99, 99, 0, 0,
		3, 1, 5, 1, 99, 99
	] );
	var info = ztrti2( 'upper', 'unit', 3, A, 1, 3, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'ztrti2: lower, unit diagonal, 3x3', function t() {
	var tc = lower_unit;
	var A = new Complex128Array( [
		99, 99, 1, 0.5, 3, 1,
		0, 0, 99, 99, 5, 1,
		0, 0, 0, 0, 99, 99
	] );
	var info = ztrti2( 'lower', 'unit', 3, A, 1, 3, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'ztrti2: N=1', function t() {
	var tc = n1;
	// A = 3+4i, inverse should be (3-4i)/25 = 0.12-0.16i
	var A = new Complex128Array( [ 3, 4 ] );
	var info = ztrti2( 'upper', 'non-unit', 1, A, 1, 1, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'ztrti2: N=0', function t() {
	var A = new Complex128Array( 0 );
	var info = ztrti2( 'upper', 'non-unit', 0, A, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'ztrti2: upper, non-unit, 4x4', function t() {
	var tc = upper_nonunit_4;
	var A = new Complex128Array( [
		1, 1, 0, 0, 0, 0, 0, 0,
		2, 0, 5, 1, 0, 0, 0, 0,
		3, 1, 6, 0, 8, 2, 0, 0,
		4, 2, 7, 3, 9, 1, 10, 0
	] );
	var info = ztrti2( 'upper', 'non-unit', 4, A, 1, 4, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-13, 'a' );
});

test( 'ztrti2: lower, non-unit, 4x4', function t() {
	var tc = lower_nonunit_4;
	var A = new Complex128Array( [
		1, 1, 2, 0, 3, 1, 4, 2,
		0, 0, 5, 1, 6, 0, 7, 3,
		0, 0, 0, 0, 8, 2, 9, 1,
		0, 0, 0, 0, 0, 0, 10, 0
	] );
	var info = ztrti2( 'lower', 'non-unit', 4, A, 1, 4, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-13, 'a' );
});
