// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpttrs from './../lib/ndarray.js';

// FIXTURES //

import upper_n4_nrhs1 from './fixtures/upper_n4_nrhs1.json' with { type: 'json' };
import lower_n4_nrhs1 from './fixtures/lower_n4_nrhs1.json' with { type: 'json' };
import upper_n4_nrhs3 from './fixtures/upper_n4_nrhs3.json' with { type: 'json' };
import lower_n4_nrhs3 from './fixtures/lower_n4_nrhs3.json' with { type: 'json' };
import n_eq_1 from './fixtures/n_eq_1.json' with { type: 'json' };
import n_eq_0 from './fixtures/n_eq_0.json' with { type: 'json' };
import nrhs_eq_0 from './fixtures/nrhs_eq_0.json' with { type: 'json' };

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

// TESTS //

test( 'zpttrs: upper_n4_nrhs1 (UPLO=U, N=4, NRHS=1)', function t() {
	const tc = upper_n4_nrhs1;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 5.0 ] );
	const e = new Complex128Array( [ 0.5, 0.1, -0.3, 0.2, 0.4, -0.1 ] );
	const B = new Complex128Array( [ 2.0, 1.0, 3.0, -1.0, 1.0, 2.0, 4.0, 0.0 ] );

	const info = zpttrs( 'upper', 4, 1, d, 1, 0, e, 1, 0, B, 1, 4, 0 );
	const bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( bv ), tc.b, 1e-14, 'b' );
});

test( 'zpttrs: lower_n4_nrhs1 (UPLO=L, N=4, NRHS=1)', function t() {
	const tc = lower_n4_nrhs1;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 5.0 ] );
	const e = new Complex128Array( [ 0.5, 0.1, -0.3, 0.2, 0.4, -0.1 ] );
	const B = new Complex128Array( [ 2.0, 1.0, 3.0, -1.0, 1.0, 2.0, 4.0, 0.0 ] );

	const info = zpttrs( 'lower', 4, 1, d, 1, 0, e, 1, 0, B, 1, 4, 0 );
	const bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( bv ), tc.b, 1e-14, 'b' );
});

test( 'zpttrs: upper_n4_nrhs3 (UPLO=U, N=4, NRHS=3)', function t() {
	const tc = upper_n4_nrhs3;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 5.0 ] );
	const e = new Complex128Array( [ 0.5, 0.1, -0.3, 0.2, 0.4, -0.1 ] );
	const B = new Complex128Array( [
		2.0, 1.0, 3.0, -1.0, 1.0, 2.0, 4.0, 0.0,
		1.0, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0, -1.0,
		5.0, 3.0, -2.0, 4.0, 3.0, -1.0, 1.0, 1.0
	] );

	const info = zpttrs( 'upper', 4, 3, d, 1, 0, e, 1, 0, B, 1, 4, 0 );
	const bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( bv ), tc.b, 1e-14, 'b' );
});

test( 'zpttrs: lower_n4_nrhs3 (UPLO=L, N=4, NRHS=3)', function t() {
	const tc = lower_n4_nrhs3;
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 5.0 ] );
	const e = new Complex128Array( [ 0.5, 0.1, -0.3, 0.2, 0.4, -0.1 ] );
	const B = new Complex128Array( [
		2.0, 1.0, 3.0, -1.0, 1.0, 2.0, 4.0, 0.0,
		1.0, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0, -1.0,
		5.0, 3.0, -2.0, 4.0, 3.0, -1.0, 1.0, 1.0
	] );

	const info = zpttrs( 'lower', 4, 3, d, 1, 0, e, 1, 0, B, 1, 4, 0 );
	const bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( bv ), tc.b, 1e-14, 'b' );
});

test( 'zpttrs: n_eq_1 (N=1, NRHS=1)', function t() {
	const tc = n_eq_1;
	const d = new Float64Array( [ 3.0 ] );
	const e = new Complex128Array( 0 );
	const B = new Complex128Array( [ 9.0, 6.0 ] );

	const info = zpttrs( 'upper', 1, 1, d, 1, 0, e, 1, 0, B, 1, 1, 0 );
	const bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( bv ), tc.b, 1e-14, 'b' );
});

test( 'zpttrs: n_eq_0 (N=0, quick return)', function t() {
	const tc = n_eq_0;
	const d = new Float64Array( 0 );
	const e = new Complex128Array( 0 );
	const B = new Complex128Array( [ 42.0, 7.0 ] );

	const info = zpttrs( 'upper', 0, 1, d, 1, 0, e, 1, 0, B, 1, 1, 0 );
	const bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( bv ), tc.b, 1e-14, 'b' );
});

test( 'zpttrs: nrhs_eq_0 (NRHS=0, quick return)', function t() {
	const tc = nrhs_eq_0;
	const d = new Float64Array( [ 4.0, 3.0 ] );
	const e = new Complex128Array( [ 0.5, 0.0 ] );
	const B = new Complex128Array( [ 42.0, 7.0 ] );

	const info = zpttrs( 'upper', 2, 0, d, 1, 0, e, 1, 0, B, 1, 2, 0 );
	const bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( bv ), tc.b, 1e-14, 'b' );
});

test( 'zpttrs: non-unit strides and offsets', function t() {
	// Same as upper_n4_nrhs1 but with offset=1 on d and e
	const tc = upper_n4_nrhs1;
	const d = new Float64Array( [ 0.0, 4.0, 3.0, 2.0, 5.0 ] );
	const e = new Complex128Array( [ 0.0, 0.0, 0.5, 0.1, -0.3, 0.2, 0.4, -0.1 ] );
	const B = new Complex128Array( [ 2.0, 1.0, 3.0, -1.0, 1.0, 2.0, 4.0, 0.0 ] );

	const info = zpttrs( 'upper', 4, 1, d, 1, 1, e, 1, 1, B, 1, 4, 0 );
	const bv = reinterpret( B, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( Array.from( bv ), tc.b, 1e-14, 'b' );
});

test( 'zpttrs: returns 0 (info)', function t() {
	const d = new Float64Array( [ 4.0, 3.0 ] );
	const e = new Complex128Array( [ 0.5, 0.1 ] );
	const B = new Complex128Array( [ 2.0, 1.0, 3.0, -1.0 ] );

	const info = zpttrs( 'lower', 2, 1, d, 1, 0, e, 1, 0, B, 1, 2, 0 );
	assert.equal( info, 0 );
});
