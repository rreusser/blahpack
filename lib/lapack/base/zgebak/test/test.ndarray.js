

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgebak from './../lib/ndarray.js';

// FIXTURES //

import job_b_side_r from './fixtures/job_b_side_r.json' with { type: 'json' };
import job_b_side_l from './fixtures/job_b_side_l.json' with { type: 'json' };
import job_s_side_r from './fixtures/job_s_side_r.json' with { type: 'json' };
import job_p_side_r from './fixtures/job_p_side_r.json' with { type: 'json' };
import ilo_eq_ihi from './fixtures/ilo_eq_ihi.json' with { type: 'json' };
import job_s_side_l from './fixtures/job_s_side_l.json' with { type: 'json' };
import job_p_side_l from './fixtures/job_p_side_l.json' with { type: 'json' };
import nonidentity_v from './fixtures/nonidentity_v.json' with { type: 'json' };

// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		var relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Creates a Complex128Array of size LDV*M in column-major layout from
* an interleaved re/im flat array representing an NxM column-major matrix.
* Each column has N complex elements (2*N doubles). LDV >= N; extra rows
* (LDV - N) are zero-padded.
*
* @param {Array} flat - interleaved re/im doubles, column-major NxM
* @param {number} N - number of rows
* @param {number} M - number of columns
* @param {number} LDV - leading dimension (>= N)
* @returns {Complex128Array}
*/
function makeV( flat, N, M, LDV ) {
	var arr = new Complex128Array( LDV * M );
	var vw = reinterpret( arr, 0 );
	var i;
	var j;
	var srcIdx;
	var dstIdx;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			srcIdx = ( j * N + i ) * 2;
			dstIdx = ( j * LDV + i ) * 2;
			vw[ dstIdx ] = flat[ srcIdx ];
			vw[ dstIdx + 1 ] = flat[ srcIdx + 1 ];
		}
	}
	return arr;
}

/**
* Extracts the NxM submatrix from a Complex128Array with leading dimension LDV.
* Returns interleaved re/im doubles in column-major order.
*
* @param {Complex128Array} arr - source array
* @param {number} N - number of rows
* @param {number} M - number of columns
* @param {number} LDV - leading dimension
* @returns {Array}
*/
function extractV( arr, N, M, LDV ) {
	var vw = reinterpret( arr, 0 );
	var out = [];
	var i;
	var j;
	var idx;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = ( j * LDV + i ) * 2;
			out.push( vw[ idx ] );
			out.push( vw[ idx + 1 ] );
		}
	}
	return out;
}

/**
* Creates a Complex128Array identity matrix of size NxN with leading dimension LDV.
*/
function makeIdentityV( N, M, LDV ) {
	var arr = new Complex128Array( LDV * M );
	var vw = reinterpret( arr, 0 );
	var i;
	for ( i = 0; i < Math.min( N, M ); i++ ) {
		vw[ ( i * LDV + i ) * 2 ] = 1.0;
	}
	return arr;
}

// TESTS //

test( 'zgebak: JOB=B, SIDE=R — right eigenvectors with full back-transform', function t() {
	var tc = job_b_side_r;
	var N = 4;
	var M = 4;
	var LDV = 5;
	var info;

	var scale = new Float64Array( tc.scale );
	var V = makeIdentityV( N, M, LDV );

	info = zgebak( 'both', 'right', N, tc.ilo, tc.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=B, SIDE=L — left eigenvectors with full back-transform', function t() {
	var tcR = job_b_side_r;
	var tc = job_b_side_l;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tcR.scale );
	var V = makeIdentityV( N, M, LDV );

	var info = zgebak( 'both', 'left', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=S, SIDE=R — scaling only', function t() {
	var tcR = job_b_side_r;
	var tc = job_s_side_r;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tcR.scale );
	var V = makeIdentityV( N, M, LDV );

	var info = zgebak( 'scale', 'right', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=P, SIDE=R — permutation only', function t() {
	var tcR = job_b_side_r;
	var tc = job_p_side_r;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tcR.scale );
	var V = makeIdentityV( N, M, LDV );

	var info = zgebak( 'permute', 'right', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=N — no-op, returns immediately', function t() {
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var V = makeIdentityV( N, M, LDV );
	var Vbefore = extractV( V, N, M, LDV );

	var info = zgebak( 'none', 'right', N, 1, 4, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, Vbefore, 0, 'V unchanged' );
});

test( 'zgebak: N=0 — quick return', function t() {
	var scale = new Float64Array( 0 );
	var V = new Complex128Array( 0 );

	var info = zgebak( 'both', 'right', 0, 1, 0, scale, 1, 0, 0, V, 1, 1, 0 );

	assert.equal( info, 0 );
});

test( 'zgebak: M=0 — quick return', function t() {
	var scale = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var V = new Complex128Array( 0 );

	var info = zgebak( 'both', 'right', 4, 1, 4, scale, 1, 0, 0, V, 1, 4, 0 );

	assert.equal( info, 0 );
});

test( 'zgebak: ILO=IHI — skips scaling, does permutation only', function t() {
	var tc = ilo_eq_ihi;
	var N = 3;
	var M = 2;
	var LDV = 5;

	// SCALE encodes permutations: row 0 swaps with row 2 (SCALE(1)=3 in 1-based)
	var scale = new Float64Array( [ 3.0, 1.0, 1.0 ] );

	// V input: interleaved re/im, col-major NxM
	var Vdata = [
		1.0, 0.5, 3.0, 1.5, 5.0, 2.5,   // col 0: (1+0.5i), (3+1.5i), (5+2.5i)
		2.0, 1.0, 4.0, 2.0, 6.0, 3.0    // col 1: (2+1i), (4+2i), (6+3i)
	];
	var V = makeV( Vdata, N, M, LDV );

	var info = zgebak( 'both', 'right', N, 2, 2, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=S, SIDE=L — left eigenvectors, scaling only', function t() {
	var tc = job_s_side_l;
	var tcR = job_b_side_r;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tc.scale );

	// V input (non-identity complex matrix), interleaved re/im col-major
	var Vdata = [
		2.0, 0.1, 0.0, 0.5, 1.0, 0.9, 0.5, 1.3,   // col 0
		0.5, 0.2, 3.0, 0.6, 0.0, 1.0, 1.0, 1.4,   // col 1
		1.0, 0.3, 0.0, 0.7, 2.0, 1.1, 0.5, 1.5,   // col 2
		0.0, 0.4, 1.0, 0.8, 0.5, 1.2, 2.0, 1.6    // col 3
	];
	var V = makeV( Vdata, N, M, LDV );

	// ILO/IHI from the balance step (same matrix)
	var info = zgebak( 'scale', 'left', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=P, SIDE=L — left eigenvectors, permutation only', function t() {
	var tcR = job_b_side_r;
	var tc = job_p_side_l;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tcR.scale );
	var V = makeIdentityV( N, M, LDV );

	var info = zgebak( 'permute', 'left', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: non-identity V with JOB=B, SIDE=R', function t() {
	var tc = nonidentity_v;
	var tcFirst = job_b_side_r;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tc.scale );

	// V input (non-identity complex matrix), interleaved re/im col-major
	var Vdata = [
		2.0, 0.1, 0.0, 0.5, 1.0, 0.9, 0.5, 1.3,   // col 0
		0.5, 0.2, 3.0, 0.6, 0.0, 1.0, 1.0, 1.4,   // col 1
		1.0, 0.3, 0.0, 0.7, 2.0, 1.1, 0.5, 1.5,   // col 2
		0.0, 0.4, 1.0, 0.8, 0.5, 1.2, 2.0, 1.6    // col 3
	];
	var V = makeV( Vdata, N, M, LDV );

	var info = zgebak( 'both', 'right', N, tcFirst.ilo, tcFirst.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});
