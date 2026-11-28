/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, max-len, max-params */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import stridedFn from './../lib/strided.js';
import { computeOptimalWorkSize } from './../lib/base.js';
const dgeevx = stridedFn;


// FUNCTIONS //

/**
* Constructs a column-major matrix from a row-major 2D array.
*/
function colMajor( rows ) {
	const n = rows.length;
	const m = rows[ 0 ].length;
	const out = new Float64Array( n * m );
	let i, j;
	for ( j = 0; j < m; j++ ) {
		for ( i = 0; i < n; i++ ) {
			out[ i + ( j * n ) ] = rows[ i ][ j ];
		}
	}
	return out;
}

/**
* Allocates work and iwork buffers for an N-by-N dgeevx call.
*/
function makeWorkspace( n ) {
	return {
		'work': new Float64Array( Math.max( 1, n * ( n + 7 ) ) ),
		'iwork': new Int32Array( Math.max( 1, 2 * ( n - 1 ) ) )
	};
}

/**
* Returns the max residual |A_v - lambda_v|.
*/
function checkRealEigenvector( A, n, lambda, v, offsetV, strideV ) {
	const Av = new Float64Array( n );
	let maxErr = 0.0;
	let err, i, j;
	for ( i = 0; i < n; i++ ) {
		Av[ i ] = 0.0;
		for ( j = 0; j < n; j++ ) {
			Av[ i ] += A[ i + ( j * n ) ] * v[ offsetV + ( j * strideV ) ];
		}
	}
	for ( i = 0; i < n; i++ ) {
		err = Math.abs( Av[ i ] - ( lambda * v[ offsetV + ( i * strideV ) ] ) );
		if ( err > maxErr ) {
			maxErr = err;
		}
	}
	return maxErr;
}

/**
* Returns the max residual for a complex conjugate eigenvector pair.
*/
function checkComplexEigenvector( A, n, wr, wi, vr, vi, strideV ) {
	const Avr = new Float64Array( n );
	const Avi = new Float64Array( n );
	let maxErr = 0.0;
	let er, ei, i, j;
	for ( i = 0; i < n; i++ ) {
		Avr[ i ] = 0.0;
		Avi[ i ] = 0.0;
		for ( j = 0; j < n; j++ ) {
			Avr[ i ] += A[ i + ( j * n ) ] * vr[ j * strideV ];
			Avi[ i ] += A[ i + ( j * n ) ] * vi[ j * strideV ];
		}
	}
	for ( i = 0; i < n; i++ ) {
		er = Math.abs( Avr[ i ] - ( ( wr * vr[ i * strideV ] ) - ( wi * vi[ i * strideV ] ) ) );
		ei = Math.abs( Avi[ i ] - ( ( wr * vi[ i * strideV ] ) + ( wi * vr[ i * strideV ] ) ) );
		if ( er > maxErr ) {
			maxErr = er;
		}
		if ( ei > maxErr ) {
			maxErr = ei;
		}
	}
	return maxErr;
}

/**
* Sorts eigenvalues by real then imaginary part.
*/
function sortedEigenvalues( wr, wi, n ) {
	const pairs = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		pairs.push( [ wr[ i ], wi[ i ] ] );
	}
	pairs.sort( function cmp( a, b ) {
		if ( a[ 0 ] !== b[ 0 ] ) {
			return a[ 0 ] - b[ 0 ];
		}
		return a[ 1 ] - b[ 1 ];
	});
	return pairs;
}


// TESTS //

test( 'dgeevx: N=0 returns immediately', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const ws = makeWorkspace( 0 );
	const A = new Float64Array( 1 );
	const WR = new Float64Array( 1 );
	const WI = new Float64Array( 1 );
	const VL = new Float64Array( 1 );
	const VR = new Float64Array( 1 );
	const SCALE = new Float64Array( 1 );
	const RCONDE = new Float64Array( 1 );
	const RCONDV = new Float64Array( 1 );
	const out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', 0, A, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );
});

test( 'dgeevx: N=1 scalar', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const ws = makeWorkspace( 1 );
	const A = new Float64Array( [ 7.5 ] );
	const WR = new Float64Array( 1 );
	const WI = new Float64Array( 1 );
	const VL = new Float64Array( 1 );
	const VR = new Float64Array( 1 );
	const SCALE = new Float64Array( 1 );
	const RCONDE = new Float64Array( 1 );
	const RCONDV = new Float64Array( 1 );
	const out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', 1, A, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );
	assert.equal( ilo[ 0 ], 1 );
	assert.equal( ihi[ 0 ], 1 );
	assert.equal( abnrm[ 0 ], 7.5 );
	assert.equal( WR[ 0 ], 7.5 );
	assert.equal( WI[ 0 ], 0.0 );
	assert.equal( VL[ 0 ], 1.0 );
	assert.equal( VR[ 0 ], 1.0 );
});

test( 'dgeevx: 4x4 diagonal matrix (BALANC=both, both V)', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 1, 0, 0, 0 ],
		[ 0, 2, 0, 0 ],
		[ 0, 0, 3, 0 ],
		[ 0, 0, 0, 4 ]
	]);
	const Acopy = new Float64Array( A );
	const n = 4;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	let resid, i;
	const out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );
	const expected = sortedEigenvalues( [ 1, 2, 3, 4 ], [ 0, 0, 0, 0 ], n );
	const actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12, 'ev ' + i );
	}
	for ( i = 0; i < n; i++ ) {
		resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
		assert.ok( resid < 1e-12, 'right ev residual: ' + resid );
	}
	// Diagonal matrix: balancing is identity permutation (ilo=ihi=1 happens here because all rows/cols isolate)
	assert.ok( ilo[ 0 ] >= 1 );
	assert.ok( ihi[ 0 ] <= n );

	// 1-norm of a diagonal matrix of 1..4 (after balancing which is identity) = 4
	assert.ok( Math.abs( abnrm[ 0 ] - 4.0 ) < 1e-12 );
});

test( 'dgeevx: 4x4 with complex conjugate pairs, BALANC=none', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 0, 1, 0, 0 ],
		[ -1, 0, 0, 0 ],
		[ 0, 0, 0, 2 ],
		[ 0, 0, -2, 0 ]
	]);
	const Acopy = new Float64Array( A );
	const n = 4;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	let resid, i;
	const out = dgeevx( 'none', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );
	assert.equal( ilo[ 0 ], 1 );
	assert.equal( ihi[ 0 ], n );
	assert.ok( Math.abs( abnrm[ 0 ] - 2.0 ) < 1e-12 );
	const expected = sortedEigenvalues( [ 0, 0, 0, 0 ], [ -2, -1, 1, 2 ], n );
	const actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12 );
		assert.ok( Math.abs( actual[ i ][ 1 ] - expected[ i ][ 1 ] ) < 1e-12 );
	}
	for ( i = 0; i < n; i++ ) {
		if ( WI[ i ] === 0.0 ) {
			resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
			assert.ok( resid < 1e-12 );
		} else if ( WI[ i ] > 0.0 ) {
			resid = checkComplexEigenvector( Acopy, n, WR[ i ], WI[ i ], VR.subarray( i * n ), VR.subarray( ( i + 1 ) * n ), 1 );
			assert.ok( resid < 1e-12 );
		}
	}
	// When balanc='none', SCALE entries should all be 1
	for ( i = 0; i < n; i++ ) {
		assert.equal( SCALE[ i ], 1.0 );
	}
});

test( 'dgeevx: eigenvalues only, BALANC=permute', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 4, -5, 0, 0 ],
		[ 2, -3, 0, 0 ],
		[ 0, 0, 1, 1 ],
		[ 0, 0, -1, 1 ]
	]);
	const n = 4;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( 1 );
	const VR = new Float64Array( 1 );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	let i;
	const out = dgeevx( 'permute', 'no-vectors', 'no-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );
	const expected = sortedEigenvalues( [ -1, 1, 1, 2 ], [ 0, -1, 1, 0 ], n );
	const actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12 );
		assert.ok( Math.abs( actual[ i ][ 1 ] - expected[ i ][ 1 ] ) < 1e-12 );
	}
});

test( 'dgeevx: right eigenvectors only, BALANC=scale', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 1, 2, 3 ],
		[ 0, 4, 5 ],
		[ 0, 0, 6 ]
	]);
	const Acopy = new Float64Array( A );
	const n = 3;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( 1 );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	let i, resid;
	const out = dgeevx( 'scale', 'no-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );
	for ( i = 0; i < n; i++ ) {
		resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
		assert.ok( resid < 1e-12, 'residual: ' + resid );
	}
});

test( 'dgeevx: left eigenvectors only, BALANC=both', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 1, 2, 3 ],
		[ 0, 4, 5 ],
		[ 0, 0, 6 ]
	]);
	const n = 3;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( 1 );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	let i;
	const out = dgeevx( 'both', 'compute-vectors', 'no-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, 1, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );
	const expected = sortedEigenvalues( [ 1, 4, 6 ], [ 0, 0, 0 ], n );
	const actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12 );
	}
});

test( 'dgeevx: mixed real and complex eigenvalues, BALANC=both', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 1, 0, 0, 0 ],
		[ 0, 2, 0, 0 ],
		[ 0, 0, 0, -1 ],
		[ 0, 0, 1, 0 ]
	]);
	const Acopy = new Float64Array( A );
	const n = 4;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	let resid, i;
	const out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );
	const expected = sortedEigenvalues( [ 0, 0, 1, 2 ], [ -1, 1, 0, 0 ], n );
	const actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12 );
		assert.ok( Math.abs( actual[ i ][ 1 ] - expected[ i ][ 1 ] ) < 1e-12 );
	}
	for ( i = 0; i < n; i++ ) {
		if ( WI[ i ] === 0.0 ) {
			resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
			assert.ok( resid < 1e-12 );
		} else if ( WI[ i ] > 0.0 ) {
			resid = checkComplexEigenvector( Acopy, n, WR[ i ], WI[ i ], VR.subarray( i * n ), VR.subarray( ( i + 1 ) * n ), 1 );
			assert.ok( resid < 1e-12 );
		}
	}
});

test( 'dgeevx: graded 4x4 matrix exercises balancing scale factors', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 1, 1e4, 1e8, 1e12 ],
		[ 1e-4, 1, 1e4, 1e8 ],
		[ 1e-8, 1e-4, 1, 1e4 ],
		[ 1e-12, 1e-8, 1e-4, 1 ]
	]);
	const Acopy = new Float64Array( A );
	const n = 4;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	let i, resid;
	let maxNorm = 0.0;
	let j, colSum;
	const out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );

	// Residuals should be small relative to matrix norm
	for ( i = 0; i < n; i++ ) {
		if ( WI[ i ] === 0.0 ) {
			resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
			assert.ok( resid < 1e-3, 'residual ' + i + ': ' + resid );
		}
	}
	// Balancing should produce non-trivial SCALE factors (not all 1)
	let anyScaled = false;
	for ( i = 0; i < n; i++ ) {
		if ( SCALE[ i ] !== 1.0 ) {
			anyScaled = true;
		}
	}
	assert.ok( anyScaled, 'balancing should produce non-trivial SCALE' );

	// Abnrm should be the 1-norm of the balanced matrix (so less than the original inf-norm)
	for ( j = 0; j < n; j++ ) {
		colSum = 0.0;
		for ( i = 0; i < n; i++ ) {
			colSum += Math.abs( Acopy[ i + ( j * n ) ] );
		}
		if ( colSum > maxNorm ) {
			maxNorm = colSum;
		}
	}
	assert.ok( abnrm[ 0 ] <= maxNorm * 1.01, 'abnrm should not exceed original 1-norm' );
	assert.ok( abnrm[ 0 ] > 0 );
});

test( 'dgeevx: strided wrapper validates arguments and computes eigenvalues', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 1, 0, 0 ],
		[ 0, 2, 0 ],
		[ 0, 0, 3 ]
	]);
	const n = 3;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	const out = stridedFn( 'both', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		stridedFn( 'INVALID', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	}, TypeError );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		stridedFn( 'both', 'X', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	}, TypeError );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		stridedFn( 'both', 'compute-vectors', 'X', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	}, TypeError );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		stridedFn( 'both', 'compute-vectors', 'compute-vectors', 'X', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	}, TypeError );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		stridedFn( 'both', 'compute-vectors', 'compute-vectors', 'none', -1, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	}, RangeError );
});

test( 'dgeevx: sense = both computes reciprocal condition numbers for a diagonal matrix', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 1, 0 ],
		[ 0, 2 ]
	]);
	const n = 2;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	const out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'both', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );

	// Diagonal matrix with eigenvalues 1, 2: S = 1 for both, SEP = 1
	assert.ok( Math.abs( RCONDE[ 0 ] - 1.0 ) < 1e-13, 'RCONDE[0] == 1' );
	assert.ok( Math.abs( RCONDE[ 1 ] - 1.0 ) < 1e-13, 'RCONDE[1] == 1' );
	assert.ok( Math.abs( RCONDV[ 0 ] - 1.0 ) < 1e-13, 'RCONDV[0] == 1' );
	assert.ok( Math.abs( RCONDV[ 1 ] - 1.0 ) < 1e-13, 'RCONDV[1] == 1' );
});

test( 'dgeevx: SENSE=eigenvalues on a 3x3 diagonal matrix (only RCONDE computed)', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 1, 0, 0 ],
		[ 0, 2, 0 ],
		[ 0, 0, 4 ]
	]);
	const n = 3;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	const out = dgeevx( 'none', 'compute-vectors', 'compute-vectors', 'eigenvalues', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );
	assert.ok( Math.abs( RCONDE[ 0 ] - 1.0 ) < 1e-13 );
	assert.ok( Math.abs( RCONDE[ 1 ] - 1.0 ) < 1e-13 );
	assert.ok( Math.abs( RCONDE[ 2 ] - 1.0 ) < 1e-13 );
});

test( 'dgeevx: SENSE=right-vectors on a 3x3 diagonal matrix (RCONDV = gap)', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 1, 0, 0 ],
		[ 0, 2, 0 ],
		[ 0, 0, 4 ]
	]);
	const n = 3;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	const out = dgeevx( 'none', 'compute-vectors', 'compute-vectors', 'right-vectors', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );

	// For diagonal (1,2,4): minimum gap(1) = 1, gap(2) = 1, gap(4) = 2
	assert.ok( Math.abs( RCONDV[ 0 ] - 1.0 ) < 1e-12, 'RCONDV[0] == 1: got ' + RCONDV[ 0 ] );
	assert.ok( Math.abs( RCONDV[ 1 ] - 1.0 ) < 1e-12, 'RCONDV[1] == 1: got ' + RCONDV[ 1 ] );
	assert.ok( Math.abs( RCONDV[ 2 ] - 2.0 ) < 1e-12, 'RCONDV[2] == 2: got ' + RCONDV[ 2 ] );
});

test( 'dgeevx: SENSE=both on a 3x3 upper-triangular matrix', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = colMajor([
		[ 1, 0.5, 0.25 ],
		[ 0, 2, 0.5 ],
		[ 0, 0, 4 ]
	]);
	const n = 3;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );
	const out = dgeevx( 'none', 'compute-vectors', 'compute-vectors', 'both', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out, 0 );

	// Reference values captured from the Fortran fixture upper3_sense_B.
	assert.ok( Math.abs( RCONDE[ 0 ] - 0.8944271909999159 ) < 1e-10, 'RCONDE[0]: got ' + RCONDE[ 0 ] );
	assert.ok( Math.abs( RCONDE[ 1 ] - 0.8677218312746247 ) < 1e-10, 'RCONDE[1]: got ' + RCONDE[ 1 ] );
	assert.ok( Math.abs( RCONDE[ 2 ] - 0.9630868246861536 ) < 1e-10, 'RCONDE[2]: got ' + RCONDE[ 2 ] );
	assert.ok( Math.abs( RCONDV[ 0 ] - 0.8571428571428571 ) < 1e-10, 'RCONDV[0]: got ' + RCONDV[ 0 ] );
	assert.ok( Math.abs( RCONDV[ 1 ] - 1.0 ) < 1e-10, 'RCONDV[1]: got ' + RCONDV[ 1 ] );
	assert.ok( Math.abs( RCONDV[ 2 ] - 2.0 ) < 1e-10, 'RCONDV[2]: got ' + RCONDV[ 2 ] );
});

test( 'dgeevx: strided wrapper throws on undersized work array', function t() {
	const A = colMajor( [ [ 1, 0 ], [ 0, 2 ] ] );
	const n = 2;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );

	// Supply a work array that is too small (only 1 element; need max(1, 2*9)=18)
	const tinyWork = new Float64Array( 1 );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		stridedFn( 'none', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, tinyWork, 1, 0, ws.iwork, 1, 0 );
	}, /work/ );
});

test( 'dgeevx: strided wrapper throws on undersized iwork array', function t() {
	const A = colMajor( [ [ 1, 0 ], [ 0, 2 ] ] );
	const n = 2;
	const ws = makeWorkspace( n );
	const WR = new Float64Array( n );
	const WI = new Float64Array( n );
	const VL = new Float64Array( n * n );
	const VR = new Float64Array( n * n );
	const SCALE = new Float64Array( n );
	const RCONDE = new Float64Array( n );
	const RCONDV = new Float64Array( n );

	// Supply an iwork array that is too small (0 elements; need 2*N-2 = 2)
	const tinyIwork = new Int32Array( 0 );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		stridedFn( 'none', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, tinyIwork, 1, 0 );
	}, /iwork/ );
});

test( 'dgeevx: the reference minimum WORK suffices past the blocking threshold (ticket 0100)', function t() {
	let seed = 7;
	let opt, r, i;
	function rnd() {
		seed = ( seed * 16807 ) % 2147483647;
		return ( seed / 2147483647 ) - 0.5;
	}
	function run( jobv, sense, N, A0, lwork ) {
		const A = new Float64Array( A0 );
		const WR = new Float64Array( N );
		const WI = new Float64Array( N );
		const VL = new Float64Array( N * N );
		const VR = new Float64Array( N * N );
		const RCONDE = new Float64Array( N );
		const RCONDV = new Float64Array( N );
		const SCALE = new Float64Array( N );
		const abnrm = new Float64Array( 1 );
		const info = stridedFn( 'both', jobv, jobv, sense, N, A, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, new Int32Array( 1 ), new Int32Array( 1 ), SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, new Float64Array( lwork ), 1, 0, new Int32Array( 2 * N ), 1, 0 );
		return [ info, Array.from( WR ), Array.from( WI ), Array.from( RCONDE ), Array.from( RCONDV ) ];
	}
	function close( got, want, rtol, msg ) {
		let k;
		for ( k = 0; k < want.length; k++ ) {
			assert.ok( Math.abs( got[ k ] - want[ k ] ) <= rtol * Math.max( 1.0, Math.abs( want[ k ] ) ), msg + '[' + k + ']: ' + got[ k ] + ' vs ' + want[ k ] );
		}
	}
	const N = 40; // > NB+1 so the optimum blocks dgehrd; <= NMIN so dhseqr does not adapt to the length
	const A0 = new Float64Array( N * N );
	for ( i = 0; i < A0.length; i++ ) {
		A0[ i ] = rnd();
	}
	opt = run( 'compute-vectors', 'both', N, A0, 200 * N );
	r = run( 'compute-vectors', 'none', N, A0, 3 * N );
	assert.equal( r[ 0 ], 0, 'info' );
	close( r[ 1 ], opt[ 1 ], 1e-12, 'WR' );
	close( r[ 2 ], opt[ 2 ], 1e-12, 'WI' );
	r = run( 'compute-vectors', 'eigenvalues', N, A0, 3 * N );
	assert.equal( r[ 0 ], 0, 'info' );
	close( r[ 1 ], opt[ 1 ], 1e-12, 'WR' );
	close( r[ 3 ], opt[ 3 ], 1e-10, 'RCONDE' );
	r = run( 'compute-vectors', 'both', N, A0, ( N * N ) + ( 6 * N ) );
	assert.equal( r[ 0 ], 0, 'info' );
	close( r[ 1 ], opt[ 1 ], 1e-12, 'WR' );
	close( r[ 3 ], opt[ 3 ], 1e-10, 'RCONDE' );
	for ( i = 0; i < N; i++ ) {
		// RCONDV is DLACN2's estimate on the Schur form, whose signs the Hessenberg blocking can change:
		assert.ok( r[ 4 ][ i ] <= 2.0 * opt[ 4 ][ i ] && opt[ 4 ][ i ] <= 2.0 * r[ 4 ][ i ], 'RCONDV[' + i + ']' );
	}
	r = run( 'no-vectors', 'none', N, A0, 2 * N );
	assert.equal( r[ 0 ], 0, 'info' );
	close( r[ 1 ], opt[ 1 ], 1e-12, 'WR' );

	// One below the reference minimums throws:
	assert.throws( function throws() {
		run( 'compute-vectors', 'none', N, A0, ( 3 * N ) - 1 );
	}, /work array must have at least 120 elements/ );
	assert.throws( function throws() {
		run( 'compute-vectors', 'eigenvalues', N, A0, ( 3 * N ) - 1 );
	}, /work array must have at least 120 elements/ );
	assert.throws( function throws() {
		run( 'compute-vectors', 'both', N, A0, ( N * N ) + ( 6 * N ) - 1 );
	}, /work array must have at least 1840 elements/ );
	assert.throws( function throws() {
		run( 'no-vectors', 'none', N, A0, ( 2 * N ) - 1 );
	}, /work array must have at least 80 elements/ );
	assert.throws( function throws() {
		run( 'no-vectors', 'right-vectors', N, A0, ( N * N ) + ( 6 * N ) - 1 );
	}, /work array must have at least 1840 elements/ );
});

test( 'dgeevx: without eigenvectors, sense = right-vectors computes RCONDV from the full Schur form', function t() {
	// DHSEQR must run with JOB = 'S' whenever condition numbers are wanted, as the reference does; with JOB = 'E' the matrix handed to DTRSNA was not in Schur form and RCONDV was wrong.
	let seed = 3;
	let a, b, i;
	function run( jobv, N, A0 ) {
		const A = new Float64Array( A0 );
		const WR = new Float64Array( N );
		const WI = new Float64Array( N );
		const VL = new Float64Array( N * N );
		const VR = new Float64Array( N * N );
		const RCONDE = new Float64Array( N );
		const RCONDV = new Float64Array( N );
		const SCALE = new Float64Array( N );
		const abnrm = new Float64Array( 1 );
		const info = stridedFn( 'none', jobv, jobv, 'right-vectors', N, A, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, new Int32Array( 1 ), new Int32Array( 1 ), SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, new Float64Array( ( N * N ) + ( 100 * N ) ), 1, 0, new Int32Array( 2 * N ), 1, 0 );
		return [ info, Array.from( WR ), Array.from( WI ), Array.from( RCONDV ) ];
	}
	const N = 12;
	const A0 = new Float64Array( N * N );
	for ( i = 0; i < A0.length; i++ ) {
		seed = ( seed * 16807 ) % 2147483647;
		A0[ i ] = ( seed / 2147483647 ) - 0.5;
	}
	a = run( 'no-vectors', N, A0 );
	b = run( 'compute-vectors', N, A0 );
	assert.equal( a[ 0 ], 0, 'info' );
	assert.deepEqual( a, b );
});

test( 'dgeevx: the reference\'s IWORK extent is 2*N-2 (none at N <= 1), and exactly 2*N-2 suffices for sense = both', function t() {
	const RCONDE = new Float64Array( 3 );
	const RCONDV = new Float64Array( 3 );
	const SCALE = new Float64Array( 3 );
	const abnrm = new Float64Array( 1 );
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const WR = new Float64Array( 3 );
	const WI = new Float64Array( 3 );
	const VL = new Float64Array( 9 );
	const VR = new Float64Array( 9 );
	let out;
	let A;

	A = new Float64Array( [ 7.5 ] );
	out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'both', 1, A, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, makeWorkspace( 1 ).work, 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.equal( out, 0, 'N=1 info' );
	assert.equal( WR[ 0 ], 7.5, 'N=1 WR' );
	assert.equal( RCONDE[ 0 ], 1.0, 'N=1 RCONDE' );
	out = dgeevx( 'both', 'no-vectors', 'no-vectors', 'none', 0, new Float64Array( 1 ), 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, new Float64Array( 1 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.equal( out, 0, 'N=0 info' );

	A = colMajor([
		[ 1, 0.5, 0.25 ],
		[ 0, 2, 0.5 ],
		[ 0, 0, 4 ]
	]);
	assert.throws( function bad() {
		dgeevx( 'none', 'compute-vectors', 'compute-vectors', 'both', 3, new Float64Array( A ), 1, 3, 0, WR, 1, 0, WI, 1, 0, VL, 1, 3, 0, VR, 1, 3, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, makeWorkspace( 3 ).work, 1, 0, new Int32Array( 4 ), 1, 1 );
	}, RangeError );
	out = dgeevx( 'none', 'compute-vectors', 'compute-vectors', 'both', 3, A, 1, 3, 0, WR, 1, 0, WI, 1, 0, VL, 1, 3, 0, VR, 1, 3, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, makeWorkspace( 3 ).work, 1, 0, new Int32Array( 4 ).fill( -999 ), 1, 0 );
	assert.equal( out, 0, 'N=3 info' );
	assert.ok( Math.abs( RCONDE[ 1 ] - 0.8677218312746247 ) < 1e-10, 'RCONDE[1]: got ' + RCONDE[ 1 ] );
	assert.ok( Math.abs( RCONDV[ 0 ] - 0.8571428571428571 ) < 1e-10, 'RCONDV[0]: got ' + RCONDV[ 0 ] );
	assert.ok( Math.abs( RCONDV[ 2 ] - 2.0 ) < 1e-10, 'RCONDV[2]: got ' + RCONDV[ 2 ] );
});

// Battery of `test/fortran/test_dgeevx.f90` (ticket 0110): every output
// compared with the reference, across BALANC, JOBVL/JOBVR, SENSE, and |A|
// scaled into the tiny/huge branches.

const BATTERY = readFileSync( resolve( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures', 'dgeevx.jsonl' ), 'utf8' ).trim().split( '\n' ).map( ( line ) => JSON.parse( line ) );
const BALANC = {
	'N': 'none',
	'P': 'permute',
	'S': 'scale',
	'B': 'both'
};
const JOB = {
	'V': 'compute-vectors',
	'N': 'no-vectors'
};
const SENSE = {
	'N': 'none',
	'E': 'eigenvalues',
	'V': 'right-vectors',
	'B': 'both'
};

// The matrix of `gen`: LCG entries in [-0.5, 0.5) (seed 1), column-major;
// typ 2 grades A(i,j) by 4^(i-j); typ 3 zeroes A(i,1), i > 1, and A(n,j),
// j < n; typ 4 keeps only the last column; typ 5 is zero; typ 6 zeroes A(1,j),
// j > 1; then everything is multiplied by sc.
function genMatrix( n, typ, sc ) {
	const M = new Float64Array( n * n );
	let x = 1;
	let i;
	let j;
	let v;
	for ( j = 1; j <= n; j++ ) {
		for ( i = 1; i <= n; i++ ) {
			x = ( x * 16807 ) % 2147483647;
			v = ( x / 2147483647 ) - 0.5;
			if ( typ === 2 ) {
				v *= Math.pow( 4.0, i - j );
			}
			if ( typ === 3 && ( ( j === 1 && i > 1 ) || ( i === n && j < n ) ) ) {
				v = 0.0;
			}
			if ( ( typ === 4 && j < n ) || typ === 5 || ( typ === 6 && i === 1 && j > 1 ) ) {
				v = 0.0;
			}
			M[ ( i - 1 ) + ( ( j - 1 ) * n ) ] = v * sc;
		}
	}
	return M;
}

// Relative to the largest expected magnitude, so that tiny or huge scaled
// outputs are compared meaningfully; an entry the reference gives as exactly
// zero (a structural zero, e.g. the entry DGEEVX's rotation zeroes in a complex
// pair's second vector) must be exactly zero.
function assertArrayRelClose( actual, expected, tol, msg ) {
	let scale = 0.0;
	let i;
	assert.equal( actual.length, expected.length, msg + ': length' );
	for ( i = 0; i < expected.length; i++ ) {
		scale = Math.max( scale, Math.abs( expected[ i ] ) );
	}
	for ( i = 0; i < expected.length; i++ ) {
		if ( expected[ i ] === 0.0 ) {
			assert.equal( actual[ i ], 0.0, msg + '[' + i + ']: expected exactly 0, got ' + actual[ i ] );
		} else {
			assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol * scale, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
		}
	}
}

BATTERY.filter( ( tc ) => /^(bat|lastcol|zero|rowone)_/.test( tc.name ) ).forEach( ( tc ) => {
	test( 'dgeevx: battery ' + tc.name + ' matches the reference\'s info, ilo, ihi, abnrm, WR, WI, SCALE, VL, VR, RCONDE, RCONDV (ticket 0110)', function t() {
		const n = tc.n;
		const A = genMatrix( n, tc.typ, tc.sc );
		const WR = new Float64Array( n );
		const WI = new Float64Array( n );
		const VL = new Float64Array( n * n ).fill( -7.0 );
		const VR = new Float64Array( n * n ).fill( -7.0 );
		const SCALE = new Float64Array( n );
		const RCONDE = new Float64Array( n ).fill( -7.0 );
		const RCONDV = new Float64Array( n ).fill( -7.0 );
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const work = new Float64Array( ( 20 * n * n ) + 200 );
		const iwork = new Int32Array( 4 * n );
		const info = dgeevx( BALANC[ tc.balanc ], JOB[ tc.jobvl ], JOB[ tc.jobvr ], SENSE[ tc.sense ], n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, ilo, ihi, SCALE, 1, 0, abnrm, RCONDE, 1, 0, RCONDV, 1, 0, work, 1, 0, iwork, 1, 0 );
		assert.equal( info, tc.info, 'info' );
		assert.equal( ilo[ 0 ], tc.ilo, 'ilo' );
		assert.equal( ihi[ 0 ], tc.ihi, 'ihi' );
		assertArrayRelClose( [ abnrm[ 0 ] ], [ tc.abnrm ], 1e-13, 'abnrm' );
		assertArrayRelClose( WR, tc.wr, 1e-12, 'WR' );
		assertArrayRelClose( WI, tc.wi, 1e-12, 'WI' );
		assertArrayRelClose( SCALE, tc.scale, 1e-13, 'SCALE' );
		assertArrayRelClose( VL, tc.vl, 1e-10, 'VL' );
		assertArrayRelClose( VR, tc.vr, 1e-10, 'VR' );
		assertArrayRelClose( RCONDE, tc.rconde, 1e-10, 'RCONDE' );
		assertArrayRelClose( RCONDV, tc.rcondv, 1e-10, 'RCONDV' );
	});
});

BATTERY.filter( ( tc ) => tc.name.startsWith( 'query_' ) ).forEach( ( tc ) => {
	test( 'dgeevx: ' + tc.name + ': the optimum equals the reference\'s MAXWRK where dtrevc3\'s optimum dominates (ticket 0110)', function t() {
		assert.equal( computeOptimalWorkSize( JOB[ tc.jobvl ], JOB[ tc.jobvr ], SENSE[ tc.sense ], tc.n ), tc.maxwrk );
	});
});

test( 'dgeevx: N = 1 runs the reference\'s path: RCONDV = |A(1,1)| (DTRSNA\'s SEP(1)) and only the condition numbers SENSE asks for are written', function t() {
	const cases = [ [ 'both', 1.0, 2.5 ], [ 'right-vectors', -7.0, 2.5 ], [ 'eigenvalues', 1.0, -7.0 ] ];
	let RCONDE;
	let RCONDV;
	let info;
	let k;
	for ( k = 0; k < cases.length; k++ ) {
		RCONDE = new Float64Array( [ -7.0 ] );
		RCONDV = new Float64Array( [ -7.0 ] );
		info = dgeevx( 'both', 'compute-vectors', 'compute-vectors', cases[ k ][ 0 ], 1, new Float64Array( [ -2.5 ] ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Int32Array( 1 ), new Int32Array( 1 ), new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), RCONDE, 1, 0, RCONDV, 1, 0, new Float64Array( 7 ), 1, 0, new Int32Array( 1 ), 1, 0 );
		assert.equal( info, 0, cases[ k ][ 0 ] + ': info' );
		assert.equal( RCONDE[ 0 ], cases[ k ][ 1 ], cases[ k ][ 0 ] + ': RCONDE' );
		assert.equal( RCONDV[ 0 ], cases[ k ][ 2 ], cases[ k ][ 0 ] + ': RCONDV' );
	}
});

test( 'dgeevx: battery cases in padded storage (strides, offsets, LDV = N + 1, sentinels) give the same outputs and touch no sentinel (ticket 0110)', function t() {
	const names = [ 'bat_n5_t1_s1_BVVB', 'bat_n8_t1_s1_NVVN', 'bat_n8_t3_s1_PVVV', 'bat_n5_t2_s2_BVVB', 'lastcol_huge_BVVB' ];
	let tc;
	let n;
	let ld;
	let A;
	let WR;
	let WI;
	let VL;
	let VR;
	let SCALE;
	let RCONDE;
	let RCONDV;
	let info;
	let i;
	let j;
	let k;
	for ( k = 0; k < names.length; k++ ) {
		tc = BATTERY.find( ( c ) => c.name === names[ k ] );
		n = tc.n;
		ld = n + 1;
		A = new Float64Array( ( ld * n ) + 1 ).fill( 99.0 );
		const A0 = genMatrix( n, tc.typ, tc.sc );
		for ( j = 0; j < n; j++ ) {
			for ( i = 0; i < n; i++ ) {
				A[ 1 + i + ( j * ld ) ] = A0[ i + ( j * n ) ];
			}
		}
		// Unused slots of the outputs: -7, and 0.5 one past WI's end, so that a
		// pass over i = N would take the complex-pair branch and write VL/VR's padding.
		WR = new Float64Array( ( 2 * n ) + 2 ).fill( -7.0 );
		WI = new Float64Array( ( 2 * n ) + 2 ).fill( 0.5 );
		VL = new Float64Array( ( ld * ( n + 2 ) ) + 1 ).fill( -7.0 );
		VR = new Float64Array( ( ld * ( n + 2 ) ) + 1 ).fill( -7.0 );
		SCALE = new Float64Array( ( 2 * n ) + 2 ).fill( -7.0 );
		RCONDE = new Float64Array( ( 2 * n ) + 2 ).fill( -7.0 );
		RCONDV = new Float64Array( ( 2 * n ) + 2 ).fill( -7.0 );
		info = dgeevx( BALANC[ tc.balanc ], JOB[ tc.jobvl ], JOB[ tc.jobvr ], SENSE[ tc.sense ], n, A, 1, ld, 1, WR, 2, 1, WI, 2, 1, VL, 1, ld, 1, VR, 1, ld, 1, new Int32Array( 1 ), new Int32Array( 1 ), SCALE, 2, 1, new Float64Array( 1 ), RCONDE, 2, 1, RCONDV, 2, 1, new Float64Array( ( 20 * n * n ) + 200 ), 1, 0, new Int32Array( 4 * n ), 1, 0 );
		assert.equal( info, tc.info, tc.name + ': info' );
		for ( i = 0; i < WR.length; i++ ) {
			if ( i % 2 === 1 && i < 2 * n ) {
				assertArrayRelClose( [ WR[ i ], WI[ i ], SCALE[ i ], RCONDE[ i ], RCONDV[ i ] ], [ tc.wr[ ( i - 1 ) / 2 ], tc.wi[ ( i - 1 ) / 2 ], tc.scale[ ( i - 1 ) / 2 ], tc.rconde[ ( i - 1 ) / 2 ], tc.rcondv[ ( i - 1 ) / 2 ] ], 1e-10, tc.name + ' outputs at ' + i );
			} else {
				assert.equal( WR[ i ], -7.0, tc.name + ': WR sentinel ' + i );
				assert.equal( WI[ i ], 0.5, tc.name + ': WI sentinel ' + i );
				assert.equal( SCALE[ i ], -7.0, tc.name + ': SCALE sentinel ' + i );
				assert.equal( RCONDE[ i ], -7.0, tc.name + ': RCONDE sentinel ' + i );
				assert.equal( RCONDV[ i ], -7.0, tc.name + ': RCONDV sentinel ' + i );
			}
		}
		for ( i = 0; i < VL.length; i++ ) {
			const r = ( i - 1 ) % ld;
			const c = Math.floor( ( i - 1 ) / ld );
			if ( i >= 1 && r < n && c < n ) {
				if ( tc.jobvl === 'V' ) {
					assertArrayRelClose( [ VL[ i ] ], [ tc.vl[ r + ( c * n ) ] ], 1e-8, tc.name + ': VL(' + r + ',' + c + ')' );
				}
				if ( tc.jobvr === 'V' ) {
					assertArrayRelClose( [ VR[ i ] ], [ tc.vr[ r + ( c * n ) ] ], 1e-8, tc.name + ': VR(' + r + ',' + c + ')' );
				}
			} else {
				assert.equal( VL[ i ], -7.0, tc.name + ': VL sentinel ' + i );
				assert.equal( VR[ i ], -7.0, tc.name + ': VR sentinel ' + i );
			}
		}
	}
});

test( 'dgeevx: N = 0 sets ilo = 1, ihi = 0 and abnrm = 0 (DGEBAL\'s convention for an empty matrix)', function t() {
	const ilo = new Int32Array( [ 5 ] );
	const ihi = new Int32Array( [ 5 ] );
	const abnrm = new Float64Array( [ 5.0 ] );
	const info = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'both', 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, ilo, ihi, new Float64Array( 1 ), 1, 0, abnrm, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	assert.equal( info, 0 );
	assert.equal( ilo[ 0 ], 1 );
	assert.equal( ihi[ 0 ], 0 );
	assert.equal( abnrm[ 0 ], 0.0 );
});
