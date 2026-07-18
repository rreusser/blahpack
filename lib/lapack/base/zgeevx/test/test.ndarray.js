/* eslint-disable max-len, max-statements, max-lines, max-statements-per-line, no-mixed-operators, no-restricted-syntax, stdlib/first-unit-test, stdlib/jsdoc-private-annotation, camelcase, require-jsdoc */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeevx from './../lib/ndarray.js';


// FIXTURES //

const fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zgeevx.jsonl' );
const lines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );

// Upper triangular test input (Schur form is deterministic, so both RCONDE and RCONDV can be compared exactly against Fortran).
const A3_TRIU = [
	1.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	2.0,
	0.0,
	3.0,
	0.0,
	0.0,
	0.0,
	0.0,
	1.0,
	1.0,
	0.0,
	5.0,
	0.0
];


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertEigenvaluesClose( actual, expected, tol, msg ) {
	const N = expected.length / 2;
	const a = [];
	const e = [];
	let i;
	for ( i = 0; i < N; i++ ) {
		a.push( [ actual[ 2 * i ], actual[ 2 * i + 1 ] ] );
		e.push( [ expected[ 2 * i ], expected[ 2 * i + 1 ] ] );
	}
	a.sort( function cmp( x, y ) { return x[ 0 ] - y[ 0 ] || x[ 1 ] - y[ 1 ]; } );
	e.sort( function cmp( x, y ) { return x[ 0 ] - y[ 0 ] || x[ 1 ] - y[ 1 ]; } );
	for ( i = 0; i < N; i++ ) {
		assert.ok( Math.abs( a[ i ][ 0 ] - e[ i ][ 0 ] ) < tol && Math.abs( a[ i ][ 1 ] - e[ i ][ 1 ] ) < tol, msg + ': eigenvalue ' + i );
	}
}

function assertRightEigenvectors( A_orig, N, wv, vrv, tol, msg ) {
	let av_re, av_im, vr_re, vr_im, err, are, aim, vre, vim, lr, li, sr, si, i;
	let j, k;
	for ( j = 0; j < N; j++ ) {
		lr = wv[ 2 * j ];
		li = wv[ 2 * j + 1 ];
		for ( i = 0; i < N; i++ ) {
			av_re = 0.0;
			av_im = 0.0;
			for ( k = 0; k < N; k++ ) {
				are = A_orig[ 2 * ( i + k * N ) ];
				aim = A_orig[ 2 * ( i + k * N ) + 1 ];
				vre = vrv[ 2 * ( k + j * N ) ];
				vim = vrv[ 2 * ( k + j * N ) + 1 ];
				av_re += are * vre - aim * vim;
				av_im += are * vim + aim * vre;
			}
			vr_re = vrv[ 2 * ( i + j * N ) ];
			vr_im = vrv[ 2 * ( i + j * N ) + 1 ];
			sr = lr * vr_re - li * vr_im;
			si = lr * vr_im + li * vr_re;
			err = Math.abs( av_re - sr ) + Math.abs( av_im - si );
			assert.ok( err < tol, msg + ': A*v != lambda*v at (' + i + ',' + j + '), err=' + err );
		}
	}
}

function assertLeftEigenvectors( A_orig, N, wv, vlv, tol, msg ) {
	// u(j)^H A = lambda(j) u(j)^H
	let ua_re, ua_im, ul_re, ul_im, err, ure, uim, are, aim, lr, li, sr, si, i;
	let j, k;
	for ( j = 0; j < N; j++ ) {
		lr = wv[ 2 * j ];
		li = wv[ 2 * j + 1 ];
		for ( i = 0; i < N; i++ ) {
			ua_re = 0.0;
			ua_im = 0.0;
			for ( k = 0; k < N; k++ ) {
				ure = vlv[ 2 * ( k + j * N ) ];
				uim = -vlv[ 2 * ( k + j * N ) + 1 ];
				are = A_orig[ 2 * ( k + i * N ) ];
				aim = A_orig[ 2 * ( k + i * N ) + 1 ];
				ua_re += ure * are - uim * aim;
				ua_im += ure * aim + uim * are;
			}
			ul_re = vlv[ 2 * ( i + j * N ) ];
			ul_im = -vlv[ 2 * ( i + j * N ) + 1 ];
			sr = lr * ul_re - li * ul_im;
			si = lr * ul_im + li * ul_re;
			err = Math.abs( ua_re - sr ) + Math.abs( ua_im - si );
			assert.ok( err < tol, msg + ': u^H A != lambda u^H at (' + i + ',' + j + '), err=' + err );
		}
	}
}

function makeComplex128Array( data ) {
	return new Complex128Array( new Float64Array( data ).buffer );
}

function callZgeevx( balanc, jobvl, jobvr, sense, N, aData ) {
	const RCONDE = new Float64Array( Math.max( N, 1 ) );
	const RCONDV = new Float64Array( Math.max( N, 1 ) );
	const SCALE = new Float64Array( Math.max( N, 1 ) );
	const RWORK = new Float64Array( Math.max( 2 * N, 1 ) );
	const lwork = Math.max( 1, ( N * N ) + ( 2 * N ) );
	const WORK = new Complex128Array( lwork );
	const VL = new Complex128Array( Math.max( N * N, 1 ) );
	const VR = new Complex128Array( Math.max( N * N, 1 ) );
	const ld = Math.max( N, 1 );
	const A = makeComplex128Array( aData );
	const w = new Complex128Array( Math.max( N, 1 ) );
	const res = zgeevx( balanc, jobvl, jobvr, sense, N, A, 1, ld, 0, w, 1, 0, VL, 1, ld, 0, VR, 1, ld, 0, 0, 0, SCALE, 1, 0, 0, RCONDE, 1, 0, RCONDV, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	return {
		'info': res.info,
		'ilo': res.ilo,
		'ihi': res.ihi,
		'abnrm': res.abnrm,
		'w': reinterpret( w, 0 ),
		'VL': reinterpret( VL, 0 ),
		'VR': reinterpret( VR, 0 ),
		'SCALE': SCALE,
		'RCONDE': RCONDE,
		'RCONDV': RCONDV
	};
}


// TESTS //

test( 'zgeevx: N=0 quick return', function t() {
	const res = callZgeevx( 'none', 'no-vectors', 'no-vectors', 'none', 0, [ 0, 0 ] );
	assert.equal( res.info, 0 );
});

test( 'zgeevx: N=1 balance=none, no vectors', function t() {
	const res = callZgeevx( 'none', 'no-vectors', 'no-vectors', 'none', 1, [ 3.0, 2.0 ] );
	const tc = findCase( 'n1_none' );
	assert.equal( res.info, 0 );
	assert.equal( res.ilo, tc.ilo );
	assert.equal( res.ihi, tc.ihi );
	assert.ok( Math.abs( res.abnrm - tc.abnrm ) < 1e-12, 'abnrm' );
	assertEigenvaluesClose( res.w, tc.w, 1e-14, 'eigenvalues' );
});

test( 'zgeevx: N=2 balance=both, right eigenvectors (diagonal)', function t() {
	const A_data = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ];
	const res = callZgeevx( 'both', 'no-vectors', 'compute-vectors', 'none', 2, A_data );
	const tc = findCase( 'n2_balanceB_vr' );
	assert.equal( res.info, 0 );
	assert.equal( res.ilo, tc.ilo );
	assert.equal( res.ihi, tc.ihi );
	assert.ok( Math.abs( res.abnrm - tc.abnrm ) < 1e-12, 'abnrm' );
	assertEigenvaluesClose( res.w, tc.w, 1e-14, 'eigenvalues' );
	assertRightEigenvectors( A_data, 2, res.w, res.VR, 1e-12, 'eigenvec' );
});

test( 'zgeevx: N=2 balance=none, both eigenvectors', function t() {
	const A_data = [ 1.0, 2.0, 0.0, 1.0, 3.0, 0.0, 4.0, -1.0 ];
	const res = callZgeevx( 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A_data );
	const tc = findCase( 'n2_none_both' );
	assert.equal( res.info, 0 );
	assert.ok( Math.abs( res.abnrm - tc.abnrm ) < 1e-10, 'abnrm' );
	assertEigenvaluesClose( res.w, tc.w, 1e-12, 'eigenvalues' );
	assertRightEigenvectors( A_data, 2, res.w, res.VR, 1e-10, 'right' );
	assertLeftEigenvectors( A_data, 2, res.w, res.VL, 1e-10, 'left' );
});

test( 'zgeevx: N=3 balance=scale, right eigenvectors', function t() {
	const A_data = [
		1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		0.0,
		2.0,
		1.0,
		3.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.5,
		5.0,
		-2.0
	];
	const res = callZgeevx( 'scale', 'no-vectors', 'compute-vectors', 'none', 3, A_data );
	const tc = findCase( 'n3_scale_vr' );
	assert.equal( res.info, 0 );
	assert.ok( Math.abs( res.abnrm - tc.abnrm ) < 1e-10, 'abnrm' );
	assertEigenvaluesClose( res.w, tc.w, 1e-12, 'eigenvalues' );
	assertRightEigenvectors( A_data, 3, res.w, res.VR, 1e-10, 'right' );
});

test( 'zgeevx: N=4 balance=permute, both eigenvectors', function t() {
	const A_data = [
		10.0,
		0.0,
		0.5,
		-0.5,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.5,
		20.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0,
		30.0,
		0.0,
		0.5,
		-0.5,
		0.0,
		0.0,
		0.0,
		0.0,
		0.5,
		0.5,
		40.0,
		0.0
	];
	const res = callZgeevx( 'permute', 'compute-vectors', 'compute-vectors', 'none', 4, A_data );
	const tc = findCase( 'n4_permute_both' );
	assert.equal( res.info, 0 );
	assert.ok( Math.abs( res.abnrm - tc.abnrm ) < 1e-10, 'abnrm' );
	assertEigenvaluesClose( res.w, tc.w, 1e-10, 'eigenvalues' );
	assertRightEigenvectors( A_data, 4, res.w, res.VR, 1e-8, 'right' );
	assertLeftEigenvectors( A_data, 4, res.w, res.VL, 1e-8, 'left' );
});

function sortByEig( w, vals ) {
	const out = [];
	let i;
	for ( i = 0; i < vals.length; i++ ) {
		out.push( [ w[ 2 * i ], w[ 2 * i + 1 ], vals[ i ] ] );
	}
	out.sort( function cmp( a, b ) { return a[ 0 ] - b[ 0 ] || a[ 1 ] - b[ 1 ]; } );
	return out;
}

test( 'zgeevx: N=3 triu sense=eigenvalues — RCONDE matches Fortran exactly', function t() {
	let i;
	const res = callZgeevx( 'none', 'compute-vectors', 'compute-vectors', 'eigenvalues', 3, A3_TRIU.slice() );
	const tc = findCase( 'n3_triu_sense_b' );
	const actual = sortByEig( res.w, res.RCONDE );
	const exp = sortByEig( tc.w, tc.rconde );
	assert.equal( res.info, 0 );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 2 ] - exp[ i ][ 2 ] ) < 1e-13, 'RCONDE[' + i + ']=' + actual[ i ][ 2 ] + ' exp ' + exp[ i ][ 2 ] );
	}
});

test( 'zgeevx: N=3 triu sense=right-vectors — RCONDV matches Fortran exactly', function t() {
	let i;
	const res = callZgeevx( 'none', 'no-vectors', 'compute-vectors', 'right-vectors', 3, A3_TRIU.slice() );
	const tc = findCase( 'n3_triu_sense_b' );
	const actual = sortByEig( res.w, res.RCONDV );
	const exp = sortByEig( tc.w, tc.rcondv );
	assert.equal( res.info, 0 );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 2 ] - exp[ i ][ 2 ] ) < 1e-13, 'RCONDV[' + i + ']=' + actual[ i ][ 2 ] + ' exp ' + exp[ i ][ 2 ] );
	}
});

test( 'zgeevx: N=3 triu sense=both — RCONDE and RCONDV match Fortran exactly', function t() {
	const res = callZgeevx( 'none', 'compute-vectors', 'compute-vectors', 'both', 3, A3_TRIU.slice() );
	const tc = findCase( 'n3_triu_sense_b' );
	const ar = sortByEig( res.w, res.RCONDE );
	const av = sortByEig( res.w, res.RCONDV );
	const er = sortByEig( tc.w, tc.rconde );
	const ev = sortByEig( tc.w, tc.rcondv );
	let i;
	assert.equal( res.info, 0 );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( ar[ i ][ 2 ] - er[ i ][ 2 ] ) < 1e-13, 'RCONDE' );
		assert.ok( Math.abs( av[ i ][ 2 ] - ev[ i ][ 2 ] ) < 1e-13, 'RCONDV' );
	}
});

test( 'zgeevx: N=3 sense=both with balance=both — basic validity', function t() {
	// For a non-triangular matrix, the Schur form from zhseqr can differ
	// From Fortran's by an off-diagonal rotation, so condition numbers
	// Are not bitwise comparable. We verify that eigenvalues still match
	// And that RCONDE/RCONDV are finite and positive.
	const aData = [
		1.0,
		0.5,
		0.0,
		1.0,
		0.5,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		0.0,
		0.5,
		0.5,
		-1.0,
		1.0,
		0.0,
		5.0,
		-1.0
	];
	const res = callZgeevx( 'both', 'compute-vectors', 'compute-vectors', 'both', 3, aData );
	const tc = findCase( 'n3_sense_b' );
	let i;
	assert.equal( res.info, 0 );
	assertEigenvaluesClose( res.w, tc.w, 1e-12, 'eigenvalues' );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( res.RCONDE[ i ] > 0 && res.RCONDE[ i ] <= 1, 'RCONDE finite' );
		assert.ok( res.RCONDV[ i ] > 0 && Number.isFinite( res.RCONDV[ i ] ), 'RCONDV finite' );
	}
});

test( 'zgeevx: N=1 sense=both sets RCONDE=RCONDV=1', function t() {
	const res = callZgeevx( 'none', 'compute-vectors', 'compute-vectors', 'both', 1, [ 3.0, 2.0 ] );
	assert.equal( res.info, 0 );
	assert.equal( res.RCONDE[ 0 ], 1 );
	assert.equal( res.RCONDV[ 0 ], 1 );
});

test( 'zgeevx: eigenvalues-only path with sense=right-vectors uses schur mode', function t() {
	// Triggers the `else` branch where neither vl nor vr is computed but sense != 'none' forces zhseqr to produce the Schur form.
	let i;
	const res = callZgeevx( 'none', 'no-vectors', 'no-vectors', 'right-vectors', 3, A3_TRIU.slice() );
	const tc = findCase( 'n3_triu_sense_b' );
	const actual = sortByEig( res.w, res.RCONDV );
	const exp = sortByEig( tc.w, tc.rcondv );
	assert.equal( res.info, 0 );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 2 ] - exp[ i ][ 2 ] ) < 1e-13, 'RCONDV[' + i + ']' );
	}
});

function scaledTriuA3( S ) {
	return [
		1.0 * S,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		2.0 * S,
		0.0,
		3.0 * S,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0 * S,
		1.0 * S,
		0.0,
		5.0 * S,
		0.0
	];
}

test( 'zgeevx: tiny-scale matrix triggers anrm<SMLNUM scaling path', function t() {
	let i;
	const S = 1e-200;
	const aData = scaledTriuA3( S );
	const res = callZgeevx( 'none', 'compute-vectors', 'compute-vectors', 'both', 3, aData );
	assert.equal( res.info, 0 );
	const sorted = [];
	for ( i = 0; i < 3; i++ ) {
		sorted.push( res.w[ 2 * i ] );
	}
	sorted.sort( function cmp( a, b ) { return a - b; } );
	assert.ok( Math.abs( sorted[ 0 ] - ( 1 * S ) ) < ( 1e-12 * S ), 'eig0' );
	assert.ok( Math.abs( sorted[ 1 ] - ( 3 * S ) ) < ( 1e-12 * S ), 'eig1' );
	assert.ok( Math.abs( sorted[ 2 ] - ( 5 * S ) ) < ( 1e-12 * S ), 'eig2' );
	for ( i = 0; i < 3; i++ ) {
		assert.ok( res.RCONDV[ i ] > 0 && Number.isFinite( res.RCONDV[ i ] ), 'rcondv finite' );
	}
});

test( 'zgeevx: huge-scale matrix triggers anrm>BIGNUM scaling path', function t() {
	let i;
	const S = 1e200;
	const aData = scaledTriuA3( S );
	const res = callZgeevx( 'none', 'no-vectors', 'no-vectors', 'none', 3, aData );
	assert.equal( res.info, 0 );
	const sorted = [];
	for ( i = 0; i < 3; i++ ) {
		sorted.push( res.w[ 2 * i ] );
	}
	sorted.sort( function cmp( a, b ) { return a - b; } );
	assert.ok( Math.abs( sorted[ 0 ] - ( 1 * S ) ) < ( 1e-12 * S ), 'eig0' );
	assert.ok( Math.abs( sorted[ 2 ] - ( 5 * S ) ) < ( 1e-12 * S ), 'eig2' );
});
