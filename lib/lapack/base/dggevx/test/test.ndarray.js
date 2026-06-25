
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, require-jsdoc, stdlib/jsdoc-private-annotation, max-statements-per-line, max-lines, node/no-sync */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import trim from '@stdlib/string/trim/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dggevxNd from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = trim( readFileSync( path.join( fixtureDir, 'dggevx.jsonl' ), 'utf8' ) ).split( '\n' );
var fixture = lines.map( parse );


// FUNCTIONS //

function parse( line ) {
	return JSON.parse( line );
}

function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

function assertClose( actual, expected, tol, msg ) {
	var d;
	if ( expected === 0.0 ) {
		d = Math.abs( actual );
	} else {
		d = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	}
	assert.ok( d <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (err=' + d + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function fromBalanc( s ) {
	if ( s === 'N' ) { return 'none'; }
	if ( s === 'P' ) { return 'permute'; }
	if ( s === 'S' ) { return 'scale'; }
	return 'both';
}

function fromJob( s ) {
	return ( s === 'V' ) ? 'compute-vectors' : 'no-vectors';
}

function fromSense( s ) {
	if ( s === 'E' ) { return 'eigenvalues'; }
	if ( s === 'V' ) { return 'right-vectors'; }
	if ( s === 'B' ) { return 'both'; }
	return 'none';
}

function makeWorkspace( N, sense ) {
	var wantsv = ( sense === 'right-vectors' || sense === 'both' );
	var wantse = ( sense === 'eigenvalues' );
	var lwork;
	if ( wantsv ) {
		lwork = Math.max( 1, ( 5 * N ) + ( 2 * N * ( N + 2 ) ) + 16 );
	} else if ( wantse ) {
		lwork = Math.max( 1, 11 * N );
	} else {
		lwork = Math.max( 1, 8 * N );
	}
	return {
		'work': new Float64Array( lwork ),
		'iwork': new Int32Array( Math.max( 1, N + 6 ) ),
		'bwork': new Uint8Array( Math.max( 1, N ) )
	};
}

function runSenseCase( name, tol ) {
	var ALPHAR;
	var ALPHAI;
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var BETA;
	var ws;
	var out;
	var tc;
	var VL;
	var VR;
	var N;
	var A;
	var B;
	tc = findCase( name );
	N = tc.n;
	A = new Float64Array( tc.A );
	B = new Float64Array( tc.B );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	LSCALE = new Float64Array( N );
	RSCALE = new Float64Array( N );
	RCONDE = new Float64Array( N );
	RCONDV = new Float64Array( N );
	ws = makeWorkspace( N, fromSense( tc.sense ) );
	out = dggevxNd( fromBalanc( tc.balanc ), fromJob( tc.jobvl ), fromJob( tc.jobvr ), fromSense( tc.sense ), N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	assert.equal( out.info, 0, name + ': info' );
	assertArrayClose( ALPHAR, tc.alphar, tol, name + ' alphar' );
	assertArrayClose( ALPHAI, tc.alphai, tol, name + ' alphai' );
	assertArrayClose( BETA, tc.beta, tol, name + ' beta' );
	if ( tc.rconde ) {
		assertArrayClose( RCONDE, tc.rconde, tol, name + ' rconde' );
	}
	if ( tc.rcondv ) {
		assertArrayClose( RCONDV, tc.rcondv, tol, name + ' rcondv' );
	}
}


// TESTS //

test( 'ndarray: throws for invalid balanc', function t() {
	var ws = makeWorkspace( 0, 'none' );
	assert.throws( function throws() {
		dggevxNd( 'bad', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws for invalid jobvl', function t() {
	var ws = makeWorkspace( 0, 'none' );
	assert.throws( function throws() {
		dggevxNd( 'none', 'bad', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws for invalid jobvr', function t() {
	var ws = makeWorkspace( 0, 'none' );
	assert.throws( function throws() {
		dggevxNd( 'none', 'no-vectors', 'bad', 'none', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws for invalid sense', function t() {
	var ws = makeWorkspace( 0, 'none' );
	assert.throws( function throws() {
		dggevxNd( 'none', 'no-vectors', 'no-vectors', 'bad', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	var ws = makeWorkspace( 1, 'none' );
	assert.throws( function throws() {
		dggevxNd( 'none', 'no-vectors', 'no-vectors', 'none', -1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for undersized work array', function t() {
	var N = 4;
	// provide work that is too small (only 1 element instead of 8*N)
	assert.throws( function throws() {
		dggevxNd( 'none', 'no-vectors', 'no-vectors', 'none', N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), 1, 0, new Int32Array( N + 6 ), 1, 0, new Uint8Array( N ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: quick return N=0', function t() {
	var ws = makeWorkspace( 0, 'none' );
	var out = dggevxNd( 'none', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	assert.equal( out.info, 0 );
	assert.equal( out.ilo, 1 );
	assert.equal( out.ihi, 0 );
});

test( 'ndarray: column-major fixture (2x2_diag_none)', function t() {
	var ALPHAR;
	var ALPHAI;
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var BETA;
	var out;
	var tc;
	var VL;
	var VR;
	var ws;
	var N;
	var A;
	var B;
	tc = findCase( '2x2_diag_none' );
	N = tc.n;
	A = new Float64Array( tc.A );
	B = new Float64Array( tc.B );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( 1 );
	VR = new Float64Array( 1 );
	LSCALE = new Float64Array( N );
	RSCALE = new Float64Array( N );
	RCONDE = new Float64Array( N );
	RCONDV = new Float64Array( N );
	ws = makeWorkspace( N, 'none' );
	out = dggevxNd( fromBalanc( tc.balanc ), fromJob( tc.jobvl ), fromJob( tc.jobvr ), 'none', N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	assert.equal( out.info, 0 );
	assert.equal( out.ilo, tc.ilo );
	assert.equal( out.ihi, tc.ihi );
	assertClose( out.abnrm, tc.abnrm, 1e-12, 'abnrm' );
	assertClose( out.bbnrm, tc.bbnrm, 1e-12, 'bbnrm' );
	assertArrayClose( ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( BETA, tc.beta, 1e-12, 'beta' );
	assertArrayClose( LSCALE, tc.lscale, 1e-12, 'lscale' );
	assertArrayClose( RSCALE, tc.rscale, 1e-12, 'rscale' );
});

test( 'ndarray: sense=eigenvalues fixture (4x4_sense_E)', function t() {
	runSenseCase( '4x4_sense_E', 1e-9 );
});

test( 'ndarray: sense=right-vectors fixture (4x4_sense_V)', function t() {
	runSenseCase( '4x4_sense_V', 1e-9 );
});

test( 'ndarray: sense=both fixture (4x4_sense_B)', function t() {
	runSenseCase( '4x4_sense_B', 1e-9 );
});

test( 'ndarray: row-major transposed submit (3x3_triu_both)', function t() {
	var ALPHAR;
	var ALPHAI;
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var BETA;
	var out;
	var tc;
	var VL;
	var VR;
	var ws;
	var N;
	var A;
	var B;
	var i;
	var j;
	tc = findCase( '3x3_triu_both' );
	N = tc.n;
	A = new Float64Array( N * N );
	B = new Float64Array( N * N );

	// Transpose A and B from column-major to row-major
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ ( i * N ) + j ] = tc.A[ ( j * N ) + i ];
			B[ ( i * N ) + j ] = tc.B[ ( j * N ) + i ];
		}
	}
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	LSCALE = new Float64Array( N );
	RSCALE = new Float64Array( N );
	RCONDE = new Float64Array( N );
	RCONDV = new Float64Array( N );
	ws = makeWorkspace( N, 'none' );

	// Row-major strides: strideA1 = N, strideA2 = 1
	out = dggevxNd( fromBalanc( tc.balanc ), fromJob( tc.jobvl ), fromJob( tc.jobvr ), 'none', N, A, N, 1, 0, B, N, 1, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, N, 1, 0, VR, N, 1, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	assert.equal( out.info, 0 );
	assertArrayClose( ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( BETA, tc.beta, 1e-12, 'beta' );
});
