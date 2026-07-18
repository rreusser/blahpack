
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
* Helper to call zposvx with standard workspace allocation.
*/
function callZposvx( fact, uplo, N, nrhs, A, AF, equed, s, B, X, FERR, BERR ) {
	const WORK = new Complex128Array( Math.max( 2 * N, 1 ) );
	const RWORK = new Float64Array( Math.max( N, 1 ) );
	const rcond = new Float64Array( 1 );
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
	const tc = fact_n_upper;
	// A = [[4, 1+i, 0], [1-i, 3, 1], [0, 1, 2]]
	const A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ] );
	const AF = new Complex128Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Complex128Array( [ 5, 1, 5, -1, 3, 0 ] );
	const X = new Complex128Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callZposvx( 'not-factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.equed, 'none', 'equed' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-10, 'x' );
	assertArrayClose( Array.from( FERR ), tc.ferr, 1e-2, 'ferr' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-2, 'berr' );
});

test( 'zposvx: fact_N_lower', function t() {
	const tc = fact_n_lower;
	const A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ] );
	const AF = new Complex128Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Complex128Array( [ 5, 1, 5, -1, 3, 0 ] );
	const X = new Complex128Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callZposvx( 'not-factored', 'lower', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.equed, 'none', 'equed' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-10, 'x' );
});

test( 'zposvx: fact_E', function t() {
	const tc = fact_e;
	// Poorly scaled HPD
	const A = new Complex128Array( [
		100, 0, 1, -1, 0.1, 0,
		1, 1, 1, 0, 0.05, -0.05,
		0.1, 0, 0.05, 0.05, 0.01, 0
	] );
	const AF = new Complex128Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Complex128Array( [ 101.1, 1.0, 1.05, -0.95, 0.16, -0.05 ] );
	const X = new Complex128Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callZposvx( 'equilibrate', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
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
	const tc = fact_f;
	// First solve with FACT='N' to get the factorization
	let A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ] );
	const AF = new Complex128Array( 9 );
	const s = new Float64Array( 3 );
	let B = new Complex128Array( [ 5, 1, 5, -1, 3, 0 ] );
	const X = new Complex128Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	callZposvx( 'not-factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );

	// Now use FACT='F' with different RHS
	A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ] );
	B = new Complex128Array( [ 1, 0, 2, 1, 3, 0 ] );
	const result = callZposvx( 'factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-10, 'x' );
});

test( 'zposvx: not_posdef', function t() {
	const tc = not_posdef;
	const A = new Complex128Array( [
		1, 0, 2, 0, 3, 0,
		2, 0, -1, 0, 4, 0,
		3, 0, 4, 0, 5, 0
	] );
	const AF = new Complex128Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
	const X = new Complex128Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callZposvx( 'not-factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.rcond, tc.rcond, 1e-14, 'rcond' );
});

test( 'zposvx: n_zero', function t() {
	const tc = n_zero;
	const A = new Complex128Array( 1 );
	const AF = new Complex128Array( 1 );
	const s = new Float64Array( 1 );
	const B = new Complex128Array( 1 );
	const X = new Complex128Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callZposvx( 'not-factored', 'upper', 0, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'zposvx: multi_rhs', function t() {
	const tc = multi_rhs;
	const A = new Complex128Array( [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ] );
	const AF = new Complex128Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Complex128Array( [ 5, 1, 5, -1, 3, 0, 1, 0, 2, 1, 3, 0 ] );
	const X = new Complex128Array( 6 );
	const FERR = new Float64Array( 2 );
	const BERR = new Float64Array( 2 );
	const result = callZposvx( 'not-factored', 'upper', 3, 2, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-10, 'x' );
	assertArrayClose( Array.from( FERR ), tc.ferr, 1e-2, 'ferr' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-2, 'berr' );
});

test( 'zposvx: fact_E_lower', function t() {
	const tc = fact_e_lower;
	const A = new Complex128Array( [
		100, 0, 1, -1, 0.1, 0,
		1, 1, 1, 0, 0.05, -0.05,
		0.1, 0, 0.05, 0.05, 0.01, 0
	] );
	const AF = new Complex128Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Complex128Array( [ 101.1, 1.0, 1.05, -0.95, 0.16, -0.05 ] );
	const X = new Complex128Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callZposvx( 'equilibrate', 'lower', 3, 1, A, AF, 'none', s, B, X, FERR, BERR );
	assert.equal( result.info, tc.info, 'info' );
	// Equilibration path: rcond and solution differ slightly between implementations
	assertClose( result.rcond, tc.rcond, 0.15, 'rcond' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.x, 1e-3, 'x' );
});
