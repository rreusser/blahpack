// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgtsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_trans_n from './fixtures/fact_n_trans_n.json' with { type: 'json' };
import fact_f_trans_n from './fixtures/fact_f_trans_n.json' with { type: 'json' };
import fact_n_trans_t from './fixtures/fact_n_trans_t.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import pivot_5x5 from './fixtures/pivot_5x5.json' with { type: 'json' };
import fact_n_trans_c from './fixtures/fact_n_trans_c.json' with { type: 'json' };
import dgttrf from './../../dgttrf/lib/base.js';

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

function toF64( arr ) {
	return new Float64Array( arr );
}

// TESTS //

test( 'dgtsvx: fact_n_trans_n', function t() {
	const tc = fact_n_trans_n;
	const N = 4;
	const dl = toF64( [ 3.0, 1.0, 2.0 ] );
	const d = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const du = toF64( [ -1.0, -2.0, -3.0 ] );
	const dlf = new Float64Array( 3 );
	const df = new Float64Array( 4 );
	const duf = new Float64Array( 3 );
	const du2 = new Float64Array( 2 );
	const ipiv = new Int32Array( 4 );
	const b = toF64( [ 0.0, 5.0, 5.0, 30.0 ] );
	const x = new Float64Array( 4 );
	const rcond = new Float64Array( 1 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );

	const info = dgtsvx( 'not-factored', 'no-transpose', N, 1,
		dl, 1, 0, d, 1, 0, du, 1, 0,
		dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0,
		ipiv, 1, 0,
		b, 1, N, 0,
		x, 1, N, 0,
		rcond,
		ferr, 1, 0, berr, 1, 0,
		work, 1, 0, iwork, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
});

test( 'dgtsvx: fact_f_trans_n (already factored)', function t() {
	const tc = fact_f_trans_n;
	const N = 4;
	const dl = toF64( [ 3.0, 1.0, 2.0 ] );
	const d = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const du = toF64( [ -1.0, -2.0, -3.0 ] );

	// Factor first
	const dlf = toF64( [ 3.0, 1.0, 2.0 ] );
	const df = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const duf = toF64( [ -1.0, -2.0, -3.0 ] );
	const du2 = new Float64Array( 2 );
	const ipiv = new Int32Array( 4 );
	dgttrf( N, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0 );

	const b = toF64( [ 0.0, 5.0, 5.0, 30.0 ] );
	const x = new Float64Array( 4 );
	const rcond = new Float64Array( 1 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );

	const info = dgtsvx( 'factored', 'no-transpose', N, 1,
		dl, 1, 0, d, 1, 0, du, 1, 0,
		dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0,
		ipiv, 1, 0,
		b, 1, N, 0,
		x, 1, N, 0,
		rcond,
		ferr, 1, 0, berr, 1, 0,
		work, 1, 0, iwork, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
});

test( 'dgtsvx: fact_n_trans_t', function t() {
	const tc = fact_n_trans_t;
	const N = 4;
	const dl = toF64( [ 3.0, 1.0, 2.0 ] );
	const d = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const du = toF64( [ -1.0, -2.0, -3.0 ] );
	const dlf = new Float64Array( 3 );
	const df = new Float64Array( 4 );
	const duf = new Float64Array( 3 );
	const du2 = new Float64Array( 2 );
	const ipiv = new Int32Array( 4 );
	const b = toF64( [ 8.0, 10.0, 19.0, 15.0 ] );
	const x = new Float64Array( 4 );
	const rcond = new Float64Array( 1 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );

	const info = dgtsvx( 'not-factored', 'transpose', N, 1,
		dl, 1, 0, d, 1, 0, du, 1, 0,
		dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0,
		ipiv, 1, 0,
		b, 1, N, 0,
		x, 1, N, 0,
		rcond,
		ferr, 1, 0, berr, 1, 0,
		work, 1, 0, iwork, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
});

test( 'dgtsvx: multi_rhs', function t() {
	const tc = multi_rhs;
	const N = 4;
	const nrhs = 2;
	const dl = toF64( [ 3.0, 1.0, 2.0 ] );
	const d = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const du = toF64( [ -1.0, -2.0, -3.0 ] );
	const dlf = new Float64Array( 3 );
	const df = new Float64Array( 4 );
	const duf = new Float64Array( 3 );
	const du2 = new Float64Array( 2 );
	const ipiv = new Int32Array( 4 );
	const b = toF64( [ 0.0, 5.0, 5.0, 30.0, 4.0, 4.0, -4.0, 20.0 ] );
	const x = new Float64Array( N * nrhs );
	const rcond = new Float64Array( 1 );
	const ferr = new Float64Array( 2 );
	const berr = new Float64Array( 2 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );

	const info = dgtsvx( 'not-factored', 'no-transpose', N, nrhs,
		dl, 1, 0, d, 1, 0, du, 1, 0,
		dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0,
		ipiv, 1, 0,
		b, 1, N, 0,
		x, 1, N, 0,
		rcond,
		ferr, 1, 0, berr, 1, 0,
		work, 1, 0, iwork, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( x.subarray( 0, 4 ) ), tc.x1, 1e-14, 'x1' );
	assertArrayClose( Array.from( x.subarray( 4, 8 ) ), tc.x2, 1e-14, 'x2' );
});

test( 'dgtsvx: n_one', function t() {
	const tc = n_one;
	const d = toF64( [ 5.0 ] );
	const dl = new Float64Array( 0 );
	const du = new Float64Array( 0 );
	const dlf = new Float64Array( 0 );
	const df = new Float64Array( 1 );
	const duf = new Float64Array( 0 );
	const du2 = new Float64Array( 0 );
	const ipiv = new Int32Array( 1 );
	const b = toF64( [ 10.0 ] );
	const x = new Float64Array( 1 );
	const rcond = new Float64Array( 1 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 );
	const iwork = new Int32Array( 1 );

	const info = dgtsvx( 'not-factored', 'no-transpose', 1, 1,
		dl, 1, 0, d, 1, 0, du, 1, 0,
		dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0,
		ipiv, 1, 0,
		b, 1, 1, 0,
		x, 1, 1, 0,
		rcond,
		ferr, 1, 0, berr, 1, 0,
		work, 1, 0, iwork, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
});

test( 'dgtsvx: n_zero', function t() {
	const tc = n_zero;
	const dl = new Float64Array( 0 );
	const d = new Float64Array( 0 );
	const du = new Float64Array( 0 );
	const dlf = new Float64Array( 0 );
	const df = new Float64Array( 0 );
	const duf = new Float64Array( 0 );
	const du2 = new Float64Array( 0 );
	const ipiv = new Int32Array( 0 );
	const b = new Float64Array( 0 );
	const x = new Float64Array( 0 );
	const rcond = new Float64Array( 1 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 1 );
	const iwork = new Int32Array( 1 );

	const info = dgtsvx( 'not-factored', 'no-transpose', 0, 1,
		dl, 1, 0, d, 1, 0, du, 1, 0,
		dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0,
		ipiv, 1, 0,
		b, 1, 0, 0,
		x, 1, 0, 0,
		rcond,
		ferr, 1, 0, berr, 1, 0,
		work, 1, 0, iwork, 1, 0 );

	assert.equal( info, tc.info );
});

test( 'dgtsvx: singular', function t() {
	const tc = singular;
	const N = 3;
	const dl = toF64( [ 0.0, 0.0 ] );
	const d = toF64( [ 0.0, 2.0, 3.0 ] );
	const du = toF64( [ 1.0, 1.0 ] );
	const dlf = new Float64Array( 2 );
	const df = new Float64Array( 3 );
	const duf = new Float64Array( 2 );
	const du2 = new Float64Array( 1 );
	const ipiv = new Int32Array( 3 );
	const b = toF64( [ 1.0, 2.0, 3.0 ] );
	const x = new Float64Array( 3 );
	const rcond = new Float64Array( 1 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );

	const info = dgtsvx( 'not-factored', 'no-transpose', N, 1,
		dl, 1, 0, d, 1, 0, du, 1, 0,
		dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0,
		ipiv, 1, 0,
		b, 1, N, 0,
		x, 1, N, 0,
		rcond,
		ferr, 1, 0, berr, 1, 0,
		work, 1, 0, iwork, 1, 0 );

	assert.equal( info, tc.info );
	assert.equal( rcond[ 0 ], tc.rcond );
});

test( 'dgtsvx: pivot_5x5', function t() {
	const tc = pivot_5x5;
	const N = 5;
	const dl = toF64( [ 5.0, 7.0, 9.0, 2.0 ] );
	const d = toF64( [ 1.0, 3.0, 2.0, 1.0, 8.0 ] );
	const du = toF64( [ 2.0, 4.0, 6.0, 3.0 ] );
	const dlf = new Float64Array( 4 );
	const df = new Float64Array( 5 );
	const duf = new Float64Array( 4 );
	const du2 = new Float64Array( 3 );
	const ipiv = new Int32Array( 5 );
	const b = toF64( [ 3.0, 12.0, 15.0, 13.0, 10.0 ] );
	const x = new Float64Array( 5 );
	const rcond = new Float64Array( 1 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );

	const info = dgtsvx( 'not-factored', 'no-transpose', N, 1,
		dl, 1, 0, d, 1, 0, du, 1, 0,
		dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0,
		ipiv, 1, 0,
		b, 1, N, 0,
		x, 1, N, 0,
		rcond,
		ferr, 1, 0, berr, 1, 0,
		work, 1, 0, iwork, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
});

test( 'dgtsvx: fact_n_trans_c (conjugate-transpose)', function t() {
	const tc = fact_n_trans_c;
	const N = 4;
	const dl = toF64( [ 3.0, 1.0, 2.0 ] );
	const d = toF64( [ 2.0, 4.0, 5.0, 6.0 ] );
	const du = toF64( [ -1.0, -2.0, -3.0 ] );
	const dlf = new Float64Array( 3 );
	const df = new Float64Array( 4 );
	const duf = new Float64Array( 3 );
	const du2 = new Float64Array( 2 );
	const ipiv = new Int32Array( 4 );
	const b = toF64( [ 8.0, 10.0, 19.0, 15.0 ] );
	const x = new Float64Array( 4 );
	const rcond = new Float64Array( 1 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );

	const info = dgtsvx( 'not-factored', 'conjugate-transpose', N, 1,
		dl, 1, 0, d, 1, 0, du, 1, 0,
		dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0,
		ipiv, 1, 0,
		b, 1, N, 0,
		x, 1, N, 0,
		rcond,
		ferr, 1, 0, berr, 1, 0,
		work, 1, 0, iwork, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( Array.from( x ), tc.x, 1e-14, 'x' );
});
