// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrtrs from './../lib/ndarray.js';
const ndarray = ztrtrs;

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import upper_trans from './fixtures/upper_trans.json' with { type: 'json' };
import upper_conj_trans from './fixtures/upper_conj_trans.json' with { type: 'json' };
import upper_unit_diag from './fixtures/upper_unit_diag.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import lower_trans from './fixtures/lower_trans.json' with { type: 'json' };
import lower_conj_trans from './fixtures/lower_conj_trans.json' with { type: 'json' };
import singular_first from './fixtures/singular_first.json' with { type: 'json' };
import singular_last from './fixtures/singular_last.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'ztrtrs: upper triangular, no transpose', function t() {
	const tc = upper_no_trans;
	const A = new Complex128Array([
		2, 1,  0, 0,  0, 0,
		1, 2,  4, 1,  0, 0,
		3, 0,  5, 2,  6, 1
	]);
	const B = new Complex128Array([
		1, 0,  2, 1,  3, 2
	]);
	const info = ztrtrs( 'upper', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-14, 'x' );
});

test( 'ztrtrs: lower triangular, no transpose', function t() {
	const tc = lower_no_trans;
	const A = new Complex128Array([
		2, 1,  1, 2,  3, 0,
		0, 0,  4, 1,  5, 2,
		0, 0,  0, 0,  6, 1
	]);
	const B = new Complex128Array([
		1, 0,  2, 1,  3, 2
	]);
	const info = ztrtrs( 'lower', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-14, 'x' );
});

test( 'ztrtrs: upper triangular, transpose', function t() {
	const tc = upper_trans;
	const A = new Complex128Array([
		2, 1,  0, 0,  0, 0,
		1, 2,  4, 1,  0, 0,
		3, 0,  5, 2,  6, 1
	]);
	const B = new Complex128Array([
		1, 0,  2, 1,  3, 2
	]);
	const info = ztrtrs( 'upper', 'transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-14, 'x' );
});

test( 'ztrtrs: upper triangular, conjugate transpose', function t() {
	const tc = upper_conj_trans;
	const A = new Complex128Array([
		2, 1,  0, 0,  0, 0,
		1, 2,  4, 1,  0, 0,
		3, 0,  5, 2,  6, 1
	]);
	const B = new Complex128Array([
		1, 0,  2, 1,  3, 2
	]);
	const info = ztrtrs( 'upper', 'conjugate-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-14, 'x' );
});

test( 'ztrtrs: upper triangular, unit diagonal', function t() {
	const tc = upper_unit_diag;
	const A = new Complex128Array([
		99, 99,  0, 0,  0, 0,
		2, 1,  99, 99,  0, 0,
		3, 0,  4, 2,  99, 99
	]);
	const B = new Complex128Array([
		10, 5,  5, 3,  1, 1
	]);
	const info = ztrtrs( 'upper', 'no-transpose', 'unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-14, 'x' );
});

test( 'ztrtrs: N=0 quick return', function t() {
	const tc = n_zero;
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const info = ztrtrs( 'upper', 'no-transpose', 'non-unit', 0, 1, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'ztrtrs: singular diagonal (element 2)', function t() {
	const tc = singular;
	const A = new Complex128Array([
		2, 1,  0, 0,  0, 0,
		1, 2,  0, 0,  0, 0,
		3, 0,  5, 2,  6, 1
	]);
	const B = new Complex128Array([
		1, 0,  2, 1,  3, 2
	]);
	const info = ztrtrs( 'upper', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'ztrtrs: multiple right-hand sides (NRHS=2)', function t() {
	const tc = multi_rhs;
	const A = new Complex128Array([
		2, 1,  0, 0,  0, 0,
		1, 2,  4, 1,  0, 0,
		3, 0,  5, 2,  6, 1
	]);
	const B = new Complex128Array([
		1, 0,  2, 1,  3, 2,
		4, 1,  5, 2,  6, 3
	]);
	const info = ztrtrs( 'upper', 'no-transpose', 'non-unit', 3, 2, A, 1, 3, 0, B, 1, 3, 0 );
	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-14, 'x' );
});

test( 'ztrtrs: lower triangular, transpose', function t() {
	const tc = lower_trans;
	const A = new Complex128Array([
		2, 1,  1, 2,  3, 0,
		0, 0,  4, 1,  5, 2,
		0, 0,  0, 0,  6, 1
	]);
	const B = new Complex128Array([
		1, 0,  2, 1,  3, 2
	]);
	const info = ztrtrs( 'lower', 'transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-14, 'x' );
});

test( 'ztrtrs: lower triangular, conjugate transpose', function t() {
	const tc = lower_conj_trans;
	const A = new Complex128Array([
		2, 1,  1, 2,  3, 0,
		0, 0,  4, 1,  5, 2,
		0, 0,  0, 0,  6, 1
	]);
	const B = new Complex128Array([
		1, 0,  2, 1,  3, 2
	]);
	const info = ztrtrs( 'lower', 'conjugate-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-14, 'x' );
});

test( 'ztrtrs: singular at first diagonal element', function t() {
	const tc = singular_first;
	const A = new Complex128Array([
		0, 0,  0, 0,  0, 0,
		1, 0,  2, 0,  0, 0,
		1, 0,  1, 0,  3, 0
	]);
	const B = new Complex128Array([
		1, 0,  2, 0,  3, 0
	]);
	const info = ztrtrs( 'upper', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'ztrtrs: singular at last diagonal element', function t() {
	const tc = singular_last;
	const A = new Complex128Array([
		2, 0,  0, 0,  0, 0,
		1, 0,  3, 0,  0, 0,
		1, 0,  1, 0,  0, 0
	]);
	const B = new Complex128Array([
		1, 0,  2, 0,  3, 0
	]);
	const info = ztrtrs( 'upper', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'ztrtrs: NRHS=0 (no right-hand sides)', function t() {
	const tc = nrhs_zero;
	const A = new Complex128Array([ 2, 1 ]);
	const B = new Complex128Array( 1 );
	const info = ztrtrs( 'upper', 'no-transpose', 'non-unit', 1, 0, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 3 );
	assert.throws( function f() {
		ndarray( 'foo', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid trans', function t() {
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 3 );
	assert.throws( function f() {
		ndarray( 'upper', 'foo', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid diag', function t() {
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 3 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'foo', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 3 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', -1, 1, A, 1, 3, 0, B, 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative NRHS', function t() {
	const A = new Complex128Array( 9 );
	const B = new Complex128Array( 3 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', 3, -1, A, 1, 3, 0, B, 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: N=0 early return', function t() {
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const info = ndarray( 'upper', 'no-transpose', 'non-unit', 0, 1, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, 0 );
});
