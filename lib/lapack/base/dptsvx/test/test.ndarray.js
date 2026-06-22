// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dptsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_4x4 from './fixtures/fact_n_4x4.json' with { type: 'json' };
import fact_n_3x3 from './fixtures/fact_n_3x3.json' with { type: 'json' };
import fact_f_4x4 from './fixtures/fact_f_4x4.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n5_nrhs1 from './fixtures/n5_nrhs1.json' with { type: 'json' };
import n2_nrhs1 from './fixtures/n2_nrhs1.json' with { type: 'json' };
import dpttrf from './../../dpttrf/lib/base.js';

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

test( 'dptsvx: main export is a function', function t() {
	assert.strictEqual( typeof dptsvx, 'function' );
});

test( 'dptsvx: fact_n_4x4 — factor and solve N=4, NRHS=1', function t() {
	var rcond;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = fact_n_4x4;

	d = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
	e = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	df = new Float64Array( 4 );
	ef = new Float64Array( 3 );
	b = new Float64Array( [ 5.0, 8.0, 11.0, 10.0 ] );
	x = new Float64Array( 4 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 8 );

	info = dptsvx( 'not-factored', 4, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0 );

	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( Array.from( berr ), tc.berr, 1e-14, 'berr' );
	assertArrayClose( Array.from( df ), tc.df, 1e-14, 'df' );
	assertArrayClose( Array.from( ef ), tc.ef, 1e-14, 'ef' );
});

test( 'dptsvx: fact_n_3x3 — factor and solve N=3, NRHS=1', function t() {
	var rcond;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = fact_n_3x3;

	d = new Float64Array( [ 10.0, 10.0, 10.0 ] );
	e = new Float64Array( [ 1.0, 1.0 ] );
	df = new Float64Array( 3 );
	ef = new Float64Array( 2 );
	b = new Float64Array( [ 12.0, 24.0, 32.0 ] );
	x = new Float64Array( 3 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 6 );

	info = dptsvx( 'not-factored', 3, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0 );

	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( Array.from( berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dptsvx: fact_f_4x4 — pre-factored, N=4, NRHS=1', function t() {
	var rcond;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = fact_f_4x4;

	d = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
	e = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	df = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
	ef = new Float64Array( [ 1.0, 2.0, 3.0 ] );

	// Pre-factor:
	dpttrf( 4, df, 1, 0, ef, 1, 0 );

	b = new Float64Array( [ 5.0, 8.0, 11.0, 10.0 ] );
	x = new Float64Array( 4 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 8 );

	info = dptsvx( 'factored', 4, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0 );

	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( Array.from( berr ), tc.berr, 1e-14, 'berr' );
});

test( 'dptsvx: n_zero — quick return for N=0', function t() {
	var rcond;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = n_zero;

	d = new Float64Array( 0 );
	e = new Float64Array( 0 );
	df = new Float64Array( 0 );
	ef = new Float64Array( 0 );
	b = new Float64Array( 0 );
	x = new Float64Array( 0 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 1 );

	info = dptsvx( 'not-factored', 0, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 1, 0, x, 1, 1, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0 );

	assert.strictEqual( info, tc.info );
});

test( 'dptsvx: n_one — N=1 scalar case', function t() {
	var rcond;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = n_one;

	d = new Float64Array( [ 4.0 ] );
	e = new Float64Array( 0 );
	df = new Float64Array( 1 );
	ef = new Float64Array( 0 );
	b = new Float64Array( [ 8.0 ] );
	x = new Float64Array( 1 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 2 );

	info = dptsvx( 'not-factored', 1, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 1, 0, x, 1, 1, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0 );

	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( Array.from( berr ), tc.berr, 1e-14, 'berr' );
});

test( 'dptsvx: not_posdef — not positive definite returns info > 0', function t() {
	var rcond;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = not_posdef;

	d = new Float64Array( [ 4.0, -1.0, 6.0 ] );
	e = new Float64Array( [ 1.0, 2.0 ] );
	df = new Float64Array( 3 );
	ef = new Float64Array( 2 );
	b = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	x = new Float64Array( 3 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 6 );

	info = dptsvx( 'not-factored', 3, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0 );

	assert.strictEqual( info, tc.info );
	assert.strictEqual( rcond[ 0 ], tc.rcond );
});

test( 'dptsvx: multi_rhs — N=3, NRHS=2', function t() {
	var rcond;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var xv;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = multi_rhs;

	d = new Float64Array( [ 10.0, 10.0, 10.0 ] );
	e = new Float64Array( [ 1.0, 1.0 ] );
	df = new Float64Array( 3 );
	ef = new Float64Array( 2 );
	// Column-major: b(:,1) = [11,12,11], b(:,2) = [23,35,43]
	b = new Float64Array( [ 11.0, 12.0, 11.0, 23.0, 35.0, 43.0 ] );
	x = new Float64Array( 6 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 2 );
	berr = new Float64Array( 2 );
	work = new Float64Array( 6 );

	info = dptsvx( 'not-factored', 3, 2, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0 );

	xv = Array.from( x );
	assert.strictEqual( info, tc.info );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( Array.from( berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dptsvx: n5_nrhs1 — larger system N=5, NRHS=1', function t() {
	var rcond;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = n5_nrhs1;

	d = new Float64Array( [ 10.0, 20.0, 30.0, 20.0, 10.0 ] );
	e = new Float64Array( [ 1.0, 2.0, 3.0, 2.0 ] );
	df = new Float64Array( 5 );
	ef = new Float64Array( 4 );
	b = new Float64Array( [ 11.0, 23.0, 35.0, 25.0, 12.0 ] );
	x = new Float64Array( 5 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 10 );

	info = dptsvx( 'not-factored', 5, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 5, 0, x, 1, 5, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0 );

	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( Array.from( berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dptsvx: n2_nrhs1 — N=2 system', function t() {
	var rcond;
	var ferr;
	var berr;
	var work;
	var info;
	var tc;
	var df;
	var ef;
	var d;
	var e;
	var b;
	var x;

	tc = n2_nrhs1;

	d = new Float64Array( [ 4.0, 5.0 ] );
	e = new Float64Array( [ 1.0 ] );
	df = new Float64Array( 2 );
	ef = new Float64Array( 1 );
	b = new Float64Array( [ 5.0, 6.0 ] );
	x = new Float64Array( 2 );
	rcond = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 4 );

	info = dptsvx( 'not-factored', 2, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 2, 0, x, 1, 2, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0 );

	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( Array.from( berr ), tc.berr, 1e-14, 'berr' );
});
