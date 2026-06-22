// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrttf from './../lib/ndarray.js';

// FIXTURES //

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
import n7_n_l from './fixtures/n7_n_l.json' with { type: 'json' };
import n7_n_u from './fixtures/n7_n_u.json' with { type: 'json' };
import n7_c_l from './fixtures/n7_c_l.json' with { type: 'json' };
import n7_c_u from './fixtures/n7_c_u.json' with { type: 'json' };
import n8_n_l from './fixtures/n8_n_l.json' with { type: 'json' };
import n8_n_u from './fixtures/n8_n_u.json' with { type: 'json' };
import n8_c_l from './fixtures/n8_c_l.json' with { type: 'json' };
import n8_c_u from './fixtures/n8_c_u.json' with { type: 'json' };

// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (actual=' + actual.length + ', expected=' + expected.length + ')' );
	for ( i = 0; i < expected.length; i += 1 ) {
		denom = Math.max( Math.abs( expected[ i ] ), 1.0 );
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / denom;
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] + ' (relErr=' + relErr + ')' );
	}
}

// TESTS //

test( 'ztrttf is a function', function t() {
	assert.equal( typeof ztrttf, 'function' );
});

test( 'ztrttf: N=0 quick return', function t() {
	var ARF;
	var A;

	A = new Complex128Array( 1 );
	ARF = new Complex128Array( 1 );
	assert.equal( ztrttf( 'no-transpose', 'lower', 0, A, 1, 1, 0, 1, ARF, 1, 0 ), 0 );
});

test( 'ztrttf: N=1, TRANSR=no-transpose (copies element)', function t() {
	var tc = n1_n;
	var ARF;
	var arv;
	var A;

	A = new Complex128Array( [ 3.0, 4.0 ] );
	ARF = new Complex128Array( 1 );
	assert.equal( ztrttf( 'no-transpose', 'lower', 1, A, 1, 1, 0, 1, ARF, 1, 0 ), 0 );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=1, TRANSR=conjugate-transpose (conjugates element)', function t() {
	var tc = n1_c;
	var ARF;
	var arv;
	var A;

	A = new Complex128Array( [ 3.0, 4.0 ] );
	ARF = new Complex128Array( 1 );
	assert.equal( ztrttf( 'conjugate-transpose', 'lower', 1, A, 1, 1, 0, 1, ARF, 1, 0 ), 0 );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=5, TRANSR=N, UPLO=L (odd, normal, lower)', function t() {
	var tc = n5_n_l;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'no-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=5, TRANSR=N, UPLO=U (odd, normal, upper)', function t() {
	var tc = n5_n_u;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'no-transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=5, TRANSR=C, UPLO=L (odd, conj-transpose, lower)', function t() {
	var tc = n5_c_l;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'conjugate-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=5, TRANSR=C, UPLO=U (odd, conj-transpose, upper)', function t() {
	var tc = n5_c_u;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'conjugate-transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=6, TRANSR=N, UPLO=L (even, normal, lower)', function t() {
	var tc = n6_n_l;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'no-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=6, TRANSR=N, UPLO=U (even, normal, upper)', function t() {
	var tc = n6_n_u;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'no-transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=6, TRANSR=C, UPLO=L (even, conj-transpose, lower)', function t() {
	var tc = n6_c_l;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'conjugate-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=6, TRANSR=C, UPLO=U (even, conj-transpose, upper)', function t() {
	var tc = n6_c_u;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'conjugate-transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=7, TRANSR=N, UPLO=L (odd, normal, lower)', function t() {
	var tc = n7_n_l;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'no-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=7, TRANSR=N, UPLO=U (odd, normal, upper)', function t() {
	var tc = n7_n_u;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'no-transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=7, TRANSR=C, UPLO=L (odd, conj-transpose, lower)', function t() {
	var tc = n7_c_l;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'conjugate-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=7, TRANSR=C, UPLO=U (odd, conj-transpose, upper)', function t() {
	var tc = n7_c_u;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'conjugate-transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=8, TRANSR=N, UPLO=L (even, normal, lower)', function t() {
	var tc = n8_n_l;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'no-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=8, TRANSR=N, UPLO=U (even, normal, upper)', function t() {
	var tc = n8_n_u;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'no-transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=8, TRANSR=C, UPLO=L (even, conj-transpose, lower)', function t() {
	var tc = n8_c_l;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'conjugate-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});

test( 'ztrttf: N=8, TRANSR=C, UPLO=U (even, conj-transpose, upper)', function t() {
	var tc = n8_c_u;
	var info;
	var ARF;
	var arv;
	var A;
	var N;

	N = tc.n;
	A = new Complex128Array( tc.A );
	ARF = new Complex128Array( N * ( N + 1 ) / 2 );
	info = ztrttf( 'conjugate-transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, tc.info );
	arv = reinterpret( ARF, 0 );
	assertArrayClose( Array.from( arv ), tc.ARF, 1e-14, 'ARF' );
});
