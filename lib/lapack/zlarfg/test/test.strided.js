import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfg from './../lib/strided.js';
import wrapper from './../lib/zlarfg.js';

// Fixtures
import zlarfgBasicReal from './fixtures/zlarfg_basic_real.json' with { type: 'json' };
import zlarfgComplex from './fixtures/zlarfg_complex.json' with { type: 'json' };
import zlarfgNOne from './fixtures/zlarfg_n_one.json' with { type: 'json' };
import zlarfgXZeroAlphaComplex from './fixtures/zlarfg_x_zero_alpha_complex.json' with { type: 'json' };
import zlarfgStride2 from './fixtures/zlarfg_stride2.json' with { type: 'json' };
import zlarfgLarger from './fixtures/zlarfg_larger.json' with { type: 'json' };
import zlarfgRescaling from './fixtures/zlarfg_rescaling.json' with { type: 'json' };

function assertClose( actual, expected, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1e-30 );
	assert.ok( relErr <= 1e-12, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, label ) {
	let i;
	assert.strictEqual( actual.length, expected.length, label + ' length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], label + '[' + i + ']' );
	}
}

test( 'zlarfg: basic real case', function t() {
	const tc = zlarfgBasicReal;
	const alpha = new Complex128Array( [ 3.0, 0.0 ] );
	const x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	const tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfg: complex case', function t() {
	const tc = zlarfgComplex;
	const alpha = new Complex128Array( [ 2.0, 1.0 ] );
	const x = new Complex128Array( [ 1.0, -1.0, 0.5, 0.5 ] );
	const tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfg: n=1 (no x vector)', function t() {
	const tc = zlarfgNOne;
	const alpha = new Complex128Array( [ 5.0, 3.0 ] );
	const x = new Complex128Array( 0 );
	const tau = new Complex128Array( 1 );

	zlarfg( 1, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
});

test( 'zlarfg: n=0 (quick return)', function t() {
	const alpha = new Complex128Array( [ 5.0, 3.0 ] );
	const tau = new Complex128Array( 1 );

	zlarfg( 0, alpha, 0, new Complex128Array( 0 ), 1, 0, tau, 0 );
	const tauv = reinterpret( tau, 0 );
	assert.strictEqual( tauv[ 0 ], 0.0 );
	assert.strictEqual( tauv[ 1 ], 0.0 );
});

test( 'zlarfg: x=0, alpha real => tau=0', function t() {
	const alpha = new Complex128Array( [ 4.0, 0.0 ] );
	const x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	const tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	const tauv = reinterpret( tau, 0 );
	assert.strictEqual( tauv[ 0 ], 0.0 );
	assert.strictEqual( tauv[ 1 ], 0.0 );
});

test( 'zlarfg: x=0, alpha complex => non-trivial', function t() {
	const tc = zlarfgXZeroAlphaComplex;
	const alpha = new Complex128Array( [ 4.0, 3.0 ] );
	const x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	const tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
});

test( 'zlarfg: stride=2', function t() {
	const tc = zlarfgStride2;
	const alpha = new Complex128Array( [ 2.0, -1.0 ] );
	const x = new Complex128Array( [ 1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0 ] );
	const tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 2, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfg: larger case n=5', function t() {
	const tc = zlarfgLarger;
	const alpha = new Complex128Array( [ 1.0, 1.0 ] );
	const x = new Complex128Array( [ 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ] );
	const tau = new Complex128Array( 1 );

	zlarfg( 5, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfg: very small values trigger rescaling loop', function t() {
	const tc = zlarfgRescaling;
	const alpha = new Complex128Array( [ 1e-310, 0.0 ] );
	const x = new Complex128Array( [ 1e-310, 0.0, 1e-310, 0.0 ] );
	const tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'x' );
});

/**
* Asserts the defining property of a complex elementary reflector: with `v = [1; x]` and `H = I - tau*v*v^H`, `H^H * u = [beta; 0]`, and `|beta| = norm(u)`.
*
* @private
* @param {Array} u - original `[alpha; x]` as interleaved real/imaginary parts
* @param {Array} v - reflector vector `[1; x]` as interleaved real/imaginary parts
* @param {Array} tauv - `tau` as `[re, im]`
* @param {number} beta - returned (real) `beta`
* @param {number} tol - absolute tolerance relative to `norm(u)`
*/
function assertReflector( u, v, tauv, beta, tol ) {
	let nrm;
	let sr;
	let si;
	let tr;
	let ti;
	let wr;
	let wi;
	let i;

	// s = v^H * u
	sr = 0.0;
	si = 0.0;
	nrm = 0.0;
	for ( i = 0; i < u.length; i += 2 ) {
		sr += ( v[ i ] * u[ i ] ) + ( v[ i + 1 ] * u[ i + 1 ] );
		si += ( v[ i ] * u[ i + 1 ] ) - ( v[ i + 1 ] * u[ i ] );
		nrm += ( u[ i ] * u[ i ] ) + ( u[ i + 1 ] * u[ i + 1 ] );
	}
	nrm = Math.sqrt( nrm );

	// t = conj(tau) * s
	tr = ( tauv[ 0 ] * sr ) + ( tauv[ 1 ] * si );
	ti = ( tauv[ 0 ] * si ) - ( tauv[ 1 ] * sr );
	for ( i = 0; i < u.length; i += 2 ) {
		wr = u[ i ] - ( ( v[ i ] * tr ) - ( v[ i + 1 ] * ti ) );
		wi = u[ i + 1 ] - ( ( v[ i ] * ti ) + ( v[ i + 1 ] * tr ) );
		assert.ok( Math.abs( wr - ( ( i === 0 ) ? beta : 0.0 ) ) <= tol * nrm, 'H^H*u re[' + ( i / 2 ) + ']: ' + wr ); // eslint-disable-line max-len
		assert.ok( Math.abs( wi ) <= tol * nrm, 'H^H*u im[' + ( i / 2 ) + ']: ' + wi ); // eslint-disable-line max-len
	}
	assert.ok( Math.abs( Math.abs( beta ) - nrm ) <= tol * nrm, '|beta| = norm(u)' ); // eslint-disable-line max-len
}

test( 'zlarfg: zero real part of alpha (sign of zero alpha)', function t() {
	const alpha = new Complex128Array( [ 0.0, 1.0 ] );
	const x = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0 ] );
	const tau = new Complex128Array( 1 );
	let av;
	let xv;
	let tv;

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	av = Array.from( reinterpret( alpha, 0 ) );
	xv = Array.from( reinterpret( x, 0 ) );
	tv = Array.from( reinterpret( tau, 0 ) );

	// Reference ZLARFG (LAPACK 3.12.0, gfortran) output; SIGN(.,+0) is positive, so beta < 0:
	assertArrayClose( av, [ -2.64575131106459072, 0.0 ], 'alpha' );
	assertArrayClose( tv, [ 1.0, 3.77964473009227198e-1 ], 'tau' );
	assertArrayClose( xv, [ 3.30718913883073784e-1, -1.24999999999999972e-1, 7.86437827766147568e-1, 8.07189138830738395e-2 ], 'x' ); // eslint-disable-line max-len
	assertReflector( [ 0.0, 1.0, 1.0, 0.0, 2.0, 1.0 ], [ 1.0, 0.0 ].concat( xv ), tv, av[ 0 ], 1e-14 ); // eslint-disable-line max-len
});

test( 'zlarfg: tiny input with zero real part of alpha (scaling loop)', function t() {
	const SCALE = 1e300;
	const alpha = new Complex128Array( [ 0.0, 1e-300 ] );
	const x = new Complex128Array( [ 1e-300, 0.0, 2e-300, 1e-300 ] );
	const tau = new Complex128Array( 1 );
	const sAlpha = new Complex128Array( [ 0.0, 1.0 ] );
	const sx = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0 ] );
	const sTau = new Complex128Array( 1 );
	let av;
	let xv;
	let tv;

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	av = Array.from( reinterpret( alpha, 0 ) );
	xv = Array.from( reinterpret( x, 0 ) );
	tv = Array.from( reinterpret( tau, 0 ) );

	// Reference ZLARFG (LAPACK 3.12.0, gfortran) output:
	assertArrayClose( [ av[ 0 ] * SCALE, av[ 1 ] ], [ -2.64575131106459103, 0.0 ], 'alpha' ); // eslint-disable-line max-len
	assertArrayClose( tv, [ 1.0, 3.77964473009227198e-1 ], 'tau' );
	assertArrayClose( xv, [ 3.30718913883073784e-1, -1.24999999999999972e-1, 7.86437827766147568e-1, 8.07189138830738395e-2 ], 'x' ); // eslint-disable-line max-len

	// Same computation on inputs scaled into normal range:
	zlarfg( 3, sAlpha, 0, sx, 1, 0, sTau, 0 );
	assertArrayClose( [ av[ 0 ] * SCALE, av[ 1 ] ], Array.from( reinterpret( sAlpha, 0 ) ), 'alpha vs scaled' ); // eslint-disable-line max-len
	assertArrayClose( tv, Array.from( reinterpret( sTau, 0 ) ), 'tau vs scaled' );
	assertArrayClose( xv, Array.from( reinterpret( sx, 0 ) ), 'x vs scaled' );

	// H^H * u = [beta; 0] (u scaled by 1e300; H is scale-invariant):
	assertReflector( [ 0.0, 1.0, 1.0, 0.0, 2.0, 1.0 ], [ 1.0, 0.0 ].concat( xv ), tv, av[ 0 ] * SCALE, 1e-14 ); // eslint-disable-line max-len
});

test( 'zlarfg: N = 0 sets tau to 0, as the reference does (both interfaces)', function t() {
	// ZLARFG sets TAU = ZERO for N <= 0; strided.js used to return before
	// base.js, leaving a stale tau (ticket 0094 PR).
	const alpha = new Complex128Array( [ 3.0, 1.0 ] );
	const x = new Complex128Array( 0 );
	let tau = new Complex128Array( [ 7.0, -2.0 ] );
	zlarfg( 0, alpha, 0, x, 1, 0, tau, 0 );
	assert.deepStrictEqual( Array.from( reinterpret( tau, 0 ) ), [ 0.0, 0.0 ], 'strided' );
	assert.deepStrictEqual( Array.from( reinterpret( alpha, 0 ) ), [ 3.0, 1.0 ], 'alpha unchanged' );
	tau = new Complex128Array( [ 7.0, -2.0 ] );
	wrapper( 0, alpha, x, 1, tau );
	assert.deepStrictEqual( Array.from( reinterpret( tau, 0 ) ), [ 0.0, 0.0 ], 'wrapper' );
});
