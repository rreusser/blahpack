

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

// Build the 3x3 complex test matrix as interleaved doubles
const A_DATA = [
	4, 1, 1, -1, 0.5, 0.2,
	1, 0.5, 3, 2, 1, -0.5,
	0.5, 0.1, 1, 0.3, 2, 1
];

// TESTS //

test( 'zlaqge: no_equil', function t() {
	const tc = no_equil;
	const A = new Complex128Array( A_DATA.slice() );
	const r = new Float64Array( [ 1, 1, 1 ] );
	const c = new Float64Array( [ 1, 1, 1 ] );
	const equed = [ '' ];
	const out = zlaqge( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 5.0, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'none' );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.a, 1e-14, 'a' );
});

test( 'zlaqge: row_equil', function t() {
	const tc = row_equil;
	const A = new Complex128Array( A_DATA.slice() );
	const r = new Float64Array( [ 0.5, 2.0, 1.5 ] );
	const c = new Float64Array( [ 1, 1, 1 ] );
	const equed = [ '' ];
	const out = zlaqge( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0, 0.01, 1.0, 5.0, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'row' );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.a, 1e-14, 'a' );
});

test( 'zlaqge: col_equil', function t() {
	const tc = col_equil;
	const A = new Complex128Array( A_DATA.slice() );
	const r = new Float64Array( [ 1, 1, 1 ] );
	const c = new Float64Array( [ 0.5, 2.0, 1.5 ] );
	const equed = [ '' ];
	const out = zlaqge( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0, 1.0, 0.01, 5.0, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'column' );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.a, 1e-14, 'a' );
});

test( 'zlaqge: both_equil', function t() {
	const tc = both_equil;
	const A = new Complex128Array( A_DATA.slice() );
	const r = new Float64Array( [ 0.5, 2.0, 1.5 ] );
	const c = new Float64Array( [ 0.5, 2.0, 1.5 ] );
	const equed = [ '' ];
	const out = zlaqge( 3, 3, A, 1, 3, 0, r, 1, 0, c, 1, 0, 0.01, 0.01, 5.0, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'both' );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.a, 1e-14, 'a' );
});

test( 'zlaqge: m_zero', function t() {
	const A = new Complex128Array( 1 );
	const r = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const equed = [ '' ];
	const out = zlaqge( 0, 3, A, 1, 1, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 5.0, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'none' );
});

test( 'zlaqge: n_zero', function t() {
	const A = new Complex128Array( 1 );
	const r = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const equed = [ '' ];
	const out = zlaqge( 3, 0, A, 1, 3, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 5.0, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'none' );
});

test( 'zlaqge: small_amax triggers row equilibration path', function t() {
	const tc = small_amax;
	const A = new Complex128Array( [
		1e-200, 0, 1e-200, 0,
		1e-200, 0, 1e-200, 0
	] );
	const r = new Float64Array( [ 1, 1 ] );
	const c = new Float64Array( [ 1, 1 ] );
	const equed = [ '' ];
	const out = zlaqge( 2, 2, A, 1, 2, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 1e-200, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	// Map Fortran single char to long-form
	const equedMap = { 'N': 'none', 'R': 'row', 'C': 'column', 'B': 'both' };
	assert.equal( equed[ 0 ], equedMap[ tc.equed ] || tc.equed );
});

test( 'zlaqge: amax just above SMALL skips scaling (ticket 0089)', function t() {
	// Reference: SMALL = DLAMCH('Safe minimum') / DLAMCH('Precision'), LARGE = 1/SMALL.
	// SMALL = 2^-1022 / 2^-52 = 2^-970 <= amax = 1.5*2^-970 < 2^-969,
	// Where 2^-969 is the SMALL DLAMCH('E') would give. With row and column condition ratios 1.0 (>= THRESH),
	// The reference leaves A untouched and returns 'none'; DLAMCH('E') would scale ('row').
	const amax = Math.pow( 2.0, -970 ) * 1.5;
	const A = new Complex128Array( [ 3.0, 2.0 ] );
	const s = new Float64Array( [ 2.0 ] );
	const equed = [ '' ];
	const out = zlaqge( 1, 1, A, 1, 1, 0, s, 1, 0, s, 1, 0, 1.0, 1.0, amax, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'none', 'equed' );
	assert.deepEqual( Array.from( reinterpret( A, 0 ) ), [ 3.0, 2.0 ], 'A unchanged' );
});

test( 'zlaqge: amax just below LARGE skips scaling (ticket 0089)', function t() {
	// Reference: SMALL = DLAMCH('Safe minimum') / DLAMCH('Precision'), LARGE = 1/SMALL.
	// LARGE = 1/SMALL = 2^970 >= amax = 1.5*2^969 > 2^969,
	// Where 2^969 is the LARGE DLAMCH('E') would give. With row and column condition ratios 1.0 (>= THRESH),
	// The reference leaves A untouched and returns 'none'; DLAMCH('E') would scale ('row').
	const amax = Math.pow( 2.0, 969 ) * 1.5;
	const A = new Complex128Array( [ 3.0, 2.0 ] );
	const s = new Float64Array( [ 2.0 ] );
	const equed = [ '' ];
	const out = zlaqge( 1, 1, A, 1, 1, 0, s, 1, 0, s, 1, 0, 1.0, 1.0, amax, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'none', 'equed' );
	assert.deepEqual( Array.from( reinterpret( A, 0 ) ), [ 3.0, 2.0 ], 'A unchanged' );
});
