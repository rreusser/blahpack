// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsytd2 from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import upper_5x5 from './fixtures/upper_5x5.json' with { type: 'json' };
import lower_5x5 from './fixtures/lower_5x5.json' with { type: 'json' };
import upper_2x2 from './fixtures/upper_2x2.json' with { type: 'json' };
import lower_2x2 from './fixtures/lower_2x2.json' with { type: 'json' };
import upper_diagonal from './fixtures/upper_diagonal.json' with { type: 'json' };
import lower_diagonal from './fixtures/lower_diagonal.json' with { type: 'json' };

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

/**
* Runs dsytd2 on a given symmetric matrix.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {number} N - order
* @param {Array} Aflat - column-major flat array of the symmetric matrix
* @returns {Object} { info, A, d, e, tau }
*/
function run( uplo, N, Aflat ) {
	var A = new Float64Array( Aflat );
	var d = new Float64Array( N );
	var e = new Float64Array( Math.max( N - 1, 0 ) );
	var tau = new Float64Array( Math.max( N - 1, 0 ) );
	var info = dsytd2( uplo, N, A, 1, N, 0, d, 1, 0, e, 1, 0, tau, 1, 0 );
	return {
		info: info,
		A: A,
		d: d,
		e: e,
		tau: tau
	};
}

// TESTS //

test( 'dsytd2: upper_4x4', function t() {
	var tc = upper_4x4;
	var r = run( 'upper', 4, [
		4, 1, 2, 1,
		1, 5, 1, 2,
		2, 1, 6, 1,
		1, 2, 1, 7
	]);
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.A ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( r.d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( r.e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( r.tau ), tc.tau, 1e-14, 'tau' );
});

test( 'dsytd2: lower_4x4', function t() {
	var tc = lower_4x4;
	var r = run( 'lower', 4, [
		4, 1, 2, 1,
		1, 5, 1, 2,
		2, 1, 6, 1,
		1, 2, 1, 7
	]);
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.A ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( r.d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( r.e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( r.tau ), tc.tau, 1e-14, 'tau' );
});

test( 'dsytd2: n_one_upper', function t() {
	var tc = n_one_upper;
	var A = new Float64Array( [ 3.0 ] );
	var d = new Float64Array( 1 );
	var e = new Float64Array( 0 );
	var tau = new Float64Array( 0 );
	var info = dsytd2( 'upper', 1, A, 1, 1, 0, d, 1, 0, e, 1, 0, tau, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( A[ 0 ], tc.A11, 1e-14, 'A11' );
	assertClose( d[ 0 ], tc.d1, 1e-14, 'd1' );
});

test( 'dsytd2: n_one_lower', function t() {
	var tc = n_one_lower;
	var A = new Float64Array( [ 3.0 ] );
	var d = new Float64Array( 1 );
	var e = new Float64Array( 0 );
	var tau = new Float64Array( 0 );
	var info = dsytd2( 'lower', 1, A, 1, 1, 0, d, 1, 0, e, 1, 0, tau, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( A[ 0 ], tc.A11, 1e-14, 'A11' );
	assertClose( d[ 0 ], tc.d1, 1e-14, 'd1' );
});

test( 'dsytd2: n_zero', function t() {
	var tc = n_zero;
	var A = new Float64Array( 0 );
	var d = new Float64Array( 0 );
	var e = new Float64Array( 0 );
	var tau = new Float64Array( 0 );
	var info = dsytd2( 'upper', 0, A, 1, 1, 0, d, 1, 0, e, 1, 0, tau, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dsytd2: upper_5x5', function t() {
	var tc = upper_5x5;
	var r = run( 'upper', 5, [
		10, 3, 1, 0.5, 0.2,
		3, 8, 2, 1, 0.5,
		1, 2, 6, 3, 1,
		0.5, 1, 3, 9, 2,
		0.2, 0.5, 1, 2, 7
	]);
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.A ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( r.d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( r.e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( r.tau ), tc.tau, 1e-14, 'tau' );
});

test( 'dsytd2: lower_5x5', function t() {
	var tc = lower_5x5;
	var r = run( 'lower', 5, [
		10, 3, 1, 0.5, 0.2,
		3, 8, 2, 1, 0.5,
		1, 2, 6, 3, 1,
		0.5, 1, 3, 9, 2,
		0.2, 0.5, 1, 2, 7
	]);
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.A ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( r.d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( r.e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( r.tau ), tc.tau, 1e-14, 'tau' );
});

test( 'dsytd2: upper_2x2', function t() {
	var tc = upper_2x2;
	var r = run( 'upper', 2, [
		4, 3,
		3, 5
	]);
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.A ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( r.d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( r.e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( r.tau ), tc.tau, 1e-14, 'tau' );
});

test( 'dsytd2: lower_2x2', function t() {
	var tc = lower_2x2;
	var r = run( 'lower', 2, [
		4, 3,
		3, 5
	]);
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.A ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( r.d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( r.e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( r.tau ), tc.tau, 1e-14, 'tau' );
});

test( 'dsytd2: upper_diagonal', function t() {
	var tc = upper_diagonal;
	var r = run( 'upper', 3, [
		2, 0, 0,
		0, 5, 0,
		0, 0, 8
	]);
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( r.e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( r.tau ), tc.tau, 1e-14, 'tau' );
});

test( 'dsytd2: lower_diagonal', function t() {
	var tc = lower_diagonal;
	var r = run( 'lower', 3, [
		2, 0, 0,
		0, 5, 0,
		0, 0, 8
	]);
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.d ), tc.d, 1e-14, 'd' );
	assertArrayClose( Array.from( r.e ), tc.e, 1e-14, 'e' );
	assertArrayClose( Array.from( r.tau ), tc.tau, 1e-14, 'tau' );
});
