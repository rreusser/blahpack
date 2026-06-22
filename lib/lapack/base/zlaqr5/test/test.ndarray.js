/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr5 from './../lib/ndarray.js';

// FIXTURES //

import _6x6_2shifts from './fixtures/6x6_2shifts.json' with { type: 'json' };
import _8x8_4shifts from './fixtures/8x8_4shifts.json' with { type: 'json' };
import _10x10_6shifts from './fixtures/10x10_6shifts.json' with { type: 'json' };
import _8x8_4shifts_no_z from './fixtures/8x8_4shifts_no_z.json' with { type: 'json' };
import _6x6_partial_sweep from './fixtures/6x6_partial_sweep.json' with { type: 'json' };

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

function getFlat( m, N ) {
	return Array.from( reinterpret( m.data, 0 ) );
}

// TESTS //

test( 'zlaqr5: main export is a function', function t() {
	assert.strictEqual( typeof zlaqr5, 'function' );
});

test( 'zlaqr5: 6x6 with 2 shifts', function t() {
	var tc = _6x6_2shifts;
	var n = 6;
	var nshfts = 2;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 3 ); // V is 3 x nshfts/2
	var Um;
	var WVm;
	var WHm;
	var S = new Complex128Array( nshfts );
	var Sv;
	var nu;
	var i;

	// Build H
	mset( Hm, n, 0, 0, 5.0, 1.0 );
	mset( Hm, n, 0, 1, 2.0, -0.5 );
	mset( Hm, n, 0, 2, 1.0, 0.0 );
	mset( Hm, n, 0, 3, 0.5, 0.2 );
	mset( Hm, n, 0, 4, 0.25, 0.0 );
	mset( Hm, n, 0, 5, 0.1, -0.1 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 4.0, -1.0 );
	mset( Hm, n, 1, 2, 1.5, 0.5 );
	mset( Hm, n, 1, 3, 0.5, 0.0 );
	mset( Hm, n, 1, 4, 0.3, 0.1 );
	mset( Hm, n, 1, 5, 0.15, 0.0 );
	mset( Hm, n, 2, 1, 0.8, 0.2 );
	mset( Hm, n, 2, 2, 3.0, 0.5 );
	mset( Hm, n, 2, 3, 1.0, -0.5 );
	mset( Hm, n, 2, 4, 0.5, 0.0 );
	mset( Hm, n, 2, 5, 0.25, 0.1 );
	mset( Hm, n, 3, 2, 0.6, -0.1 );
	mset( Hm, n, 3, 3, 2.5, -0.5 );
	mset( Hm, n, 3, 4, 1.0, 0.5 );
	mset( Hm, n, 3, 5, 0.5, 0.0 );
	mset( Hm, n, 4, 3, 0.4, 0.15 );
	mset( Hm, n, 4, 4, 2.0, 0.0 );
	mset( Hm, n, 4, 5, 1.0, -0.5 );
	mset( Hm, n, 5, 4, 0.3, -0.1 );
	mset( Hm, n, 5, 5, 1.5, 1.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 3.0; Sv[ 1 ] = 1.0;
	Sv[ 2 ] = 2.0; Sv[ 3 ] = -0.5;

	nu = 2 * nshfts + 1;
	Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 0, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	assertArrayClose( getFlat( Hm, n ), tc.H, 1e-12, 'H' );
	assertArrayClose( getFlat( Zm, n ), tc.Z, 1e-12, 'Z' );
});

test( 'zlaqr5: 8x8 with 4 shifts', function t() {
	var tc = _8x8_4shifts;
	var n = 8;
	var nshfts = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 3 );
	var Um;
	var WVm;
	var WHm;
	var S = new Complex128Array( nshfts );
	var Sv;
	var nu;
	var i;

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

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 4.5; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 3.5; Sv[ 3 ] = -0.5;
	Sv[ 4 ] = 2.5; Sv[ 5 ] = 1.0;
	Sv[ 6 ] = 1.5; Sv[ 7 ] = -1.0;

	nu = 2 * nshfts + 1;
	Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 0, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	assertArrayClose( getFlat( Hm, n ), tc.H, 1e-12, 'H' );
	assertArrayClose( getFlat( Zm, n ), tc.Z, 1e-12, 'Z' );
});

test( 'zlaqr5: 10x10 with 6 shifts', function t() {
	var tc = _10x10_6shifts;
	var n = 10;
	var nshfts = 6;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 3 );
	var Um;
	var WVm;
	var WHm;
	var S = new Complex128Array( nshfts );
	var Sv;
	var nu;
	var i;
	var j;

	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( n - i ) * 3.0, ( i + 1 ) * 0.1 );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 0.5, 0.1 * Math.pow( -1, i + 1 ) );
		}
		for ( j = i + 1; j < Math.min( i + 3, n ); j++ ) {
			mset( Hm, n, i, j, 0.3 / ( j - i ), 0.05 * Math.pow( -1, j + 1 ) );
		}
	}

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 5.0; Sv[ 1 ] = 0.3;
	Sv[ 2 ] = 4.0; Sv[ 3 ] = -0.2;
	Sv[ 4 ] = 3.0; Sv[ 5 ] = 0.5;
	Sv[ 6 ] = 2.0; Sv[ 7 ] = -0.4;
	Sv[ 8 ] = 1.5; Sv[ 9 ] = 0.1;
	Sv[ 10 ] = 1.0; Sv[ 11 ] = -0.3;

	nu = 2 * nshfts + 1;
	Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 0, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	assertArrayClose( getFlat( Hm, n ), tc.H, 1e-10, 'H' );
	assertArrayClose( getFlat( Zm, n ), tc.Z, 1e-10, 'Z' );
});

test( 'zlaqr5: 8x8 with 4 shifts, no Z (wantz=false)', function t() {
	var tc = _8x8_4shifts_no_z;
	var n = 8;
	var nshfts = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 3 );
	var Um;
	var WVm;
	var WHm;
	var S = new Complex128Array( nshfts );
	var Sv;
	var nu;

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

	Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 4.5; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 3.5; Sv[ 3 ] = -0.5;
	Sv[ 4 ] = 2.5; Sv[ 5 ] = 1.0;
	Sv[ 6 ] = 1.5; Sv[ 7 ] = -1.0;

	nu = 2 * nshfts + 1;
	Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, false, 0, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	assertArrayClose( getFlat( Hm, n ), tc.H, 1e-12, 'H' );
});

test( 'zlaqr5: quick return for nshfts < 2', function t() {
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var S = new Complex128Array( 1 );
	var Vm = makeMatrix( 3 );
	var Um = makeMatrix( 3 );
	var WVm = { data: new Complex128Array( n * 3 ), s1: 1, s2: n, offset: 0 };
	var WHm = { data: new Complex128Array( 3 * n ), s1: 1, s2: 3, offset: 0 };
	var Hv;

	mset( Hm, n, 0, 0, 10.0, 0.0 );

	zlaqr5( true, true, 0, n, 1, n, 1,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	Hv = reinterpret( Hm.data, 0 );
	assert.equal( Hv[ 0 ], 10.0, 'H unchanged after quick return' );
});

test( 'zlaqr5: quick return for ktop >= kbot', function t() {
	var n = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var S = new Complex128Array( 2 );
	var Vm = makeMatrix( 3 );
	var Um = makeMatrix( 5 );
	var WVm = { data: new Complex128Array( n * 5 ), s1: 1, s2: n, offset: 0 };
	var WHm = { data: new Complex128Array( 5 * n ), s1: 1, s2: 5, offset: 0 };
	var Hv;

	mset( Hm, n, 0, 0, 10.0, 0.0 );

	zlaqr5( true, true, 0, n, 3, 3, 2,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	Hv = reinterpret( Hm.data, 0 );
	assert.equal( Hv[ 0 ], 10.0, 'H unchanged after quick return' );
});

test( 'zlaqr5: 8x8 with 4 shifts kacc22=1 (accum=true, U accumulator)', function t() {
	var n = 8;
	var nshfts = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 3 );
	var Um;
	var WVm;
	var WHm;
	var S = new Complex128Array( nshfts );
	var Sv;
	var nu;
	var i;
	var Hv;
	var Hbefore;

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

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 4.5; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 3.5; Sv[ 3 ] = -0.5;
	Sv[ 4 ] = 2.5; Sv[ 5 ] = 1.0;
	Sv[ 6 ] = 1.5; Sv[ 7 ] = -1.0;

	nu = 2 * nshfts + 1;
	Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	Hbefore = getFlat( Hm, n ).slice();

	zlaqr5( true, true, 1, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	// H must change (sweep applied)
	Hv = getFlat( Hm, n );
	var changed = false;
	for ( i = 0; i < Hv.length; i++ ) {
		if ( Math.abs( Hv[ i ] - Hbefore[ i ] ) > 1e-12 ) {
			changed = true;
			break;
		}
	}
	assert.ok( changed, 'H modified by sweep' );
});

test( 'zlaqr5: 8x8 with 4 shifts kacc22=2 (accum + 2x2 block updates)', function t() {
	var n = 8;
	var nshfts = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 3 );
	var Um;
	var WVm;
	var WHm;
	var S = new Complex128Array( nshfts );
	var Sv;
	var nu;
	var i;

	mset( Hm, n, 0, 0, 8.0, 0.5 );
	mset( Hm, n, 0, 1, 1.0, -0.5 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 7.0, -0.5 );
	mset( Hm, n, 1, 2, 1.0, 0.5 );
	mset( Hm, n, 2, 1, 0.8, 0.1 );
	mset( Hm, n, 2, 2, 6.0, 1.0 );
	mset( Hm, n, 2, 3, 1.0, -0.3 );
	mset( Hm, n, 3, 2, 0.7, -0.2 );
	mset( Hm, n, 3, 3, 5.0, -1.0 );
	mset( Hm, n, 3, 4, 1.0, 0.5 );
	mset( Hm, n, 4, 3, 0.6, 0.1 );
	mset( Hm, n, 4, 4, 4.0, 0.0 );
	mset( Hm, n, 4, 5, 1.0, -0.5 );
	mset( Hm, n, 5, 4, 0.5, -0.1 );
	mset( Hm, n, 5, 5, 3.0, 0.5 );
	mset( Hm, n, 5, 6, 1.0, 0.5 );
	mset( Hm, n, 6, 5, 0.4, 0.05 );
	mset( Hm, n, 6, 6, 2.0, -0.5 );
	mset( Hm, n, 6, 7, 1.0, -0.5 );
	mset( Hm, n, 7, 6, 0.3, -0.1 );
	mset( Hm, n, 7, 7, 1.0, 1.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 4.5; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 3.5; Sv[ 3 ] = -0.5;
	Sv[ 4 ] = 2.5; Sv[ 5 ] = 1.0;
	Sv[ 6 ] = 1.5; Sv[ 7 ] = -1.0;

	nu = 2 * nshfts + 1;
	Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 2, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);
	// kacc22=2 should still produce a result without errors
	assert.ok( true, 'completed without error' );
});

test( 'zlaqr5: 8x8 kacc22=1 wantt=false (jbot=kbot path)', function t() {
	var n = 8;
	var nshfts = 4;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 3 );
	var Um;
	var WVm;
	var WHm;
	var S = new Complex128Array( nshfts );
	var Sv;
	var nu;
	var i;

	mset( Hm, n, 0, 0, 8.0, 0.5 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 7.0, -0.5 );
	mset( Hm, n, 2, 1, 0.8, 0.1 );
	mset( Hm, n, 2, 2, 6.0, 1.0 );
	mset( Hm, n, 3, 2, 0.7, -0.2 );
	mset( Hm, n, 3, 3, 5.0, -1.0 );
	mset( Hm, n, 4, 3, 0.6, 0.1 );
	mset( Hm, n, 4, 4, 4.0, 0.0 );
	mset( Hm, n, 5, 4, 0.5, -0.1 );
	mset( Hm, n, 5, 5, 3.0, 0.5 );
	mset( Hm, n, 6, 5, 0.4, 0.05 );
	mset( Hm, n, 6, 6, 2.0, -0.5 );
	mset( Hm, n, 7, 6, 0.3, -0.1 );
	mset( Hm, n, 7, 7, 1.0, 1.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 4.5; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 3.5; Sv[ 3 ] = -0.5;
	Sv[ 4 ] = 2.5; Sv[ 5 ] = 1.0;
	Sv[ 6 ] = 1.5; Sv[ 7 ] = -1.0;

	nu = 2 * nshfts + 1;
	Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	// wantt=false, kacc22=1
	zlaqr5( false, true, 1, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);
	assert.ok( true, 'completed' );
});

test( 'zlaqr5: 6x6 kacc22=0 wantt=false (jbot=kbot path no accum)', function t() {
	var n = 6;
	var nshfts = 2;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 3 );
	var Um;
	var WVm;
	var WHm;
	var S = new Complex128Array( nshfts );
	var Sv;
	var nu;
	var i;

	mset( Hm, n, 0, 0, 5.0, 1.0 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 4.0, -1.0 );
	mset( Hm, n, 2, 1, 0.8, 0.2 );
	mset( Hm, n, 2, 2, 3.0, 0.5 );
	mset( Hm, n, 3, 2, 0.6, -0.1 );
	mset( Hm, n, 3, 3, 2.5, -0.5 );
	mset( Hm, n, 4, 3, 0.4, 0.15 );
	mset( Hm, n, 4, 4, 2.0, 0.0 );
	mset( Hm, n, 5, 4, 0.3, -0.1 );
	mset( Hm, n, 5, 5, 1.5, 1.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 3.0; Sv[ 1 ] = 1.0;
	Sv[ 2 ] = 2.0; Sv[ 3 ] = -0.5;

	nu = 2 * nshfts + 1;
	Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( false, true, 0, n, 1, n, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);
	assert.ok( true, 'completed' );
});

test( 'zlaqr5: 6x6 nshfts=2, ktop=2, kbot=6 partial sweep', function t() {
	// Tests partial sweep with subrange [ktop, kbot]
	var n = 6;
	var nshfts = 2;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 3 );
	var Um;
	var WVm;
	var WHm;
	var S = new Complex128Array( nshfts );
	var Sv;
	var nu;
	var i;

	mset( Hm, n, 0, 0, 10.0, 0.0 );
	mset( Hm, n, 1, 1, 4.0, 0.5 );
	mset( Hm, n, 2, 1, 1.0, 0.0 );
	mset( Hm, n, 2, 2, 3.5, 0.0 );
	mset( Hm, n, 3, 2, 0.5, 0.0 );
	mset( Hm, n, 3, 3, 3.0, 0.0 );
	mset( Hm, n, 4, 3, 0.4, 0.0 );
	mset( Hm, n, 4, 4, 2.5, 0.0 );
	mset( Hm, n, 5, 4, 0.3, 0.0 );
	mset( Hm, n, 5, 5, 2.0, 0.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 3.0; Sv[ 1 ] = 0.0;
	Sv[ 2 ] = 2.5; Sv[ 3 ] = 0.0;

	nu = 2 * nshfts + 1;
	Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 0, n, 2, 6, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);
	assert.ok( true, 'completed' );
});

test( 'zlaqr5: throws RangeError for negative N', function t() {
	var S = new Complex128Array( 2 );
	var Hm = makeMatrix( 1 );
	var Zm = makeMatrix( 1 );
	var Vm = makeMatrix( 3 );
	var Um = makeMatrix( 5 );
	var WVm = { data: new Complex128Array( 5 ), s1: 1, s2: 1, offset: 0 };
	var WHm = { data: new Complex128Array( 5 ), s1: 1, s2: 5, offset: 0 };
	assert.throws( function throws() {
		zlaqr5( true, true, 0, -1, 1, 1, 2,
			S, 1, 0,
			Hm.data, Hm.s1, Hm.s2, Hm.offset,
			1, 1,
			Zm.data, Zm.s1, Zm.s2, Zm.offset,
			Vm.data, Vm.s1, Vm.s2, Vm.offset,
			Um.data, Um.s1, Um.s2, Um.offset,
			1,
			WVm.data, WVm.s1, WVm.s2, WVm.offset,
			1,
			WHm.data, WHm.s1, WHm.s2, WHm.offset
		);
	}, RangeError );
});

test( 'zlaqr5: 6x6 partial sweep (ktop=2, kbot=5)', function t() {
	var tc = _6x6_partial_sweep;
	var n = 6;
	var nshfts = 2;
	var Hm = makeMatrix( n );
	var Zm = makeMatrix( n );
	var Vm = makeMatrix( 3 );
	var Um;
	var WVm;
	var WHm;
	var S = new Complex128Array( nshfts );
	var Sv;
	var nu;
	var i;

	mset( Hm, n, 0, 0, 10.0, 0.0 );
	mset( Hm, n, 0, 1, 1.0, 0.5 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 1, 1, 5.0, 1.0 );
	mset( Hm, n, 1, 2, 2.0, -0.5 );
	mset( Hm, n, 1, 3, 1.0, 0.0 );
	mset( Hm, n, 1, 4, 0.5, 0.2 );
	mset( Hm, n, 2, 1, 1.0, 0.0 );
	mset( Hm, n, 2, 2, 4.0, -1.0 );
	mset( Hm, n, 2, 3, 1.5, 0.5 );
	mset( Hm, n, 2, 4, 0.5, 0.0 );
	mset( Hm, n, 3, 2, 0.8, 0.2 );
	mset( Hm, n, 3, 3, 3.0, 0.5 );
	mset( Hm, n, 3, 4, 1.0, -0.5 );
	mset( Hm, n, 4, 3, 0.6, -0.1 );
	mset( Hm, n, 4, 4, 2.0, 0.0 );
	mset( Hm, n, 4, 5, 0.5, 0.5 );
	mset( Hm, n, 5, 5, -1.0, 2.0 );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	Sv = reinterpret( S, 0 );
	Sv[ 0 ] = 3.0; Sv[ 1 ] = 0.5;
	Sv[ 2 ] = 2.5; Sv[ 3 ] = -0.5;

	nu = 2 * nshfts + 1;
	Um = { data: new Complex128Array( nu * nu ), s1: 1, s2: nu, offset: 0 };
	WVm = { data: new Complex128Array( n * nu ), s1: 1, s2: n, offset: 0 };
	WHm = { data: new Complex128Array( nu * n ), s1: 1, s2: nu, offset: 0 };

	zlaqr5( true, true, 0, n, 2, 5, nshfts,
		S, 1, 0,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		Vm.data, Vm.s1, Vm.s2, Vm.offset,
		Um.data, Um.s1, Um.s2, Um.offset,
		n,
		WVm.data, WVm.s1, WVm.s2, WVm.offset,
		n,
		WHm.data, WHm.s1, WHm.s2, WHm.offset
	);

	assertArrayClose( getFlat( Hm, n ), tc.H, 1e-12, 'H' );
	assertArrayClose( getFlat( Zm, n ), tc.Z, 1e-12, 'Z' );
});
