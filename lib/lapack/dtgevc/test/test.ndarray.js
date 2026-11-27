/* eslint-disable no-restricted-syntax, max-len, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import dtgevc from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dtgevc.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

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
* Extract the NxM submatrix from column-major storage.
*/
function submatrix( A, LDA, N, M ) {
	const out = [];
	let i, j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out.push( A[ i + j * LDA ] );
		}
	}
	return out;
}


// TESTS //

test( 'dtgevc: right all 4x4', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'right all 4x4' );
	const N = 4;
	const S = new Float64Array( tc.S );
	const P = new Float64Array( tc.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	const info = dtgevc( 'right', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
});

test( 'dtgevc: left all 4x4', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'left all 4x4' );
	const tcInput = findCase( 'right all 4x4' );
	const N = 4;
	const S = new Float64Array( tcInput.S );
	const P = new Float64Array( tcInput.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	const info = dtgevc( 'left', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: both all 4x4', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'both all 4x4' );
	const tcInput = findCase( 'right all 4x4' );
	const N = 4;
	const S = new Float64Array( tcInput.S );
	const P = new Float64Array( tcInput.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	const info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: right selected 4x4', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'right selected 4x4' );
	const tcInput = findCase( 'right all 4x4' );
	const N = 4;
	const M = tc.M;
	const S = new Float64Array( tcInput.S );
	const P = new Float64Array( tcInput.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	// Select eigenvalue 1 and eigenvalue 3 (complex pair)
	SELECT[ 0 ] = 1.0;
	SELECT[ 2 ] = 1.0;
	const info = dtgevc( 'right', 'selected', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, M ), tc.VR, 1e-10, 'VR' );
});

test( 'dtgevc: both all 3x3 real', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'both all 3x3 real' );
	const N = 3;
	const S = new Float64Array( tc.S );
	const P = new Float64Array( tc.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	const info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: both all 2x2 complex', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'both all 2x2 complex' );
	const N = 2;
	const S = new Float64Array( tc.S );
	const P = new Float64Array( tc.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	const info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: left selected eig2 4x4', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'left selected eig2 4x4' );
	const tcInput = findCase( 'right all 4x4' );
	const N = 4;
	const M = tc.M;
	const S = new Float64Array( tcInput.S );
	const P = new Float64Array( tcInput.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	// Select only eigenvalue 2
	SELECT[ 1 ] = 1.0;
	const info = dtgevc( 'left', 'selected', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VL, N, N, M ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: both all 1x1', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'both all 1x1' );
	const N = 1;
	const S = new Float64Array( [ 5.0 ] );
	const P = new Float64Array( [ 2.0 ] );
	const VL = new Float64Array( 1 );
	const VR = new Float64Array( 1 );
	const WORK = new Float64Array( 6 );
	const SELECT = new Float64Array( 1 );

	const info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, 1, 0, P, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 1, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( VR ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( Array.from( VL ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: right backtransform 4x4', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'right backtransform 4x4' );
	const tcInput = findCase( 'right all 4x4' );
	const N = 4;
	const S = new Float64Array( tcInput.S );
	const P = new Float64Array( tcInput.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );
	let i;

	// Set VR to identity
	for ( i = 0; i < N; i++ ) {
		VR[ i + i * N ] = 1.0;
	}
	const info = dtgevc( 'right', 'backtransform', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
});

test( 'dtgevc: left backtransform 4x4', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'left backtransform 4x4' );
	const tcInput = findCase( 'right all 4x4' );
	const N = 4;
	const S = new Float64Array( tcInput.S );
	const P = new Float64Array( tcInput.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );
	let i;

	// Set VL to identity
	for ( i = 0; i < N; i++ ) {
		VL[ i + i * N ] = 1.0;
	}
	const info = dtgevc( 'left', 'backtransform', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: N=0 returns immediately', function t() {
	const m = new Int32Array( 1 );
	const WORK = new Float64Array( 6 );
	const SELECT = new Float64Array( 1 );
	const S = new Float64Array( 1 );
	const P = new Float64Array( 1 );
	const VL = new Float64Array( 1 );
	const VR = new Float64Array( 1 );

	const info = dtgevc( 'both', 'all', SELECT, 1, 0, 0, S, 1, 1, 0, P, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 0, m, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dtgevc: both all 4x4 cpx top', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'both all 4x4 cpx top' );
	const N = 4;
	const S = new Float64Array( tc.S );
	const P = new Float64Array( tc.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	const info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: both all 5x5 cpx mid', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'both all 5x5 cpx mid' );
	const N = 5;

	// Build 5x5 S and P manually from fixture
	const S = new Float64Array( N * N );
	const P = new Float64Array( N * N );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	// S matrix (column-major)
	S[ 0 + 0 * N ] = 1.0; S[ 0 + 1 * N ] = 0.5; S[ 0 + 2 * N ] = 0.2; S[ 0 + 3 * N ] = 0.1; S[ 0 + 4 * N ] = 0.05;
	S[ 1 + 1 * N ] = 3.0; S[ 1 + 2 * N ] = -1.5;
	S[ 2 + 1 * N ] = 2.0; S[ 2 + 2 * N ] = 3.0;
	S[ 1 + 3 * N ] = 0.3; S[ 1 + 4 * N ] = 0.15;
	S[ 2 + 3 * N ] = 0.2; S[ 2 + 4 * N ] = 0.1;
	S[ 3 + 3 * N ] = 6.0; S[ 3 + 4 * N ] = 0.4;
	S[ 4 + 4 * N ] = 8.0;

	// P matrix
	P[ 0 + 0 * N ] = 1.0; P[ 0 + 1 * N ] = 0.1; P[ 0 + 2 * N ] = 0.05; P[ 0 + 3 * N ] = 0.02; P[ 0 + 4 * N ] = 0.01;
	P[ 1 + 1 * N ] = 1.0; P[ 1 + 2 * N ] = 0.0; P[ 1 + 3 * N ] = 0.1; P[ 1 + 4 * N ] = 0.05;
	P[ 2 + 2 * N ] = 1.0; P[ 2 + 3 * N ] = 0.08; P[ 2 + 4 * N ] = 0.04;
	P[ 3 + 3 * N ] = 1.0; P[ 3 + 4 * N ] = 0.1;
	P[ 4 + 4 * N ] = 1.0;

	const info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: both all degenerate', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'both all degenerate' );
	const N = 3;
	const S = new Float64Array( N * N );
	const P = new Float64Array( N * N );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	// S: near-zero (1,1), rest normal
	S[ 0 + 0 * N ] = 1e-320; S[ 0 + 1 * N ] = 0.5; S[ 0 + 2 * N ] = 0.2;
	S[ 1 + 1 * N ] = 2.0; S[ 1 + 2 * N ] = 0.3;
	S[ 2 + 2 * N ] = 3.0;
	P[ 0 + 0 * N ] = 1e-320; P[ 0 + 1 * N ] = 0.1; P[ 0 + 2 * N ] = 0.05;
	P[ 1 + 1 * N ] = 1.0; P[ 1 + 2 * N ] = 0.1;
	P[ 2 + 2 * N ] = 1.0;

	const info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: left sel cpx top 4x4', function t() {
	const m = new Int32Array( 1 );
	const tc = findCase( 'left sel cpx top 4x4' );
	const tcInput = findCase( 'both all 4x4 cpx top' );
	const N = 4;
	const M = tc.M;
	const S = new Float64Array( tcInput.S );
	const P = new Float64Array( tcInput.P );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );

	SELECT[ 0 ] = 1.0;
	const info = dtgevc( 'left', 'selected', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.strictEqual( m[ 0 ], tc.M, 'M' );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VL, N, N, M ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: defective double eigenvalue uses DMIN = ULP*|ACOEF|*ANORM with ULP = DLAMCH(E)*base (ticket 0089)', function t() {
	// S = [1 1; 0 1], P = I: the double eigenvalue 1 makes the 1x1 back-substitution pivot exactly zero, so DLALN2 perturbs it to SMIN = DMIN = MAX( ULP*ACOEFA*ANORM, ULP*BCOEFA*BNORM, SAFMIN ). Reference: ULP = DLAMCH('Epsilon')*DLAMCH('Base') = 2^-52, and the small eigenvector component, proportional to DMIN, is 4.440892098500626e-16 (with ULP = 2^-51 it would be twice as large). Expected values are the output of the reference Fortran DTGEVC for these inputs.
	const N = 2;
	const m = new Int32Array( 1 );
	const S = new Float64Array( [ 1.0, 0.0, 1.0, 1.0 ] );
	const P = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const SELECT = new Float64Array( N );
	const info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.strictEqual( m[ 0 ], 2, 'M' );
	assert.deepEqual( Array.from( VL ), [ 4.440892098500626e-16, -1.0, 0.0, 1.0 ], 'VL' );
	assert.deepEqual( Array.from( VR ), [ 1.0, 0.0, -1.0, 4.440892098500626e-16 ], 'VR' );
});


// PROPERTY-BASED TESTS (eigenvector residuals) //

/**
* Builds a column-major matrix from an array of rows.
*/
function colmajor( rows ) {
	const N = rows.length;
	const A = new Float64Array( N * N );
	let i, j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			A[ i + ( j * N ) ] = rows[ i ][ j ];
		}
	}
	return A;
}

/**
* Eigenvalues ( alpha, beta ) of the diagonal blocks of a quasi-triangular pencil (S,P), computed independently: 1x1 blocks give ( S(j,j), P(j,j) ); 2x2 blocks (with diagonal P block) solve det( A - lambda B ) = 0 by the quadratic formula on the block scaled to unit max entry, returning the root with positive imaginary part as alpha = ( ar + i*ai ), beta real.
*/
function blockEigs( S, P, N ) {
	const out = [];
	let disc, qa, qb, qc, sS, sP, mr, mi, m, j;
	j = 0;
	while ( j < N ) {
		if ( j < N - 1 && S[ j + 1 + ( j * N ) ] !== 0.0 ) {
			sS = Math.max( Math.abs( S[ j + ( j * N ) ] ), Math.abs( S[ j + 1 + ( j * N ) ] ), Math.abs( S[ j + ( ( j + 1 ) * N ) ] ), Math.abs( S[ j + 1 + ( ( j + 1 ) * N ) ] ) );
			sP = Math.max( Math.abs( P[ j + ( j * N ) ] ), Math.abs( P[ j + 1 + ( ( j + 1 ) * N ) ] ) );
			qa = ( P[ j + ( j * N ) ] / sP ) * ( P[ j + 1 + ( ( j + 1 ) * N ) ] / sP );
			qb = -( ( ( S[ j + ( j * N ) ] / sS ) * ( P[ j + 1 + ( ( j + 1 ) * N ) ] / sP ) ) + ( ( S[ j + 1 + ( ( j + 1 ) * N ) ] / sS ) * ( P[ j + ( j * N ) ] / sP ) ) );
			qc = ( ( S[ j + ( j * N ) ] / sS ) * ( S[ j + 1 + ( ( j + 1 ) * N ) ] / sS ) ) - ( ( S[ j + ( ( j + 1 ) * N ) ] / sS ) * ( S[ j + 1 + ( j * N ) ] / sS ) );
			disc = ( 4.0 * qa * qc ) - ( qb * qb );
			mr = -qb / ( 2.0 * qa );
			mi = Math.sqrt( disc ) / ( 2.0 * Math.abs( qa ) );
			m = Math.max( sS, sP );
			out.push({
				'cplx': true,
				'ar': mr * ( sS / m ),
				'ai': mi * ( sS / m ),
				'beta': sP / m
			});
			j += 2;
		} else {
			out.push({
				'cplx': false,
				'ar': S[ j + ( j * N ) ],
				'ai': 0.0,
				'beta': P[ j + ( j * N ) ]
			});
			j += 1;
		}
	}
	return out;
}

/**
* Relative residual of beta*op(S)*x - alpha*op(P)*x, x = xr + i*xi, op(A) = A or A^T. Normwise: || r ||_inf / ( ( |beta|*||S|| + |alpha|*||P|| ) * ||x||_inf ). Componentwise (`cw`): max_i |r_i| / ( |beta|*(|op(S)|*|x|)_i + |alpha|*(|op(P)|*|x|)_i ). Returns NaN for a zero/non-finite vector or a non-finite scale.
*/
function residual( S, P, N, trans, xr, xi, e, cw ) {
	let denom, rmax, nS, nP, nx, rs, rp, sr, si, pr, pi, rr, ri, as, ap, ax, d, s, p, i, k;
	rmax = 0.0;
	nS = 0.0;
	nP = 0.0;
	nx = 0.0;
	for ( i = 0; i < N; i++ ) {
		nx = Math.max( nx, Math.abs( xr[ i ] ) + Math.abs( xi[ i ] ) );
		rs = 0.0;
		rp = 0.0;
		for ( k = 0; k < N; k++ ) {
			rs += Math.abs( S[ i + ( k * N ) ] ) + Math.abs( S[ k + ( i * N ) ] );
			rp += Math.abs( P[ i + ( k * N ) ] ) + Math.abs( P[ k + ( i * N ) ] );
		}
		nS = Math.max( nS, rs );
		nP = Math.max( nP, rp );
	}
	for ( i = 0; i < N; i++ ) {
		sr = 0.0;
		si = 0.0;
		pr = 0.0;
		pi = 0.0;
		as = 0.0;
		ap = 0.0;
		for ( k = 0; k < N; k++ ) {
			s = ( trans ) ? S[ k + ( i * N ) ] : S[ i + ( k * N ) ];
			p = ( trans ) ? P[ k + ( i * N ) ] : P[ i + ( k * N ) ];
			sr += s * xr[ k ];
			si += s * xi[ k ];
			pr += p * xr[ k ];
			pi += p * xi[ k ];
			ax = Math.abs( xr[ k ] ) + Math.abs( xi[ k ] );
			as += Math.abs( s ) * ax;
			ap += Math.abs( p ) * ax;
		}
		rr = ( e.beta * sr ) - ( ( e.ar * pr ) - ( e.ai * pi ) );
		ri = ( e.beta * si ) - ( ( e.ar * pi ) + ( e.ai * pr ) );
		if ( cw ) {
			d = ( Math.abs( e.beta ) * as ) + ( ( Math.abs( e.ar ) + Math.abs( e.ai ) ) * ap );
			if ( !isFinite( d ) ) {
				return NaN;
			}
			if ( Math.abs( rr ) + Math.abs( ri ) > 0.0 ) {
				rmax = Math.max( rmax, ( Math.abs( rr ) + Math.abs( ri ) ) / d );
			}
		} else {
			rmax = Math.max( rmax, Math.abs( rr ) + Math.abs( ri ) );
		}
	}
	denom = ( ( Math.abs( e.beta ) * nS ) + ( ( Math.abs( e.ar ) + Math.abs( e.ai ) ) * nP ) ) * nx;
	if ( !( nx > 0.0 ) || !isFinite( denom ) || !isFinite( rmax ) ) {
		return NaN;
	}
	return ( cw ) ? rmax : rmax / denom;
}

/**
* Returns Q^T * x for an N x N column-major Q.
*/
function mulT( Q, x, N ) {
	const y = [];
	let i, k;
	for ( i = 0; i < N; i++ ) {
		y.push( 0.0 );
		for ( k = 0; k < N; k++ ) {
			y[ i ] += Q[ k + ( i * N ) ] * x[ k ];
		}
	}
	return y;
}

/**
* Returns Q*X (N x N, column-major) with each eigenvector rescaled so that max_i( |re_i| + |im_i| ) = 1; `cplx[ c ]` marks column c as the real part of a complex pair (followed by its imaginary part).
*/
function backtransformed( Q, X, N, cplx ) {
	const out = [];
	let xmax, c, i, k, v;
	for ( c = 0; c < N; c++ ) {
		for ( i = 0; i < N; i++ ) {
			v = 0.0;
			for ( k = 0; k < N; k++ ) {
				v += Q[ i + ( k * N ) ] * X[ k + ( c * N ) ];
			}
			out.push( v );
		}
	}
	c = 0;
	while ( c < N ) {
		xmax = 0.0;
		for ( i = 0; i < N; i++ ) {
			xmax = Math.max( xmax, Math.abs( out[ i + ( c * N ) ] ) + ( ( cplx[ c ] ) ? Math.abs( out[ i + ( ( c + 1 ) * N ) ] ) : 0.0 ) );
		}
		for ( k = c; k < c + ( ( cplx[ c ] ) ? 2 : 1 ); k++ ) {
			for ( i = 0; i < N; i++ ) {
				out[ i + ( k * N ) ] /= xmax;
			}
		}
		c += ( cplx[ c ] ) ? 2 : 1;
	}
	return out;
}

/**
* Largest residual over the eigenvectors stored in V (column-major, N rows), one entry of `eigs` per eigenvector (two columns, real and imaginary part, for a complex pair). Right: S*x = lambda*P*x. Left: y^H*S = lambda*y^H*P, i.e. S^T*conj(y) = lambda*P^T*conj(y). If Q is given, V holds Q*x (backtransformed) and x = Q^T*V is checked.
*/
function maxResidual( S, P, N, side, V, eigs, Q, cw ) {
	let worst, xr, xi, c, k;
	worst = 0.0;
	c = 0;
	for ( k = 0; k < eigs.length; k++ ) {
		xr = Array.from( V.slice( c * N, ( c * N ) + N ) );
		if ( eigs[ k ].cplx ) {
			xi = Array.from( V.slice( ( c + 1 ) * N, ( ( c + 1 ) * N ) + N ) );
		} else {
			xi = new Array( N ).fill( 0.0 );
		}
		if ( Q ) {
			xr = mulT( Q, xr, N );
			xi = mulT( Q, xi, N );
		}
		if ( side === 'left' ) {
			xi = xi.map( function neg( v ) { return -v; } );
		}
		worst = Math.max( worst, residual( S, P, N, side === 'left', xr, xi, eigs[ k ], cw ) );
		if ( !( worst <= Infinity ) ) {
			return NaN;
		}
		c += ( eigs[ k ].cplx ) ? 2 : 1;
	}
	return worst;
}

/**
* Runs dtgevc( 'both', 'all' ) on the pencil and asserts info = 0, M = N, small normwise left/right residuals, optionally small componentwise residuals (`opts.cw`), and optionally agreement with reference values (`opts.VL`, `opts.VR`: column-major output of the reference Fortran DTGEVC for the same inputs, compiled from data/lapack-3.12.0/SRC).
*/
function checkBoth( Srows, Prows, opts, msg ) {
	const N = Srows.length;
	const S = colmajor( Srows );
	const P = colmajor( Prows );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const WORK = new Float64Array( 6 * N );
	const m = new Int32Array( 1 );
	const eigs = blockEigs( S, P, N );
	const info = dtgevc( 'both', 'all', new Float64Array( N ), 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0 );
	let res;
	assert.equal( info, 0, msg + ': info' );
	assert.equal( m[ 0 ], N, msg + ': M' );
	res = maxResidual( S, P, N, 'right', VR, eigs );
	assert.ok( res <= 1e-14, msg + ': right residual ' + res );
	res = maxResidual( S, P, N, 'left', VL, eigs );
	assert.ok( res <= 1e-14, msg + ': left residual ' + res );
	if ( opts.cw ) {
		res = maxResidual( S, P, N, 'right', VR, eigs, null, true );
		assert.ok( res <= opts.cw, msg + ': right componentwise residual ' + res );
		res = maxResidual( S, P, N, 'left', VL, eigs, null, true );
		assert.ok( res <= opts.cw, msg + ': left componentwise residual ' + res );
	}
	if ( opts.VL ) {
		assertArrayClose( Array.from( VL ), opts.VL, 1e-14, msg + ': VL' );
		assertArrayClose( Array.from( VR ), opts.VR, 1e-14, msg + ': VR' );
	}
}

/**
* Upper triangular N x N matrix of ones (S) and the identity (P): a single defective eigenvalue 1 of multiplicity N, whose triangular solves grow geometrically and force the overflow-protection rescalings.
*/
function jordanPencil( N ) {
	const S = [];
	const P = [];
	let i, j;
	for ( i = 0; i < N; i++ ) {
		S.push( [] );
		P.push( [] );
		for ( j = 0; j < N; j++ ) {
			S[ i ].push( ( j >= i ) ? 1.0 : 0.0 );
			P[ i ].push( ( i === j ) ? 1.0 : 0.0 );
		}
	}
	return [ S, P ];
}

test( 'dtgevc: returns -5 when S has two consecutive nonzero subdiagonal entries', function t() {
	const N = 3;
	const S = colmajor( [ [ 1, 2, 3 ], [ 1, 2, 1 ], [ 0, 1, 2 ] ] );
	const P = colmajor( [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ] );
	const info = dtgevc( 'both', 'all', new Float64Array( N ), 1, 0, N, S, 1, N, 0, P, 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, N, new Int32Array( 1 ), new Float64Array( 6 * N ), 1, 0 );
	assert.equal( info, -5 );
});

test( 'dtgevc: returns -7 when P is not diagonal on a 2x2 block of S', function t() {
	const N = 3;
	const S = colmajor( [ [ 2, 1, 3 ], [ -1, 2, 1 ], [ 0, 0, 2 ] ] );
	let P = colmajor( [ [ 1, 0.5, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ] );
	let info = dtgevc( 'both', 'all', new Float64Array( N ), 1, 0, N, S, 1, N, 0, P, 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, N, new Int32Array( 1 ), new Float64Array( 6 * N ), 1, 0 );
	assert.equal( info, -7, 'P(1,2) nonzero' );
	P = colmajor( [ [ 0, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ] );
	info = dtgevc( 'both', 'all', new Float64Array( N ), 1, 0, N, S, 1, N, 0, P, 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, N, new Int32Array( 1 ), new Float64Array( 6 * N ), 1, 0 );
	assert.equal( info, -7, 'P(1,1) zero' );
	P = colmajor( [ [ 1, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 1 ] ] );
	info = dtgevc( 'both', 'all', new Float64Array( N ), 1, 0, N, S, 1, N, 0, P, 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, N, new Int32Array( 1 ), new Float64Array( 6 * N ), 1, 0 );
	assert.equal( info, -7, 'P(2,2) zero' );
});

test( 'dtgevc: returns -13 when mm is smaller than the number of selected eigenvector columns', function t() {
	const N = 3;
	const S = colmajor( [ [ 2, 1, 3 ], [ -1, 2, 1 ], [ 0, 0, 2 ] ] );
	const P = colmajor( [ [ 1, 0, 0.5 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ] );
	const SELECT = new Float64Array( [ 0.0, 1.0, 1.0 ] ); // complex pair (2 columns) + real one
	const info = dtgevc( 'right', 'selected', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, 2, new Int32Array( 1 ), new Float64Array( 6 * N ), 1, 0 );
	assert.equal( info, -13 );
});

test( 'dtgevc: a 2x2 block of S with real eigenvalues returns the (1-based) index of the block', function t() {
	// Rows/columns 2-3 hold S-block [2 1; 1 2] with P = I: eigenvalues 1 and 3 are real, so DLAG2 returns WI = 0 and the reference sets INFO = 2 (the block's first index) for left and right.
	const N = 3;
	const S = colmajor( [ [ 5, 1, 1 ], [ 0, 2, 1 ], [ 0, 1, 2 ] ] );
	const P = colmajor( [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ] );
	let info = dtgevc( 'left', 'all', new Float64Array( N ), 1, 0, N, S, 1, N, 0, P, 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, N, new Int32Array( 1 ), new Float64Array( 6 * N ), 1, 0 );
	assert.equal( info, 2, 'left' );
	info = dtgevc( 'right', 'all', new Float64Array( N ), 1, 0, N, S, 1, N, 0, P, 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, N, new Int32Array( 1 ), new Float64Array( 6 * N ), 1, 0 );
	assert.equal( info, 2, 'right' );
});

// The badly scaled pencils below drive DTGEVC's underflow/overflow scalings. Each checks the normwise backward error of every eigenvector (the guarantee DTGEVC gives; componentwise too where the exact eigenvector is well conditioned, i.e. not when DMIN perturbs a near-singular pivot) and the full VL/VR against the reference Fortran DTGEVC run on the same inputs (data/lapack-3.12.0/SRC, gfortran; JS matched bit for bit).

test( 'dtgevc: real eigenvalues with tiny P diagonal (underflow scaling of ACOEF) satisfy beta*S*x = alpha*P*x', function t() {
	checkBoth( [ [ 1, 2, 3 ], [ 0, 2, 1 ], [ 0, 0, 3 ] ], [ [ 1e-300, 0.5, 0.2 ], [ 0, 1, 0.3 ], [ 0, 0, 1e-300 ] ], { 'VL': [ 6.661338147750937e-15, -3.3306690738754684e-15, 1, 0, 1, -0.13333333333333336, 0, 0, 1 ], 'VR': [ 1, 0, 0, -1, 1, 0, 1, -1.99840144432528e-15, 6.661338147750935e-15 ] }, 'tiny P' );
});

test( 'dtgevc: real eigenvalues with tiny S diagonal (underflow scaling of BCOEFR) satisfy beta*S*x = alpha*P*x', function t() {
	checkBoth( [ [ 1e-300, 2, 3 ], [ 0, 2, 1 ], [ 0, 0, 1e-300 ] ], [ [ 1, 0.5, 0.2 ], [ 0, 1, 0.3 ], [ 0, 0, 2 ] ], { 'VL': [ 4.440892098500626e-16, -4.440892098500626e-16, -1, 0, 1, 0.10000000000000002, 0, 0, 1 ], 'VR': [ 1, 0, 0, 0.5, 1, 0, -1, -2.2204460492503126e-16, 4.440892098500625e-16 ] }, 'tiny S' );
});

test( 'dtgevc: complex pair with tiny P block (ACOEF underflow scaling) satisfies S*x = lambda*P*x', function t() {
	checkBoth( [ [ 1, 2, 3 ], [ 0, 2, 1 ], [ 0, -1, 2 ] ], [ [ 1, 0.5, 0.2 ], [ 0, 1e-300, 0 ], [ 0, 0, 1e-300 ] ], { 'VL': [ 0.8620689655172413, -1, -0.7068965517241379, 0, 4.440892098500622e-16, 0.9999999999999991, 0, -0.9999999999999996, 0 ], 'VR': [ 1, 0, 0, -0.49999999999999956, 0.9999999999999991, 4.440892098500622e-16, -0.1999999999999999, 0, 0.9999999999999996 ], 'cw': 1e-14 }, 'cpx tiny P (bottom)' );
	checkBoth( [ [ 2, 1, 3 ], [ -1, 2, 1 ], [ 0, 0, 2 ] ], [ [ 1e-300, 0, 0.2 ], [ 0, 1e-300, 0.3 ], [ 0, 0, 1 ] ], { 'VL': [ 4.440892098500622e-16, 0.9999999999999991, -0.2999999999999998, -0.9999999999999996, 0, 0.1999999999999999, 0, 0, 1 ], 'VR': [ 0.9999999999999991, 4.440892098500622e-16, 0, 0, 0.9999999999999996, 0, -0.96, -0.68, 1 ], 'cw': 1e-14 }, 'cpx tiny P (top)' );
});

test( 'dtgevc: complex pair with huge S block (mixed scalings) satisfies S*x = lambda*P*x', function t() {
	checkBoth( [ [ 1e300, 2e300, 3 ], [ -1e300, 2e300, 1 ], [ 0, 0, 2 ] ], [ [ 1, 0, 0.2 ], [ 0, 1, 0.3 ], [ 0, 0, 1 ] ], { 'VL': [ -0.25, 1, -0.24999999999999997, -0.6614378277661477, 0, 0.13228756555322954, 0, 0, 1 ], 'VR': [ 1, 0.25, 0, 0, 0.6614378277661477, 0, -1.0999999999999998e-300, -7.499999999999999e-301, 1 ], 'cw': 1e-14 }, 'cpx huge S' );
});

test( 'dtgevc: complex pair with tiny S block and large ||S|| (SAFMIN*|ACOEF| > ASCALE) satisfies S*x = lambda*P*x', function t() {
	checkBoth( [ [ 1e10, 1e10, 1e10 ], [ 0, 2e-300, 1e-300 ], [ 0, -1e-300, 2e-300 ] ], [ [ 1, 0.5, 0.2 ], [ 0, 1, 0 ], [ 0, 0, 2 ] ], { 'VL': [ 1, 0.5, 0.4, 0, 1, 0.4999999999999999, 0, 0, 0.5 ], 'VR': [ 1, 0, 0, -0.5000000000000001, 1, -0.4999999999999999, -0.5, 0, 0.5 ], 'cw': 1e-14 }, 'cpx tiny S (bottom)' );
	checkBoth( [ [ 2e-300, 1e-300, 1e10 ], [ -1e-300, 2e-300, 1e10 ], [ 0, 0, 1e10 ] ], [ [ 1, 0, 0.2 ], [ 0, 1, 0.5 ], [ 0, 0, 2 ] ], { 'VL': [ -1.4474579468005276e-16, 0.5000000000000002, -0.5, -0.5000000000000001, 0, 0.5, 0, 0, 1 ], 'VR': [ 0.9999999999999998, -2.8949158936010533e-16, 0, 0, 0.9999999999999997, 0, 1, 0.8333333333333335, 0.5555555555555555 ], 'cw': 1e-14 }, 'cpx tiny S (top)' );
});

test( 'dtgevc: complex pair with ||P|| near overflow (SAFMIN*|BCOEF| > BSCALE) satisfies S*x = lambda*P*x', function t() {
	checkBoth( [ [ 2, 1, 3 ], [ -1, 2, 1 ], [ 0, 0, 2 ] ], [ [ 1, 0, 3e307 ], [ 0, 1, 0.3 ], [ 0, 0, 1 ] ], { 'VL': [ 0, 2.220446049250313e-16, -0.3333333333333333, -2.220446049250313e-16, 0, -0.6666666666666666, 0, 0, 1 ], 'VR': [ 0, 1, 0, -1, 0, 0, 1, -6.666666666666673e-309, 2.220446049250313e-16 ] }, 'big P (top)' );
	checkBoth( [ [ 2, 1, 3 ], [ 0, 2, 1 ], [ 0, -1, 2 ] ], [ [ 1, 3e307, 1 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ], { 'VL': [ 2.220446049250313e-16, 1, -1.666666666666667e-308, 0, 0, 1, 0, -1, 0 ], 'VR': [ 1, 0, 0, 0.3333333333333333, 0, 2.220446049250313e-16, -0.6666666666666666, -2.220446049250313e-16, 0 ] }, 'big P (bottom)' );
});

test( 'dtgevc: backtransformed eigenvectors of a badly scaled pencil satisfy the residual after undoing the orthogonal transform', function t() {
	const N = 3;
	const S = colmajor( [ [ 2, 1, 3 ], [ -1, 2, 1 ], [ 0, 0, 2 ] ] );
	const P = colmajor( [ [ 1e-300, 0, 0.2 ], [ 0, 1e-300, 0.3 ], [ 0, 0, 1 ] ] );
	const c = 0.6;
	const s = 0.8;
	// Q: Givens rotation in the (1,3) plane (orthogonal)
	const Q = colmajor( [ [ c, 0, -s ], [ 0, 1, 0 ], [ s, 0, c ] ] );
	const VL = new Float64Array( Q );
	const VR = new Float64Array( Q );
	const m = new Int32Array( 1 );
	const eigs = blockEigs( S, P, N );
	const info = dtgevc( 'both', 'backtransform', new Float64Array( N ), 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, new Float64Array( 6 * N ), 1, 0 );
	let res;
	assert.equal( info, 0, 'info' );
	assert.equal( m[ 0 ], N, 'M' );
	res = maxResidual( S, P, N, 'right', VR, eigs, Q );
	assert.ok( res <= 1e-14, 'right residual ' + res );
	res = maxResidual( S, P, N, 'left', VL, eigs, Q );
	assert.ok( res <= 1e-14, 'left residual ' + res );
	// Backtransformed columns equal Q times the (reference Fortran) untransformed eigenvectors of the 'cpx tiny P (top)' case above, renormalized so the largest |re|+|im| over each eigenvector is 1:
	assertArrayClose( Array.from( VR ), backtransformed( Q, [ 0.9999999999999991, 4.440892098500622e-16, 0, 0, 0.9999999999999996, 0, -0.96, -0.68, 1 ], N, [ true, true, false ] ), 1e-14, 'VR' );
	assertArrayClose( Array.from( VL ), backtransformed( Q, [ 4.440892098500622e-16, 0.9999999999999991, -0.2999999999999998, -0.9999999999999996, 0, 0.1999999999999999, 0, 0, 1 ], N, [ true, true, false ] ), 1e-14, 'VL' );
});

test( 'dtgevc: defective 25x25 eigenvalue (DLALN2 rescaling of the growing solution) satisfies the residual', function t() {
	const pencil = jordanPencil( 25 );
	checkBoth( pencil[ 0 ], pencil[ 1 ], { 'cw': 1e-13 }, 'jordan 25' );
});

test( 'dtgevc: defective 60x60 eigenvalue (overflow-protection rescaling) satisfies the residual', function t() {
	const pencil = jordanPencil( 60 );
	checkBoth( pencil[ 0 ], pencil[ 1 ], { 'cw': 1e-13 }, 'jordan 60' );
});
