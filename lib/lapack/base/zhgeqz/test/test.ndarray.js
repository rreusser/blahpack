// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhgeqz from './../lib/ndarray.js';

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
