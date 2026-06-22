/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */
/* eslint-disable max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dspevx from './../lib/ndarray.js';

// FIXTURES //

import dspevx_4x4_v_a_l from './fixtures/dspevx_4x4_v_a_l.json' with { type: 'json' };
import dspevx_4x4_v_a_u from './fixtures/dspevx_4x4_v_a_u.json' with { type: 'json' };
import dspevx_4x4_n_a_l from './fixtures/dspevx_4x4_n_a_l.json' with { type: 'json' };
import dspevx_4x4_v_v_l from './fixtures/dspevx_4x4_v_v_l.json' with { type: 'json' };
import dspevx_4x4_v_i_l from './fixtures/dspevx_4x4_v_i_l.json' with { type: 'json' };
import dspevx_4x4_n_v_u from './fixtures/dspevx_4x4_n_v_u.json' with { type: 'json' };
import dspevx_1x1_v_a from './fixtures/dspevx_1x1_v_a.json' with { type: 'json' };
import dspevx_1x1_v_v_excluded from './fixtures/dspevx_1x1_v_v_excluded.json' with { type: 'json' };
import dspevx_1x1_v_v_included from './fixtures/dspevx_1x1_v_v_included.json' with { type: 'json' };
import dspevx_1x1_n_i from './fixtures/dspevx_1x1_n_i.json' with { type: 'json' };
import dspevx_4x4_n_i_u_fast from './fixtures/dspevx_4x4_n_i_u_fast.json' with { type: 'json' };
import dspevx_4x4_v_i_u_fast from './fixtures/dspevx_4x4_v_i_u_fast.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;

	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, msg + ': got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual value
* @param {Array} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;

	assert.equal( actual.length, expected.length, msg + ' length' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array slice to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @param {NonNegativeInteger} start - start index
* @param {NonNegativeInteger} end - end index
* @returns {Array} output array
*/
function toArray( arr, start, end ) {
	var out = [];
	var i;

	for ( i = start; i < end; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Expands a packed lower-triangular matrix to full column-major form.
*
* @private
* @param {Float64Array} AP - packed lower matrix
* @param {NonNegativeInteger} N - matrix order
* @returns {Float64Array} full column-major matrix
*/
function unpackLower( AP, N ) {
	var out = new Float64Array( N * N );
	var k = 0;
	var i;
	var j;

	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			out[ i + (j * N) ] = AP[ k ];
			out[ j + (i * N) ] = AP[ k ];
			k += 1;
		}
	}
	return out;
}

/**
* Expands a packed upper-triangular matrix to full column-major form.
*
* @private
* @param {Float64Array} AP - packed upper matrix
* @param {NonNegativeInteger} N - matrix order
* @returns {Float64Array} full column-major matrix
*/
function unpackUpper( AP, N ) {
	var out = new Float64Array( N * N );
	var k = 0;
	var i;
	var j;

	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			out[ i + (j * N) ] = AP[ k ];
			out[ j + (i * N) ] = AP[ k ];
			k += 1;
		}
	}
	return out;
}

/**
* Validates the eigendecomposition: A_v = lambda_v for each eigenpair.
*
* @private
* @param {Float64Array} Afull - full symmetric matrix (column-major)
* @param {Float64Array} Z - eigenvector matrix (column-major)
* @param {Float64Array} w - eigenvalues
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} M - number of eigenvalues
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function verifyEigenpairs( Afull, Z, w, N, M, tol, msg ) {
	var lhs;
	var rhs;
	var i;
	var j;
	var k;

	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			lhs = 0.0;
			for ( k = 0; k < N; k++ ) {
				lhs += Afull[ i + (k * N) ] * Z[ k + (j * N) ];
			}
			rhs = Z[ i + (j * N) ] * w[ j ];
			assertClose( lhs, rhs, tol, msg + '(' + i + ',' + j + ')' ); // eslint-disable-line max-len
		}
	}
}

/**
* Runs dspevx with standard workspace allocation.
*
* @private
* @param {string} jobz - job type
* @param {string} range - range type
* @param {string} uplo - triangle type
* @param {NonNegativeInteger} N - matrix order
* @param {Float64Array} AP - packed matrix
* @param {number} vl - lower value bound
* @param {number} vu - upper value bound
* @param {integer} il - lower index bound
* @param {integer} iu - upper index bound
* @param {number} abstol - convergence tolerance
* @returns {Object} result with info, M, w, Z, IFAIL
*/
function runDspevx( jobz, range, uplo, N, AP, vl, vu, il, iu, abstol ) {
	var IWORK;
	var IFAIL;
	var WORK;
	var info;
	var out;
	var w;
	var Z;

	WORK = new Float64Array( Math.max( 256, (8 * N) + 100 ) );
	IWORK = new Int32Array( (5 * N) + 10 );
	IFAIL = new Int32Array( N + 1 );
	w = new Float64Array( N );
	Z = new Float64Array( N * N );
	out = {
		'M': 0
	};

	info = dspevx( jobz, range, uplo, N, AP, 1, 0, vl, vu, il, iu, abstol, out, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'M': out.M,
		'w': w,
		'Z': Z,
		'IFAIL': IFAIL
	};
}

/**
* Returns 4x4 packed lower matrix for the test matrix.
*
* @private
* @returns {Float64Array} packed lower matrix
*/
function packedLower4() {
	return new Float64Array([
		4,
		1,
		-2,
		0,
		3,
		0,
		1,
		5,
		-1,
		6
	]);
}

/**
* Returns 4x4 packed upper matrix for the test matrix.
*
* @private
* @returns {Float64Array} packed upper matrix
*/
function packedUpper4() {
	return new Float64Array([
		4,
		1,
		3,
		-2,
		0,
		5,
		0,
		1,
		-1,
		6
	]);
}

// TESTS //

test( 'dspevx: V, A, L, 4x4', function t() {
	var Afull;
	var tc;
	var AP;
	var r;

	tc = dspevx_4x4_v_a_l;
	AP = packedLower4();
	Afull = unpackLower( packedLower4(), 4 );
	r = runDspevx( 'compute-vectors', 'all', 'lower', 4, AP, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-13, 'eigenpairs' );
});

test( 'dspevx: V, A, U, 4x4', function t() {
	var Afull;
	var tc;
	var AP;
	var r;

	tc = dspevx_4x4_v_a_u;
	AP = packedUpper4();
	Afull = unpackUpper( packedUpper4(), 4 );
	r = runDspevx( 'compute-vectors', 'all', 'upper', 4, AP, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-13, 'eigenpairs' );
});

test( 'dspevx: N, A, L, 4x4', function t() {
	var tc;
	var AP;
	var r;

	tc = dspevx_4x4_n_a_l;
	AP = packedLower4();
	r = runDspevx( 'no-vectors', 'all', 'lower', 4, AP, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dspevx: V, V, L, 4x4 (value range)', function t() {
	var Afull;
	var tc;
	var AP;
	var r;

	tc = dspevx_4x4_v_v_l;
	AP = packedLower4();
	Afull = unpackLower( packedLower4(), 4 );
	r = runDspevx( 'compute-vectors', 'value', 'lower', 4, AP, 2.5, 5.5, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-13, 'eigenpairs' );
});

test( 'dspevx: V, I, L, 4x4 (index range 2..3)', function t() {
	var Afull;
	var tc;
	var AP;
	var r;

	tc = dspevx_4x4_v_i_l;
	AP = packedLower4();
	Afull = unpackLower( packedLower4(), 4 );
	r = runDspevx( 'compute-vectors', 'index', 'lower', 4, AP, 0, 0, 2, 3, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-13, 'eigenpairs' );
});

test( 'dspevx: N, V, U, 4x4 (value range)', function t() {
	var tc;
	var AP;
	var r;

	tc = dspevx_4x4_n_v_u;
	AP = packedUpper4();
	r = runDspevx( 'no-vectors', 'value', 'upper', 4, AP, 0, 4, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dspevx: N=1, V, A', function t() {
	var tc;
	var AP;
	var r;

	tc = dspevx_1x1_v_a;
	AP = new Float64Array( [ 7.5 ] );
	r = runDspevx( 'compute-vectors', 'all', 'lower', 1, AP, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-14, 'w' );
	assertClose( r.Z[ 0 ], 1.0, 1e-14, 'Z[0]' );
});

test( 'dspevx: N=0', function t() {
	var AP;
	var r;

	AP = new Float64Array( 1 );
	r = runDspevx( 'compute-vectors', 'all', 'lower', 0, AP, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'dspevx: N=1, V, V, excluded', function t() {
	var tc;
	var AP;
	var r;

	tc = dspevx_1x1_v_v_excluded;
	AP = new Float64Array( [ 7.5 ] );
	r = runDspevx( 'compute-vectors', 'value', 'lower', 1, AP, 0, 5, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
});

test( 'dspevx: N=1, V, V, included', function t() {
	var tc;
	var AP;
	var r;

	tc = dspevx_1x1_v_v_included;
	AP = new Float64Array( [ 7.5 ] );
	r = runDspevx( 'compute-vectors', 'value', 'lower', 1, AP, 5, 10, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-14, 'w' );
	assertClose( r.Z[ 0 ], 1.0, 1e-14, 'Z[0]' );
});

test( 'dspevx: N=1, N, I', function t() {
	var tc;
	var AP;
	var r;

	tc = dspevx_1x1_n_i;
	AP = new Float64Array( [ 3.0 ] );
	r = runDspevx( 'no-vectors', 'index', 'upper', 1, AP, 0, 0, 1, 1, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-14, 'w' );
});

test( 'dspevx: N, I, U, fast path (il=1, iu=N)', function t() {
	var tc;
	var AP;
	var r;

	tc = dspevx_4x4_n_i_u_fast;
	AP = packedUpper4();
	r = runDspevx( 'no-vectors', 'index', 'upper', 4, AP, 0, 0, 1, 4, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dspevx: V, I, U, fast path (il=1, iu=N)', function t() {
	var Afull;
	var tc;
	var AP;
	var r;

	tc = dspevx_4x4_v_i_u_fast;
	AP = packedUpper4();
	Afull = unpackUpper( packedUpper4(), 4 );
	r = runDspevx( 'compute-vectors', 'index', 'upper', 4, AP, 0, 0, 1, 4, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Afull, r.Z, r.w, 4, r.M, 1e-13, 'eigenpairs' );
});

test( 'dspevx: V, A, L, scaled (tiny matrix)', function t() {
	var APbase;
	var scale;
	var AP;
	var tc;
	var r;
	var i;

	scale = 1e-160;

	APbase = packedLower4();
	AP = new Float64Array( APbase.length );
	for ( i = 0; i < APbase.length; i++ ) {
		AP[ i ] = APbase[ i ] * scale;
	}
	r = runDspevx( 'compute-vectors', 'all', 'lower', 4, AP, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	tc = dspevx_4x4_v_a_l;
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], tc.w[ i ] * scale, 1e-10, 'w[' + i + ']' );
	}
});

test( 'dspevx: V, A, U, scaled (large matrix)', function t() {
	var APbase;
	var scale;
	var AP;
	var tc;
	var r;
	var i;

	scale = 1e155;

	APbase = packedUpper4();
	AP = new Float64Array( APbase.length );
	for ( i = 0; i < APbase.length; i++ ) {
		AP[ i ] = APbase[ i ] * scale;
	}
	r = runDspevx( 'compute-vectors', 'all', 'upper', 4, AP, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	tc = dspevx_4x4_v_a_u;
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], tc.w[ i ] * scale, 1e-10, 'w[' + i + ']' );
	}
});

test( 'dspevx: V, V, L, scaled (value range)', function t() {
	var APbase;
	var scale;
	var AP;
	var r;
	var i;

	scale = 1e-160;

	APbase = packedLower4();
	AP = new Float64Array( APbase.length );
	for ( i = 0; i < APbase.length; i++ ) {
		AP[ i ] = APbase[ i ] * scale;
	}
	r = runDspevx( 'compute-vectors', 'value', 'lower', 4, AP, 2.5*scale, 5.5*scale, 0, 0, 0 ); // eslint-disable-line max-len

	assert.equal( r.info, 0 );
	assert.ok( r.M >= 1, 'should find at least one eigenvalue' );
});
