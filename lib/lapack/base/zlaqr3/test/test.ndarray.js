// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr3 from './../lib/ndarray.js';

// FIXTURES //

import _8x8_nw3 from './fixtures/8x8_nw3.json' with { type: 'json' };
import _8x8_nw4_no_schur from './fixtures/8x8_nw4_no_schur.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
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
	var mv = reinterpret( m.data, 0 );
	var idx = ( m.offset + i * m.s1 + j * m.s2 ) * 2;
	mv[ idx ] = re;
	mv[ idx + 1 ] = im;
}

function getFlat( m ) {
	return Array.from( reinterpret( m.data, 0 ) );
}

function buildHess8( Hm ) {
	var n = 8;
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

test( 'zlaqr3: main export is a function', function t() {
	assert.strictEqual( typeof zlaqr3, 'function' );
});

test( 'zlaqr3: 8x8 with NW=3', function t() {
	var tc = _8x8_nw3;
	var n = 8;
	var nw = 3;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( nw );
	var Tm = makeMatrix( nw );
	var WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	var SH = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );
	var result;
	var i;

	buildHess8( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	result = zlaqr3( true, true, n, 1, 8, nw,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, 8,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		0, 0,
		SH, 1, 0,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		nw,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		WORK, 1, 0, n * n
	);

	assert.equal( result.ns, tc.ns );
	assert.equal( result.nd, tc.nd );
	assertArrayClose( getFlat( Hm ), tc.H, 1e-10, 'H' );
	assertArrayClose( getFlat( Zm ), tc.Z, 1e-10, 'Z' );
	assertArrayClose( Array.from( reinterpret( SH, 0 ) ).slice( 0, 2 * n ), tc.SH, 1e-10, 'SH' );
});

test( 'zlaqr3: 8x8 NW=4, no Schur form', function t() {
	var tc = _8x8_nw4_no_schur;
	var n = 8;
	var nw = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( nw );
	var Tm = makeMatrix( nw );
	var WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	var SH = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );
	var result;

	buildHess8( Hm );

	result = zlaqr3( false, false, n, 1, 8, nw,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, 8,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		0, 0,
		SH, 1, 0,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		nw,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		WORK, 1, 0, n * n
	);

	assert.equal( result.ns, tc.ns );
	assert.equal( result.nd, tc.nd );
	assertArrayClose( Array.from( reinterpret( SH, 0 ) ).slice( 0, 2 * n ), tc.SH, 1e-10, 'SH' );
});

test( 'zlaqr3: quick return for ktop > kbot', function t() {
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 2 );
	var Tm = makeMatrix( 2 );
	var WVm = { data: new Complex128Array( n * 2 ), s1: 1, s2: n, offset: 0 };
	var SH = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );
	var result;

	result = zlaqr3( true, true, n, 5, 3, 2,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		0, 0,
		SH, 1, 0,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		2,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		WORK, 1, 0, n * n
	);

	assert.equal( result.ns, 0, 'ns=0 for ktop > kbot' );
	assert.equal( result.nd, 0, 'nd=0 for ktop > kbot' );
});

test( 'zlaqr3: quick return for nw < 1', function t() {
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 1 );
	var Tm = makeMatrix( 1 );
	var WVm = { data: new Complex128Array( n ), s1: 1, s2: n, offset: 0 };
	var SH = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );
	var result;

	result = zlaqr3( true, true, n, 1, 4, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		0, 0,
		SH, 1, 0,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		1,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		WORK, 1, 0, n * n
	);

	assert.equal( result.ns, 0, 'ns=0 for nw=0' );
	assert.equal( result.nd, 0, 'nd=0 for nw=0' );
});

test( 'zlaqr3: workspace query (lwork=-1)', function t() {
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 2 );
	var Tm = makeMatrix( 2 );
	var WVm = { data: new Complex128Array( n * 2 ), s1: 1, s2: n, offset: 0 };
	var SH = new Complex128Array( n );
	var WORK = new Complex128Array( 1 );
	var result;

	result = zlaqr3( true, true, n, 1, 4, 2,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		0, 0,
		SH, 1, 0,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		2,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		WORK, 1, 0, -1
	);

	assert.equal( result.ns, 0, 'ns=0 for workspace query' );
	assert.equal( result.nd, 0, 'nd=0 for workspace query' );
});

test( 'zlaqr3: 1x1 deflation window with deflation', function t() {
	var n = 4;
	var nw = 1;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( nw );
	var Tm = makeMatrix( nw );
	var WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	var SH = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );
	var result;
	var i;

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
	mset( Hm, n, 3, 2, 1e-20, 0.0 );
	mset( Hm, n, 3, 3, 2.0, 0.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	result = zlaqr3( true, true, n, 1, 4, nw,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		0, 0,
		SH, 1, 0,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		nw,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		WORK, 1, 0, n * n
	);

	assert.equal( result.nd, 1, 'nd=1 for deflatable 1x1 window' );
	assert.equal( result.ns, 0, 'ns=0 when deflated' );
});

test( 'zlaqr3: 1x1 deflation window without deflation', function t() {
	var n = 4;
	var nw = 1;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( nw );
	var Tm = makeMatrix( nw );
	var WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	var SH = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );
	var result;
	var i;

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
	mset( Hm, n, 3, 2, 2.0, 0.0 );
	mset( Hm, n, 3, 3, 2.0, 0.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	result = zlaqr3( true, true, n, 1, 4, nw,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		0, 0,
		SH, 1, 0,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		nw,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		WORK, 1, 0, n * n
	);

	assert.equal( result.nd, 0, 'nd=0 for non-deflatable 1x1 window' );
	assert.equal( result.ns, 1, 'ns=1 when not deflated' );
});

test( 'zlaqr3: 8x8 NW=6, large deflation window', function t() {
	var n = 8;
	var nw = 6;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( nw );
	var Tm = makeMatrix( nw );
	var WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	var SH = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );
	var result;
	var i;

	buildHess8( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	result = zlaqr3( true, true, n, 1, 8, nw,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, 8,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		0, 0,
		SH, 1, 0,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		nw,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		WORK, 1, 0, n * n
	);

	assert.ok( result.ns >= 0, 'ns >= 0' );
	assert.ok( result.nd >= 0, 'nd >= 0' );
	assert.ok( result.ns + result.nd <= nw, 'ns + nd <= nw' );
});

test( 'zlaqr3: 8x8 NW=4 with partial deflation (ns<jw path)', function t() {
	var n = 8;
	var nw = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( nw );
	var Tm = makeMatrix( nw );
	var WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	var SH = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );
	var result;
	var i;
	var j;

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

	result = zlaqr3( true, true, n, 1, 8, nw,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, 8,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		0, 0,
		SH, 1, 0,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		nw,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		WORK, 1, 0, n * n
	);

	// Should have some deflation
	assert.ok( result.nd >= 1, 'at least 1 deflated eigenvalue' );
	assert.ok( result.ns < nw, 'ns < nw (partial deflation)' );
	assert.ok( result.ns + result.nd <= nw, 'ns + nd <= nw' );
});

test( 'zlaqr3: 8x8 with NW=4 and wantt=true', function t() {
	var n = 8;
	var nw = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( nw );
	var Tm = makeMatrix( nw );
	var WVm = { data: new Complex128Array( n * nw ), s1: 1, s2: n, offset: 0 };
	var SH = new Complex128Array( n );
	var WORK = new Complex128Array( n * n );
	var result;
	var i;

	buildHess8( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	result = zlaqr3( true, true, n, 1, 8, nw,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, 8,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		0, 0,
		SH, 1, 0,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		nw,
		Tm.data, Tm.s1, Tm.s2, Tm.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		WORK, 1, 0, n * n
	);

	assert.ok( result.ns >= 0, 'ns >= 0' );
	assert.ok( result.nd >= 0, 'nd >= 0' );
	assert.ok( result.ns + result.nd <= nw, 'ns + nd <= nw' );
});
