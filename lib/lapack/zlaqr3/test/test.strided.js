// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr3 from './../lib/strided.js';

// FIXTURES //

import _8x8_nw3 from './fixtures/8x8_nw3.json' with { type: 'json' };
import _8x8_nw4_no_schur from './fixtures/8x8_nw4_no_schur.json' with { type: 'json' };

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

test( 'zlaqr3: main export is a function', function t() {
	assert.strictEqual( typeof zlaqr3, 'function' );
});

test( 'zlaqr3: 8x8 with NW=3', function t() {
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
	zlaqr3( true, true, n, 1, 8, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, 8, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( ns[ 0 ], tc.ns );
	assert.equal( nd[ 0 ], tc.nd );
	assertArrayClose( getFlat( Hm ), tc.H, 1e-10, 'H' );
	assertArrayClose( getFlat( Zm ), tc.Z, 1e-10, 'Z' );
	assertArrayClose( Array.from( reinterpret( SH, 0 ) ).slice( 0, 2 * n ), tc.SH, 1e-10, 'SH' );
});

test( 'zlaqr3: 8x8 NW=4, no Schur form', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const tc = _8x8_nw4_no_schur;
	const n = 8;
	const nw = 4;
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
	zlaqr3( false, false, n, 1, 8, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, 8, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( ns[ 0 ], tc.ns );
	assert.equal( nd[ 0 ], tc.nd );
	assertArrayClose( Array.from( reinterpret( SH, 0 ) ).slice( 0, 2 * n ), tc.SH, 1e-10, 'SH' );
});

test( 'zlaqr3: quick return for ktop > kbot', function t() {
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
	zlaqr3( true, true, n, 5, 3, 2, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, n, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, 2, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( ns[ 0 ], 0, 'ns=0 for ktop > kbot' );
	assert.equal( nd[ 0 ], 0, 'nd=0 for ktop > kbot' );
});

test( 'zlaqr3: quick return for nw < 1', function t() {
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
	zlaqr3( true, true, n, 1, 4, 0, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, n, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, 1, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( ns[ 0 ], 0, 'ns=0 for nw=0' );
	assert.equal( nd[ 0 ], 0, 'nd=0 for nw=0' );
});

test( 'zlaqr3: 1x1 deflation window with deflation', function t() {
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

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr3( true, true, n, 1, 4, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, n, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( nd[ 0 ], 1, 'nd=1 for deflatable 1x1 window' );
	assert.equal( ns[ 0 ], 0, 'ns=0 when deflated' );
});

test( 'zlaqr3: 1x1 deflation window without deflation', function t() {
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

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr3( true, true, n, 1, 4, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, n, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.equal( nd[ 0 ], 0, 'nd=0 for non-deflatable 1x1 window' );
	assert.equal( ns[ 0 ], 1, 'ns=1 when not deflated' );
});

test( 'zlaqr3: 8x8 NW=6, large deflation window', function t() {
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
	zlaqr3( true, true, n, 1, 8, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, 8, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.ok( ns[ 0 ] >= 0, 'ns >= 0' );
	assert.ok( nd[ 0 ] >= 0, 'nd >= 0' );
	assert.ok( ns[ 0 ] + nd[ 0 ] <= nw, 'ns + nd <= nw' );
});

test( 'zlaqr3: 8x8 NW=4 with partial deflation (ns<jw path)', function t() {
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
	zlaqr3( true, true, n, 1, 8, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, 8, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	// Should have some deflation
	assert.ok( nd[ 0 ] >= 1, 'at least 1 deflated eigenvalue' );
	assert.ok( ns[ 0 ] < nw, 'ns < nw (partial deflation)' );
	assert.ok( ns[ 0 ] + nd[ 0 ] <= nw, 'ns + nd <= nw' );
});

test( 'zlaqr3: 8x8 with NW=4 and wantt=true', function t() {
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
	let i;

	buildHess8( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr3( true, true, n, 1, 8, nw, Hm.data, Hm.s1, Hm.s2, Hm.offset, 1, 8, Zm.data, Zm.s1, Zm.s2, Zm.offset, ns, nd, SH, 1, 0, Vm.data, Vm.s1, Vm.s2, Vm.offset, nw, Tm.data, Tm.s1, Tm.s2, Tm.offset, n, WVm.data, WVm.s1, WVm.s2, WVm.offset, WORK, 1, 0 );

	assert.ok( ns[ 0 ] >= 0, 'ns >= 0' );
	assert.ok( nd[ 0 ] >= 0, 'nd >= 0' );
	assert.ok( ns[ 0 ] + nd[ 0 ] <= nw, 'ns + nd <= nw' );
});

// PROPERTY TESTS //

/**
* Returns an N-by-N complex upper Hessenberg matrix (column-major) with pseudo-random entries.
*
* @private
* @param {PositiveInteger} N - order
* @param {integer} seed - seed
* @returns {Complex128Array} matrix
*/
function randomHess( N, seed ) {
	const H = new Complex128Array( N * N );
	const hv = reinterpret( H, 0 );
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j + 1, N - 1 ); i++ ) {
			for ( k = 0; k < 2; k++ ) {
				seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
				hv[ ( 2 * ( i + ( j * N ) ) ) + k ] = ( seed / 2147483648 ) - 0.5;
			}
		}
	}
	return H;
}

/**
* Sets the (i,j) element (0-based) of a column-major N-by-N complex matrix.
*
* @private
* @param {Complex128Array} A - matrix
* @param {PositiveInteger} N - order
* @param {integer} i - row
* @param {integer} j - column
* @param {number} re - real part
* @param {number} im - imaginary part
*/
function setEl( A, N, i, j, re, im ) {
	const av = reinterpret( A, 0 );
	av[ 2 * ( i + ( j * N ) ) ] = re;
	av[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = im;
}

/**
* Runs zlaqr3 (column-major, Z = I on entry, ILOZ = 1, IHIZ = N) and checks that it applied a unitary similarity: Z unitary and Z * Hout * Z^H = Hin.
*
* @private
* @param {Complex128Array} Hin - input upper Hessenberg matrix
* @param {PositiveInteger} N - order
* @param {Object} opts - `wantt`, `ktop`, `kbot`, `nw`, and optionally `lwork` (default 10*N*N)
* @returns {Object} `ns`, `nd`, and the outputs `H`, `Z`, `SH`
*/
function runAndCheckSimilarity( Hin, N, opts ) {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const H = new Complex128Array( reinterpret( Hin, 0 ) );
	const Z = new Complex128Array( N * N );
	const SH = new Complex128Array( N );
	const hin = reinterpret( Hin, 0 );
	let anorm;
	let maxr;
	let rr;
	let ri;
	let hv;
	let zv;
	let pr;
	let pi;
	let i;
	let j;
	let k;
	let l;
	for ( i = 0; i < N; i++ ) {
		setEl( Z, N, i, i, 1.0, 0.0 );
	}
	zlaqr3( opts.wantt, true, N, opts.ktop, opts.kbot, opts.nw, H, 1, N, 0, 1, N, Z, 1, N, 0, ns, nd, SH, 1, 0, new Complex128Array( N * N ), 1, N, 0, N, new Complex128Array( N * N ), 1, N, 0, N, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( opts.lwork || ( 10 * N * N ) ), 1, 0 ); // eslint-disable-line max-len
	hv = reinterpret( H, 0 );
	zv = reinterpret( Z, 0 );
	anorm = 0.0;
	for ( i = 0; i < 2 * N * N; i++ ) {
		anorm = Math.max( anorm, Math.abs( hin[ i ] ) );
	}

	// Z^H * Z = I:
	maxr = 0.0;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			rr = ( i === j ) ? -1.0 : 0.0;
			ri = 0.0;
			for ( k = 0; k < N; k++ ) {
				rr += ( zv[ 2 * ( k + ( i * N ) ) ] * zv[ 2 * ( k + ( j * N ) ) ] ) + ( zv[ ( 2 * ( k + ( i * N ) ) ) + 1 ] * zv[ ( 2 * ( k + ( j * N ) ) ) + 1 ] ); // eslint-disable-line max-len
				ri += ( zv[ 2 * ( k + ( i * N ) ) ] * zv[ ( 2 * ( k + ( j * N ) ) ) + 1 ] ) - ( zv[ ( 2 * ( k + ( i * N ) ) ) + 1 ] * zv[ 2 * ( k + ( j * N ) ) ] ); // eslint-disable-line max-len
			}
			maxr = Math.max( maxr, Math.abs( rr ), Math.abs( ri ) );
		}
	}
	assert.ok( maxr <= 1e-13 * N, 'Z unitary (max residual ' + maxr + ')' );

	// Z * Hout * Z^H - Hin = 0:
	maxr = 0.0;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			rr = -hin[ 2 * ( i + ( j * N ) ) ];
			ri = -hin[ ( 2 * ( i + ( j * N ) ) ) + 1 ];
			for ( k = 0; k < N; k++ ) {
				// P = Z(i,k) * Hout(k,l), summed against conj( Z(j,l) ):
				for ( l = 0; l < N; l++ ) {
					pr = ( zv[ 2 * ( i + ( k * N ) ) ] * hv[ 2 * ( k + ( l * N ) ) ] ) - ( zv[ ( 2 * ( i + ( k * N ) ) ) + 1 ] * hv[ ( 2 * ( k + ( l * N ) ) ) + 1 ] ); // eslint-disable-line max-len
					pi = ( zv[ 2 * ( i + ( k * N ) ) ] * hv[ ( 2 * ( k + ( l * N ) ) ) + 1 ] ) + ( zv[ ( 2 * ( i + ( k * N ) ) ) + 1 ] * hv[ 2 * ( k + ( l * N ) ) ] ); // eslint-disable-line max-len
					rr += ( pr * zv[ 2 * ( j + ( l * N ) ) ] ) + ( pi * zv[ ( 2 * ( j + ( l * N ) ) ) + 1 ] );
					ri += ( pi * zv[ 2 * ( j + ( l * N ) ) ] ) - ( pr * zv[ ( 2 * ( j + ( l * N ) ) ) + 1 ] );
				}
			}
			maxr = Math.max( maxr, Math.abs( rr ), Math.abs( ri ) );
		}
	}
	assert.ok( maxr <= 1e-13 * N * Math.max( anorm, 1.0 ), 'Z * H * Z^H = H0 (max residual ' + maxr + ')' );

	// Hout stays upper Hessenberg:
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 2; i < N; i++ ) {
			assert.strictEqual( hv[ 2 * ( i + ( j * N ) ) ], 0.0, 'H(' + i + ',' + j + ') re' );
			assert.strictEqual( hv[ ( 2 * ( i + ( j * N ) ) ) + 1 ], 0.0, 'H(' + i + ',' + j + ') im' );
		}
	}
	assert.ok( ns[ 0 ] + nd[ 0 ] <= Math.min( opts.nw, opts.kbot - opts.ktop + 1 ), 'ns + nd <= jw' );
	return {
		'ns': ns[ 0 ],
		'nd': nd[ 0 ],
		'H': H,
		'Z': Z,
		'SH': SH
	};
}

test( 'zlaqr3: window covering the whole active block (KWTOP = KTOP, S = 0) deflates everything', function t() {
	const N = 6;
	const r = runAndCheckSimilarity( randomHess( N, 3 ), N, {
		'wantt': true,
		'ktop': 1,
		'kbot': N,
		'nw': N
	});

	// With S = 0 every eigenvalue of the window passes the deflation test:
	assert.strictEqual( r.ns, 0, 'ns' );
	assert.strictEqual( r.nd, N, 'nd' );
});

test( 'zlaqr3: negligible spike deflates the whole window (NS = 0 resets S), wantt = false', function t() {
	const N = 8;
	const H = randomHess( N, 5 );
	let r;
	setEl( H, N, 4, 3, 1e-20, 0.0 );
	r = runAndCheckSimilarity( H, N, {
		'wantt': false,
		'ktop': 1,
		'kbot': N,
		'nw': 4
	});
	assert.strictEqual( r.ns, 0, 'ns' );
	assert.strictEqual( r.nd, 4, 'nd' );

	// H(KWTOP,KWTOP-1) = S * conj( V(1,1) ) with S reset to zero (zlaqr3.f: IF( NS.EQ.0 ) S = ZERO):
	assert.ok( reinterpret( r.H, 0 )[ 2 * ( 4 + ( 3 * N ) ) ] === 0.0, 'spike re' );
	assert.ok( reinterpret( r.H, 0 )[ ( 2 * ( 4 + ( 3 * N ) ) ) + 1 ] === 0.0, 'spike im' );
});

test( 'zlaqr3: active block above the bottom of H updates the horizontal slab (wantt, KBOT < N)', function t() {
	const N = 8;
	const H = randomHess( N, 7 );
	let r;
	setEl( H, N, 6, 5, 0.0, 0.0 ); // H(KBOT+1,KBOT) = 0 delimits the active block
	setEl( H, N, 3, 2, 1e-20, 0.0 );
	r = runAndCheckSimilarity( H, N, {
		'wantt': true,
		'ktop': 1,
		'kbot': 6,
		'nw': 3
	});
	assert.strictEqual( r.ns, 0, 'ns' );
	assert.strictEqual( r.nd, 3, 'nd' );
});

test( 'zlaqr3: zero diagonal in the Schur form falls back to |S| in the deflation test', function t() {
	const N = 6;
	const H = new Complex128Array( N * N );
	let r;
	let i;
	let j;

	// Leading 3x3 block is nonzero; the 3x3 window H(4:6,4:6) is zero with spike S = H(4,3) = 1:
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i <= Math.min( j + 1, 2 ); i++ ) {
			setEl( H, N, i, j, 1.0 + i + j, 0.5 );
		}
	}
	setEl( H, N, 3, 2, 1.0, 0.0 );
	r = runAndCheckSimilarity( H, N, {
		'wantt': true,
		'ktop': 1,
		'kbot': N,
		'nw': 3
	});

	// T(3,3) = T(2,2) = 0 so FOO = |S|; V = I so |S*V(1,k)| = 0 deflates k = 3, 2, but not k = 1:
	assert.strictEqual( r.ns, 1, 'ns' );
	assert.strictEqual( r.nd, 2, 'nd' );
});

test( 'zlaqr3: deflation window larger than NMIN = 75 uses zlaqr4', function t() {
	const N = 80;
	const r = runAndCheckSimilarity( randomHess( N, 11 ), N, {
		'wantt': true,
		'ktop': 1,
		'kbot': N,
		'nw': 78
	});
	assert.ok( r.ns > 0, 'ns > 0' );
});

test( 'zlaqr3: the reference minimum 2*JW suffices for a deflation window wider than 32, where ZGEHRD/ZUNMHR would block (ticket 0100)', function t() {
	const N = 80;
	const jw = 78;
	let opt;
	let lo;
	let a;
	let b;
	let i;
	function opts( lwork ) {
		return {
			'wantt': true,
			'ktop': 1,
			'kbot': N,
			'nw': jw,
			'lwork': lwork
		};
	}
	opt = runAndCheckSimilarity( randomHess( N, 11 ), N, opts( ( 33 * jw ) + 4160 ) );

	// On the old code this threw (minimum 33*JW + 2080); runAndCheckSimilarity checks Z unitary and Z*H*Z^H = H0:
	lo = runAndCheckSimilarity( randomHess( N, 11 ), N, opts( 2 * jw ) );
	assert.ok( opt.ns > 32, 'ns > 32 (blocked ZGEHRD path with room for it)' );
	assert.strictEqual( lo.ns, opt.ns, 'ns' );
	assert.strictEqual( lo.nd, opt.nd, 'nd' );
	a = reinterpret( lo.SH, 0 );
	b = reinterpret( opt.SH, 0 );
	for ( i = 0; i < 2 * N; i++ ) {
		assert.ok( Math.abs( a[ i ] - b[ i ] ) <= 1e-10, 'SH[' + i + ']' );
	}

	// One below the reference's minimum 2*JW throws:
	assert.throws( function throws() {
		runAndCheckSimilarity( randomHess( N, 11 ), N, opts( ( 2 * jw ) - 1 ) );
	}, /WORK array must have at least 156 elements/ );
});

test( 'zlaqr3: the minimum WORK follows JW = min( NW, KBOT-KTOP+1 ), not NW (ticket 0096)', function t() {
	const N = 8;
	const r = runAndCheckSimilarity( randomHess( N, 3 ), N, {
		'wantt': true,
		'ktop': 1,
		'kbot': N,
		'nw': 20,
		'lwork': 16
	});
	assert.ok( r.ns + r.nd <= N, 'ns + nd <= jw' );
	assert.throws( function throws() {
		runAndCheckSimilarity( randomHess( N, 3 ), N, {
			'wantt': true,
			'ktop': 1,
			'kbot': N,
			'nw': 20,
			'lwork': 15
		});
	}, RangeError );
});
