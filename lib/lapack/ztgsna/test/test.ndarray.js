/* eslint-disable no-restricted-syntax, max-len, max-statements, vars-on-top, require-jsdoc */

// MODULES //

import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import ztgsna from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const lines = fs.readFileSync( path.join( fixtureDir, 'ztgsna.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
} );

const A4 = [
	[ 0, 0, 2.0, 0.5 ],
	[ 0, 1, 0.3, 0.1 ],
	[ 0, 2, 0.1, -0.1 ],
	[ 0, 3, 0.05, 0.02 ],
	[ 1, 1, 3.0, -0.3 ],
	[ 1, 2, 0.4, 0.3 ],
	[ 1, 3, 0.2, -0.1 ],
	[ 2, 2, 4.0, 1.0 ],
	[ 2, 3, 0.6, 0.1 ],
	[ 3, 3, 5.0, 0.8 ]
];
const B4 = [
	[ 0, 0, 1.0, 0.2 ],
	[ 0, 1, 0.1, 0.1 ],
	[ 0, 2, 0.05, 0.0 ],
	[ 0, 3, 0.02, -0.01 ],
	[ 1, 1, 2.0, -0.1 ],
	[ 1, 2, 0.15, -0.05 ],
	[ 1, 3, 0.08, 0.03 ],
	[ 2, 2, 1.5, 0.3 ],
	[ 2, 3, 0.12, 0.04 ],
	[ 3, 3, 3.0, 0.0 ]
];
const A3 = [
	[ 0, 0, 2.0, 1.0 ],
	[ 0, 1, 0.5, -0.2 ],
	[ 0, 2, 0.3, 0.1 ],
	[ 1, 1, 4.0, 0.0 ],
	[ 1, 2, 0.7, -0.3 ],
	[ 2, 2, 6.0, -1.0 ]
];
const B3 = [
	[ 0, 0, 1.0, 0.0 ],
	[ 0, 1, 0.1, 0.05 ],
	[ 0, 2, 0.0, 0.0 ],
	[ 1, 1, 1.0, 0.0 ],
	[ 1, 2, 0.2, -0.1 ],
	[ 2, 2, 1.0, 0.0 ]
];


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( tc ) {
		return tc.name === name;
	} );
}

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function buildMatrix( N, entries ) {
	const buf = new Float64Array( 2 * N * N );
	let idx, re, im, i, r, c;
	for ( i = 0; i < entries.length; i++ ) {
		r = entries[ i ][ 0 ];
		c = entries[ i ][ 1 ];
		re = entries[ i ][ 2 ];
		im = entries[ i ][ 3 ];
		idx = 2 * ( r + ( c * N ) );
		buf[ idx ] = re;
		buf[ idx + 1 ] = im;
	}
	return new Complex128Array( buf.buffer );
}

function identity( N ) {
	const buf = new Float64Array( 2 * N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		buf[ 2 * ( i + ( i * N ) ) ] = 1.0;
	}
	return new Complex128Array( buf.buffer );
}

function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'ztgsna: main export is a function', function t() {
	assert.strictEqual( typeof ztgsna, 'function', 'is a function' );
} );

test( 'ztgsna: job=both howmny=all N=4', function t() {
	const m = new Int32Array( 1 );
	const N = 4;
	const A = buildMatrix( N, A4 );
	const B = buildMatrix( N, B4 );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 128 );
	const IWORK = new Int32Array( 32 );
	m[ 0 ] = 0;
	const res = ztgsna( 'both', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, m, WORK, 1, 0, IWORK, 1, 0 );
	const tc = findCase( 'job=B howmny=A N=4' );
	assertArrayClose( toArray( s ), tc.S, 1e-13, 'S' );
	assertArrayClose( toArray( DIF ), tc.DIF, 1e-13, 'DIF' );
	assert.equal( m[ 0 ], tc.M );
	assert.equal( res, tc.info );
} );

test( 'ztgsna: job=eigenvalues howmny=all N=3', function t() {
	const m = new Int32Array( 1 );
	const N = 3;
	const A = buildMatrix( N, A3 );
	const B = buildMatrix( N, B3 );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 128 );
	const IWORK = new Int32Array( 32 );
	m[ 0 ] = 0;
	const res = ztgsna( 'eigenvalues', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, m, WORK, 1, 0, IWORK, 1, 0 );
	const tc = findCase( 'job=E howmny=A N=3' );
	assertArrayClose( toArray( s ).slice( 0, N ), tc.S, 1e-13, 'S' );
	assert.equal( m[ 0 ], tc.M );
	assert.equal( res, tc.info );
} );

test( 'ztgsna: job=eigenvectors howmny=all N=3', function t() {
	const m = new Int32Array( 1 );
	const N = 3;
	const A = buildMatrix( N, A3 );
	const B = buildMatrix( N, B3 );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 128 );
	const IWORK = new Int32Array( 32 );
	m[ 0 ] = 0;
	const res = ztgsna( 'eigenvectors', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, m, WORK, 1, 0, IWORK, 1, 0 );
	const tc = findCase( 'job=V howmny=A N=3' );
	assertArrayClose( toArray( DIF ).slice( 0, N ), tc.DIF, 1e-13, 'DIF' );
	assert.equal( m[ 0 ], tc.M );
	assert.equal( res, tc.info );
} );

test( 'ztgsna: job=both howmny=selected select=[1,0,1,0] N=4', function t() {
	const m = new Int32Array( 1 );
	const N = 4;
	const A = buildMatrix( N, A4 );
	const B = buildMatrix( N, B4 );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( [ 1, 0, 1, 0 ] );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 128 );
	const IWORK = new Int32Array( 32 );
	m[ 0 ] = 0;
	const res = ztgsna( 'both', 'selected', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, 2, m, WORK, 1, 0, IWORK, 1, 0 );
	const tc = findCase( 'job=B howmny=S select=[T,F,T,F] N=4' );
	assertArrayClose( toArray( s ).slice( 0, 2 ), tc.S, 1e-13, 'S' );
	assertArrayClose( toArray( DIF ).slice( 0, 2 ), tc.DIF, 1e-13, 'DIF' );
	assert.equal( m[ 0 ], tc.M );
	assert.equal( res, tc.info );
} );

test( 'ztgsna: N=1 job=both', function t() {
	const m = new Int32Array( 1 );
	const N = 1;
	const A = buildMatrix( N, [ [ 0, 0, 3.0, 2.0 ] ] );
	const B = buildMatrix( N, [ [ 0, 0, 1.0, 0.5 ] ] );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 128 );
	const IWORK = new Int32Array( 32 );
	m[ 0 ] = 0;
	const res = ztgsna( 'both', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, m, WORK, 1, 0, IWORK, 1, 0 );
	const tc = findCase( 'job=B howmny=A N=1' );
	assertArrayClose( toArray( s ), tc.S, 1e-13, 'S' );
	assertArrayClose( toArray( DIF ), tc.DIF, 1e-13, 'DIF' );
	assert.equal( m[ 0 ], tc.M );
	assert.equal( res, tc.info );
} );

test( 'ztgsna: N=0 quick return', function t() {
	const m = new Int32Array( 1 );
	const A = new Complex128Array( 0 );
	const B = new Complex128Array( 0 );
	const VL = new Complex128Array( 0 );
	const VR = new Complex128Array( 0 );
	const SELECT = new Uint8Array( 0 );
	const s = new Float64Array( 0 );
	const DIF = new Float64Array( 0 );
	const WORK = new Complex128Array( 0 );
	const IWORK = new Int32Array( 0 );
	m[ 0 ] = 0;
	const res = ztgsna( 'both', 'all', SELECT, 1, 0, 0, A, 1, 1, 0, B, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, DIF, 1, 0, 0, m, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( res, 0, 'info' );
	assert.equal( m[ 0 ], 0, 'm' );
} );

test( 'ztgsna: howmny=selected with all SELECT[i]=0 (m=0)', function t() {
	const m = new Int32Array( 1 );
	const N = 3;
	const A = buildMatrix( N, A3 );
	const B = buildMatrix( N, B3 );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 128 );
	const IWORK = new Int32Array( 32 );
	m[ 0 ] = 0;
	const res = ztgsna( 'both', 'selected', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, m, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( res, 0, 'info' );
	assert.equal( m[ 0 ], 0, 'm=0' );
} );

test( 'ztgsna: throws TypeError for invalid job', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		const A = new Complex128Array( 1 );
		const B = new Complex128Array( 1 );
		const VL = new Complex128Array( 1 );
		const VR = new Complex128Array( 1 );
		const SELECT = new Uint8Array( 1 );
		const s = new Float64Array( 1 );
		const DIF = new Float64Array( 1 );
		const WORK = new Complex128Array( 128 );
		const IWORK = new Int32Array( 32 );
		m[ 0 ] = 0;
		ztgsna( 'invalid', 'all', SELECT, 1, 0, 1, A, 1, 1, 0, B, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, DIF, 1, 0, 1, m, WORK, 1, 0, IWORK, 1, 0 );
	}, TypeError );
} );

test( 'ztgsna: throws TypeError for invalid howmny', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		const A = new Complex128Array( 1 );
		const B = new Complex128Array( 1 );
		const VL = new Complex128Array( 1 );
		const VR = new Complex128Array( 1 );
		const SELECT = new Uint8Array( 1 );
		const s = new Float64Array( 1 );
		const DIF = new Float64Array( 1 );
		const WORK = new Complex128Array( 128 );
		const IWORK = new Int32Array( 32 );
		m[ 0 ] = 0;
		ztgsna( 'both', 'invalid', SELECT, 1, 0, 1, A, 1, 1, 0, B, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, DIF, 1, 0, 1, m, WORK, 1, 0, IWORK, 1, 0 );
	}, TypeError );
} );

test( 'ztgsna: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		const A = new Complex128Array( 1 );
		const B = new Complex128Array( 1 );
		const VL = new Complex128Array( 1 );
		const VR = new Complex128Array( 1 );
		const SELECT = new Uint8Array( 1 );
		const s = new Float64Array( 1 );
		const DIF = new Float64Array( 1 );
		const WORK = new Complex128Array( 128 );
		const IWORK = new Int32Array( 32 );
		m[ 0 ] = 0;
		ztgsna( 'both', 'all', SELECT, 1, 0, -1, A, 1, 1, 0, B, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, DIF, 1, 0, 1, m, WORK, 1, 0, IWORK, 1, 0 );
	}, RangeError );
} );

test( 'ztgsna: job=both howmny=all N=40 (ztgsyl blocked path) computes finite DIF', function t() {
	const m = new Int32Array( 1 );
	// Regression: ztgsna passed a stale `lwork` (-1) to ztgsyl, shifting IWORK
	// into a number. Only ztgsyl's blocked path (M or N > 32) touches IWORK, so
	// the N <= 4 fixtures never caught it; N = 40 makes the DIF solve blocked.
	const N = 40;
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const Av = new Float64Array( A.buffer );
	const Bv = new Float64Array( B.buffer );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( ( 2 * N * N ) + ( 64 * N ) );
	const IWORK = new Int32Array( N + 6 );
	let i, j;

	// Upper-triangular (generalized complex Schur) pair with distinct eigenvalues A(i,i)/B(i,i):
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			Av[ 2 * ( i + ( j * N ) ) ] = ( i === j ) ? ( j + 1 ) : 0.1 * ( ( ( i + j ) % 5 ) - 2 );
			Av[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = ( i === j ) ? 0.5 : 0.05 * ( ( i * j ) % 3 );
			Bv[ 2 * ( i + ( j * N ) ) ] = ( i === j ) ? 1.0 : 0.02 * ( ( ( 2 * i ) + j ) % 7 );
		}
	}
	m[ 0 ] = 0;
	const res = ztgsna( 'both', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, m, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( res, 0 );
	assert.equal( m[ 0 ], N );
	for ( i = 0; i < N; i++ ) {
		assert.ok( Number.isFinite( s[ i ] ) && s[ i ] > 0.0, 's[' + i + '] = ' + s[ i ] );
		assert.ok( Number.isFinite( DIF[ i ] ) && DIF[ i ] > 0.0, 'DIF[' + i + '] = ' + DIF[ i ] );
	}
} );

test( 'ztgsna: N=1 job=eigenvectors with the reference minimum WORK (2N^2 = 2) matches the job=both DIF fixture', function t() {
	const m = new Int32Array( 1 );
	const N = 1;
	const A = buildMatrix( N, [ [ 0, 0, 3.0, 2.0 ] ] );
	const B = buildMatrix( N, [ [ 0, 0, 1.0, 0.5 ] ] );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const tc = findCase( 'job=B howmny=A N=1' );
	const res = ztgsna( 'eigenvectors', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, m, new Complex128Array( 2 ), 1, 0, new Int32Array( N + 2 ), 1, 0 );
	assert.equal( res, tc.info );
	assert.equal( m[ 0 ], tc.M );
	assertArrayClose( toArray( DIF ), tc.DIF, 1e-13, 'DIF' );
	assert.equal( s[ 0 ], 0.0, 's untouched' );
} );

test( 'ztgsna: at N=1, job=eigenvectors/both demands the reference LWMIN 2N^2 = 2 (ticket 0103)', function t() {
	const N = 1;
	const jobs = [ 'eigenvectors', 'both' ];
	let i;
	for ( i = 0; i < jobs.length; i++ ) {
		assert.throws( function throws() {
			ztgsna( jobs[ i ], 'all', new Uint8Array( N ), 1, 0, N, buildMatrix( N, [ [ 0, 0, 3.0, 2.0 ] ] ), 1, N, 0, buildMatrix( N, [ [ 0, 0, 1.0, 0.5 ] ] ), 1, N, 0, identity( N ), 1, N, 0, identity( N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, N, new Int32Array( 1 ), new Complex128Array( 1 ), 1, 0, new Int32Array( 3 ), 1, 0 );
		}, RangeError, jobs[ i ] );
	}
	assert.throws( function throws() {
		ztgsna( 'eigenvectors', 'all', new Uint8Array( N ), 1, 0, N, buildMatrix( N, [ [ 0, 0, 3.0, 2.0 ] ] ), 1, N, 0, buildMatrix( N, [ [ 0, 0, 1.0, 0.5 ] ] ), 1, N, 0, identity( N ), 1, N, 0, identity( N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, N, new Int32Array( 1 ), null, 1, 0, null, 1, 0 );
	}, RangeError, 'null WORK' );
} );

test( 'ztgsna: IWORK of its declared dimension N+2 suffices on the eigenvector path; N+1 throws (ticket 0103)', function t() {
	const N = 3;
	function run( len ) {
		const DIF = new Float64Array( N );
		const info = ztgsna( 'both', 'all', new Uint8Array( N ), 1, 0, N, buildMatrix( N, A3 ), 1, N, 0, buildMatrix( N, B3 ), 1, N, 0, identity( N ), 1, N, 0, identity( N ), 1, N, 0, new Float64Array( N ), 1, 0, DIF, 1, 0, N, new Int32Array( 1 ), new Complex128Array( 2 * N * N ), 1, 0, new Int32Array( len ), 1, 0 ); // eslint-disable-line max-len
		assert.equal( info, 0 );
		return DIF;
	}
	assert.deepStrictEqual( run( N + 2 ), run( 64 ), 'N+2 matches an ample IWORK' );
	assert.throws( function throws() {
		run( N + 1 );
	}, RangeError );
} );

test( 'ztgsna: throws RangeError for a null WORK when eigenvalue conditions are wanted', function t() {
	const N = 3;
	assert.throws( function throws() {
		ztgsna( 'eigenvalues', 'all', new Uint8Array( N ), 1, 0, N, buildMatrix( N, A3 ), 1, N, 0, buildMatrix( N, B3 ), 1, N, 0, identity( N ), 1, N, 0, identity( N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, N, new Int32Array( 1 ), null, 1, 0, new Int32Array( 32 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna: throws RangeError for a too-small WORK on the eigenvector path', function t() {
	const N = 3;
	assert.throws( function throws() {
		ztgsna( 'eigenvectors', 'all', new Uint8Array( N ), 1, 0, N, buildMatrix( N, A3 ), 1, N, 0, buildMatrix( N, B3 ), 1, N, 0, identity( N ), 1, N, 0, identity( N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, N, new Int32Array( 1 ), new Complex128Array( 10 ), 1, 0, new Int32Array( 32 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna: throws RangeError for a null IWORK on the eigenvector path', function t() {
	const N = 3;
	assert.throws( function throws() {
		ztgsna( 'both', 'all', new Uint8Array( N ), 1, 0, N, buildMatrix( N, A3 ), 1, N, 0, buildMatrix( N, B3 ), 1, N, 0, identity( N ), 1, N, 0, identity( N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, N, new Int32Array( 1 ), new Complex128Array( 128 ), 1, 0, null, 1, 0 );
	}, RangeError );
} );

test( 'ztgsna: WORK of exactly the reference minimum 2*N*N on the eigenvector path matches an ample WORK; one element less throws (ticket 0104)', function t() {
	const N = 3;
	const off = 2;
	function run( len ) {
		const DIF = new Float64Array( N );
		const WORK = new Complex128Array( off + len );
		const info = ztgsna( 'eigenvectors', 'all', new Uint8Array( N ), 1, 0, N, buildMatrix( N, A3 ), 1, N, 0, buildMatrix( N, B3 ), 1, N, 0, identity( N ), 1, N, 0, identity( N ), 1, N, 0, new Float64Array( N ), 1, 0, DIF, 1, 0, N, new Int32Array( 1 ), WORK, 1, off, new Int32Array( N + 6 ), 1, 0 ); // eslint-disable-line max-len
		assert.equal( info, 0 );
		return DIF;
	}
	const ample = run( ( 2 * N * N ) + 64 );
	const atMin = run( 2 * N * N );
	assert.deepStrictEqual( Array.from( atMin ), Array.from( ample ) );
	assert.ok( ample.every( function f( d ) {
		return Number.isFinite( d ) && d > 0.0;
	}), 'DIF is finite and positive' );
	assert.throws( function throws() {
		run( ( 2 * N * N ) - 1 );
	}, /at least 18 elements/ );
} );

test( 'ztgsna: IWORK shorter than the declared N+2 throws RangeError with job = eigenvalues too (ticket 0107)', function t() {
	const N = 2;
	function call( job, IWORK ) {
		return ztgsna( job, 'all', new Uint8Array( N ), 1, 0, N, identity( N ), 1, N, 0, identity( N ), 1, N, 0, identity( N ), 1, N, 0, identity( N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, N, new Int32Array( 1 ), new Complex128Array( 2 * N * N ), 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	}
	assert.throws( function eigenvalues() {
		call( 'eigenvalues', new Int32Array( N + 1 ) );
	}, /IWORK array must have at least 4 elements from offset 0/ );
	assert.doesNotThrow( function atMinimum() {
		call( 'eigenvalues', new Int32Array( N + 2 ) );
	});
});
