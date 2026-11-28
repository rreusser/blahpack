// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr2 from './../lib/strided.js';

// FIXTURES //

import _8x8_nw3 from './fixtures/8x8_nw3.json' with { type: 'json' };
import _8x8_nw4 from './fixtures/8x8_nw4.json' with { type: 'json' };
import _8x8_nw3_no_schur from './fixtures/8x8_nw3_no_schur.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function makeMatrix( N ) {
	return {
		data: new Complex128Array( N * N ),
		s1: 1,
		s2: N,
		offset: 0
	};
}

function mset( m, N, i, j, re, im ) {
	const mv = reinterpret( m.data, 0 );
	const idx = ( m.offset + i * m.s1 + j * m.s2 ) * 2;
	mv[ idx ] = re;
	mv[ idx + 1 ] = im;
}

function getFlat( m ) {
	return Array.from( reinterpret( m.data, 0 ) );
}

function buildHess8( Hm ) {
	const n = 8;
	mset( Hm, n, 0, 0, 8.0, 0.5 );
	mset( Hm, n, 0, 1, 1.0, -0.5 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 0, 3, 0.25, 0.1 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 7.0, -0.5 );
	mset( Hm, n, 1, 2, 1.0, 0.5 );
	mset( Hm, n, 1, 3, 0.5, 0.0 );
	mset( Hm, n, 1, 4, 0.25, 0.0 );
	mset( Hm, n, 2, 1, 0.8, 0.1 );
	mset( Hm, n, 2, 2, 6.0, 1.0 );
	mset( Hm, n, 2, 3, 1.0, -0.3 );
	mset( Hm, n, 2, 4, 0.5, 0.0 );
	mset( Hm, n, 2, 5, 0.2, 0.0 );
	mset( Hm, n, 3, 2, 0.7, -0.2 );
	mset( Hm, n, 3, 3, 5.0, -1.0 );
	mset( Hm, n, 3, 4, 1.0, 0.5 );
	mset( Hm, n, 3, 5, 0.4, 0.0 );
	mset( Hm, n, 3, 6, 0.1, 0.0 );
	mset( Hm, n, 4, 3, 0.6, 0.1 );
	mset( Hm, n, 4, 4, 4.0, 0.0 );
	mset( Hm, n, 4, 5, 1.0, -0.5 );
	mset( Hm, n, 4, 6, 0.3, 0.0 );
	mset( Hm, n, 4, 7, 0.1, 0.0 );
	mset( Hm, n, 5, 4, 0.5, -0.1 );
	mset( Hm, n, 5, 5, 3.0, 0.5 );
	mset( Hm, n, 5, 6, 1.0, 0.5 );
	mset( Hm, n, 5, 7, 0.2, 0.0 );
	mset( Hm, n, 6, 5, 0.4, 0.05 );
	mset( Hm, n, 6, 6, 2.0, -0.5 );
	mset( Hm, n, 6, 7, 1.0, -0.5 );
	mset( Hm, n, 7, 6, 0.3, -0.1 );
	mset( Hm, n, 7, 7, 1.0, 1.0 );
}

// TESTS //

test( 'zlaqr2: main export is a function', function t() {
	assert.strictEqual( typeof zlaqr2, 'function' );
});

test( 'zlaqr2: 8x8 with NW=3', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const tc = _8x8_nw3;
	const n = 8;
	const nw = 3;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( nw );
	const Tm = makeMatrix( nw );
	const WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	const SH = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	buildHess8( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr2( true, true, n, 1, 8, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, 8, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( ns[ 0 ], tc.ns );
	assert.equal( nd[ 0 ], tc.nd );
	assertArrayClose( getFlat( Hm ), tc.H, 1e-10, 'H' );
	assertArrayClose( getFlat( Zm ), tc.Z, 1e-10, 'Z' );
	assertArrayClose( Array.from( reinterpret( SH, 0 ) ).slice( 0, 2 * n ), tc.SH, 1e-10, 'SH' );
});

test( 'zlaqr2: 8x8 with NW=4', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const tc = _8x8_nw4;
	const n = 8;
	const nw = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( nw );
	const Tm = makeMatrix( nw );
	const WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	const SH = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	buildHess8( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr2( true, true, n, 1, 8, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, 8, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( ns[ 0 ], tc.ns );
	assert.equal( nd[ 0 ], tc.nd );
	assertArrayClose( getFlat( Hm ), tc.H, 1e-10, 'H' );
	assertArrayClose( getFlat( Zm ), tc.Z, 1e-10, 'Z' );
	assertArrayClose( Array.from( reinterpret( SH, 0 ) ).slice( 0, 2 * n ), tc.SH, 1e-10, 'SH' );
});

test( 'zlaqr2: 8x8 NW=3, no Schur form', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const tc = _8x8_nw3_no_schur;
	const n = 8;
	const nw = 3;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( nw );
	const Tm = makeMatrix( nw );
	const WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	const SH = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );

	buildHess8( Hm );

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr2( false, false, n, 1, 8, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, 8, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( ns[ 0 ], tc.ns );
	assert.equal( nd[ 0 ], tc.nd );
	assertArrayClose( Array.from( reinterpret( SH, 0 ) ).slice( 0, 2 * n ), tc.SH, 1e-10, 'SH' );
});

test( 'zlaqr2: quick return for ktop > kbot', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const n = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 2 );
	const Tm = makeMatrix( 2 );
	const WVm = { data: new Complex128Array( n * 2 ), s1: 1, s2: n, offset: 0 };
	const SH = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr2( true, true, n, 5, 3, 2, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, n, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, 2, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( ns[ 0 ], 0, 'ns=0 for ktop > kbot' );
	assert.equal( nd[ 0 ], 0, 'nd=0 for ktop > kbot' );
});

test( 'zlaqr2: quick return for nw < 1', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const n = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( 1 );
	const Tm = makeMatrix( 1 );
	const WVm = { data: new Complex128Array( n ), s1: 1, s2: n, offset: 0 };
	const SH = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr2( true, true, n, 1, 4, 0, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, n, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, 1, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( ns[ 0 ], 0, 'ns=0 for nw=0' );
	assert.equal( nd[ 0 ], 0, 'nd=0 for nw=0' );
});

test( 'zlaqr2: 1x1 deflation window with deflation', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const n = 4;
	const nw = 1;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( nw );
	const Tm = makeMatrix( nw );
	const WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	const SH = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	// Build 4x4 Hessenberg where the last eigenvalue is well-separated (deflatable)
	mset( Hm, n, 0, 0, 10.0, 0.0 );
	mset( Hm, n, 0, 1, 1.0, 0.0 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 0, 3, 0.2, 0.0 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 8.0, 0.0 );
	mset( Hm, n, 1, 2, 1.0, 0.0 );
	mset( Hm, n, 1, 3, 0.3, 0.0 );
	mset( Hm, n, 2, 1, 0.5, 0.0 );
	mset( Hm, n, 2, 2, 5.0, 0.0 );
	mset( Hm, n, 2, 3, 1.0, 0.0 );
	// H(4,3) is the subdiagonal entry controlling deflation of eigenvalue 4
	// Make it very small => deflation should occur
	mset( Hm, n, 3, 2, 1e-20, 0.0 );
	mset( Hm, n, 3, 3, 2.0, 0.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr2( true, true, n, 1, 4, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, n, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	// 1x1 window with tiny subdiagonal should deflate
	assert.equal( nd[ 0 ], 1, 'nd=1 for deflatable 1x1 window' );
	assert.equal( ns[ 0 ], 0, 'ns=0 when deflated' );
});

test( 'zlaqr2: 1x1 deflation window without deflation', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const n = 4;
	const nw = 1;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( nw );
	const Tm = makeMatrix( nw );
	const WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	const SH = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	// Build 4x4 Hessenberg where the last subdiagonal is large (not deflatable)
	mset( Hm, n, 0, 0, 10.0, 0.0 );
	mset( Hm, n, 0, 1, 1.0, 0.0 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 0, 3, 0.2, 0.0 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 8.0, 0.0 );
	mset( Hm, n, 1, 2, 1.0, 0.0 );
	mset( Hm, n, 1, 3, 0.3, 0.0 );
	mset( Hm, n, 2, 1, 0.5, 0.0 );
	mset( Hm, n, 2, 2, 5.0, 0.0 );
	mset( Hm, n, 2, 3, 1.0, 0.0 );
	// Large subdiagonal => no deflation
	mset( Hm, n, 3, 2, 2.0, 0.0 );
	mset( Hm, n, 3, 3, 2.0, 0.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr2( true, true, n, 1, 4, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, n, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	// 1x1 window with large subdiagonal should not deflate
	assert.equal( nd[ 0 ], 0, 'nd=0 for non-deflatable 1x1 window' );
	assert.equal( ns[ 0 ], 1, 'ns=1 when not deflated' );
});

test( 'zlaqr2: 8x8 NW=6, large deflation window', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const n = 8;
	const nw = 6;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( nw );
	const Tm = makeMatrix( nw );
	const WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	const SH = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	buildHess8( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr2( true, true, n, 1, 8, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, 8, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	// Just verify it returns without error and ns+nd make sense
	assert.ok( ns[ 0 ] >= 0, 'ns >= 0' );
	assert.ok( nd[ 0 ] >= 0, 'nd >= 0' );
	assert.ok( ns[ 0 ] + nd[ 0 ] <= nw, 'ns + nd <= nw' );
});

test( 'zlaqr2: 8x8 NW=4 with partial deflation (ns<jw path)', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const n = 8;
	const nw = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( nw );
	const Tm = makeMatrix( nw );
	const WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	const SH = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i, j;

	// Build matrix with tiny subdiagonal near bottom to encourage deflation
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( n - i ) * 10.0, 0.1 * i );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, ( i >= n - 2 ) ? 1e-15 : 0.5, 0.0 );
		}
		for ( j = i + 1; j < Math.min( i + 3, n ); j++ ) {
			mset( Hm, n, i, j, 0.2 / ( j - i ), 0.0 );
		}
	}

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr2( true, true, n, 1, 8, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, 8, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	// Should have some deflation
	assert.ok( nd[ 0 ] >= 1, 'at least 1 deflated eigenvalue' );
	assert.ok( ns[ 0 ] < nw, 'ns < nw (partial deflation)' );
	assert.ok( ns[ 0 ] + nd[ 0 ] <= nw, 'ns + nd <= nw' );
});

test( 'zlaqr2: kwtop === ktop (window starts at top)', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const n = 4;
	const nw = 4;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const Vm = makeMatrix( nw );
	const Tm = makeMatrix( nw );
	const WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	const SH = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	// 4x4 with nw=4, so kwtop = kbot - jw + 1 = 4 - 4 + 1 = 1 = ktop
	mset( Hm, n, 0, 0, 10.0, 0.5 );
	mset( Hm, n, 0, 1, 1.0, 0.0 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 0, 3, 0.2, 0.0 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 7.0, -0.3 );
	mset( Hm, n, 1, 2, 1.0, 0.0 );
	mset( Hm, n, 1, 3, 0.3, 0.0 );
	mset( Hm, n, 2, 1, 0.5, 0.0 );
	mset( Hm, n, 2, 2, 4.0, 0.2 );
	mset( Hm, n, 2, 3, 1.0, 0.0 );
	mset( Hm, n, 3, 2, 0.3, 0.0 );
	mset( Hm, n, 3, 3, 1.0, -0.1 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr2( true, true, n, 1, 4, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, n, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.ok( ns[ 0 ] >= 0, 'ns >= 0' );
	assert.ok( nd[ 0 ] >= 0, 'nd >= 0' );
});

test( 'zlaqr2: the reference minimum 2*JW suffices for a deflation window wider than 32, where ZGEHRD/ZUNMHR would block (ticket 0100)', function t() {
	const N = 60;
	const nw = 50;
	const H0 = new Float64Array( 2 * N * N );
	let seed = 7;
	let opt;
	let lo;
	let M;
	let a;
	let b;
	let zr;
	let zi;
	let hr;
	let hi;
	let i;
	let j;
	let k;
	function rnd() {
		seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
		return ( seed / 2147483648 ) - 0.5;
	}
	function run( lwork ) {
		const H = new Complex128Array( H0 );
		const Z = new Complex128Array( N * N );
		const zv = reinterpret( Z, 0 );
		const SH = new Complex128Array( N );
		const W = new Complex128Array( 3 * N * N );
		const ns = new Int32Array( 1 );
		const nd = new Int32Array( 1 );
		let q;
		for ( q = 0; q < N; q++ ) {
			zv[ 2 * ( q + ( q * N ) ) ] = 1.0;
		}
		zlaqr2( true, true, N, 1, N, nw, H, 1, N, 0, 1, N, Z, 1, N, 0, ns, nd, SH, 1, 0, W, 1, N, 0, N, W, 1, N, N * N, N, W, 1, N, 2 * N * N, new Complex128Array( lwork ), 1, 0 ); // eslint-disable-line max-len
		return {
			'ns': ns[ 0 ],
			'nd': nd[ 0 ],
			'H': reinterpret( H, 0 ),
			'Z': zv,
			'SH': reinterpret( SH, 0 )
		};
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j + 1, N - 1 ); i++ ) {
			H0[ 2 * ( i + ( j * N ) ) ] = rnd();
			H0[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = rnd();
		}
	}
	opt = run( ( 33 * nw ) + 4160 );
	lo = run( 2 * nw ); // on the old code this threw (minimum 33*JW + 2080)

	// More than 32 undeflated shifts, so ZGEHRD/ZUNMHR would take their blocked paths with room for them:
	assert.ok( opt.ns > 32, 'ns > 32 (got ' + opt.ns + ')' );
	assert.strictEqual( lo.ns, opt.ns, 'ns' );
	assert.strictEqual( lo.nd, opt.nd, 'nd' );
	for ( i = 0; i < 2 * N; i++ ) {
		assert.ok( Math.abs( lo.SH[ i ] - opt.SH[ i ] ) <= 1e-10, 'SH[' + i + ']' );
	}
	// Similarity with the minimum workspace: Z^H * H0 * Z = H (M = H0 * Z first).
	M = new Float64Array( 2 * N * N );
	for ( j = 0; j < N; j++ ) {
		for ( k = 0; k < N; k++ ) {
			zr = lo.Z[ 2 * ( k + ( j * N ) ) ];
			zi = lo.Z[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
			for ( i = 0; i < N; i++ ) {
				hr = H0[ 2 * ( i + ( k * N ) ) ];
				hi = H0[ ( 2 * ( i + ( k * N ) ) ) + 1 ];
				M[ 2 * ( i + ( j * N ) ) ] += ( hr * zr ) - ( hi * zi );
				M[ ( 2 * ( i + ( j * N ) ) ) + 1 ] += ( hr * zi ) + ( hi * zr );
			}
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			a = 0.0;
			b = 0.0;
			for ( k = 0; k < N; k++ ) {
				zr = lo.Z[ 2 * ( k + ( i * N ) ) ];
				zi = -lo.Z[ ( 2 * ( k + ( i * N ) ) ) + 1 ];
				hr = M[ 2 * ( k + ( j * N ) ) ];
				hi = M[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
				a += ( zr * hr ) - ( zi * hi );
				b += ( zr * hi ) + ( zi * hr );
			}
			assert.ok( Math.abs( a - lo.H[ 2 * ( i + ( j * N ) ) ] ) <= 1e-12 && Math.abs( b - lo.H[ ( 2 * ( i + ( j * N ) ) ) + 1 ] ) <= 1e-12, 'Z^H H0 Z (' + i + ',' + j + ')' );
		}
	}

	// One below the reference's minimum 2*JW throws:
	assert.throws( function throws() {
		run( ( 2 * nw ) - 1 );
	}, /WORK array must have at least 100 elements/ );
});
