// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeequ from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import diagonal_varied from './fixtures/diagonal_varied.json' with { type: 'json' };
import zero_row from './fixtures/zero_row.json' with { type: 'json' };
import zero_col from './fixtures/zero_col.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nonsquare from './fixtures/nonsquare.json' with { type: 'json' };

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

test( 'dgeequ: basic 3x3 well-conditioned matrix', function t() {
	var tc = basic;
	var A = new Float64Array( [ 4.0, 1.0, 0.5, 1.0, 3.0, 1.0, 0.5, 1.0, 2.0 ] );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var result = dgeequ( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info );
	assertArrayClose( r, tc.r, 1e-14, 'r' );
	assertArrayClose( c, tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dgeequ: diagonal matrix with varying scales', function t() {
	var tc = diagonal_varied;
	var A = new Float64Array( 9 );
	A[ 0 ] = 100.0; A[ 4 ] = 1.0; A[ 8 ] = 0.01;
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var result = dgeequ( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info );
	assertArrayClose( r, tc.r, 1e-14, 'r' );
	assertArrayClose( c, tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dgeequ: matrix with zero row returns info=i', function t() {
	var tc = zero_row;
	var A = new Float64Array( [ 1.0, 0.0, 1.0, 2.0, 0.0, 3.0, 4.0, 0.0, 5.0 ] );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var result = dgeequ( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info );
});

test( 'dgeequ: matrix with zero column returns info=M+j', function t() {
	var tc = zero_col;
	var A = new Float64Array( [ 1.0, 2.0, 3.0, 0.0, 0.0, 0.0, 4.0, 5.0, 6.0 ] );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var result = dgeequ( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info );
	assertArrayClose( r, tc.r, 1e-14, 'r' );
});

test( 'dgeequ: identity matrix', function t() {
	var tc = identity;
	var A = new Float64Array( 9 );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var result = dgeequ( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info );
	assertArrayClose( r, tc.r, 1e-14, 'r' );
	assertArrayClose( c, tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dgeequ: quick return M=0', function t() {
	var tc = m_zero;
	var r = new Float64Array( 0 );
	var c = new Float64Array( 3 );
	var result = dgeequ( 0, 3, new Float64Array( 0 ), 1, 1, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, 0 );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dgeequ: quick return N=0', function t() {
	var tc = n_zero;
	var r = new Float64Array( 3 );
	var c = new Float64Array( 0 );
	var result = dgeequ( 3, 0, new Float64Array( 0 ), 1, 1, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, 0 );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dgeequ: non-square 2x4 matrix', function t() {
	var tc = nonsquare;
	var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] );
	var r = new Float64Array( 2 );
	var c = new Float64Array( 4 );
	var result = dgeequ( 2, 4, A, 1, 2, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info );
	assertArrayClose( r, tc.r, 1e-14, 'r' );
	assertArrayClose( c, tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});
