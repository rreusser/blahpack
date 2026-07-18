

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztfttr from './../lib/ndarray.js';

// FIXTURES //

import n0 from './fixtures/n0.json' with { type: 'json' };
import n1_n from './fixtures/n1_n.json' with { type: 'json' };
import n1_c from './fixtures/n1_c.json' with { type: 'json' };
import n5_n_l from './fixtures/n5_n_l.json' with { type: 'json' };
import n5_n_u from './fixtures/n5_n_u.json' with { type: 'json' };
import n5_c_l from './fixtures/n5_c_l.json' with { type: 'json' };
import n5_c_u from './fixtures/n5_c_u.json' with { type: 'json' };
import n6_n_l from './fixtures/n6_n_l.json' with { type: 'json' };
import n6_n_u from './fixtures/n6_n_u.json' with { type: 'json' };
import n6_c_l from './fixtures/n6_c_l.json' with { type: 'json' };
import n6_c_u from './fixtures/n6_c_u.json' with { type: 'json' };

// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	let relErr, i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

// TESTS //

test( 'ztfttr is a function', function t() {
	assert.equal( typeof ztfttr, 'function' );
});

test( 'ztfttr: N=0 quick return', function t() {
	const tc = n0;
	const ARF = new Complex128Array( 1 );
	const A = new Complex128Array( 1 );
	const info = ztfttr( 'no-transpose', 'lower', 0, ARF, 1, 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'ztfttr: N=1 normal (no conjugation)', function t() {
	const tc = n1_n;
	const ARF = new Complex128Array( [ 42.0, 7.0 ] );
	const A = new Complex128Array( 1 );
	const info = ztfttr( 'no-transpose', 'lower', 1, ARF, 1, 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=1 conjugate-transpose', function t() {
	const tc = n1_c;
	const ARF = new Complex128Array( [ 42.0, 7.0 ] );
	const A = new Complex128Array( 1 );
	const info = ztfttr( 'conjugate-transpose', 'lower', 1, ARF, 1, 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=5, TRANSR=no-transpose, UPLO=lower (odd, normal, lower)', function t() {
	const tc = n5_n_l;
	const N = tc.n;
	const NT = N * ( N + 1 ) / 2;
	const ARF = new Complex128Array( tc.ARF );
	const A = new Complex128Array( N * N );
	const info = ztfttr( 'no-transpose', 'lower', N, ARF, 1, 0, A, 1, N, 0 );
	assert.equal( info, tc.info );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=5, TRANSR=no-transpose, UPLO=upper (odd, normal, upper)', function t() {
	const tc = n5_n_u;
	const N = tc.n;
	const ARF = new Complex128Array( tc.ARF );
	const A = new Complex128Array( N * N );
	const info = ztfttr( 'no-transpose', 'upper', N, ARF, 1, 0, A, 1, N, 0 );
	assert.equal( info, tc.info );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=5, TRANSR=conjugate-transpose, UPLO=lower (odd, conj-trans, lower)', function t() {
	const tc = n5_c_l;
	const N = tc.n;
	const ARF = new Complex128Array( tc.ARF );
	const A = new Complex128Array( N * N );
	const info = ztfttr( 'conjugate-transpose', 'lower', N, ARF, 1, 0, A, 1, N, 0 );
	assert.equal( info, tc.info );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=5, TRANSR=conjugate-transpose, UPLO=upper (odd, conj-trans, upper)', function t() {
	const tc = n5_c_u;
	const N = tc.n;
	const ARF = new Complex128Array( tc.ARF );
	const A = new Complex128Array( N * N );
	const info = ztfttr( 'conjugate-transpose', 'upper', N, ARF, 1, 0, A, 1, N, 0 );
	assert.equal( info, tc.info );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=6, TRANSR=no-transpose, UPLO=lower (even, normal, lower)', function t() {
	const tc = n6_n_l;
	const N = tc.n;
	const ARF = new Complex128Array( tc.ARF );
	const A = new Complex128Array( N * N );
	const info = ztfttr( 'no-transpose', 'lower', N, ARF, 1, 0, A, 1, N, 0 );
	assert.equal( info, tc.info );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=6, TRANSR=no-transpose, UPLO=upper (even, normal, upper)', function t() {
	const tc = n6_n_u;
	const N = tc.n;
	const ARF = new Complex128Array( tc.ARF );
	const A = new Complex128Array( N * N );
	const info = ztfttr( 'no-transpose', 'upper', N, ARF, 1, 0, A, 1, N, 0 );
	assert.equal( info, tc.info );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=6, TRANSR=conjugate-transpose, UPLO=lower (even, conj-trans, lower)', function t() {
	const tc = n6_c_l;
	const N = tc.n;
	const ARF = new Complex128Array( tc.ARF );
	const A = new Complex128Array( N * N );
	const info = ztfttr( 'conjugate-transpose', 'lower', N, ARF, 1, 0, A, 1, N, 0 );
	assert.equal( info, tc.info );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=6, TRANSR=conjugate-transpose, UPLO=upper (even, conj-trans, upper)', function t() {
	const tc = n6_c_u;
	const N = tc.n;
	const ARF = new Complex128Array( tc.ARF );
	const A = new Complex128Array( N * N );
	const info = ztfttr( 'conjugate-transpose', 'upper', N, ARF, 1, 0, A, 1, N, 0 );
	assert.equal( info, tc.info );
	const Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});
