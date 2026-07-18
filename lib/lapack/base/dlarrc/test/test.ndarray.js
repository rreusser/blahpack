// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrc from './../lib/ndarray.js';

// FIXTURES //

import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n1_t_inside from './fixtures/n1_t_inside.json' with { type: 'json' };
import n1_t_outside from './fixtures/n1_t_outside.json' with { type: 'json' };
import n5_t_all from './fixtures/n5_t_all.json' with { type: 'json' };
import n5_t_narrow from './fixtures/n5_t_narrow.json' with { type: 'json' };
import n1_l_inside from './fixtures/n1_l_inside.json' with { type: 'json' };
import n5_l_all from './fixtures/n5_l_all.json' with { type: 'json' };
import n5_l_narrow from './fixtures/n5_l_narrow.json' with { type: 'json' };
import n3_t_boundary from './fixtures/n3_t_boundary.json' with { type: 'json' };
import n4_t_negative from './fixtures/n4_t_negative.json' with { type: 'json' };
import n4_l_negative from './fixtures/n4_l_negative.json' with { type: 'json' };
import n2_t_both from './fixtures/n2_t_both.json' with { type: 'json' };
import n2_l_both from './fixtures/n2_l_both.json' with { type: 'json' };
const ndarray = dlarrc;
import lib from './../lib/index.js';

// TESTS //

test( 'dlarrc is a function', function t() {
	assert.equal( typeof dlarrc, 'function' );
});

test( 'dlarrc: n_zero (quick return)', function t() {
	const tc = n_zero;
	const d = new Float64Array( [ 0.0 ] );
	const e = new Float64Array( [ 0.0 ] );
	const result = dlarrc( 'tridiagonal', 0, -1.0, 1.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n1_t_inside (single eigenvalue inside interval)', function t() {
	const tc = n1_t_inside;
	const d = new Float64Array( [ 2.0 ] );
	const e = new Float64Array( [ 0.0 ] );
	const result = dlarrc( 'tridiagonal', 1, 0.0, 3.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n1_t_outside (single eigenvalue outside interval)', function t() {
	const tc = n1_t_outside;
	const d = new Float64Array( [ 2.0 ] );
	const e = new Float64Array( [ 0.0 ] );
	const result = dlarrc( 'tridiagonal', 1, 3.0, 5.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n5_t_all (wide interval captures all eigenvalues)', function t() {
	const tc = n5_t_all;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const result = dlarrc( 'tridiagonal', 5, -10.0, 10.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n5_t_narrow (narrow interval captures subset)', function t() {
	const tc = n5_t_narrow;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const result = dlarrc( 'tridiagonal', 5, 1.0, 4.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n1_l_inside (LDL^T, single eigenvalue inside)', function t() {
	const tc = n1_l_inside;
	const d = new Float64Array( [ 2.0 ] );
	const e = new Float64Array( [ 0.0 ] );
	const result = dlarrc( 'ldl', 1, 0.0, 3.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n5_l_all (LDL^T, wide interval)', function t() {
	const tc = n5_l_all;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const e = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
	const result = dlarrc( 'ldl', 5, -10.0, 10.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n5_l_narrow (LDL^T, narrow interval)', function t() {
	const tc = n5_l_narrow;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const e = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
	const result = dlarrc( 'ldl', 5, 1.0, 4.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n3_t_boundary (eigenvalue at interval boundary)', function t() {
	const tc = n3_t_boundary;
	const d = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const e = new Float64Array( [ 0.0, 0.0 ] );
	const result = dlarrc( 'tridiagonal', 3, 1.0, 3.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n4_t_negative (negative eigenvalues, tridiagonal)', function t() {
	const tc = n4_t_negative;
	const d = new Float64Array( [ -5.0, -3.0, -7.0, -1.0 ] );
	const e = new Float64Array( [ 0.5, 0.5, 0.5 ] );
	const result = dlarrc( 'tridiagonal', 4, -8.0, -2.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n4_l_negative (negative eigenvalues, LDL^T)', function t() {
	const tc = n4_l_negative;
	const d = new Float64Array( [ -5.0, -3.0, -7.0, -1.0 ] );
	const e = new Float64Array( [ 0.5, 0.5, 0.5 ] );
	const result = dlarrc( 'ldl', 4, -8.0, -2.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n2_t_both (two eigenvalues, tridiagonal)', function t() {
	const tc = n2_t_both;
	const d = new Float64Array( [ 1.0, 4.0 ] );
	const e = new Float64Array( [ 1.0 ] );
	const result = dlarrc( 'tridiagonal', 2, 0.0, 5.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: n2_l_both (two eigenvalues, LDL^T)', function t() {
	const tc = n2_l_both;
	const d = new Float64Array( [ 1.0, 4.0 ] );
	const e = new Float64Array( [ 1.0 ] );
	const result = dlarrc( 'ldl', 2, 0.0, 5.0, d, 1, 0, e, 1, 0, 1e-16 );

	assert.equal( result.info, tc.info );
	assert.equal( result.eigcnt, tc.eigcnt );
	assert.equal( result.lcnt, tc.lcnt );
	assert.equal( result.rcnt, tc.rcnt );
});

test( 'dlarrc: non-unit strides (tridiagonal)', function t() {
	// Use stride=2 with interleaved data
	const d = new Float64Array( [ 4.0, 999.0, 3.0, 999.0, 2.0, 999.0, 1.0, 999.0, 5.0 ] );
	const e = new Float64Array( [ 1.0, 999.0, 1.0, 999.0, 1.0, 999.0, 1.0 ] );
	const result = dlarrc( 'tridiagonal', 5, -10.0, 10.0, d, 2, 0, e, 2, 0, 1e-16 );

	// Same as n5_t_all
	assert.equal( result.info, 0 );
	assert.equal( result.eigcnt, 5 );
	assert.equal( result.lcnt, 0 );
	assert.equal( result.rcnt, 5 );
});

test( 'dlarrc: non-unit strides with offset (tridiagonal)', function t() {
	// Data starts at offset 1
	const d = new Float64Array( [ 999.0, 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const e = new Float64Array( [ 999.0, 1.0, 1.0, 1.0, 1.0 ] );
	const result = dlarrc( 'tridiagonal', 5, -10.0, 10.0, d, 1, 1, e, 1, 1, 1e-16 );

	// Same as n5_t_all
	assert.equal( result.info, 0 );
	assert.equal( result.eigcnt, 5 );
	assert.equal( result.lcnt, 0 );
	assert.equal( result.rcnt, 5 );
});

test( 'dlarrc: non-unit strides (LDL^T)', function t() {
	const d = new Float64Array( [ 4.0, 999.0, 3.0, 999.0, 2.0, 999.0, 1.0, 999.0, 5.0 ] );
	const e = new Float64Array( [ 0.5, 999.0, 0.5, 999.0, 0.5, 999.0, 0.5 ] );
	const result = dlarrc( 'ldl', 5, -10.0, 10.0, d, 2, 0, e, 2, 0, 1e-16 );

	// Same as n5_l_all
	assert.equal( result.info, 0 );
	assert.equal( result.eigcnt, 5 );
	assert.equal( result.lcnt, 0 );
	assert.equal( result.rcnt, 5 );
});

test( 'ndarray wrapper validates jobt parameter', function t() {
	const d = new Float64Array( [ 1.0 ] );
	const e = new Float64Array( [ 0.0 ] );

	assert.throws( function throws() {
		ndarray( 'invalid', 1, 0.0, 1.0, d, 1, 0, e, 1, 0, 1e-16 );
	}, TypeError );
});

test( 'ndarray wrapper accepts valid jobt values', function t() {
	const d = new Float64Array( [ 2.0 ] );
	const e = new Float64Array( [ 0.0 ] );

	const r1 = ndarray( 'tridiagonal', 1, 0.0, 3.0, d, 1, 0, e, 1, 0, 1e-16 );
	assert.equal( r1.eigcnt, 1 );

	const r2 = ndarray( 'ldl', 1, 0.0, 3.0, d, 1, 0, e, 1, 0, 1e-16 );
	assert.equal( r2.eigcnt, 1 );
});

test( 'dlarrc: LDL^T tmp2===0 branch (zero off-diagonal)', function t() {
	// When E[i]*D[i]*E[i] / lpivot === 0, the tmp2===0 branch is taken
	// Use E[0]=0 to force tmp=0, hence tmp2=0
	const d = new Float64Array( [ 2.0, 3.0 ] );
	const e = new Float64Array( [ 0.0 ] );
	const result = dlarrc( 'ldl', 2, 0.0, 4.0, d, 1, 0, e, 1, 0, 1e-16 );

	// D = [2, 3], E = [0]. LDL^T is diagonal: eigenvalues are 2 and 3.
	// Interval (0, 4] captures both.
	assert.equal( result.info, 0 );
	assert.equal( result.eigcnt, 2 );
});

test( 'main export and ndarray export work', function t() {
	const d = new Float64Array( [ 2.0 ] );
	const e = new Float64Array( [ 0.0 ] );

	assert.equal( typeof lib, 'function' );
	assert.equal( typeof lib.ndarray, 'function' );

	const r = lib( 'tridiagonal', 1, 0.0, 3.0, d, e, 1e-16 );
	assert.equal( r.eigcnt, 1 );

	const r2 = lib.ndarray( 'tridiagonal', 1, 0.0, 3.0, d, 1, 0, e, 1, 0, 1e-16 );
	assert.equal( r2.eigcnt, 1 );
});
