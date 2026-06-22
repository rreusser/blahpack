
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, require-jsdoc, stdlib/jsdoc-private-annotation, max-statements-per-line, max-lines, node/no-sync */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import trim from '@stdlib/string/trim/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggevx from './../lib/dggevx.js';


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

function runCase( order, tc ) {
	var computeVL;
	var computeVR;
	var ALPHAR;
	var ALPHAI;
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var BETA;
	var ldvl;
	var ldvr;
	var VL;
	var VR;
	var N;
	var A;
	var B;

	N = tc.n;
	computeVL = ( tc.jobvl === 'V' );
	computeVR = ( tc.jobvr === 'V' );
	A = new Float64Array( tc.A );
	B = new Float64Array( tc.B );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( ( computeVL ) ? N * N : 1 );
	VR = new Float64Array( ( computeVR ) ? N * N : 1 );
	LSCALE = new Float64Array( N );
	RSCALE = new Float64Array( N );
	RCONDE = new Float64Array( N );
	RCONDV = new Float64Array( N );
	ldvl = ( computeVL ) ? N : 1;
	ldvr = ( computeVR ) ? N : 1;

	return {
		'out': dggevx( order, fromBalanc( tc.balanc ), fromJob( tc.jobvl ), fromJob( tc.jobvr ), 'none', N, A, N, B, N, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, ldvl, VR, ldvr, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 ),
		'ALPHAR': ALPHAR,
		'ALPHAI': ALPHAI,
		'BETA': BETA,
		'LSCALE': LSCALE,
		'RSCALE': RSCALE
	};
}


// TESTS //

test( 'dggevx is a function', function t() {
	assert.strictEqual( typeof dggevx, 'function', 'is a function' );
});

test( 'dggevx throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dggevx( 'bad', 'none', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dggevx throws TypeError for invalid balanc', function t() {
	assert.throws( function throws() {
		dggevx( 'column-major', 'bad', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dggevx throws TypeError for invalid jobvl', function t() {
	assert.throws( function throws() {
		dggevx( 'column-major', 'none', 'bad', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dggevx throws TypeError for invalid jobvr', function t() {
	assert.throws( function throws() {
		dggevx( 'column-major', 'none', 'no-vectors', 'bad', 'none', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dggevx throws TypeError for invalid sense', function t() {
	assert.throws( function throws() {
		dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'bad', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dggevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', -1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, RangeError );
});

test( 'dggevx throws RangeError for invalid LDA', function t() {
	assert.throws( function throws() {
		dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dggevx throws RangeError for invalid LDB', function t() {
	assert.throws( function throws() {
		dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dggevx quick return for N=0', function t() {
	var out = dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	assert.equal( out.info, 0 );
	assert.equal( out.ilo, 1 );
	assert.equal( out.ihi, 0 );
	assert.equal( out.abnrm, 0 );
	assert.equal( out.bbnrm, 0 );
});

test( 'dggevx throws for invalid sense', function t() {
	assert.throws( function throws() {
		dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'bad', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, TypeError );
});


// TESTS //

test( 'dggevx: 2x2_diag_none (column-major)', function t() {
	var tc = findCase( '2x2_diag_none' );
	var r = runCase( 'column-major', tc );
	assert.equal( r.out.info, 0, 'info' );
	assert.equal( r.out.ilo, tc.ilo, 'ilo' );
	assert.equal( r.out.ihi, tc.ihi, 'ihi' );
	assertClose( r.out.abnrm, tc.abnrm, 1e-12, 'abnrm' );
	assertClose( r.out.bbnrm, tc.bbnrm, 1e-12, 'bbnrm' );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
	assertArrayClose( r.LSCALE, tc.lscale, 1e-12, 'lscale' );
	assertArrayClose( r.RSCALE, tc.rscale, 1e-12, 'rscale' );
});

test( 'dggevx: 3x3_diag_permute (column-major)', function t() {
	var tc = findCase( '3x3_diag_permute' );
	var r = runCase( 'column-major', tc );
	assert.equal( r.out.info, 0 );
	assert.equal( r.out.ilo, tc.ilo );
	assert.equal( r.out.ihi, tc.ihi );
	assertClose( r.out.abnrm, tc.abnrm, 1e-12, 'abnrm' );
	assertClose( r.out.bbnrm, tc.bbnrm, 1e-12, 'bbnrm' );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});

test( 'dggevx: 3x3_triu_both (column-major)', function t() {
	var tc = findCase( '3x3_triu_both' );
	var r = runCase( 'column-major', tc );
	assert.equal( r.out.info, 0 );
	assert.equal( r.out.ilo, tc.ilo );
	assert.equal( r.out.ihi, tc.ihi );
	assertClose( r.out.abnrm, tc.abnrm, 1e-12, 'abnrm' );
	assertClose( r.out.bbnrm, tc.bbnrm, 1e-12, 'bbnrm' );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});

test( 'dggevx: 4x4_complex_scale (column-major)', function t() {
	var tc = findCase( '4x4_complex_scale' );
	var r = runCase( 'column-major', tc );
	assert.equal( r.out.info, 0 );
	assert.equal( r.out.ilo, tc.ilo );
	assert.equal( r.out.ihi, tc.ihi );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
	assertArrayClose( r.LSCALE, tc.lscale, 1e-12, 'lscale' );
	assertArrayClose( r.RSCALE, tc.rscale, 1e-12, 'rscale' );
});

test( 'dggevx: 4x4_general_both (column-major)', function t() {
	var tc = findCase( '4x4_general_both' );
	var r = runCase( 'column-major', tc );
	assert.equal( r.out.info, 0 );
	assert.equal( r.out.ilo, tc.ilo );
	assert.equal( r.out.ihi, tc.ihi );
	assertClose( r.out.abnrm, tc.abnrm, 1e-12, 'abnrm' );
	assertClose( r.out.bbnrm, tc.bbnrm, 1e-12, 'bbnrm' );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});

test( 'dggevx: 1x1_trivial (column-major)', function t() {
	var tc = findCase( '1x1_trivial' );
	var r = runCase( 'column-major', tc );
	assert.equal( r.out.info, 0 );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});

test( 'dggevx: 2x2_diag_none (row-major reproduces column-major for symmetric case)', function t() {
	var tc;
	var r;
	tc = findCase( '2x2_diag_none' );
	r = runCase( 'row-major', tc );
	assert.equal( r.out.info, 0 );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});

function runScaleCase( A, B ) {
	var ALPHAR;
	var ALPHAI;
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var BETA;
	var out;
	var VL;
	var VR;
	var N;
	N = 2;
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( 1 );
	VR = new Float64Array( 1 );
	LSCALE = new Float64Array( N );
	RSCALE = new Float64Array( N );
	RCONDE = new Float64Array( N );
	RCONDV = new Float64Array( N );
	out = dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', N, A, N, B, N, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, 1, VR, 1, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
	return {
		'out': out,
		'ALPHAR': ALPHAR,
		'BETA': BETA
	};
}

test( 'dggevx: scales A when max element below SMLNUM', function t() {
	var tiny = 1e-180;
	var r = runScaleCase( new Float64Array( [ 2.0 * tiny, 0.0, 0.0, 3.0 * tiny ] ), new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] ) );
	assert.equal( r.out.info, 0 );
	assertClose( r.ALPHAR[ 0 ] / r.BETA[ 0 ], 2.0 * tiny, 1e-10, 'eig0' );
	assertClose( r.ALPHAR[ 1 ] / r.BETA[ 1 ], 3.0 * tiny, 1e-10, 'eig1' );
});

test( 'dggevx: scales B when max element below SMLNUM', function t() {
	var tiny = 1e-180;
	var r = runScaleCase( new Float64Array( [ 2.0, 0.0, 0.0, 3.0 ] ), new Float64Array( [ tiny, 0.0, 0.0, tiny ] ) );
	assert.equal( r.out.info, 0 );
	assertClose( r.ALPHAR[ 0 ] / r.BETA[ 0 ], 2.0 / tiny, 1e-10, 'eig0' );
	assertClose( r.ALPHAR[ 1 ] / r.BETA[ 1 ], 3.0 / tiny, 1e-10, 'eig1' );
});

test( 'dggevx: scales A when max element above BIGNUM', function t() {
	var huge = 1e180;
	var r = runScaleCase( new Float64Array( [ 2.0 * huge, 0.0, 0.0, 3.0 * huge ] ), new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] ) );
	assert.equal( r.out.info, 0 );
	assertClose( r.ALPHAR[ 0 ] / r.BETA[ 0 ], 2.0 * huge, 1e-10, 'eig0' );
	assertClose( r.ALPHAR[ 1 ] / r.BETA[ 1 ], 3.0 * huge, 1e-10, 'eig1' );
});

test( 'dggevx: scales B when max element above BIGNUM', function t() {
	var huge = 1e180;
	var r = runScaleCase( new Float64Array( [ 2.0, 0.0, 0.0, 3.0 ] ), new Float64Array( [ huge, 0.0, 0.0, huge ] ) );
	assert.equal( r.out.info, 0 );
	assertClose( r.ALPHAR[ 0 ] / r.BETA[ 0 ], 2.0 / huge, 1e-10, 'eig0' );
	assertClose( r.ALPHAR[ 1 ] / r.BETA[ 1 ], 3.0 / huge, 1e-10, 'eig1' );
});

function cloneCaseWithJobs( tc, jobvl, jobvr ) {
	return {
		'name': tc.name,
		'n': tc.n,
		'A': tc.A,
		'B': tc.B,
		'balanc': tc.balanc,
		'jobvl': jobvl,
		'jobvr': jobvr
	};
}

test( 'dggevx: jobvl=compute jobvr=no (3x3_triu)', function t() {
	var tcVl;
	var tc;
	var r;
	tc = findCase( '3x3_triu_both' );
	tcVl = cloneCaseWithJobs( tc, 'V', 'N' );
	r = runCase( 'column-major', tcVl );
	assert.equal( r.out.info, 0 );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});

test( 'dggevx: jobvl=no jobvr=compute (3x3_triu)', function t() {
	var tcVr;
	var tc;
	var r;
	tc = findCase( '3x3_triu_both' );
	tcVr = cloneCaseWithJobs( tc, 'N', 'V' );
	r = runCase( 'column-major', tcVr );
	assert.equal( r.out.info, 0 );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});
