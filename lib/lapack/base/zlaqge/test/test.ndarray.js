

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqge from './../lib/ndarray.js';

// FIXTURES //

import no_equil from './fixtures/no_equil.json' with { type: 'json' };
import row_equil from './fixtures/row_equil.json' with { type: 'json' };
import col_equil from './fixtures/col_equil.json' with { type: 'json' };
import both_equil from './fixtures/both_equil.json' with { type: 'json' };
import small_amax from './fixtures/small_amax.json' with { type: 'json' };

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

// Build the 3x3 complex test matrix as interleaved doubles
var A_DATA = [
	4, 1, 1, -1, 0.5, 0.2,
	1, 0.5, 3, 2, 1, -0.5,
	0.5, 0.1, 1, 0.3, 2, 1
];

// TESTS //

test( 'zlaqge: no_equil', function t() {
	var tc = no_equil;
	var A = new Complex128Array( A_DATA.slice() );
	var r = new Float64Array( [ 1, 1, 1 ] );
	var c = new Float64Array( [ 1, 1, 1 ] );
	var equed = zlaqge( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 5.0 );
	assert.equal( equed, 'none' );
	var Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.a, 1e-14, 'a' );
});

test( 'zlaqge: row_equil', function t() {
	var tc = row_equil;
	var A = new Complex128Array( A_DATA.slice() );
	var r = new Float64Array( [ 0.5, 2.0, 1.5 ] );
	var c = new Float64Array( [ 1, 1, 1 ] );
	var equed = zlaqge( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0, 0.01, 1.0, 5.0 );
	assert.equal( equed, 'row' );
	var Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.a, 1e-14, 'a' );
});

test( 'zlaqge: col_equil', function t() {
	var tc = col_equil;
	var A = new Complex128Array( A_DATA.slice() );
	var r = new Float64Array( [ 1, 1, 1 ] );
	var c = new Float64Array( [ 0.5, 2.0, 1.5 ] );
	var equed = zlaqge( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0, 1.0, 0.01, 5.0 );
	assert.equal( equed, 'column' );
	var Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.a, 1e-14, 'a' );
});

test( 'zlaqge: both_equil', function t() {
	var tc = both_equil;
	var A = new Complex128Array( A_DATA.slice() );
	var r = new Float64Array( [ 0.5, 2.0, 1.5 ] );
	var c = new Float64Array( [ 0.5, 2.0, 1.5 ] );
	var equed = zlaqge( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0, 0.01, 0.01, 5.0 );
	assert.equal( equed, 'both' );
	var Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.a, 1e-14, 'a' );
});

test( 'zlaqge: m_zero', function t() {
	var A = new Complex128Array( 1 );
	var r = new Float64Array( 1 );
	var c = new Float64Array( 1 );
	var equed = zlaqge( 0, 3, A, 1, 1, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 5.0 );
	assert.equal( equed, 'none' );
});

test( 'zlaqge: n_zero', function t() {
	var A = new Complex128Array( 1 );
	var r = new Float64Array( 1 );
	var c = new Float64Array( 1 );
	var equed = zlaqge( 3, 0, A, 1, 3, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 5.0 );
	assert.equal( equed, 'none' );
});

test( 'zlaqge: small_amax triggers row equilibration path', function t() {
	var tc = small_amax;
	var A = new Complex128Array( [
		1e-200, 0, 1e-200, 0,
		1e-200, 0, 1e-200, 0
	] );
	var r = new Float64Array( [ 1, 1 ] );
	var c = new Float64Array( [ 1, 1 ] );
	var equed = zlaqge( 2, 2, A, 1, 2, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 1e-200 );
	// Map Fortran single char to long-form
	var equedMap = { 'N': 'none', 'R': 'row', 'C': 'column', 'B': 'both' };
	assert.equal( equed, equedMap[ tc.equed ] || tc.equed );
});
