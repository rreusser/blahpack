/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, node/no-sync, vars-on-top, stdlib/vars-order, require-jsdoc, stdlib/jsdoc-private-annotation */

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

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
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
	const N = 4;
	const A = buildMatrix( N, A4 );
	const B = buildMatrix( N, B4 );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 1 );
	const IWORK = new Int32Array( 1 );
	const res = ztgsna( 'both', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, 0, WORK, 1, 0, 0, IWORK, 1, 0 );
	const tc = findCase( 'job=B howmny=A N=4' );
	assertArrayClose( toArray( s ), tc.S, 1e-13, 'S' );
	assertArrayClose( toArray( DIF ), tc.DIF, 1e-13, 'DIF' );
	assert.equal( res.m, tc.M );
	assert.equal( res.info, tc.info );
} );

test( 'ztgsna: job=eigenvalues howmny=all N=3', function t() {
	const N = 3;
	const A = buildMatrix( N, A3 );
	const B = buildMatrix( N, B3 );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 1 );
	const IWORK = new Int32Array( 1 );
	const res = ztgsna( 'eigenvalues', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, 0, WORK, 1, 0, 0, IWORK, 1, 0 );
	const tc = findCase( 'job=E howmny=A N=3' );
	assertArrayClose( toArray( s ).slice( 0, N ), tc.S, 1e-13, 'S' );
	assert.equal( res.m, tc.M );
	assert.equal( res.info, tc.info );
} );

test( 'ztgsna: job=eigenvectors howmny=all N=3', function t() {
	const N = 3;
	const A = buildMatrix( N, A3 );
	const B = buildMatrix( N, B3 );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 1 );
	const IWORK = new Int32Array( 1 );
	const res = ztgsna( 'eigenvectors', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, 0, WORK, 1, 0, 0, IWORK, 1, 0 );
	const tc = findCase( 'job=V howmny=A N=3' );
	assertArrayClose( toArray( DIF ).slice( 0, N ), tc.DIF, 1e-13, 'DIF' );
	assert.equal( res.m, tc.M );
	assert.equal( res.info, tc.info );
} );

test( 'ztgsna: job=both howmny=selected select=[1,0,1,0] N=4', function t() {
	const N = 4;
	const A = buildMatrix( N, A4 );
	const B = buildMatrix( N, B4 );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( [ 1, 0, 1, 0 ] );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 1 );
	const IWORK = new Int32Array( 1 );
	const res = ztgsna( 'both', 'selected', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, 2, 0, WORK, 1, 0, 0, IWORK, 1, 0 );
	const tc = findCase( 'job=B howmny=S select=[T,F,T,F] N=4' );
	assertArrayClose( toArray( s ).slice( 0, 2 ), tc.S, 1e-13, 'S' );
	assertArrayClose( toArray( DIF ).slice( 0, 2 ), tc.DIF, 1e-13, 'DIF' );
	assert.equal( res.m, tc.M );
	assert.equal( res.info, tc.info );
} );

test( 'ztgsna: N=1 job=both', function t() {
	const N = 1;
	const A = buildMatrix( N, [ [ 0, 0, 3.0, 2.0 ] ] );
	const B = buildMatrix( N, [ [ 0, 0, 1.0, 0.5 ] ] );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 1 );
	const IWORK = new Int32Array( 1 );
	const res = ztgsna( 'both', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, 0, WORK, 1, 0, 0, IWORK, 1, 0 );
	const tc = findCase( 'job=B howmny=A N=1' );
	assertArrayClose( toArray( s ), tc.S, 1e-13, 'S' );
	assertArrayClose( toArray( DIF ), tc.DIF, 1e-13, 'DIF' );
	assert.equal( res.m, tc.M );
	assert.equal( res.info, tc.info );
} );

test( 'ztgsna: N=0 quick return', function t() {
	const A = new Complex128Array( 0 );
	const B = new Complex128Array( 0 );
	const VL = new Complex128Array( 0 );
	const VR = new Complex128Array( 0 );
	const SELECT = new Uint8Array( 0 );
	const s = new Float64Array( 0 );
	const DIF = new Float64Array( 0 );
	const WORK = new Complex128Array( 0 );
	const IWORK = new Int32Array( 0 );
	const res = ztgsna( 'both', 'all', SELECT, 1, 0, 0, A, 1, 1, 0, B, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, DIF, 1, 0, 0, 0, WORK, 1, 0, 0, IWORK, 1, 0 );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 0, 'm' );
} );

test( 'ztgsna: howmny=selected with all SELECT[i]=0 (m=0)', function t() {
	const N = 3;
	const A = buildMatrix( N, A3 );
	const B = buildMatrix( N, B3 );
	const VL = identity( N );
	const VR = identity( N );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const DIF = new Float64Array( N );
	const WORK = new Complex128Array( 1 );
	const IWORK = new Int32Array( 1 );
	const res = ztgsna( 'both', 'selected', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, 0, WORK, 1, 0, 0, IWORK, 1, 0 );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 0, 'm=0' );
} );

test( 'ztgsna: throws TypeError for invalid job', function t() {
	assert.throws( function throws() {
		const A = new Complex128Array( 1 );
		const B = new Complex128Array( 1 );
		const VL = new Complex128Array( 1 );
		const VR = new Complex128Array( 1 );
		const SELECT = new Uint8Array( 1 );
		const s = new Float64Array( 1 );
		const DIF = new Float64Array( 1 );
		const WORK = new Complex128Array( 1 );
		const IWORK = new Int32Array( 1 );
		ztgsna( 'invalid', 'all', SELECT, 1, 0, 1, A, 1, 1, 0, B, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, DIF, 1, 0, 1, 0, WORK, 1, 0, 0, IWORK, 1, 0 );
	}, TypeError );
} );

test( 'ztgsna: throws TypeError for invalid howmny', function t() {
	assert.throws( function throws() {
		const A = new Complex128Array( 1 );
		const B = new Complex128Array( 1 );
		const VL = new Complex128Array( 1 );
		const VR = new Complex128Array( 1 );
		const SELECT = new Uint8Array( 1 );
		const s = new Float64Array( 1 );
		const DIF = new Float64Array( 1 );
		const WORK = new Complex128Array( 1 );
		const IWORK = new Int32Array( 1 );
		ztgsna( 'both', 'invalid', SELECT, 1, 0, 1, A, 1, 1, 0, B, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, DIF, 1, 0, 1, 0, WORK, 1, 0, 0, IWORK, 1, 0 );
	}, TypeError );
} );

test( 'ztgsna: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const A = new Complex128Array( 1 );
		const B = new Complex128Array( 1 );
		const VL = new Complex128Array( 1 );
		const VR = new Complex128Array( 1 );
		const SELECT = new Uint8Array( 1 );
		const s = new Float64Array( 1 );
		const DIF = new Float64Array( 1 );
		const WORK = new Complex128Array( 1 );
		const IWORK = new Int32Array( 1 );
		ztgsna( 'both', 'all', SELECT, 1, 0, -1, A, 1, 1, 0, B, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, DIF, 1, 0, 1, 0, WORK, 1, 0, 0, IWORK, 1, 0 );
	}, RangeError );
} );
