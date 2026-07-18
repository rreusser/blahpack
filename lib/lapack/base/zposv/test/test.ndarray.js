

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zposv from './../lib/ndarray.js';

// FIXTURES //

import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
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

/**
* Computes complex matrix-vector product b = A*x (col-major).
* All arrays are Float64 interleaved [re, im, re, im, ...].
*/
function zmatmat( A, x, N, nrhs ) {
	const b = new Float64Array( 2 * N * nrhs );
	let are, aim, xre, xim, i, j, k;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			for ( k = 0; k < N; k++ ) {
				are = A[ 2 * ( i + k * N ) ];
				aim = A[ 2 * ( i + k * N ) + 1 ];
				xre = x[ 2 * ( k + j * N ) ];
				xim = x[ 2 * ( k + j * N ) + 1 ];
				b[ 2 * ( i + j * N ) ] += are * xre - aim * xim;
				b[ 2 * ( i + j * N ) + 1 ] += are * xim + aim * xre;
			}
		}
	}
	return b;
}

// TESTS //

test( 'zposv: lower_3x3', function t() {

	const tc = lower_3x3;

	// Hermitian positive definite 3x3 (col-major):
	// A = [10  3-i  1+2i;  3+i  8  2-i;  1-2i  2+i  6]
	const A = new Complex128Array( [
		10.0, 0.0, 3.0, 1.0, 1.0, -2.0,
		3.0, -1.0, 8.0, 0.0, 2.0, 1.0,
		1.0, 2.0, 2.0, -1.0, 6.0, 0.0
	] );
	const Aorig = new Float64Array( reinterpret( A, 0 ) );

	const B = new Complex128Array( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	const Borig = new Float64Array( reinterpret( B, 0 ) );

	const info = zposv( 'lower', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	const view = reinterpret( B, 0 );

	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( view ), tc.x, 1e-13, 'x' );

	// Verify A_orig * x ≈ b_orig
	const AB = zmatmat( Aorig, Array.from( view ), 3, 1 );
	assertArrayClose( Array.from( AB ), Array.from( Borig ), 1e-13, 'A*x=b' );
});

test( 'zposv: upper_3x3', function t() {

	const tc = upper_3x3;

	// Same matrix, upper triangle
	const A = new Complex128Array( [
		10.0, 0.0, 3.0, 1.0, 1.0, -2.0,
		3.0, -1.0, 8.0, 0.0, 2.0, 1.0,
		1.0, 2.0, 2.0, -1.0, 6.0, 0.0
	] );
	const Aorig = new Float64Array( reinterpret( A, 0 ) );

	const B = new Complex128Array( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	const Borig = new Float64Array( reinterpret( B, 0 ) );

	const info = zposv( 'upper', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	const view = reinterpret( B, 0 );

	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( view ), tc.x, 1e-13, 'x' );

	// Verify A_orig * x ≈ b_orig
	const AB = zmatmat( Aorig, Array.from( view ), 3, 1 );
	assertArrayClose( Array.from( AB ), Array.from( Borig ), 1e-13, 'A*x=b' );
});

test( 'zposv: not_posdef', function t() {

	const tc = not_posdef;

	// Not positive definite matrix
	const A = new Complex128Array( [
		1.0, 0.0, 2.0, 1.0, 3.0, 0.0,
		2.0, -1.0, 1.0, 0.0, 4.0, 0.0,
		3.0, 0.0, 4.0, 0.0, 1.0, 0.0
	] );
	const B = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );

	const info = zposv( 'lower', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );

	assert.ok( info > 0, 'info > 0 for non-positive-definite matrix' );
});

test( 'zposv: n_zero', function t() {

	const tc = n_zero;

	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );

	const info = zposv( 'lower', 0, 1, A, 1, 1, 0, B, 1, 1, 0 );

	assert.equal( info, tc.info, 'info' );
});

test( 'zposv: identity', function t() {

	const tc = identity;

	// 3x3 identity matrix (col-major)
	const A = new Complex128Array( 9 );
	const av = reinterpret( A, 0 );
	av[ 0 ] = 1.0;   // A(0,0) re
	av[ 8 ] = 1.0;   // A(1,1) re
	av[ 16 ] = 1.0;  // A(2,2) re

	const B = new Complex128Array( [ 3.0, 1.0, 5.0, -2.0, 7.0, 0.5 ] );

	const info = zposv( 'lower', 3, 1, A, 1, 3, 0, B, 1, 3, 0 );
	const view = reinterpret( B, 0 );

	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( view ), tc.x, 1e-14, 'x' );
});

test( 'zposv: multi_rhs', function t() {

	const tc = multi_rhs;

	// Same HPD matrix, 2 RHS columns
	const A = new Complex128Array( [
		10.0, 0.0, 3.0, 1.0, 1.0, -2.0,
		3.0, -1.0, 8.0, 0.0, 2.0, 1.0,
		1.0, 2.0, 2.0, -1.0, 6.0, 0.0
	] );
	const Aorig = new Float64Array( reinterpret( A, 0 ) );

	// B col-major: col1 = [1; 0; 0], col2 = [0; 1; 0]
	const B = new Complex128Array( [
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0, 0.0, 0.0
	] );
	const Borig = new Float64Array( reinterpret( B, 0 ) );

	const info = zposv( 'lower', 3, 2, A, 1, 3, 0, B, 1, 3, 0 );
	const view = reinterpret( B, 0 );

	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( view ), tc.x, 1e-13, 'x' );

	// Verify A_orig * X ≈ B_orig
	const AB = zmatmat( Aorig, Array.from( view ), 3, 2 );
	assertArrayClose( Array.from( AB ), Array.from( Borig ), 1e-13, 'A*X=B' );
});

test( 'zposv: nrhs_zero', function t() {

	const tc = nrhs_zero;

	const A = new Complex128Array( [ 4.0, 0.0 ] );
	const B = new Complex128Array( 1 );

	const info = zposv( 'lower', 1, 0, A, 1, 1, 0, B, 1, 1, 0 );

	assert.equal( info, tc.info, 'info' );
});
