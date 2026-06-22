

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
	var relErr;
	var i;
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
	var tc = n0;
	var ARF = new Complex128Array( 1 );
	var A = new Complex128Array( 1 );
	var info = ztfttr( 'no-transpose', 'lower', 0, ARF, 1, 0, A, 1, 1, 0, 1 );
	assert.equal( info, tc.info );
});

test( 'ztfttr: N=1 normal (no conjugation)', function t() {
	var tc = n1_n;
	var ARF = new Complex128Array( [ 42.0, 7.0 ] );
	var A = new Complex128Array( 1 );
	var Av;
	var info = ztfttr( 'no-transpose', 'lower', 1, ARF, 1, 0, A, 1, 1, 0, 1 );
	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=1 conjugate-transpose', function t() {
	var tc = n1_c;
	var ARF = new Complex128Array( [ 42.0, 7.0 ] );
	var A = new Complex128Array( 1 );
	var Av;
	var info = ztfttr( 'conjugate-transpose', 'lower', 1, ARF, 1, 0, A, 1, 1, 0, 1 );
	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=5, TRANSR=no-transpose, UPLO=lower (odd, normal, lower)', function t() {
	var tc = n5_n_l;
	var N = tc.n;
	var NT = N * ( N + 1 ) / 2;
	var ARF = new Complex128Array( tc.ARF );
	var A = new Complex128Array( N * N );
	var Av;
	var info = ztfttr( 'no-transpose', 'lower', N, ARF, 1, 0, A, 1, N, 0, N );
	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=5, TRANSR=no-transpose, UPLO=upper (odd, normal, upper)', function t() {
	var tc = n5_n_u;
	var N = tc.n;
	var ARF = new Complex128Array( tc.ARF );
	var A = new Complex128Array( N * N );
	var Av;
	var info = ztfttr( 'no-transpose', 'upper', N, ARF, 1, 0, A, 1, N, 0, N );
	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=5, TRANSR=conjugate-transpose, UPLO=lower (odd, conj-trans, lower)', function t() {
	var tc = n5_c_l;
	var N = tc.n;
	var ARF = new Complex128Array( tc.ARF );
	var A = new Complex128Array( N * N );
	var Av;
	var info = ztfttr( 'conjugate-transpose', 'lower', N, ARF, 1, 0, A, 1, N, 0, N );
	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=5, TRANSR=conjugate-transpose, UPLO=upper (odd, conj-trans, upper)', function t() {
	var tc = n5_c_u;
	var N = tc.n;
	var ARF = new Complex128Array( tc.ARF );
	var A = new Complex128Array( N * N );
	var Av;
	var info = ztfttr( 'conjugate-transpose', 'upper', N, ARF, 1, 0, A, 1, N, 0, N );
	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=6, TRANSR=no-transpose, UPLO=lower (even, normal, lower)', function t() {
	var tc = n6_n_l;
	var N = tc.n;
	var ARF = new Complex128Array( tc.ARF );
	var A = new Complex128Array( N * N );
	var Av;
	var info = ztfttr( 'no-transpose', 'lower', N, ARF, 1, 0, A, 1, N, 0, N );
	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=6, TRANSR=no-transpose, UPLO=upper (even, normal, upper)', function t() {
	var tc = n6_n_u;
	var N = tc.n;
	var ARF = new Complex128Array( tc.ARF );
	var A = new Complex128Array( N * N );
	var Av;
	var info = ztfttr( 'no-transpose', 'upper', N, ARF, 1, 0, A, 1, N, 0, N );
	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=6, TRANSR=conjugate-transpose, UPLO=lower (even, conj-trans, lower)', function t() {
	var tc = n6_c_l;
	var N = tc.n;
	var ARF = new Complex128Array( tc.ARF );
	var A = new Complex128Array( N * N );
	var Av;
	var info = ztfttr( 'conjugate-transpose', 'lower', N, ARF, 1, 0, A, 1, N, 0, N );
	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});

test( 'ztfttr: N=6, TRANSR=conjugate-transpose, UPLO=upper (even, conj-trans, upper)', function t() {
	var tc = n6_c_u;
	var N = tc.n;
	var ARF = new Complex128Array( tc.ARF );
	var A = new Complex128Array( N * N );
	var Av;
	var info = ztfttr( 'conjugate-transpose', 'upper', N, ARF, 1, 0, A, 1, N, 0, N );
	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
});
