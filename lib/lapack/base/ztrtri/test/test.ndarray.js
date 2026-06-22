// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrtri from './../lib/ndarray.js';

// FIXTURES //

import upper_nonunit_3 from './fixtures/upper_nonunit_3.json' with { type: 'json' };
import lower_nonunit_3 from './fixtures/lower_nonunit_3.json' with { type: 'json' };
import upper_unit from './fixtures/upper_unit.json' with { type: 'json' };
import upper_nonunit_4 from './fixtures/upper_nonunit_4.json' with { type: 'json' };
import lower_nonunit_4 from './fixtures/lower_nonunit_4.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import upper_5x5 from './fixtures/upper_5x5.json' with { type: 'json' };
import lower_5x5 from './fixtures/lower_5x5.json' with { type: 'json' };

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

test( 'ztrtri: upper, non-unit, 3x3', function t() {
	var tc = upper_nonunit_3;
	var A = new Complex128Array( [
		2, 1, 0, 0, 0, 0,
		1, 0.5, 4, 2, 0, 0,
		3, 1, 5, 1, 6, 3
	] );
	var info = ztrtri( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'ztrtri: lower, non-unit, 3x3', function t() {
	var tc = lower_nonunit_3;
	var A = new Complex128Array( [
		2, 1, 1, 0.5, 3, 1,
		0, 0, 4, 2, 5, 1,
		0, 0, 0, 0, 6, 3
	] );
	var info = ztrtri( 'lower', 'non-unit', 3, A, 1, 3, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'ztrtri: upper, unit diag, 3x3', function t() {
	var tc = upper_unit;
	var A = new Complex128Array( [
		99, 99, 0, 0, 0, 0,
		1, 0.5, 99, 99, 0, 0,
		3, 1, 5, 1, 99, 99
	] );
	var info = ztrtri( 'upper', 'unit', 3, A, 1, 3, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'ztrtri: upper, non-unit, 4x4', function t() {
	var tc = upper_nonunit_4;
	var A = new Complex128Array( [
		1, 1, 0, 0, 0, 0, 0, 0,
		2, 0, 5, 1, 0, 0, 0, 0,
		3, 1, 6, 0, 8, 2, 0, 0,
		4, 2, 7, 3, 9, 1, 10, 0
	] );
	var info = ztrtri( 'upper', 'non-unit', 4, A, 1, 4, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-13, 'a' );
});

test( 'ztrtri: lower, non-unit, 4x4', function t() {
	var tc = lower_nonunit_4;
	var A = new Complex128Array( [
		1, 1, 2, 0, 3, 1, 4, 2,
		0, 0, 5, 1, 6, 0, 7, 3,
		0, 0, 0, 0, 8, 2, 9, 1,
		0, 0, 0, 0, 0, 0, 10, 0
	] );
	var info = ztrtri( 'lower', 'non-unit', 4, A, 1, 4, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-13, 'a' );
});

test( 'ztrtri: N=0', function t() {
	var A = new Complex128Array( 0 );
	var info = ztrtri( 'upper', 'non-unit', 0, A, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'ztrtri: singular (zero diagonal)', function t() {
	var tc = singular;
	var A = new Complex128Array( [
		2, 1, 0, 0, 0, 0,
		3, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 6, 3
	] );
	var info = ztrtri( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'ztrtri: identity 3x3', function t() {
	var tc = identity;
	var A = new Complex128Array( [
		1, 0, 0, 0, 0, 0,
		0, 0, 1, 0, 0, 0,
		0, 0, 0, 0, 1, 0
	] );
	var info = ztrtri( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'ztrtri: upper 5x5 (blocked path)', function t() {
	var tc = upper_5x5;
	var A = new Complex128Array( [
		2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
		1, 0, 4, 2, 0, 0, 0, 0, 0, 0,
		3, 1, 1, 0, 5, 0, 0, 0, 0, 0,
		2, 0.5, 3, 1, 1, 1, 6, 3, 0, 0,
		1, 1, 2, 0, 4, 2, 1, 0, 3, 1
	] );
	var info = ztrtri( 'upper', 'non-unit', 5, A, 1, 5, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-13, 'a' );
});

test( 'ztrtri: lower 5x5 (blocked path)', function t() {
	var tc = lower_5x5;
	var A = new Complex128Array( [
		2, 1, 1, 0, 3, 1, 2, 0.5, 1, 1,
		0, 0, 4, 2, 1, 0, 3, 1, 2, 0,
		0, 0, 0, 0, 5, 0, 1, 1, 4, 2,
		0, 0, 0, 0, 0, 0, 6, 3, 1, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 3, 1
	] );
	var info = ztrtri( 'lower', 'non-unit', 5, A, 1, 5, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-13, 'a' );
});

test( 'ztrtri: N=1 (unblocked path)', function t() {
	var A = new Complex128Array( [ 4, 2 ] );
	var info = ztrtri( 'upper', 'non-unit', 1, A, 1, 1, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, 0 );
	// 1/(4+2i) = (4-2i)/20 = 0.2-0.1i
	assertClose( view[ 0 ], 0.2, 1e-14, 'real' );
	assertClose( view[ 1 ], -0.1, 1e-14, 'imag' );
});
