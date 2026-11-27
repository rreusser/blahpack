
/* eslint-disable no-restricted-syntax, max-len, max-statements, require-jsdoc, max-statements-per-line, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import trim from '@stdlib/string/trim/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggevx from './../lib/dggevx.js';


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

function runCase( order, tc ) {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const bbnrm = new Float64Array( 1 );

	const N = tc.n;
	const computeVL = ( tc.jobvl === 'V' );
	const computeVR = ( tc.jobvr === 'V' );
	const A = new Float64Array( tc.A );
	const B = new Float64Array( tc.B );
	const ALPHAR = new Float64Array( N );
	const ALPHAI = new Float64Array( N );
	const BETA = new Float64Array( N );
	const VL = new Float64Array( ( computeVL ) ? N * N : 1 );
	const VR = new Float64Array( ( computeVR ) ? N * N : 1 );
	const LSCALE = new Float64Array( N );
	const RSCALE = new Float64Array( N );
	const RCONDE = new Float64Array( N );
	const RCONDV = new Float64Array( N );
	const ldvl = ( computeVL ) ? N : 1;
	const ldvr = ( computeVR ) ? N : 1;

	return {
		'out': {
		'info': dggevx( order, fromBalanc( tc.balanc ), fromJob( tc.jobvl ), fromJob( tc.jobvr ), 'none', N, A, N, B, N, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, ldvl, VR, ldvr, ilo, ihi, LSCALE, 1, RSCALE, 1, abnrm, bbnrm, RCONDE, 1, RCONDV, 1 ),
		'ilo': ilo[ 0 ],
		'ihi': ihi[ 0 ],
		'abnrm': abnrm[ 0 ],
		'bbnrm': bbnrm[ 0 ]
	},
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
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevx( 'bad', 'none', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, ilo, ihi, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, abnrm, bbnrm, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dggevx throws TypeError for invalid balanc', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevx( 'column-major', 'bad', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, ilo, ihi, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, abnrm, bbnrm, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dggevx throws TypeError for invalid jobvl', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevx( 'column-major', 'none', 'bad', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, ilo, ihi, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, abnrm, bbnrm, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dggevx throws TypeError for invalid jobvr', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevx( 'column-major', 'none', 'no-vectors', 'bad', 'none', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, ilo, ihi, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, abnrm, bbnrm, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dggevx throws TypeError for invalid sense', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'bad', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, ilo, ihi, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, abnrm, bbnrm, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dggevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', -1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, ilo, ihi, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, abnrm, bbnrm, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, RangeError );
});

test( 'dggevx throws RangeError for invalid LDA', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, ilo, ihi, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, abnrm, bbnrm, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dggevx throws RangeError for invalid LDB', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, ilo, ihi, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, abnrm, bbnrm, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, RangeError );
});

test( 'dggevx quick return for N=0', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const bbnrm = new Float64Array( 1 );
	const out = dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, ilo, ihi, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, abnrm, bbnrm, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	assert.equal( out, 0 );
	assert.equal( ilo[ 0 ], 1 );
	assert.equal( ihi[ 0 ], 0 );
	assert.equal( abnrm[ 0 ], 0 );
	assert.equal( bbnrm[ 0 ], 0 );
});

test( 'dggevx throws for invalid sense', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'bad', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, ilo, ihi, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, abnrm, bbnrm, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1 );
	}, TypeError );
});


// TESTS //

test( 'dggevx: 2x2_diag_none (column-major)', function t() {
	const tc = findCase( '2x2_diag_none' );
	const r = runCase( 'column-major', tc );
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
	const tc = findCase( '3x3_diag_permute' );
	const r = runCase( 'column-major', tc );
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
	const tc = findCase( '3x3_triu_both' );
	const r = runCase( 'column-major', tc );
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
	const tc = findCase( '4x4_complex_scale' );
	const r = runCase( 'column-major', tc );
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
	const tc = findCase( '4x4_general_both' );
	const r = runCase( 'column-major', tc );
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
	const tc = findCase( '1x1_trivial' );
	const r = runCase( 'column-major', tc );
	assert.equal( r.out.info, 0 );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});

test( 'dggevx: 2x2_diag_none (row-major reproduces column-major for symmetric case)', function t() {
	const tc = findCase( '2x2_diag_none' );
	const r = runCase( 'row-major', tc );
	assert.equal( r.out.info, 0 );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});

function runScaleCase( A, B ) {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const bbnrm = new Float64Array( 1 );
	const N = 2;
	const ALPHAR = new Float64Array( N );
	const ALPHAI = new Float64Array( N );
	const BETA = new Float64Array( N );
	const VL = new Float64Array( 1 );
	const VR = new Float64Array( 1 );
	const LSCALE = new Float64Array( N );
	const RSCALE = new Float64Array( N );
	const RCONDE = new Float64Array( N );
	const RCONDV = new Float64Array( N );
	const out = {
		'info': dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', N, A, N, B, N, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, 1, VR, 1, ilo, ihi, LSCALE, 1, RSCALE, 1, abnrm, bbnrm, RCONDE, 1, RCONDV, 1 ),
		'ilo': ilo[ 0 ],
		'ihi': ihi[ 0 ],
		'abnrm': abnrm[ 0 ],
		'bbnrm': bbnrm[ 0 ]
	};
	return {
		'out': out,
		'ALPHAR': ALPHAR,
		'BETA': BETA
	};
}

test( 'dggevx: scales A when max element below SMLNUM', function t() {
	const tiny = 1e-180;
	const r = runScaleCase( new Float64Array( [ 2.0 * tiny, 0.0, 0.0, 3.0 * tiny ] ), new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] ) );
	assert.equal( r.out.info, 0 );
	assertClose( r.ALPHAR[ 0 ] / r.BETA[ 0 ], 2.0 * tiny, 1e-10, 'eig0' );
	assertClose( r.ALPHAR[ 1 ] / r.BETA[ 1 ], 3.0 * tiny, 1e-10, 'eig1' );
});

test( 'dggevx: scales B when max element below SMLNUM', function t() {
	const tiny = 1e-180;
	const r = runScaleCase( new Float64Array( [ 2.0, 0.0, 0.0, 3.0 ] ), new Float64Array( [ tiny, 0.0, 0.0, tiny ] ) );
	assert.equal( r.out.info, 0 );
	assertClose( r.ALPHAR[ 0 ] / r.BETA[ 0 ], 2.0 / tiny, 1e-10, 'eig0' );
	assertClose( r.ALPHAR[ 1 ] / r.BETA[ 1 ], 3.0 / tiny, 1e-10, 'eig1' );
});

test( 'dggevx: scales A when max element above BIGNUM', function t() {
	const huge = 1e180;
	const r = runScaleCase( new Float64Array( [ 2.0 * huge, 0.0, 0.0, 3.0 * huge ] ), new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] ) );
	assert.equal( r.out.info, 0 );
	assertClose( r.ALPHAR[ 0 ] / r.BETA[ 0 ], 2.0 * huge, 1e-10, 'eig0' );
	assertClose( r.ALPHAR[ 1 ] / r.BETA[ 1 ], 3.0 * huge, 1e-10, 'eig1' );
});

test( 'dggevx: scales B when max element above BIGNUM', function t() {
	const huge = 1e180;
	const r = runScaleCase( new Float64Array( [ 2.0, 0.0, 0.0, 3.0 ] ), new Float64Array( [ huge, 0.0, 0.0, huge ] ) );
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
	const tc = findCase( '3x3_triu_both' );
	const tcVl = cloneCaseWithJobs( tc, 'V', 'N' );
	const r = runCase( 'column-major', tcVl );
	assert.equal( r.out.info, 0 );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});

test( 'dggevx: jobvl=no jobvr=compute (3x3_triu)', function t() {
	const tc = findCase( '3x3_triu_both' );
	const tcVr = cloneCaseWithJobs( tc, 'N', 'V' );
	const r = runCase( 'column-major', tcVr );
	assert.equal( r.out.info, 0 );
	assertArrayClose( r.ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( r.BETA, tc.beta, 1e-12, 'beta' );
});

test( 'dggevx: N=40 (> NB=32) with work = null matches the optimal explicit work bit-for-bit', function t() {
	const N = 40;
	const lwork = Math.max( ( 2 * N * ( N + 4 ) ) + 16, N + ( N * 32 ) + 4160 );
	const A0 = new Float64Array( N * N );
	const B0 = new Float64Array( N * N );
	let seed = 8675309;
	let i;
	for ( i = 0; i < N * N; i++ ) {
		seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
		A0[ i ] = ( seed / 2147483648 ) - 0.5;
		seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
		B0[ i ] = ( seed / 2147483648 ) - 0.5;
	}
	const runs = [ null, new Float64Array( lwork ) ].map( function run( work ) {
		const out = {
			'ALPHAR': new Float64Array( N ),
			'ALPHAI': new Float64Array( N ),
			'BETA': new Float64Array( N ),
			'VL': new Float64Array( N * N ),
			'VR': new Float64Array( N * N ),
			'RCONDE': new Float64Array( N ),
			'RCONDV': new Float64Array( N )
		};
		out.info = dggevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'both', N, new Float64Array( A0 ), N, new Float64Array( B0 ), N, out.ALPHAR, 1, out.ALPHAI, 1, out.BETA, 1, out.VL, N, out.VR, N, new Int32Array( 1 ), new Int32Array( 1 ), new Float64Array( N ), 1, new Float64Array( N ), 1, new Float64Array( 1 ), new Float64Array( 1 ), out.RCONDE, 1, out.RCONDV, 1, work, null, null );
		return out;
	});
	assert.equal( runs[ 0 ].info, 0, 'info' );
	assert.equal( runs[ 1 ].info, 0, 'info' );
	Object.keys( runs[ 1 ] ).forEach( function check( k ) {
		assert.deepStrictEqual( runs[ 0 ][ k ], runs[ 1 ][ k ], k );
	});
});
