import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfg from './../lib/ndarray.js';

// Fixtures
import zlarfgBasicReal from './fixtures/zlarfg_basic_real.json' with { type: 'json' };
import zlarfgComplex from './fixtures/zlarfg_complex.json' with { type: 'json' };
import zlarfgNOne from './fixtures/zlarfg_n_one.json' with { type: 'json' };
import zlarfgXZeroAlphaComplex from './fixtures/zlarfg_x_zero_alpha_complex.json' with { type: 'json' };
import zlarfgStride2 from './fixtures/zlarfg_stride2.json' with { type: 'json' };
import zlarfgLarger from './fixtures/zlarfg_larger.json' with { type: 'json' };
import zlarfgRescaling from './fixtures/zlarfg_rescaling.json' with { type: 'json' };

function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1e-30 );
	assert.ok( relErr <= 1e-12, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, label ) {
	var i;
	assert.strictEqual( actual.length, expected.length, label + ' length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], label + '[' + i + ']' );
	}
}

test( 'zlarfg: basic real case', function t() {
	var tc = zlarfgBasicReal;
	var alpha = new Complex128Array( [ 3.0, 0.0 ] );
	var x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	var tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfg: complex case', function t() {
	var tc = zlarfgComplex;
	var alpha = new Complex128Array( [ 2.0, 1.0 ] );
	var x = new Complex128Array( [ 1.0, -1.0, 0.5, 0.5 ] );
	var tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfg: n=1 (no x vector)', function t() {
	var tc = zlarfgNOne;
	var alpha = new Complex128Array( [ 5.0, 3.0 ] );
	var x = new Complex128Array( 0 );
	var tau = new Complex128Array( 1 );

	zlarfg( 1, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
});

test( 'zlarfg: n=0 (quick return)', function t() {
	var alpha = new Complex128Array( [ 5.0, 3.0 ] );
	var tau = new Complex128Array( 1 );

	zlarfg( 0, alpha, 0, new Complex128Array( 0 ), 1, 0, tau, 0 );
	var tauv = reinterpret( tau, 0 );
	assert.strictEqual( tauv[ 0 ], 0.0 );
	assert.strictEqual( tauv[ 1 ], 0.0 );
});

test( 'zlarfg: x=0, alpha real => tau=0', function t() {
	var alpha = new Complex128Array( [ 4.0, 0.0 ] );
	var x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	var tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	var tauv = reinterpret( tau, 0 );
	assert.strictEqual( tauv[ 0 ], 0.0 );
	assert.strictEqual( tauv[ 1 ], 0.0 );
});

test( 'zlarfg: x=0, alpha complex => non-trivial', function t() {
	var tc = zlarfgXZeroAlphaComplex;
	var alpha = new Complex128Array( [ 4.0, 3.0 ] );
	var x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	var tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
});

test( 'zlarfg: stride=2', function t() {
	var tc = zlarfgStride2;
	var alpha = new Complex128Array( [ 2.0, -1.0 ] );
	var x = new Complex128Array( [ 1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0 ] );
	var tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 2, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfg: larger case n=5', function t() {
	var tc = zlarfgLarger;
	var alpha = new Complex128Array( [ 1.0, 1.0 ] );
	var x = new Complex128Array( [ 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ] );
	var tau = new Complex128Array( 1 );

	zlarfg( 5, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfg: very small values trigger rescaling loop', function t() {
	var tc = zlarfgRescaling;
	var alpha = new Complex128Array( [ 1e-310, 0.0 ] );
	var x = new Complex128Array( [ 1e-310, 0.0, 1e-310, 0.0 ] );
	var tau = new Complex128Array( 1 );

	zlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( Array.from( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( Array.from( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 'x' );
});
