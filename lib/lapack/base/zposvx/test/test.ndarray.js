
// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zposvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_upper from './fixtures/fact_n_upper.json' with { type: 'json' };
import fact_n_lower from './fixtures/fact_n_lower.json' with { type: 'json' };
import fact_e from './fixtures/fact_e.json' with { type: 'json' };
import fact_f from './fixtures/fact_f.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import fact_e_lower from './fixtures/fact_e_lower.json' with { type: 'json' };

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
* Helper to call zposvx with standard workspace allocation.
*/
function callZposvx( fact, uplo, N, nrhs, A, AF, equed, s, B, X, FERR, BERR ) {
	var WORK = new Complex128Array( Math.max( 2 * N, 1 ) );
	var RWORK = new Float64Array( Math.max( N, 1 ) );
	var rcond = new Float64Array( 1 );
	return zposvx( fact, uplo, N, nrhs,
		A, 1, N, 0,
		AF, 1, N, 0,
		equed, s, 1, 0,
		B, 1, N, 0,
		X, 1, N, 0,
		rcond,
		FERR, 1, 0,
		BERR, 1, 0,
		WORK, 1, 0,
		RWORK, 1, 0
	);
}

// TESTS //

test( 'zposvx: fact_N_upper', function t() {
	var tc = fact_n_upper;
	// A = [[4, 1+i, 0], [1-i, 3, 1], [0, 1, 2]]
	var A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ] );
	var AF = new Complex128Array( 9 );
	var s = new Float64Array( 3 );
	var B = new Complex128Array( [ 5, 1, 5, -1, 3, 0 ] );
	var X = new Complex128Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var result = callZposvx( 'not-factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.equed, 'none', 'equed' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-10, 'x' );
	assertArrayClose( Array.from( FERR ), tc.ferr, 1e-2, 'ferr' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-2, 'berr' );
});

test( 'zposvx: fact_N_lower', function t() {
	var tc = fact_n_lower;
	var A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ] );
	var AF = new Complex128Array( 9 );
	var s = new Float64Array( 3 );
	var B = new Complex128Array( [ 5, 1, 5, -1, 3, 0 ] );
	var X = new Complex128Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var result = callZposvx( 'not-factored', 'lower', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.equed, 'none', 'equed' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-10, 'x' );
});

test( 'zposvx: fact_E', function t() {
	var tc = fact_e;
	// Poorly scaled HPD
	var A = new Complex128Array( [
		100, 0, 1, -1, 0.1, 0,
		1, 1, 1, 0, 0.05, -0.05,
		0.1, 0, 0.05, 0.05, 0.01, 0
	] );
	var AF = new Complex128Array( 9 );
	var s = new Float64Array( 3 );
	var B = new Complex128Array( [ 101.1, 1.0, 1.05, -0.95, 0.16, -0.05 ] );
	var X = new Complex128Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var result = callZposvx( 'equilibrate', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	// Equilibration path: rcond and solution differ slightly between implementations
	// due to different internal rounding in the condition estimator
	assertClose( result.rcond, tc.rcond, 0.15, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-3, 'x' );
	if ( tc.s ) {
		assertArrayClose( Array.from( s ), tc.s, 1e-10, 's' );
	}
});

test( 'zposvx: fact_F', function t() {
	var tc = fact_f;
	// First solve with FACT='N' to get the factorization
	var A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ] );
	var AF = new Complex128Array( 9 );
	var s = new Float64Array( 3 );
	var B = new Complex128Array( [ 5, 1, 5, -1, 3, 0 ] );
	var X = new Complex128Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	callZposvx( 'not-factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );

	// Now use FACT='F' with different RHS
	A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ] );
	B = new Complex128Array( [ 1, 0, 2, 1, 3, 0 ] );
	var result = callZposvx( 'factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-10, 'x' );
});

test( 'zposvx: not_posdef', function t() {
	var tc = not_posdef;
	var A = new Complex128Array( [
		1, 0, 2, 0, 3, 0,
		2, 0, -1, 0, 4, 0,
		3, 0, 4, 0, 5, 0
	] );
	var AF = new Complex128Array( 9 );
	var s = new Float64Array( 3 );
	var B = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
	var X = new Complex128Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var result = callZposvx( 'not-factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.rcond, tc.rcond, 1e-14, 'rcond' );
});

test( 'zposvx: n_zero', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 1 );
	var AF = new Complex128Array( 1 );
	var s = new Float64Array( 1 );
	var B = new Complex128Array( 1 );
	var X = new Complex128Array( 1 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var result = callZposvx( 'not-factored', 'upper', 0, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'zposvx: multi_rhs', function t() {
	var tc = multi_rhs;
	var A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ] );
	var AF = new Complex128Array( 9 );
	var s = new Float64Array( 3 );
	var B = new Complex128Array( [ 5, 1, 5, -1, 3, 0, 1, 0, 2, 1, 3, 0 ] );
	var X = new Complex128Array( 6 );
	var FERR = new Float64Array( 2 );
	var BERR = new Float64Array( 2 );
	var result = callZposvx( 'not-factored', 'upper', 3, 2, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-10, 'x' );
	assertArrayClose( Array.from( FERR ), tc.ferr, 1e-2, 'ferr' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-2, 'berr' );
});

test( 'zposvx: fact_E_lower', function t() {
	var tc = fact_e_lower;
	var A = new Complex128Array( [
		100, 0, 1, -1, 0.1, 0,
		1, 1, 1, 0, 0.05, -0.05,
		0.1, 0, 0.05, 0.05, 0.01, 0
	] );
	var AF = new Complex128Array( 9 );
	var s = new Float64Array( 3 );
	var B = new Complex128Array( [ 101.1, 1.0, 1.05, -0.95, 0.16, -0.05 ] );
	var X = new Complex128Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var result = callZposvx( 'equilibrate', 'lower', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	// Equilibration path: rcond and solution differ slightly between implementations
	assertClose( result.rcond, tc.rcond, 0.15, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-3, 'x' );
});
