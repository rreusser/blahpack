// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpbsv from './../lib/ndarray.js';

// FIXTURES //

import upper_tridiag_nrhs1 from './fixtures/upper_tridiag_nrhs1.json' with { type: 'json' };
import lower_tridiag_nrhs1 from './fixtures/lower_tridiag_nrhs1.json' with { type: 'json' };
import upper_tridiag_nrhs2 from './fixtures/upper_tridiag_nrhs2.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import lower_penta_nrhs1 from './fixtures/lower_penta_nrhs1.json' with { type: 'json' };
import upper_penta_nrhs1 from './fixtures/upper_penta_nrhs1.json' with { type: 'json' };

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

test( 'zpbsv: main export is a function', function t() {
	assert.strictEqual( typeof zpbsv, 'function' );
});

test( 'zpbsv: upper tridiagonal N=5, KD=1, NRHS=1', function t() {
	var tc = upper_tridiag_nrhs1;
	// Upper band storage: LDAB=2, row 0 = superdiag, row 1 = diag
	var AB = new Complex128Array( [
		0, 0, 4, 0,
		-1, 0.5, 4, 0,
		-1, 0.5, 4, 0,
		-1, 0.5, 4, 0,
		-1, 0.5, 4, 0
	] );
	var B = new Complex128Array( [
		1, 1, 2, -1, 0, 3, -1, 2, 1, 0
	] );
	var info = zpbsv( 'upper', 5, 1, 1, AB, 1, 2, 0, B, 1, 5, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.x, 1e-10, 'x' );
});

test( 'zpbsv: lower tridiagonal N=5, KD=1, NRHS=1', function t() {
	var tc = lower_tridiag_nrhs1;
	// Lower band storage: LDAB=2, row 0 = diag, row 1 = subdiag
	var AB = new Complex128Array( [
		4, 0, -1, -0.5,
		4, 0, -1, -0.5,
		4, 0, -1, -0.5,
		4, 0, -1, -0.5,
		4, 0, 0, 0
	] );
	var B = new Complex128Array( [
		1, 1, 2, -1, 0, 3, -1, 2, 1, 0
	] );
	var info = zpbsv( 'lower', 5, 1, 1, AB, 1, 2, 0, B, 1, 5, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.x, 1e-10, 'x' );
});

test( 'zpbsv: upper tridiagonal N=5, KD=1, NRHS=2', function t() {
	var tc = upper_tridiag_nrhs2;
	var AB = new Complex128Array( [
		0, 0, 4, 0,
		-1, 0.5, 4, 0,
		-1, 0.5, 4, 0,
		-1, 0.5, 4, 0,
		-1, 0.5, 4, 0
	] );
	// B is N-by-NRHS in column-major: col1 then col2
	var B = new Complex128Array( [
		1, 0, 2, 1, 3, -1, 4, 2, 5, 0,
		5, 1, 4, -1, 3, 0, 2, 1, 1, -1
	] );
	var info = zpbsv( 'upper', 5, 1, 2, AB, 1, 2, 0, B, 1, 5, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.x, 1e-10, 'x' );
});

test( 'zpbsv: N=0 quick return', function t() {
	var tc = n_zero;
	var AB = new Complex128Array( 1 );
	var B = new Complex128Array( 1 );
	var info = zpbsv( 'upper', 0, 0, 1, AB, 1, 1, 0, B, 1, 1, 0 );
	assert.strictEqual( info, tc.info );
});

test( 'zpbsv: NRHS=0 quick return', function t() {
	var tc = nrhs_zero;
	var AB = new Complex128Array( [ 4, 0 ] );
	var B = new Complex128Array( 1 );
	var info = zpbsv( 'lower', 1, 0, 0, AB, 1, 1, 0, B, 1, 1, 0 );
	assert.strictEqual( info, tc.info );
});

test( 'zpbsv: N=1', function t() {
	var tc = n_one;
	var AB = new Complex128Array( [ 4, 0 ] );
	var B = new Complex128Array( [ 8, 4 ] );
	var info = zpbsv( 'upper', 1, 0, 1, AB, 1, 1, 0, B, 1, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.x, 1e-10, 'x' );
});

test( 'zpbsv: not positive definite (INFO > 0)', function t() {
	var tc = not_posdef;
	var AB = new Complex128Array( [
		1, 0, 2, 1,
		0, 0, 0, 0
	] );
	var B = new Complex128Array( [ 1, 0, 1, 0 ] );
	var info = zpbsv( 'lower', 2, 1, 1, AB, 1, 2, 0, B, 1, 2, 0 );
	assert.strictEqual( info, tc.info );
});

test( 'zpbsv: lower pentadiagonal N=4, KD=2, NRHS=1', function t() {
	var tc = lower_penta_nrhs1;
	var AB = new Complex128Array( [
		6, 0, -0.5, 0.5, 0.25, 0,
		6, 0, -0.5, 0.5, 0.25, 0,
		6, 0, -0.5, 0.5, 0, 0,
		6, 0, 0, 0, 0, 0
	] );
	var B = new Complex128Array( [ 1, 2, 2, -1, 3, 0, 4, 1 ] );
	var info = zpbsv( 'lower', 4, 2, 1, AB, 1, 3, 0, B, 1, 4, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.x, 1e-10, 'x' );
});

test( 'zpbsv: upper pentadiagonal N=4, KD=2, NRHS=1', function t() {
	var tc = upper_penta_nrhs1;
	var AB = new Complex128Array( [
		0, 0, 0, 0, 6, 0,
		0, 0, -0.5, -0.5, 6, 0,
		0.25, 0, -0.5, -0.5, 6, 0,
		0.25, 0, -0.5, -0.5, 6, 0
	] );
	var B = new Complex128Array( [ 1, 2, 2, -1, 3, 0, 4, 1 ] );
	var info = zpbsv( 'upper', 4, 2, 1, AB, 1, 3, 0, B, 1, 4, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.x, 1e-10, 'x' );
});
