

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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		const relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
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
	const arr = new Complex128Array( LDV * M );
	const vw = reinterpret( arr, 0 );
	let i, j, srcIdx, dstIdx;
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
	const vw = reinterpret( arr, 0 );
	const out = [];
	let i, j, idx;
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
	const arr = new Complex128Array( LDV * M );
	const vw = reinterpret( arr, 0 );
	let i;
	for ( i = 0; i < Math.min( N, M ); i++ ) {
		vw[ ( i * LDV + i ) * 2 ] = 1.0;
	}
	return arr;
}

// TESTS //

test( 'zgebak: JOB=B, SIDE=R — right eigenvectors with full back-transform', function t() {
	const tc = job_b_side_r;
	const N = 4;
	const M = 4;
	const LDV = 5;

	const scale = new Float64Array( tc.scale );
	const V = makeIdentityV( N, M, LDV );

	const info = zgebak( 'both', 'right', N, tc.ilo, tc.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	const actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=B, SIDE=L — left eigenvectors with full back-transform', function t() {
	const tcR = job_b_side_r;
	const tc = job_b_side_l;
	const N = 4;
	const M = 4;
	const LDV = 5;

	const scale = new Float64Array( tcR.scale );
	const V = makeIdentityV( N, M, LDV );

	const info = zgebak( 'both', 'left', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	const actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=S, SIDE=R — scaling only', function t() {
	const tcR = job_b_side_r;
	const tc = job_s_side_r;
	const N = 4;
	const M = 4;
	const LDV = 5;

	const scale = new Float64Array( tcR.scale );
	const V = makeIdentityV( N, M, LDV );

	const info = zgebak( 'scale', 'right', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	const actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=P, SIDE=R — permutation only', function t() {
	const tcR = job_b_side_r;
	const tc = job_p_side_r;
	const N = 4;
	const M = 4;
	const LDV = 5;

	const scale = new Float64Array( tcR.scale );
	const V = makeIdentityV( N, M, LDV );

	const info = zgebak( 'permute', 'right', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	const actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=N — no-op, returns immediately', function t() {
	const N = 4;
	const M = 4;
	const LDV = 5;

	const scale = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const V = makeIdentityV( N, M, LDV );
	const Vbefore = extractV( V, N, M, LDV );

	const info = zgebak( 'none', 'right', N, 1, 4, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	const actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, Vbefore, 0, 'V unchanged' );
});

test( 'zgebak: N=0 — quick return', function t() {
	const scale = new Float64Array( 0 );
	const V = new Complex128Array( 0 );

	const info = zgebak( 'both', 'right', 0, 1, 0, scale, 1, 0, 0, V, 1, 1, 0 );

	assert.equal( info, 0 );
});

test( 'zgebak: M=0 — quick return', function t() {
	const scale = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const V = new Complex128Array( 0 );

	const info = zgebak( 'both', 'right', 4, 1, 4, scale, 1, 0, 0, V, 1, 4, 0 );

	assert.equal( info, 0 );
});

test( 'zgebak: ILO=IHI — skips scaling, does permutation only', function t() {
	const tc = ilo_eq_ihi;
	const N = 3;
	const M = 2;
	const LDV = 5;

	// SCALE encodes permutations: row 0 swaps with row 2 (SCALE(1)=3 in 1-based)
	const scale = new Float64Array( [ 3.0, 1.0, 1.0 ] );

	// V input: interleaved re/im, col-major NxM
	const Vdata = [
		1.0, 0.5, 3.0, 1.5, 5.0, 2.5,   // col 0: (1+0.5i), (3+1.5i), (5+2.5i)
		2.0, 1.0, 4.0, 2.0, 6.0, 3.0    // col 1: (2+1i), (4+2i), (6+3i)
	];
	const V = makeV( Vdata, N, M, LDV );

	const info = zgebak( 'both', 'right', N, 2, 2, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	const actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=S, SIDE=L — left eigenvectors, scaling only', function t() {
	const tc = job_s_side_l;
	const tcR = job_b_side_r;
	const N = 4;
	const M = 4;
	const LDV = 5;

	const scale = new Float64Array( tc.scale );

	// V input (non-identity complex matrix), interleaved re/im col-major
	const Vdata = [
		2.0, 0.1, 0.0, 0.5, 1.0, 0.9, 0.5, 1.3,   // col 0
		0.5, 0.2, 3.0, 0.6, 0.0, 1.0, 1.0, 1.4,   // col 1
		1.0, 0.3, 0.0, 0.7, 2.0, 1.1, 0.5, 1.5,   // col 2
		0.0, 0.4, 1.0, 0.8, 0.5, 1.2, 2.0, 1.6    // col 3
	];
	const V = makeV( Vdata, N, M, LDV );

	// ILO/IHI from the balance step (same matrix)
	const info = zgebak( 'scale', 'left', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	const actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: JOB=P, SIDE=L — left eigenvectors, permutation only', function t() {
	const tcR = job_b_side_r;
	const tc = job_p_side_l;
	const N = 4;
	const M = 4;
	const LDV = 5;

	const scale = new Float64Array( tcR.scale );
	const V = makeIdentityV( N, M, LDV );

	const info = zgebak( 'permute', 'left', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	const actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});

test( 'zgebak: non-identity V with JOB=B, SIDE=R', function t() {
	const tc = nonidentity_v;
	const tcFirst = job_b_side_r;
	const N = 4;
	const M = 4;
	const LDV = 5;

	const scale = new Float64Array( tc.scale );

	// V input (non-identity complex matrix), interleaved re/im col-major
	const Vdata = [
		2.0, 0.1, 0.0, 0.5, 1.0, 0.9, 0.5, 1.3,   // col 0
		0.5, 0.2, 3.0, 0.6, 0.0, 1.0, 1.0, 1.4,   // col 1
		1.0, 0.3, 0.0, 0.7, 2.0, 1.1, 0.5, 1.5,   // col 2
		0.0, 0.4, 1.0, 0.8, 0.5, 1.2, 2.0, 1.6    // col 3
	];
	const V = makeV( Vdata, N, M, LDV );

	const info = zgebak( 'both', 'right', N, tcFirst.ilo, tcFirst.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	const actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, tc.V, 1e-14, 'V' );
});
