
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

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = trim( readFileSync( path.join( fixtureDir, 'dggevx.jsonl' ), 'utf8' ) ).split( '\n' );
const fixture = lines.map( parse );


// FUNCTIONS //

function parse( line ) {
	return JSON.parse( line );
}

function findCase( name ) {
	let i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

function assertClose( actual, expected, tol, msg ) {
	let d;
	if ( expected === 0.0 ) {
		d = Math.abs( actual );
	} else {
		d = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	}
	assert.ok( d <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (err=' + d + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
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
	const wantsv = ( sense === 'right-vectors' || sense === 'both' );
	const wantse = ( sense === 'eigenvalues' );
	let lwork;

	// The reference's minimum (6*N covers every balanc and job):
	if ( wantsv ) {
		lwork = Math.max( ( sense === 'both' ) ? 10 * N : 6 * N, ( 2 * N * ( N + 4 ) ) + 16 );
	} else if ( wantse ) {
		lwork = Math.max( 1, 10 * N );
	} else {
		lwork = Math.max( 1, 6 * N );
	}
	return {
		'work': new Float64Array( lwork ),
		'iwork': new Int32Array( Math.max( 1, N + 6 ) ),
		'bwork': new Uint8Array( Math.max( 1, N ) )
	};
}

function runSenseCase( name, tol ) {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const bbnrm = new Float64Array( 1 );
	const tc = findCase( name );
	const N = tc.n;
	const A = new Float64Array( tc.A );
	const B = new Float64Array( tc.B );
	const ALPHAR = new Float64Array( N );
	const ALPHAI = new Float64Array( N );
	const BETA = new Float64Array( N );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const LSCALE = new Float64Array( N );
	const RSCALE = new Float64Array( N );
	const RCONDE = new Float64Array( N );
	const RCONDV = new Float64Array( N );
	const ws = makeWorkspace( N, fromSense( tc.sense ) );
	const out = dggevxNd( fromBalanc( tc.balanc ), fromJob( tc.jobvl ), fromJob( tc.jobvr ), fromSense( tc.sense ), N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, abnrm, bbnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	assert.equal( out, 0, name + ': info' );
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
	const ws = makeWorkspace( 0, 'none' );
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevxNd( 'bad', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, ilo, ihi, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, abnrm, bbnrm, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws for invalid jobvl', function t() {
	const ws = makeWorkspace( 0, 'none' );
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevxNd( 'none', 'bad', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, ilo, ihi, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, abnrm, bbnrm, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws for invalid jobvr', function t() {
	const ws = makeWorkspace( 0, 'none' );
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevxNd( 'none', 'no-vectors', 'bad', 'none', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, ilo, ihi, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, abnrm, bbnrm, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws for invalid sense', function t() {
	const ws = makeWorkspace( 0, 'none' );
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevxNd( 'none', 'no-vectors', 'no-vectors', 'bad', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, ilo, ihi, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, abnrm, bbnrm, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	const ws = makeWorkspace( 1, 'none' );
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevxNd( 'none', 'no-vectors', 'no-vectors', 'none', -1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, ilo, ihi, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, abnrm, bbnrm, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for undersized work array', function t() {
	const N = 4;

	// Provide work that is too small (only 1 element instead of 8*N)
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevxNd( 'none', 'no-vectors', 'no-vectors', 'none', N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, ilo, ihi, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, abnrm, bbnrm, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), 1, 0, new Int32Array( N + 6 ), 1, 0, new Uint8Array( N ), 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for undersized iwork when sense needs it (right-vectors)', function t() {
	const N = 4;
	assert.throws( function throws() {
		dggevxNd( 'none', 'compute-vectors', 'compute-vectors', 'right-vectors', N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Int32Array( 1 ), new Int32Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1000 ), 1, 0, new Int32Array( N + 5 ), 1, 0, new Uint8Array( N ), 1, 0 );
	}, /IWORK array must have at least 10 elements/ );
});

test( 'ndarray: throws RangeError for undersized bwork when sense is not none', function t() {
	const N = 4;
	assert.throws( function throws() {
		dggevxNd( 'none', 'no-vectors', 'no-vectors', 'eigenvalues', N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Int32Array( 1 ), new Int32Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1000 ), 1, 0, new Int32Array( N + 6 ), 1, 0, new Uint8Array( N - 1 ), 1, 0 );
	}, /BWORK array must have at least 4 elements/ );
});

test( 'ndarray: quick return N=0', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const bbnrm = new Float64Array( 1 );
	const ws = makeWorkspace( 0, 'none' );
	const out = dggevxNd( 'none', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, ilo, ihi, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, abnrm, bbnrm, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	assert.equal( out, 0 );
	assert.equal( ilo[ 0 ], 1 );
	assert.equal( ihi[ 0 ], 0 );
});

test( 'ndarray: column-major fixture (2x2_diag_none)', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const bbnrm = new Float64Array( 1 );
	const tc = findCase( '2x2_diag_none' );
	const N = tc.n;
	const A = new Float64Array( tc.A );
	const B = new Float64Array( tc.B );
	const ALPHAR = new Float64Array( N );
	const ALPHAI = new Float64Array( N );
	const BETA = new Float64Array( N );
	const VL = new Float64Array( 1 );
	const VR = new Float64Array( 1 );
	const LSCALE = new Float64Array( N );
	const RSCALE = new Float64Array( N );
	const RCONDE = new Float64Array( N );
	const RCONDV = new Float64Array( N );
	const ws = makeWorkspace( N, 'none' );
	const out = dggevxNd( fromBalanc( tc.balanc ), fromJob( tc.jobvl ), fromJob( tc.jobvr ), 'none', N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, abnrm, bbnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	assert.equal( out, 0 );
	assert.equal( ilo[ 0 ], tc.ilo );
	assert.equal( ihi[ 0 ], tc.ihi );
	assertClose( abnrm[ 0 ], tc.abnrm, 1e-12, 'abnrm' );
	assertClose( bbnrm[ 0 ], tc.bbnrm, 1e-12, 'bbnrm' );
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
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const bbnrm = new Float64Array( 1 );
	let i, j;
	const tc = findCase( '3x3_triu_both' );
	const N = tc.n;
	const A = new Float64Array( N * N );
	const B = new Float64Array( N * N );

	// Transpose A and B from column-major to row-major
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ ( i * N ) + j ] = tc.A[ ( j * N ) + i ];
			B[ ( i * N ) + j ] = tc.B[ ( j * N ) + i ];
		}
	}
	const ALPHAR = new Float64Array( N );
	const ALPHAI = new Float64Array( N );
	const BETA = new Float64Array( N );
	const VL = new Float64Array( N * N );
	const VR = new Float64Array( N * N );
	const LSCALE = new Float64Array( N );
	const RSCALE = new Float64Array( N );
	const RCONDE = new Float64Array( N );
	const RCONDV = new Float64Array( N );
	const ws = makeWorkspace( N, 'none' );

	// Row-major strides: strideA1 = N, strideA2 = 1
	const out = dggevxNd( fromBalanc( tc.balanc ), fromJob( tc.jobvl ), fromJob( tc.jobvr ), 'none', N, A, N, 1, 0, B, N, 1, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, N, 1, 0, VR, N, 1, 0, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, abnrm, bbnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0, ws.bwork, 1, 0 );
	assert.equal( out, 0 );
	assertArrayClose( ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( BETA, tc.beta, 1e-12, 'beta' );
});

/**
* Runs dggevx (ndarray) on a deterministic pseudo-random N-by-N pair with a WORK of the given length.
*
* @private
* @param {string} balanc - balancing option
* @param {string} jobv - eigenvector option for both sides
* @param {string} sense - condition-number option
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} lwork - WORK length
* @returns {Object} outputs
*/
function runRandom( balanc, jobv, sense, N, lwork ) {
	const A = new Float64Array( N * N );
	const B = new Float64Array( N * N );
	let seed = 31337;
	let i;
	for ( i = 0; i < N * N; i++ ) {
		seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
		A[ i ] = ( seed / 2147483648 ) - 0.5;
		seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
		B[ i ] = ( seed / 2147483648 ) - 0.5;
	}
	const out = {
		'ALPHAR': new Float64Array( N ),
		'ALPHAI': new Float64Array( N ),
		'BETA': new Float64Array( N ),
		'RCONDE': new Float64Array( N ),
		'RCONDV': new Float64Array( N )
	};
	out.info = dggevxNd( balanc, jobv, jobv, sense, N, A, 1, N, 0, B, 1, N, 0, out.ALPHAR, 1, 0, out.ALPHAI, 1, 0, out.BETA, 1, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Int32Array( 1 ), new Int32Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), out.RCONDE, 1, 0, out.RCONDV, 1, 0, new Float64Array( lwork ), 1, 0, new Int32Array( N + 6 ), 1, 0, new Uint8Array( N ), 1, 0 );
	return out;
}

test( 'ndarray: N=40 (> NB=32) with the reference minimum WORK gives the eigenvalues and condition numbers of an optimal WORK; one element less throws', function t() {
	const N = 40;
	const cases = [
		[ 'both', 'compute-vectors', 'both', ( 2 * N * ( N + 4 ) ) + 16 ],
		[ 'scale', 'compute-vectors', 'none', 6 * N ],
		[ 'permute', 'no-vectors', 'none', 2 * N ],
		[ 'none', 'no-vectors', 'eigenvalues', 10 * N ]
	];
	let opt;
	let lo;
	let c;
	let i;
	for ( c = 0; c < cases.length; c++ ) {
		lo = runRandom( cases[ c ][ 0 ], cases[ c ][ 1 ], cases[ c ][ 2 ], N, cases[ c ][ 3 ] );
		opt = runRandom( cases[ c ][ 0 ], cases[ c ][ 1 ], cases[ c ][ 2 ], N, Math.max( cases[ c ][ 3 ], N + ( N * 32 ) + 4160 ) );
		assert.equal( lo.info, 0, 'info' );
		assert.equal( opt.info, 0, 'info' );
		for ( i = 0; i < N; i++ ) {
			assertClose( lo.ALPHAR[ i ] / lo.BETA[ i ], opt.ALPHAR[ i ] / opt.BETA[ i ], 1e-8, cases[ c ].join( '/' ) + ' alphar/beta[' + i + ']' );
			assertClose( lo.ALPHAI[ i ] / lo.BETA[ i ], opt.ALPHAI[ i ] / opt.BETA[ i ], 1e-8, cases[ c ].join( '/' ) + ' alphai/beta[' + i + ']' );
			assertClose( lo.RCONDE[ i ], opt.RCONDE[ i ], 1e-6, cases[ c ].join( '/' ) + ' rconde[' + i + ']' );

			// RCONDV is an estimate (DTGSNA's DIF), which may move with the sign choices of the Schur form:
			assert.ok( lo.RCONDV[ i ] <= 2.0 * opt.RCONDV[ i ] && opt.RCONDV[ i ] <= 2.0 * lo.RCONDV[ i ], cases[ c ].join( '/' ) + ' rcondv[' + i + ']: ' + lo.RCONDV[ i ] + ' vs ' + opt.RCONDV[ i ] );
		}
		assert.throws( function bad() {
			runRandom( cases[ c ][ 0 ], cases[ c ][ 1 ], cases[ c ][ 2 ], N, cases[ c ][ 3 ] - 1 );
		}, RangeError, cases[ c ].join( '/' ) );
	}
});

test( 'ndarray: IWORK and BWORK shorter than the declared N+6 and N throw RangeError with sense = none too (ticket 0107)', function t() {
	const N = 4;
	function call( iwork, bwork ) {
		return dggevxNd( 'none', 'no-vectors', 'no-vectors', 'none', N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Int32Array( 1 ), new Int32Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 2 * N ), 1, 0, iwork, 1, 0, bwork, 1, 0 ); // eslint-disable-line max-len
	}
	assert.throws( function shortIwork() {
		call( new Int32Array( N + 5 ), new Uint8Array( N ) );
	}, /IWORK array must have at least 10 elements from offset 0/ );
	assert.throws( function shortBwork() {
		call( new Int32Array( N + 6 ), new Uint8Array( N - 1 ) );
	}, /BWORK array must have at least 4 elements from offset 0/ );
	assert.doesNotThrow( function atMinimum() {
		call( new Int32Array( N + 6 ), new Uint8Array( N ) );
	});
});
