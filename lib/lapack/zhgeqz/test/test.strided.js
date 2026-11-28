// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { importWithConstants } from '../../../../test/harness/constants.js';
import zhgeqz from './../lib/strided.js';

// FIXTURES //

import n_eq_0 from './fixtures/n_eq_0.json' with { type: 'json' };
import n_eq_1 from './fixtures/n_eq_1.json' with { type: 'json' };
import eig_only_3x3 from './fixtures/eig_only_3x3.json' with { type: 'json' };
import schur_3x3 from './fixtures/schur_3x3.json' with { type: 'json' };
import schur_4x4 from './fixtures/schur_4x4.json' with { type: 'json' };
import ihi_lt_ilo from './fixtures/ihi_lt_ilo.json' with { type: 'json' };
import partial_4x4 from './fixtures/partial_4x4.json' with { type: 'json' };
import eig_only_4x4 from './fixtures/eig_only_4x4.json' with { type: 'json' };
import schur_2x2 from './fixtures/schur_2x2.json' with { type: 'json' };
import zero_t_diag_3x3 from './fixtures/zero_t_diag_3x3.json' with { type: 'json' };
import zero_t_last_3x3 from './fixtures/zero_t_last_3x3.json' with { type: 'json' };
import diagonal_3x3 from './fixtures/diagonal_3x3.json' with { type: 'json' };
import accumulate_qz from './fixtures/accumulate_qz.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build an NxN complex column-major matrix from flat interleaved doubles.
* Returns { data: Float64Array, s1: 2, s2: 2*N, offset: 0 }
*/
function makeMatrix( N ) {
	return {
		data: new Complex128Array( N * N ),
		s1: 1,
		s2: N,
		offset: 0
	};
}

/**
* Set complex element (i, j) in a matrix (0-based).
*/
function mset( m, N, i, j, re, im ) {
	const mv = reinterpret( m.data, 0 );
	const idx = ( m.offset + i * m.s1 + j * m.s2 ) * 2;
	mv[ idx ] = re;
	mv[ idx + 1 ] = im;
}

/**
* Get column j of an NxN matrix as a flat array of 2*N doubles.
*/
function getCol( m, N, j ) {
	const mv = reinterpret( m.data, 0 );
	const col = [];
	let idx, i;
	for ( i = 0; i < N; i++ ) {
		idx = ( m.offset + i * m.s1 + j * m.s2 ) * 2;
		col.push( mv[ idx ], mv[ idx + 1 ] );
	}
	return col;
}

// TESTS //

test( 'zhgeqz: n_eq_0', function t() {
	const tc = n_eq_0;
	const H = new Complex128Array( 0 );
	const T = new Complex128Array( 0 );
	const Q = new Complex128Array( 0 );
	const Z = new Complex128Array( 0 );
	const ALPHA = new Complex128Array( 0 );
	const BETA = new Complex128Array( 0 );
	const WORK = new Complex128Array( 1 );
	const RWORK = new Float64Array( 1 );

	const info = zhgeqz( 'eigenvalues', 'none', 'none', 0, 1, 0,
		H, 1, 0, 0,
		T, 1, 0, 0,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Q, 1, 0, 0,
		Z, 1, 0, 0,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
});

test( 'zhgeqz: n_eq_1', function t() {
	const tc = n_eq_1;
	const n = 1;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( 1 );
	const BETA = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const RWORK = new Float64Array( 1 );

	mset( Hm, n, 0, 0, 3.0, 1.0 );
	mset( Tm, n, 0, 0, 2.0, 0.5 );

	const info = zhgeqz( 'schur', 'initialize', 'initialize', n, 1, 1,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-13, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-13, 'beta' );
	assertArrayClose( getCol( Hm, n, 0 ), tc.H, 1e-13, 'H' );
	assertArrayClose( getCol( Tm, n, 0 ), tc.T, 1e-13, 'T' );
	assertArrayClose( getCol( Qm, n, 0 ), tc.Q, 1e-13, 'Q' );
	assertArrayClose( getCol( Zm, n, 0 ), tc.Z, 1e-13, 'Z' );
});

test( 'zhgeqz: eig_only_3x3', function t() {
	const tc = eig_only_3x3;
	const n = 3;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 2.0, 1.0 );
	mset( Hm, n, 0, 1, 1.0, 0.5 );
	mset( Hm, n, 0, 2, 0.5, -0.5 );
	mset( Hm, n, 1, 0, 1.0, -1.0 );
	mset( Hm, n, 1, 1, 3.0, 0.0 );
	mset( Hm, n, 1, 2, 1.0, 1.0 );
	mset( Hm, n, 2, 1, 0.5, 0.5 );
	mset( Hm, n, 2, 2, 4.0, -1.0 );

	mset( Tm, n, 0, 0, 3.0, 0.0 );
	mset( Tm, n, 0, 1, 1.0, 0.5 );
	mset( Tm, n, 0, 2, 0.5, 0.5 );
	mset( Tm, n, 1, 1, 2.0, 1.0 );
	mset( Tm, n, 1, 2, 1.0, 0.0 );
	mset( Tm, n, 2, 2, 1.0, 0.5 );

	const info = zhgeqz( 'eigenvalues', 'none', 'none', n, 1, 3,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-12, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-12, 'beta' );
});

test( 'zhgeqz: schur_3x3', function t() {
	const tc = schur_3x3;
	const n = 3;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 2.0, 1.0 );
	mset( Hm, n, 0, 1, 1.0, 0.5 );
	mset( Hm, n, 0, 2, 0.5, -0.5 );
	mset( Hm, n, 1, 0, 1.0, -1.0 );
	mset( Hm, n, 1, 1, 3.0, 0.0 );
	mset( Hm, n, 1, 2, 1.0, 1.0 );
	mset( Hm, n, 2, 1, 0.5, 0.5 );
	mset( Hm, n, 2, 2, 4.0, -1.0 );

	mset( Tm, n, 0, 0, 3.0, 0.0 );
	mset( Tm, n, 0, 1, 1.0, 0.5 );
	mset( Tm, n, 0, 2, 0.5, 0.5 );
	mset( Tm, n, 1, 1, 2.0, 1.0 );
	mset( Tm, n, 1, 2, 1.0, 0.0 );
	mset( Tm, n, 2, 2, 1.0, 0.5 );

	const info = zhgeqz( 'schur', 'initialize', 'initialize', n, 1, 3,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-12, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-12, 'beta' );
	assertArrayClose( getCol( Hm, n, 0 ), tc.H_col1, 1e-12, 'H_col1' );
	assertArrayClose( getCol( Hm, n, 1 ), tc.H_col2, 1e-12, 'H_col2' );
	assertArrayClose( getCol( Hm, n, 2 ), tc.H_col3, 1e-12, 'H_col3' );
	assertArrayClose( getCol( Tm, n, 0 ), tc.T_col1, 1e-12, 'T_col1' );
	assertArrayClose( getCol( Tm, n, 1 ), tc.T_col2, 1e-12, 'T_col2' );
	assertArrayClose( getCol( Tm, n, 2 ), tc.T_col3, 1e-12, 'T_col3' );
	assertArrayClose( getCol( Qm, n, 0 ), tc.Q_col1, 1e-12, 'Q_col1' );
	assertArrayClose( getCol( Qm, n, 1 ), tc.Q_col2, 1e-12, 'Q_col2' );
	assertArrayClose( getCol( Qm, n, 2 ), tc.Q_col3, 1e-12, 'Q_col3' );
	assertArrayClose( getCol( Zm, n, 0 ), tc.Z_col1, 1e-12, 'Z_col1' );
	assertArrayClose( getCol( Zm, n, 1 ), tc.Z_col2, 1e-12, 'Z_col2' );
	assertArrayClose( getCol( Zm, n, 2 ), tc.Z_col3, 1e-12, 'Z_col3' );
});

test( 'zhgeqz: schur_4x4', function t() {
	const tc = schur_4x4;
	const n = 4;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 1.0, 0.5 );
	mset( Hm, n, 0, 1, 2.0, -1.0 );
	mset( Hm, n, 0, 2, 0.5, 0.5 );
	mset( Hm, n, 0, 3, 1.0, 0.0 );
	mset( Hm, n, 1, 0, 0.5, 0.3 );
	mset( Hm, n, 1, 1, 3.0, 1.0 );
	mset( Hm, n, 1, 2, 1.0, -0.5 );
	mset( Hm, n, 1, 3, 0.5, 1.0 );
	mset( Hm, n, 2, 1, 0.8, -0.2 );
	mset( Hm, n, 2, 2, 2.0, 0.0 );
	mset( Hm, n, 2, 3, 1.5, 0.5 );
	mset( Hm, n, 3, 2, 0.3, 0.1 );
	mset( Hm, n, 3, 3, 4.0, -0.5 );

	mset( Tm, n, 0, 0, 2.0, 0.0 );
	mset( Tm, n, 0, 1, 0.5, 0.5 );
	mset( Tm, n, 0, 2, 0.0, 1.0 );
	mset( Tm, n, 0, 3, 0.5, 0.0 );
	mset( Tm, n, 1, 1, 3.0, 1.0 );
	mset( Tm, n, 1, 2, 1.0, 0.0 );
	mset( Tm, n, 1, 3, 0.5, -0.5 );
	mset( Tm, n, 2, 2, 1.0, 0.5 );
	mset( Tm, n, 2, 3, 0.5, 0.5 );
	mset( Tm, n, 3, 3, 2.0, -1.0 );

	const info = zhgeqz( 'schur', 'initialize', 'initialize', n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-11, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-11, 'beta' );
	assertArrayClose( getCol( Hm, n, 0 ), tc.H_col1, 1e-11, 'H_col1' );
	assertArrayClose( getCol( Hm, n, 1 ), tc.H_col2, 1e-11, 'H_col2' );
	assertArrayClose( getCol( Hm, n, 2 ), tc.H_col3, 1e-11, 'H_col3' );
	assertArrayClose( getCol( Hm, n, 3 ), tc.H_col4, 1e-11, 'H_col4' );
	assertArrayClose( getCol( Tm, n, 0 ), tc.T_col1, 1e-11, 'T_col1' );
	assertArrayClose( getCol( Tm, n, 1 ), tc.T_col2, 1e-11, 'T_col2' );
	assertArrayClose( getCol( Tm, n, 2 ), tc.T_col3, 1e-11, 'T_col3' );
	assertArrayClose( getCol( Tm, n, 3 ), tc.T_col4, 1e-11, 'T_col4' );
	assertArrayClose( getCol( Qm, n, 0 ), tc.Q_col1, 1e-11, 'Q_col1' );
	assertArrayClose( getCol( Qm, n, 1 ), tc.Q_col2, 1e-11, 'Q_col2' );
	assertArrayClose( getCol( Qm, n, 2 ), tc.Q_col3, 1e-11, 'Q_col3' );
	assertArrayClose( getCol( Qm, n, 3 ), tc.Q_col4, 1e-11, 'Q_col4' );
	assertArrayClose( getCol( Zm, n, 0 ), tc.Z_col1, 1e-11, 'Z_col1' );
	assertArrayClose( getCol( Zm, n, 1 ), tc.Z_col2, 1e-11, 'Z_col2' );
	assertArrayClose( getCol( Zm, n, 2 ), tc.Z_col3, 1e-11, 'Z_col3' );
	assertArrayClose( getCol( Zm, n, 3 ), tc.Z_col4, 1e-11, 'Z_col4' );
});

test( 'zhgeqz: ihi_lt_ilo', function t() {
	const tc = ihi_lt_ilo;
	const n = 3;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 5.0, 1.0 );
	mset( Hm, n, 1, 1, 3.0, -1.0 );
	mset( Hm, n, 2, 2, 1.0, 2.0 );
	mset( Tm, n, 0, 0, 2.0, 0.0 );
	mset( Tm, n, 1, 1, 1.0, 0.5 );
	mset( Tm, n, 2, 2, 3.0, -0.5 );

	const info = zhgeqz( 'schur', 'initialize', 'initialize', n, 2, 1,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-13, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-13, 'beta' );
});

test( 'zhgeqz: partial_4x4', function t() {
	const tc = partial_4x4;
	const n = 4;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 1.0, 0.0 );
	mset( Hm, n, 0, 1, 0.5, 0.5 );
	mset( Hm, n, 0, 2, 0.0, 1.0 );
	mset( Hm, n, 0, 3, 0.5, 0.0 );
	mset( Hm, n, 1, 1, 2.0, 1.0 );
	mset( Hm, n, 1, 2, 1.0, -0.5 );
	mset( Hm, n, 1, 3, 0.5, 0.5 );
	mset( Hm, n, 2, 1, 0.8, 0.3 );
	mset( Hm, n, 2, 2, 3.0, 0.0 );
	mset( Hm, n, 2, 3, 1.0, 1.0 );
	mset( Hm, n, 3, 3, 4.0, -1.0 );

	mset( Tm, n, 0, 0, 2.0, 0.0 );
	mset( Tm, n, 0, 1, 0.5, 0.0 );
	mset( Tm, n, 0, 2, 0.0, 0.5 );
	mset( Tm, n, 0, 3, 1.0, 0.0 );
	mset( Tm, n, 1, 1, 1.0, 0.5 );
	mset( Tm, n, 1, 2, 0.5, 0.0 );
	mset( Tm, n, 1, 3, 0.0, 0.5 );
	mset( Tm, n, 2, 2, 3.0, 0.0 );
	mset( Tm, n, 2, 3, 1.0, -0.5 );
	mset( Tm, n, 3, 3, 1.0, 0.0 );

	const info = zhgeqz( 'schur', 'initialize', 'initialize', n, 2, 3,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-12, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-12, 'beta' );
	assertArrayClose( getCol( Hm, n, 0 ), tc.H_col1, 1e-12, 'H_col1' );
	assertArrayClose( getCol( Hm, n, 1 ), tc.H_col2, 1e-12, 'H_col2' );
	assertArrayClose( getCol( Hm, n, 2 ), tc.H_col3, 1e-12, 'H_col3' );
	assertArrayClose( getCol( Hm, n, 3 ), tc.H_col4, 1e-12, 'H_col4' );
	assertArrayClose( getCol( Tm, n, 0 ), tc.T_col1, 1e-12, 'T_col1' );
	assertArrayClose( getCol( Tm, n, 1 ), tc.T_col2, 1e-12, 'T_col2' );
	assertArrayClose( getCol( Tm, n, 2 ), tc.T_col3, 1e-12, 'T_col3' );
	assertArrayClose( getCol( Tm, n, 3 ), tc.T_col4, 1e-12, 'T_col4' );
	assertArrayClose( getCol( Qm, n, 0 ), tc.Q_col1, 1e-12, 'Q_col1' );
	assertArrayClose( getCol( Qm, n, 1 ), tc.Q_col2, 1e-12, 'Q_col2' );
	assertArrayClose( getCol( Qm, n, 2 ), tc.Q_col3, 1e-12, 'Q_col3' );
	assertArrayClose( getCol( Qm, n, 3 ), tc.Q_col4, 1e-12, 'Q_col4' );
	assertArrayClose( getCol( Zm, n, 0 ), tc.Z_col1, 1e-12, 'Z_col1' );
	assertArrayClose( getCol( Zm, n, 1 ), tc.Z_col2, 1e-12, 'Z_col2' );
	assertArrayClose( getCol( Zm, n, 2 ), tc.Z_col3, 1e-12, 'Z_col3' );
	assertArrayClose( getCol( Zm, n, 3 ), tc.Z_col4, 1e-12, 'Z_col4' );
});

test( 'zhgeqz: eig_only_4x4', function t() {
	const tc = eig_only_4x4;
	const n = 4;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 1.0, 0.5 );
	mset( Hm, n, 0, 1, 2.0, -1.0 );
	mset( Hm, n, 0, 2, 0.5, 0.5 );
	mset( Hm, n, 0, 3, 1.0, 0.0 );
	mset( Hm, n, 1, 0, 0.5, 0.3 );
	mset( Hm, n, 1, 1, 3.0, 1.0 );
	mset( Hm, n, 1, 2, 1.0, -0.5 );
	mset( Hm, n, 1, 3, 0.5, 1.0 );
	mset( Hm, n, 2, 1, 0.8, -0.2 );
	mset( Hm, n, 2, 2, 2.0, 0.0 );
	mset( Hm, n, 2, 3, 1.5, 0.5 );
	mset( Hm, n, 3, 2, 0.3, 0.1 );
	mset( Hm, n, 3, 3, 4.0, -0.5 );

	mset( Tm, n, 0, 0, 2.0, 0.0 );
	mset( Tm, n, 0, 1, 0.5, 0.5 );
	mset( Tm, n, 0, 2, 0.0, 1.0 );
	mset( Tm, n, 0, 3, 0.5, 0.0 );
	mset( Tm, n, 1, 1, 3.0, 1.0 );
	mset( Tm, n, 1, 2, 1.0, 0.0 );
	mset( Tm, n, 1, 3, 0.5, -0.5 );
	mset( Tm, n, 2, 2, 1.0, 0.5 );
	mset( Tm, n, 2, 3, 0.5, 0.5 );
	mset( Tm, n, 3, 3, 2.0, -1.0 );

	const info = zhgeqz( 'eigenvalues', 'none', 'none', n, 1, 4,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-11, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-11, 'beta' );
});

test( 'zhgeqz: schur_2x2', function t() {
	const tc = schur_2x2;
	const n = 2;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 1.0, 2.0 );
	mset( Hm, n, 0, 1, 3.0, -1.0 );
	mset( Hm, n, 1, 0, 0.5, 0.5 );
	mset( Hm, n, 1, 1, 4.0, 1.0 );

	mset( Tm, n, 0, 0, 2.0, 0.0 );
	mset( Tm, n, 0, 1, 1.0, 1.0 );
	mset( Tm, n, 1, 1, 3.0, -0.5 );

	const info = zhgeqz( 'schur', 'initialize', 'initialize', n, 1, 2,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-12, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-12, 'beta' );
	assertArrayClose( getCol( Hm, n, 0 ), tc.H_col1, 1e-12, 'H_col1' );
	assertArrayClose( getCol( Hm, n, 1 ), tc.H_col2, 1e-12, 'H_col2' );
	assertArrayClose( getCol( Tm, n, 0 ), tc.T_col1, 1e-12, 'T_col1' );
	assertArrayClose( getCol( Tm, n, 1 ), tc.T_col2, 1e-12, 'T_col2' );
	assertArrayClose( getCol( Qm, n, 0 ), tc.Q_col1, 1e-12, 'Q_col1' );
	assertArrayClose( getCol( Qm, n, 1 ), tc.Q_col2, 1e-12, 'Q_col2' );
	assertArrayClose( getCol( Zm, n, 0 ), tc.Z_col1, 1e-12, 'Z_col1' );
	assertArrayClose( getCol( Zm, n, 1 ), tc.Z_col2, 1e-12, 'Z_col2' );
});

test( 'zhgeqz: zero_t_diag_3x3', function t() {
	const tc = zero_t_diag_3x3;
	const n = 3;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 2.0, 1.0 );
	mset( Hm, n, 0, 1, 1.0, 0.5 );
	mset( Hm, n, 0, 2, 0.5, -0.5 );
	mset( Hm, n, 1, 0, 1.0, -1.0 );
	mset( Hm, n, 1, 1, 3.0, 0.0 );
	mset( Hm, n, 1, 2, 1.0, 1.0 );
	mset( Hm, n, 2, 1, 0.5, 0.5 );
	mset( Hm, n, 2, 2, 4.0, -1.0 );

	mset( Tm, n, 0, 0, 3.0, 0.0 );
	mset( Tm, n, 0, 1, 1.0, 0.5 );
	mset( Tm, n, 0, 2, 0.5, 0.5 );
	mset( Tm, n, 1, 1, 0.0, 0.0 );
	mset( Tm, n, 1, 2, 1.0, 0.0 );
	mset( Tm, n, 2, 2, 1.0, 0.5 );

	const info = zhgeqz( 'schur', 'initialize', 'initialize', n, 1, 3,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-12, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-12, 'beta' );
});

test( 'zhgeqz: zero_t_last_3x3', function t() {
	const tc = zero_t_last_3x3;
	const n = 3;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 2.0, 1.0 );
	mset( Hm, n, 0, 1, 1.0, 0.5 );
	mset( Hm, n, 0, 2, 0.5, -0.5 );
	mset( Hm, n, 1, 0, 1.0, -1.0 );
	mset( Hm, n, 1, 1, 3.0, 0.0 );
	mset( Hm, n, 1, 2, 1.0, 1.0 );
	mset( Hm, n, 2, 1, 0.5, 0.5 );
	mset( Hm, n, 2, 2, 4.0, -1.0 );

	mset( Tm, n, 0, 0, 3.0, 0.0 );
	mset( Tm, n, 0, 1, 1.0, 0.5 );
	mset( Tm, n, 0, 2, 0.5, 0.5 );
	mset( Tm, n, 1, 1, 2.0, 1.0 );
	mset( Tm, n, 1, 2, 1.0, 0.0 );
	mset( Tm, n, 2, 2, 0.0, 0.0 );

	const info = zhgeqz( 'schur', 'initialize', 'initialize', n, 1, 3,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-12, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-12, 'beta' );
});

test( 'zhgeqz: diagonal_3x3', function t() {
	const tc = diagonal_3x3;
	const n = 3;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 1.0, 2.0 );
	mset( Hm, n, 0, 1, 0.5, 0.5 );
	mset( Hm, n, 0, 2, 0.0, 1.0 );
	mset( Hm, n, 1, 1, 3.0, -1.0 );
	mset( Hm, n, 1, 2, 1.0, 0.0 );
	mset( Hm, n, 2, 2, 2.0, 0.5 );

	mset( Tm, n, 0, 0, 1.0, 0.0 );
	mset( Tm, n, 0, 1, 0.5, 0.0 );
	mset( Tm, n, 0, 2, 0.0, 0.5 );
	mset( Tm, n, 1, 1, 2.0, 0.0 );
	mset( Tm, n, 1, 2, 1.0, 0.0 );
	mset( Tm, n, 2, 2, 3.0, 0.0 );

	const info = zhgeqz( 'eigenvalues', 'none', 'none', n, 1, 3,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-12, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-12, 'beta' );
});

test( 'zhgeqz: accumulate_qz (COMPQ=V, COMPZ=V)', function t() {
	const tc = accumulate_qz;
	const n = 3;
	const Hm = makeMatrix( n );
	const Tm = makeMatrix( n );
	const Qm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const ALPHA = new Complex128Array( n );
	const BETA = new Complex128Array( n );
	const WORK = new Complex128Array( n );
	const RWORK = new Float64Array( n );

	mset( Hm, n, 0, 0, 2.0, 1.0 );
	mset( Hm, n, 0, 1, 1.0, 0.5 );
	mset( Hm, n, 0, 2, 0.5, -0.5 );
	mset( Hm, n, 1, 0, 1.0, -1.0 );
	mset( Hm, n, 1, 1, 3.0, 0.0 );
	mset( Hm, n, 1, 2, 1.0, 1.0 );
	mset( Hm, n, 2, 1, 0.5, 0.5 );
	mset( Hm, n, 2, 2, 4.0, -1.0 );

	mset( Tm, n, 0, 0, 3.0, 0.0 );
	mset( Tm, n, 0, 1, 1.0, 0.5 );
	mset( Tm, n, 0, 2, 0.5, 0.5 );
	mset( Tm, n, 1, 1, 2.0, 1.0 );
	mset( Tm, n, 1, 2, 1.0, 0.0 );
	mset( Tm, n, 2, 2, 1.0, 0.5 );

	// Initialize Q,Z to identity
	mset( Qm, n, 0, 0, 1.0, 0.0 );
	mset( Qm, n, 1, 1, 1.0, 0.0 );
	mset( Qm, n, 2, 2, 1.0, 0.0 );
	mset( Zm, n, 0, 0, 1.0, 0.0 );
	mset( Zm, n, 1, 1, 1.0, 0.0 );
	mset( Zm, n, 2, 2, 1.0, 0.0 );

	const info = zhgeqz( 'schur', 'update', 'update', n, 1, 3,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		ALPHA, 1, 0,
		BETA, 1, 0,
		Qm.data, Qm.s1, Qm.s2, Qm.offset,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-12, 'alpha' );
	assertArrayClose( Array.from( reinterpret( BETA, 0 ) ), tc.beta, 1e-12, 'beta' );
	assertArrayClose( getCol( Qm, n, 0 ), tc.Q_col1, 1e-12, 'Q_col1' );
	assertArrayClose( getCol( Qm, n, 1 ), tc.Q_col2, 1e-12, 'Q_col2' );
	assertArrayClose( getCol( Qm, n, 2 ), tc.Q_col3, 1e-12, 'Q_col3' );
	assertArrayClose( getCol( Zm, n, 0 ), tc.Z_col1, 1e-12, 'Z_col1' );
	assertArrayClose( getCol( Zm, n, 1 ), tc.Z_col2, 1e-12, 'Z_col2' );
	assertArrayClose( getCol( Zm, n, 2 ), tc.Z_col3, 1e-12, 'Z_col3' );
});


// PROPERTY HELPERS //

/**
* Builds an NxN column-major Complex128Array from `[ i, j, re, im ]` entries.
*/
function cmat( N, entries ) {
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	let k;
	for ( k = 0; k < entries.length; k++ ) {
		v[ 2 * ( entries[ k ][ 0 ] + ( entries[ k ][ 1 ] * N ) ) ] = entries[ k ][ 2 ];
		v[ ( 2 * ( entries[ k ][ 0 ] + ( entries[ k ][ 1 ] * N ) ) ) + 1 ] = entries[ k ][ 3 ];
	}
	return A;
}

function eye( N ) {
	const e = [];
	let i;
	for ( i = 0; i < N; i++ ) {
		e.push( [ i, i, 1.0, 0.0 ] );
	}
	return cmat( N, e );
}

function copyMat( A ) {
	return new Complex128Array( reinterpret( A, 0 ).slice() );
}

/**
* Returns op(A)*B for NxN column-major matrices, with op(A) = A or A^H.
*/
function matmul( A, B, N, transA ) {
	const C = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	const cv = reinterpret( C, 0 );
	let ar, ai, br, bi, ia, i, j, k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			for ( k = 0; k < N; k++ ) {
				ia = ( transA ) ? 2 * ( k + ( i * N ) ) : 2 * ( i + ( k * N ) );
				ar = av[ ia ];
				ai = ( transA ) ? -av[ ia + 1 ] : av[ ia + 1 ];
				br = bv[ 2 * ( k + ( j * N ) ) ];
				bi = bv[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
				cv[ 2 * ( i + ( j * N ) ) ] += ( ar * br ) - ( ai * bi );
				cv[ ( 2 * ( i + ( j * N ) ) ) + 1 ] += ( ar * bi ) + ( ai * br );
			}
		}
	}
	return C;
}

/**
* Returns A * B^H for NxN column-major matrices.
*/
function matmulH( A, B, N ) {
	const Bh = new Complex128Array( N * N );
	const bv = reinterpret( B, 0 );
	const hv = reinterpret( Bh, 0 );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			hv[ 2 * ( i + ( j * N ) ) ] = bv[ 2 * ( j + ( i * N ) ) ];
			hv[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = -bv[ ( 2 * ( j + ( i * N ) ) ) + 1 ];
		}
	}
	return matmul( A, Bh, N, false );
}

function maxAbs( A ) {
	const v = reinterpret( A, 0 );
	let m = 0.0;
	let i;
	for ( i = 0; i < v.length; i += 2 ) {
		m = Math.max( m, Math.hypot( v[ i ], v[ i + 1 ] ) );
	}
	return m;
}

function maxDiff( A, B ) {
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	let m = 0.0;
	let i;
	for ( i = 0; i < av.length; i += 2 ) {
		m = Math.max( m, Math.hypot( av[ i ] - bv[ i ], av[ i + 1 ] - bv[ i + 1 ] ) );
	}
	return m;
}

function el( A, N, i, j ) {
	const v = reinterpret( A, 0 );
	return [ v[ 2 * ( i + ( j * N ) ) ], v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] ];
}

/**
* Runs zhgeqz on copies of H and T (column-major, unit row stride).
*/
function runQZ( job, compq, compz, N, ilo, ihi, H0, T0, Q0, Z0, fcn ) {
	const H = copyMat( H0 );
	const T = copyMat( T0 );
	const Q = ( Q0 ) ? copyMat( Q0 ) : new Complex128Array( N * N );
	const Z = ( Z0 ) ? copyMat( Z0 ) : new Complex128Array( N * N );
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const info = ( fcn || zhgeqz )( job, compq, compz, N, ilo, ihi, H, 1, N, 0, T, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, new Complex128Array( N ), 1, 0, new Float64Array( N ), 1, 0 );
	return {
		'info': info,
		'H': H,
		'T': T,
		'Q': Q,
		'Z': Z,
		'ALPHA': ALPHA,
		'BETA': BETA
	};
}

/**
* Asserts the generalized Schur decomposition properties of a `'schur'` run
* with `compq = compz = 'initialize'`: H0 = Q*S*Z^H, T0 = Q*P*Z^H, Q and Z
* unitary, S and P upper triangular, diag(P) real and nonnegative,
* ALPHA = diag(S), BETA = diag(P).
*/
function assertSchur( N, H0, T0, r, msg ) {
	const tolH = 1e-13 * N * Math.max( maxAbs( H0 ), 1.0 );
	const tolT = 1e-13 * N * Math.max( maxAbs( T0 ), 1.0 );
	const av = reinterpret( r.ALPHA, 0 );
	const bv = reinterpret( r.BETA, 0 );
	let e, i, j;
	assert.equal( r.info, 0, msg + ': info' );
	assert.ok( maxDiff( matmulH( matmul( r.Q, r.H, N, false ), r.Z, N ), H0 ) <= tolH, msg + ': H = Q*S*Z^H' );
	assert.ok( maxDiff( matmulH( matmul( r.Q, r.T, N, false ), r.Z, N ), T0 ) <= tolT, msg + ': T = Q*P*Z^H' );
	assert.ok( maxDiff( matmul( r.Q, r.Q, N, true ), eye( N ) ) <= 1e-13 * N, msg + ': Q unitary' );
	assert.ok( maxDiff( matmul( r.Z, r.Z, N, true ), eye( N ) ) <= 1e-13 * N, msg + ': Z unitary' );
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			assert.deepEqual( el( r.H, N, i, j ), [ 0.0, 0.0 ], msg + ': S(' + i + ',' + j + ') = 0' );
			assert.deepEqual( el( r.T, N, i, j ), [ 0.0, 0.0 ], msg + ': P(' + i + ',' + j + ') = 0' );
		}
		e = el( r.T, N, j, j );
		assert.equal( e[ 1 ], 0.0, msg + ': P(' + j + ',' + j + ') real' );
		assert.ok( e[ 0 ] >= 0.0, msg + ': P(' + j + ',' + j + ') >= 0' );
		assert.deepEqual( [ bv[ 2 * j ], bv[ ( 2 * j ) + 1 ] ], e, msg + ': BETA(' + j + ')' );
		assert.deepEqual( [ av[ 2 * j ], av[ ( 2 * j ) + 1 ] ], el( r.H, N, j, j ), msg + ': ALPHA(' + j + ')' );
	}
}

/**
* Returns the generalized eigenvalues ALPHA/BETA (`null` for BETA = 0).
*/
function eigs( r, N ) {
	const av = reinterpret( r.ALPHA, 0 );
	const bv = reinterpret( r.BETA, 0 );
	const out = [];
	let d, i;
	for ( i = 0; i < N; i++ ) {
		d = ( bv[ 2 * i ] * bv[ 2 * i ] ) + ( bv[ ( 2 * i ) + 1 ] * bv[ ( 2 * i ) + 1 ] );
		if ( d === 0.0 ) {
			out.push( null );
		} else {
			out.push( [
				( ( av[ 2 * i ] * bv[ 2 * i ] ) + ( av[ ( 2 * i ) + 1 ] * bv[ ( 2 * i ) + 1 ] ) ) / d,
				( ( av[ ( 2 * i ) + 1 ] * bv[ 2 * i ] ) - ( av[ 2 * i ] * bv[ ( 2 * i ) + 1 ] ) ) / d
			] );
		}
	}
	return out;
}

/**
* Asserts two eigenvalue lists are equal as multisets (infinite = null).
*/
function assertSameEigs( a, b, tol, msg ) {
	const used = [];
	let best, bd, d, i, k;
	assert.equal( a.length, b.length, msg + ': count' );
	for ( i = 0; i < a.length; i++ ) {
		best = -1;
		bd = Infinity;
		for ( k = 0; k < b.length; k++ ) {
			if ( used[ k ] ) {
				continue;
			}
			if ( a[ i ] === null || b[ k ] === null ) {
				d = ( a[ i ] === b[ k ] ) ? 0.0 : Infinity;
			} else {
				d = Math.hypot( a[ i ][ 0 ] - b[ k ][ 0 ], a[ i ][ 1 ] - b[ k ][ 1 ] );
			}
			if ( d < bd ) {
				bd = d;
				best = k;
			}
		}
		assert.ok( best >= 0 && bd <= tol * Math.max( 1.0, ( a[ i ] ) ? Math.hypot( a[ i ][ 0 ], a[ i ][ 1 ] ) : 1.0 ), msg + ': eigenvalue ' + i + ' matched (dist ' + bd + ')' );
		used[ best ] = true;
	}
}

/**
* Runs the full property check for a pair: schur/initialize decomposition,
* schur/update equals Q0*(initialize result), and eigenvalues-only agrees.
*/
function assertQZProperties( N, ilo, ihi, H0, T0, msg ) {
	const Q0 = cmat( N, unitaryEntries( N ) );
	const Z0 = matmul( Q0, Q0, N, true );
	const rs = runQZ( 'schur', 'initialize', 'initialize', N, ilo, ihi, H0, T0 );
	const ru = runQZ( 'schur', 'update', 'update', N, ilo, ihi, H0, T0, Q0, Q0 );
	const re = runQZ( 'eigenvalues', 'none', 'none', N, ilo, ihi, H0, T0 );
	assertSchur( N, H0, T0, rs, msg );
	assert.equal( ru.info, 0, msg + ': update info' );
	assert.ok( maxDiff( ru.Q, matmul( Q0, rs.Q, N, false ) ) <= 1e-13 * N, msg + ': update Q = Q0*Q' );
	assert.ok( maxDiff( ru.Z, matmul( Q0, rs.Z, N, false ) ) <= 1e-13 * N, msg + ': update Z = Q0*Z' );
	assert.ok( maxDiff( Z0, eye( N ) ) <= 1e-14 * N, msg + ': Q0 unitary' );
	assert.equal( re.info, 0, msg + ': eigenvalues info' );
	assertSameEigs( eigs( re, N ), eigs( rs, N ), 1e-12, msg + ': eigenvalues job' );
	return rs;
}

/**
* Entries of a fixed unitary matrix: a product of a complex plane rotation
* on rows (0,1) and diagonal phases.
*/
function unitaryEntries( N ) {
	const c = 0.6;
	const s = 0.8;
	const e = [];
	let i;
	if ( N === 1 ) {
		return [ [ 0, 0, 0.0, 1.0 ] ];
	}
	e.push( [ 0, 0, c, 0.0 ] );
	e.push( [ 0, 1, 0.0, s ] );
	e.push( [ 1, 0, 0.0, s ] );
	e.push( [ 1, 1, c, 0.0 ] );
	for ( i = 2; i < N; i++ ) {
		e.push( [ i, i, Math.cos( i ), Math.sin( i ) ] );
	}
	return e;
}


// PROPERTY TESTS //

test( 'zhgeqz: cyclic permutation pair stalls the shift and takes exceptional shifts', function t() {
	// H = cyclic shift (unitary, eigenvalues the 5th roots of unity), T = I.
	// The Wilkinson shift's CTEMP is zero (H(ilast-1,ilast) = 0) and a zero
	// shift leaves a permutation unchanged, so convergence needs the
	// exceptional shifts taken every 10 iterations.
	const N = 5;
	const e = [ [ 0, N - 1, 1.0, 0.0 ] ];
	let rs, ev, p, k;
	for ( k = 1; k < N; k++ ) {
		e.push( [ k, k - 1, 1.0, 0.0 ] );
	}
	const H0 = cmat( N, e );
	const T0 = eye( N );
	rs = assertQZProperties( N, 1, N, H0, T0, 'cyclic' );
	ev = eigs( rs, N );
	for ( k = 0; k < N; k++ ) {
		// Each eigenvalue is a 5th root of unity: lambda^5 = 1.
		p = cpow( ev[ k ], N );
		assert.ok( Math.hypot( p[ 0 ] - 1.0, p[ 1 ] ) <= 1e-11, 'lambda^5 = 1 for eigenvalue ' + k );
	}
});

function cpow( z, n ) {
	let r = [ 1.0, 0.0 ];
	let i;
	for ( i = 0; i < n; i++ ) {
		r = [ ( r[ 0 ] * z[ 0 ] ) - ( r[ 1 ] * z[ 1 ] ), ( r[ 0 ] * z[ 1 ] ) + ( r[ 1 ] * z[ 0 ] ) ];
	}
	return r;
}

test( 'zhgeqz: ilo/ihi sub-range with complex and zero T diagonals outside the active block', function t() {
	// Rows/cols outside ilo:ihi = 3:4 are already triangular. T(0,0) = T(5,5)
	// = 0 (infinite eigenvalues); T(1,1) and T(4,4) are complex, so their
	// columns are scaled to make the diagonal real and nonnegative.
	const N = 6;
	const H0 = cmat( N, [
		[ 0, 0, 1.0, 1.0 ], [ 0, 1, 0.5, 0.0 ], [ 0, 2, 0.3, -0.2 ], [ 0, 3, 0.1, 0.1 ], [ 0, 4, -0.4, 0.2 ], [ 0, 5, 0.2, 0.0 ],
		[ 1, 1, 2.0, -1.0 ], [ 1, 2, 0.7, 0.1 ], [ 1, 3, -0.3, 0.5 ], [ 1, 4, 0.2, 0.2 ], [ 1, 5, 0.6, -0.1 ],
		[ 2, 2, 3.0, 0.5 ], [ 2, 3, 1.0, -1.0 ], [ 2, 4, 0.4, 0.0 ], [ 2, 5, -0.2, 0.3 ],
		[ 3, 2, 1.5, 0.5 ], [ 3, 3, -1.0, 2.0 ], [ 3, 4, 0.5, 0.5 ], [ 3, 5, 0.1, -0.4 ],
		[ 4, 4, 2.0, -1.0 ], [ 4, 5, 0.3, 0.3 ],
		[ 5, 5, 1.5, 0.5 ]
	] );
	const T0 = cmat( N, [
		[ 0, 1, 0.2, 0.1 ], [ 0, 2, 0.5, 0.0 ], [ 0, 3, -0.1, 0.3 ], [ 0, 4, 0.2, 0.0 ], [ 0, 5, 0.1, 0.1 ],
		[ 1, 1, 0.5, -1.0 ], [ 1, 2, 0.3, 0.3 ], [ 1, 3, 0.2, -0.2 ], [ 1, 4, 0.0, 0.4 ], [ 1, 5, 0.3, 0.0 ],
		[ 2, 2, 2.0, 1.0 ], [ 2, 3, 0.5, 0.5 ], [ 2, 4, 0.1, 0.0 ], [ 2, 5, 0.2, -0.1 ],
		[ 3, 3, 1.0, -0.5 ], [ 3, 4, 0.3, 0.2 ], [ 3, 5, -0.2, 0.2 ],
		[ 4, 4, 1.0, 2.0 ], [ 4, 5, 0.4, 0.1 ]
	] );
	const rs = assertQZProperties( N, 3, 4, H0, T0, 'sub-range' );
	const ev = eigs( rs, N );
	assert.equal( ev[ 0 ], null, 'eigenvalue 0 infinite' );
	assert.equal( ev[ 5 ], null, 'eigenvalue 5 infinite' );
	assertSameEigs( [ ev[ 1 ], ev[ 4 ] ], [ cdiv( [ 2.0, -1.0 ], [ 0.5, -1.0 ] ), cdiv( [ 2.0, -1.0 ], [ 1.0, 2.0 ] ) ], 1e-14, 'outside eigenvalues' );
});

function cdiv( a, b ) {
	const d = ( b[ 0 ] * b[ 0 ] ) + ( b[ 1 ] * b[ 1 ] );
	return [ ( ( a[ 0 ] * b[ 0 ] ) + ( a[ 1 ] * b[ 1 ] ) ) / d, ( ( a[ 1 ] * b[ 0 ] ) - ( a[ 0 ] * b[ 1 ] ) ) / d ];
}

/**
* Builds a full-subdiagonal Hessenberg H and upper triangular T with the
* given T diagonal and H subdiagonal overrides.
*/
function hessTri( N, tdiag, hsub ) {
	const he = [];
	const te = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j + 1, N - 1 ); i++ ) {
			if ( i === j + 1 ) {
				he.push( [ i, j, ( hsub[ j ] === void 0 ) ? 1.0 + ( 0.25 * j ) : hsub[ j ], ( hsub[ j ] === void 0 ) ? 0.5 - ( 0.2 * j ) : 0.0 ] );
			} else {
				he.push( [ i, j, Math.cos( ( 3 * i ) + j + 1 ) + ( ( i === j ) ? 2.0 : 0.0 ), Math.sin( ( 2 * i ) - j ) ] );
			}
			if ( i <= j ) {
				if ( i === j ) {
					te.push( [ i, j, tdiag[ j ][ 0 ], tdiag[ j ][ 1 ] ] );
				} else {
					te.push( [ i, j, 0.5 * Math.sin( i + ( 2 * j ) ), 0.3 * Math.cos( i - j ) ] );
				}
			}
		}
	}
	return [ cmat( N, he ), cmat( N, te ) ];
}

test( 'zhgeqz: zero T(j,j) in the middle is chased to the bottom (infinite eigenvalue)', function t() {
	const N = 5;
	const p = hessTri( N, [ [ 2.0, 0.5 ], [ 0.0, 0.0 ], [ 1.5, -0.5 ], [ 1.0, 1.0 ], [ 3.0, 0.0 ] ], [] );
	const rs = assertQZProperties( N, 1, N, p[ 0 ], p[ 1 ], 'chase' );
	const ev = eigs( rs, N );
	assert.equal( ev.filter( ( x ) => x === null ).length, 1, 'exactly one infinite eigenvalue' );
});

test( 'zhgeqz: zero T(0,0) and T(1,1) at the top split 1x1 blocks from the top', function t() {
	const N = 4;
	const p = hessTri( N, [ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 1.5, -0.5 ], [ 1.0, 1.0 ] ], [] );
	const rs = assertQZProperties( N, 1, N, p[ 0 ], p[ 1 ], 'top zeros' );
	const ev = eigs( rs, N );

	// T has rank 3 (T(0,1) != 0), so det(H - lambda*T) has degree 3: one
	// infinite eigenvalue.
	assert.equal( ev.filter( ( x ) => x === null ).length, 1, 'one infinite eigenvalue' );
});

test( 'zhgeqz: zero T(0,0) splits a 1x1 block, then a QZ step on the rest', function t() {
	const N = 4;
	const p = hessTri( N, [ [ 0.0, 0.0 ], [ 2.0, 0.0 ], [ 1.5, -0.5 ], [ 1.0, 1.0 ] ], [] );
	const rs = assertQZProperties( N, 1, N, p[ 0 ], p[ 1 ], 'top zero' );
	assert.equal( eigs( rs, N ).filter( ( x ) => x === null ).length, 1, 'one infinite eigenvalue' );
});

test( 'zhgeqz: top split whose rotation zeroes T(ilast,ilast) falls through to the T(ilast,ilast)=0 deflation', function t() {
	// T(0,0) = 0 and T(0,1) = T(1,1): the rotation that zeroes H(1,0) (from
	// H(0,0) = H(1,0)) also annihilates T(1,1), so both eigenvalues are infinite.
	const N = 2;
	const H0 = cmat( N, [ [ 0, 0, 1.0, 0.0 ], [ 1, 0, 1.0, 0.0 ], [ 0, 1, 2.0, 1.0 ], [ 1, 1, -1.0, 0.5 ] ] );
	const T0 = cmat( N, [ [ 0, 1, 1.0, 0.0 ], [ 1, 1, 1.0, 0.0 ] ] );
	const rs = assertQZProperties( N, 1, N, H0, T0, 'both infinite' );
	assert.deepEqual( eigs( rs, N ), [ null, null ], 'both eigenvalues infinite' );
});

test( 'zhgeqz: zero T(j,j) with two consecutive small subdiagonals splits at j', function t() {
	// H(1,0)*H(2,1) = 1e-18 is negligible relative to H(1,1)*atol, though
	// neither subdiagonal is negligible on its own.
	const N = 4;
	const p = hessTri( N, [ [ 2.0, 0.5 ], [ 0.0, 0.0 ], [ 1.5, -0.5 ], [ 1.0, 1.0 ] ], [ 1e-9, 1e-9 ] );
	const rs = assertQZProperties( N, 1, N, p[ 0 ], p[ 1 ], 'small subdiags' );
	assert.equal( eigs( rs, N ).filter( ( x ) => x === null ).length, 1, 'one infinite eigenvalue' );
});

test( 'zhgeqz: a zero interior subdiagonal splits the pair into independent blocks', function t() {
	const N = 5;
	const p = hessTri( N, [ [ 2.0, 0.5 ], [ 1.0, -1.0 ], [ 1.5, -0.5 ], [ 1.0, 1.0 ], [ 3.0, 0.0 ] ], [ void 0, 0.0 ] );
	const rs = assertQZProperties( N, 1, N, p[ 0 ], p[ 1 ], 'split' );
	assert.equal( eigs( rs, N ).filter( ( x ) => x === null ).length, 0, 'all eigenvalues finite' );
});

test( 'zhgeqz: iteration limit reached returns info = ilast (base, MAXIT overridden)', async function t() {
	// ZHGEQZ: INFO = 1..N means the QZ iteration did not converge; ALPHA(i),
	// BETA(i) for i = INFO+1..N are still correct. With no iterations allowed
	// the active block ilo:ihi = 1:3 is never reduced, so INFO = ihi = 3.
	const mod = await importWithConstants( new URL( './../lib/base.js', import.meta.url ), { 'maxit': 0 } );
	const N = 4;
	const p = hessTri( N, [ [ 2.0, 0.5 ], [ 1.0, -1.0 ], [ 1.5, -0.5 ], [ 1.0, 2.0 ] ], [ void 0, void 0, 0.0 ] );
	const r = runQZ( 'schur', 'initialize', 'initialize', N, 1, 3, p[ 0 ], p[ 1 ], null, null, mod.default );
	const ev = eigs( r, N );
	assert.equal( r.info, 3, 'info' );
	assert.deepEqual( el( r.T, N, 3, 3 ), [ Math.hypot( 1.0, 2.0 ), 0.0 ], 'T(3,3) made real and nonnegative' );
	assertSameEigs( [ ev[ 3 ] ], [ cdiv( el( p[ 0 ], N, 3, 3 ), [ 1.0, 2.0 ] ) ], 1e-14, 'eigenvalue 4 correct' );
	assert.ok( maxDiff( matmulH( matmul( r.Q, r.H, N, false ), r.Z, N ), p[ 0 ] ) <= 1e-13 * N * maxAbs( p[ 0 ] ), 'H = Q*H*Z^H still holds' );
	assert.ok( maxDiff( matmulH( matmul( r.Q, r.T, N, false ), r.Z, N ), p[ 1 ] ) <= 1e-13 * N * maxAbs( p[ 1 ] ), 'T = Q*T*Z^H still holds' );
	assert.deepEqual( el( r.H, N, 1, 0 ), el( p[ 0 ], N, 1, 0 ), 'active block not reduced' );
});

test( 'zhgeqz: slowly converging cyclic pair needs a second exceptional shift (iteration 20)', function t() {
	// Cyclic H with H(3,2) = 1e-6: all eigenvalues have modulus 1e-6^(1/4)
	// and zero diagonal, so neither the Wilkinson shift nor the first
	// exceptional shift (~1e-6) makes progress; the 20th iteration takes the
	// H(ilast,ilast)/T(ilast,ilast) exceptional shift.
	const N = 4;
	const H0 = cmat( N, [ [ 0, 3, 1.0, 0.0 ], [ 1, 0, 1.0, 0.0 ], [ 2, 1, 1.0, 0.0 ], [ 3, 2, 1e-6, 0.0 ] ] );
	const rs = assertQZProperties( N, 1, N, H0, eye( N ), 'cyclic 1e-6' );
	const ev = eigs( rs, N );
	let p, k;
	for ( k = 0; k < N; k++ ) {
		// lambda^4 = det(H)/det(T) up to sign: lambda^4 = 1e-6.
		p = cpow( ev[ k ], N );
		assert.ok( Math.hypot( p[ 0 ] - 1e-6, p[ 1 ] ) <= 1e-17, 'lambda^4 = 1e-6 for eigenvalue ' + k );
	}
});

test( 'zhgeqz: zero T(0,0) of a 2x2 pair: the top split reaches ilast and deflates', function t() {
	const N = 2;
	const p = hessTri( N, [ [ 0.0, 0.0 ], [ 1.5, -0.5 ] ], [] );
	const rs = assertQZProperties( N, 1, N, p[ 0 ], p[ 1 ], 'top zero 2x2' );
	const ev = eigs( rs, N );
	assert.equal( ev.filter( ( x ) => x === null ).length, 1, 'one infinite eigenvalue' );

	// The finite eigenvalue solves det(H - lambda*T) = 0, which is linear here.
	assertSameEigs( ev.filter( ( x ) => x !== null ), [ finite2x2( p[ 0 ], p[ 1 ] ) ], 1e-13, 'finite eigenvalue' );
});

/**
* Root of det(H - lambda*T) = 0 for a 2x2 pair with T(0,0) = 0:
* -lambda*T(1,1)*H00 + lambda*T(0,1)*H10 + (H00*H11 - H01*H10) = 0.
*/
function finite2x2( H, T ) {
	const N = 2;
	const h00 = el( H, N, 0, 0 );
	const h01 = el( H, N, 0, 1 );
	const h10 = el( H, N, 1, 0 );
	const h11 = el( H, N, 1, 1 );
	const t01 = el( T, N, 0, 1 );
	const t11 = el( T, N, 1, 1 );
	const det = csub( cmul( h00, h11 ), cmul( h01, h10 ) );
	const lin = csub( cmul( t11, h00 ), cmul( t01, h10 ) );
	return cdiv( det, lin );
}

function cmul( a, b ) {
	return [ ( a[ 0 ] * b[ 0 ] ) - ( a[ 1 ] * b[ 1 ] ), ( a[ 0 ] * b[ 1 ] ) + ( a[ 1 ] * b[ 0 ] ) ];
}

function csub( a, b ) {
	return [ a[ 0 ] - b[ 0 ], a[ 1 ] - b[ 1 ] ];
}
