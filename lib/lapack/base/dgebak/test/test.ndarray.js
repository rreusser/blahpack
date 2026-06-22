

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dgebak from './../lib/ndarray.js';

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
* Extracts the NxM submatrix from a column-major flat array with leading dimension LDV.
* Fixture matrices are stored as column-major NxM blocks (the print_matrix subroutine
* outputs columns of length N, M columns).
*/
function extractColMajor( flat, N, M ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out.push( flat[ j * N + i ] );
		}
	}
	return out;
}

/**
* Creates a Float64Array of size LDV*M in column-major layout from an NxM column-major flat array.
* LDV >= N. Extra rows (LDV - N) are zero-padded.
*/
function makeV( flat, N, M, LDV ) {
	var arr = new Float64Array( LDV * M );
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			arr[ j * LDV + i ] = flat[ j * N + i ];
		}
	}
	return arr;
}

/**
* Extracts an NxM submatrix from a column-major Float64Array with leading dimension LDV.
*/
function extractV( arr, N, M, LDV ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out.push( arr[ j * LDV + i ] );
		}
	}
	return out;
}

// TESTS //

test( 'dgebak: JOB=B, SIDE=R — right eigenvectors with full back-transform', function t() {
	var tc = job_b_side_r;
	var N = 4;
	var M = 4;
	var LDV = 5;
	var info;

	// SCALE from dgebal('both', ...) on the test matrix:
	var scale = new Float64Array( tc.scale );

	// V = identity (eigenvectors of balanced matrix):
	var Vdata = [];
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Vdata.push( i === j ? 1.0 : 0.0 );
		}
	}
	var V = makeV( Vdata, N, M, LDV );

	// ILO=1, IHI=4 (1-based, from fixture)
	info = dgebak( 'both', 'right', N, tc.ilo, tc.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var expected = extractColMajor( tc.V, N, M );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, expected, 1e-14, 'V' );
});

test( 'dgebak: JOB=B, SIDE=L — left eigenvectors with full back-transform', function t() {
	var tcR = job_b_side_r; // for scale/ilo/ihi
	var tc = job_b_side_l;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tcR.scale );

	// V = identity:
	var Vdata = [];
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Vdata.push( i === j ? 1.0 : 0.0 );
		}
	}
	var V = makeV( Vdata, N, M, LDV );

	var info = dgebak( 'both', 'left', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var expected = extractColMajor( tc.V, N, M );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, expected, 1e-14, 'V' );
});

test( 'dgebak: JOB=S, SIDE=R — scaling only', function t() {
	var tcR = job_b_side_r;
	var tc = job_s_side_r;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tcR.scale );

	var Vdata = [];
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Vdata.push( i === j ? 1.0 : 0.0 );
		}
	}
	var V = makeV( Vdata, N, M, LDV );

	var info = dgebak( 'scale', 'right', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var expected = extractColMajor( tc.V, N, M );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, expected, 1e-14, 'V' );
});

test( 'dgebak: JOB=P, SIDE=R — permutation only', function t() {
	var tcR = job_b_side_r;
	var tc = job_p_side_r;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tcR.scale );

	var Vdata = [];
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Vdata.push( i === j ? 1.0 : 0.0 );
		}
	}
	var V = makeV( Vdata, N, M, LDV );

	var info = dgebak( 'permute', 'right', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var expected = extractColMajor( tc.V, N, M );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, expected, 1e-14, 'V' );
});

test( 'dgebak: JOB=N — no-op, returns immediately', function t() {
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var Vdata = [];
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Vdata.push( i === j ? 1.0 : 0.0 );
		}
	}
	var V = makeV( Vdata, N, M, LDV );
	var Vcopy = new Float64Array( V );

	var info = dgebak( 'none', 'right', N, 1, 4, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	// V should be unchanged:
	for ( i = 0; i < V.length; i++ ) {
		assert.equal( V[ i ], Vcopy[ i ] );
	}
});

test( 'dgebak: N=0 — quick return', function t() {
	var scale = new Float64Array( 0 );
	var V = new Float64Array( 0 );

	var info = dgebak( 'both', 'right', 0, 1, 0, scale, 1, 0, 0, V, 1, 1, 0 );

	assert.equal( info, 0 );
});

test( 'dgebak: M=0 — quick return', function t() {
	var scale = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var V = new Float64Array( 0 );

	var info = dgebak( 'both', 'right', 4, 1, 4, scale, 1, 0, 0, V, 1, 4, 0 );

	assert.equal( info, 0 );
});

test( 'dgebak: ILO=IHI — skips scaling, does permutation only', function t() {
	var tc = ilo_eq_ihi;
	var N = 3;
	var M = 2;
	var LDV = 5;

	// SCALE encodes permutations: row 0 swaps with row 2 (SCALE(1)=3 in 1-based)
	var scale = new Float64Array( [ 3.0, 1.0, 1.0 ] );

	// V input:
	// col-major: V(1,1)=1, V(2,1)=3, V(3,1)=5, V(1,2)=2, V(2,2)=4, V(3,2)=6
	var Vdata = [ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ];
	var V = makeV( Vdata, N, M, LDV );

	// ILO=IHI=2 (1-based)
	var info = dgebak( 'both', 'right', N, 2, 2, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var expected = extractColMajor( tc.V, N, M );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, expected, 1e-14, 'V' );
});

test( 'dgebak: JOB=S, SIDE=L — left eigenvectors, scaling only', function t() {
	var tc = job_s_side_l;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tc.scale );

	// V input (non-identity):
	var Vdata = [
		2.0, 0.0, 1.0, 0.5,   // col 1
		0.5, 3.0, 0.0, 1.0,   // col 2
		1.0, 0.0, 2.0, 0.5,   // col 3
		0.0, 1.0, 0.5, 2.0    // col 4
	];
	var V = makeV( Vdata, N, M, LDV );

	var info = dgebak( 'scale', 'left', N, 1, 4, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var expected = extractColMajor( tc.V, N, M );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, expected, 1e-14, 'V' );
});

test( 'dgebak: JOB=P, SIDE=L — left eigenvectors, permutation only', function t() {
	var tcR = job_b_side_r;
	var tc = job_p_side_l;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tcR.scale );

	var Vdata = [];
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Vdata.push( i === j ? 1.0 : 0.0 );
		}
	}
	var V = makeV( Vdata, N, M, LDV );

	var info = dgebak( 'permute', 'left', N, tcR.ilo, tcR.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var expected = extractColMajor( tc.V, N, M );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, expected, 1e-14, 'V' );
});

test( 'dgebak: non-identity V with JOB=B, SIDE=R', function t() {
	var tc = nonidentity_v;
	var N = 4;
	var M = 4;
	var LDV = 5;

	var scale = new Float64Array( tc.scale );

	// V input (non-identity):
	var Vdata = [
		2.0, 0.0, 1.0, 0.5,   // col 1
		0.5, 3.0, 0.0, 1.0,   // col 2
		1.0, 0.0, 2.0, 0.5,   // col 3
		0.0, 1.0, 0.5, 2.0    // col 4
	];
	var V = makeV( Vdata, N, M, LDV );

	// Use same ILO/IHI from the first test (dgebal output on the same matrix)
	var tcFirst = job_b_side_r;
	var info = dgebak( 'both', 'right', N, tcFirst.ilo, tcFirst.ihi, scale, 1, 0, M, V, 1, LDV, 0 );

	assert.equal( info, 0 );
	var expected = extractColMajor( tc.V, N, M );
	var actual = extractV( V, N, M, LDV );
	assertArrayClose( actual, expected, 1e-14, 'V' );
});
