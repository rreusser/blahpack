// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlatrd from './../lib/ndarray.js';

// FIXTURES //

import upper_6x6_nb3 from './fixtures/upper_6x6_nb3.json' with { type: 'json' };
import lower_6x6_nb3 from './fixtures/lower_6x6_nb3.json' with { type: 'json' };

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
* Build the 6x6 Hermitian matrix from the Fortran test.
*/
function makeHerm6() {
	// Column-major interleaved: A(row, col), rows first within each column
	return new Complex128Array([
		// col 0
		10, 0,     1, -2,    0.5, 1,    0.3, -0.4,  0.1, 0.2,   0.2, -0.1,
		// col 1
		1, 2,      9, 0,     1.5, -1,   0.7, 0.3,   0.4, -0.5,  0.3, 0.2,
		// col 2
		0.5, -1,   1.5, 1,   8, 0,      2, -1.5,    0.6, 0.4,   0.5, -0.3,
		// col 3
		0.3, 0.4,  0.7, -0.3, 2, 1.5,   7, 0,       1, -0.8,    0.4, 0.6,
		// col 4
		0.1, -0.2, 0.4, 0.5, 0.6, -0.4, 1, 0.8,     6, 0,       1.5, -1,
		// col 5
		0.2, 0.1,  0.3, -0.2, 0.5, 0.3, 0.4, -0.6,  1.5, 1,     5, 0
	]);
}

// TESTS //

test( 'zlatrd: upper_6x6_nb3', function t() {
	var tc = upper_6x6_nb3;
	var A = makeHerm6();
	var e = new Float64Array( 5 );
	var TAU = new Complex128Array( 5 );
	var W = new Complex128Array( 6 * 3 );
	var Av = reinterpret( A, 0 );
	var Tv = reinterpret( TAU, 0 );
	var Wv = reinterpret( W, 0 );

	zlatrd( 'upper', 6, 3, A, 1, 6, 0, e, 1, 0, TAU, 1, 0, W, 1, 6, 0 );

	assertArrayClose( Array.from( Av ), tc.A, 1e-13, 'A' );
	assertArrayClose( Array.from( e ), tc.e, 1e-13, 'e' );
	assertArrayClose( Array.from( Tv ), tc.tau, 1e-13, 'tau' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-13, 'W' );
});

test( 'zlatrd: lower_6x6_nb3', function t() {
	var tc = lower_6x6_nb3;
	var A = makeHerm6();
	var e = new Float64Array( 5 );
	var TAU = new Complex128Array( 5 );
	var W = new Complex128Array( 6 * 3 );
	var Av = reinterpret( A, 0 );
	var Tv = reinterpret( TAU, 0 );
	var Wv = reinterpret( W, 0 );

	zlatrd( 'lower', 6, 3, A, 1, 6, 0, e, 1, 0, TAU, 1, 0, W, 1, 6, 0 );

	assertArrayClose( Array.from( Av ), tc.A, 1e-13, 'A' );
	assertArrayClose( Array.from( e ), tc.e, 1e-13, 'e' );
	assertArrayClose( Array.from( Tv ), tc.tau, 1e-13, 'tau' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-13, 'W' );
});

test( 'zlatrd: N=0 quick return', function t() {
	var A = new Complex128Array( 0 );
	var e = new Float64Array( 0 );
	var TAU = new Complex128Array( 0 );
	var W = new Complex128Array( 0 );
	// Should not throw
	zlatrd( 'upper', 0, 0, A, 1, 1, 0, e, 1, 0, TAU, 1, 0, W, 1, 1, 0 );
});
