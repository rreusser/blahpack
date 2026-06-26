/**
* @license Apache-2.0
*
* Copyright (c) 2026 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, max-len, max-params */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import ndarrayFn from './../lib/ndarray.js';
var dgeevx = ndarrayFn;


// FUNCTIONS //

/**
* Constructs a column-major matrix from a row-major 2D array.
*/
function colMajor( rows ) {
	var n = rows.length;
	var m = rows[ 0 ].length;
	var out = new Float64Array( n * m );
	var i;
	var j;
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
	var Av = new Float64Array( n );
	var maxErr = 0.0;
	var err;
	var i;
	var j;
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
	var Avr = new Float64Array( n );
	var Avi = new Float64Array( n );
	var maxErr = 0.0;
	var er;
	var ei;
	var i;
	var j;
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
	var pairs = [];
	var i;
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
	var ws = makeWorkspace( 0 );
	var A = new Float64Array( 1 );
	var WR = new Float64Array( 1 );
	var WI = new Float64Array( 1 );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var SCALE = new Float64Array( 1 );
	var RCONDE = new Float64Array( 1 );
	var RCONDV = new Float64Array( 1 );
	var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', 0, A, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );
});

test( 'dgeevx: N=1 scalar', function t() {
	var ws = makeWorkspace( 1 );
	var A = new Float64Array( [ 7.5 ] );
	var WR = new Float64Array( 1 );
	var WI = new Float64Array( 1 );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var SCALE = new Float64Array( 1 );
	var RCONDE = new Float64Array( 1 );
	var RCONDV = new Float64Array( 1 );
	var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', 1, A, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );
	assert.equal( out.ilo, 1 );
	assert.equal( out.ihi, 1 );
	assert.equal( out.abnrm, 7.5 );
	assert.equal( WR[ 0 ], 7.5 );
	assert.equal( WI[ 0 ], 0.0 );
	assert.equal( VL[ 0 ], 1.0 );
	assert.equal( VR[ 0 ], 1.0 );
});

test( 'dgeevx: 4x4 diagonal matrix (BALANC=both, both V)', function t() {
	var A = colMajor([
		[ 1, 0, 0, 0 ],
		[ 0, 2, 0, 0 ],
		[ 0, 0, 3, 0 ],
		[ 0, 0, 0, 4 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 4;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var expected;
	var actual;
	var resid;
	var i;
	var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );
	expected = sortedEigenvalues( [ 1, 2, 3, 4 ], [ 0, 0, 0, 0 ], n );
	actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12, 'ev ' + i );
	}
	for ( i = 0; i < n; i++ ) {
		resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
		assert.ok( resid < 1e-12, 'right ev residual: ' + resid );
	}
	// Diagonal matrix: balancing is identity permutation (ilo=ihi=1 happens here because all rows/cols isolate)
	assert.ok( out.ilo >= 1 );
	assert.ok( out.ihi <= n );

	// 1-norm of a diagonal matrix of 1..4 (after balancing which is identity) = 4
	assert.ok( Math.abs( out.abnrm - 4.0 ) < 1e-12 );
});

test( 'dgeevx: 4x4 with complex conjugate pairs, BALANC=none', function t() {
	var A = colMajor([
		[ 0, 1, 0, 0 ],
		[ -1, 0, 0, 0 ],
		[ 0, 0, 0, 2 ],
		[ 0, 0, -2, 0 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 4;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var expected;
	var actual;
	var resid;
	var i;
	var out = dgeevx( 'none', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );
	assert.equal( out.ilo, 1 );
	assert.equal( out.ihi, n );
	assert.ok( Math.abs( out.abnrm - 2.0 ) < 1e-12 );
	expected = sortedEigenvalues( [ 0, 0, 0, 0 ], [ -2, -1, 1, 2 ], n );
	actual = sortedEigenvalues( WR, WI, n );
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
	var A = colMajor([
		[ 4, -5, 0, 0 ],
		[ 2, -3, 0, 0 ],
		[ 0, 0, 1, 1 ],
		[ 0, 0, -1, 1 ]
	]);
	var n = 4;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var expected;
	var actual;
	var i;
	var out = dgeevx( 'permute', 'no-vectors', 'no-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );
	expected = sortedEigenvalues( [ -1, 1, 1, 2 ], [ 0, -1, 1, 0 ], n );
	actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12 );
		assert.ok( Math.abs( actual[ i ][ 1 ] - expected[ i ][ 1 ] ) < 1e-12 );
	}
});

test( 'dgeevx: right eigenvectors only, BALANC=scale', function t() {
	var A = colMajor([
		[ 1, 2, 3 ],
		[ 0, 4, 5 ],
		[ 0, 0, 6 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 3;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var i;
	var resid;
	var out = dgeevx( 'scale', 'no-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );
	for ( i = 0; i < n; i++ ) {
		resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
		assert.ok( resid < 1e-12, 'residual: ' + resid );
	}
});

test( 'dgeevx: left eigenvectors only, BALANC=both', function t() {
	var A = colMajor([
		[ 1, 2, 3 ],
		[ 0, 4, 5 ],
		[ 0, 0, 6 ]
	]);
	var n = 3;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( 1 );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var expected;
	var actual;
	var i;
	var out = dgeevx( 'both', 'compute-vectors', 'no-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, 1, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );
	expected = sortedEigenvalues( [ 1, 4, 6 ], [ 0, 0, 0 ], n );
	actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12 );
	}
});

test( 'dgeevx: mixed real and complex eigenvalues, BALANC=both', function t() {
	var A = colMajor([
		[ 1, 0, 0, 0 ],
		[ 0, 2, 0, 0 ],
		[ 0, 0, 0, -1 ],
		[ 0, 0, 1, 0 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 4;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var expected;
	var actual;
	var resid;
	var i;
	var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );
	expected = sortedEigenvalues( [ 0, 0, 1, 2 ], [ -1, 1, 0, 0 ], n );
	actual = sortedEigenvalues( WR, WI, n );
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
	var A = colMajor([
		[ 1, 1e4, 1e8, 1e12 ],
		[ 1e-4, 1, 1e4, 1e8 ],
		[ 1e-8, 1e-4, 1, 1e4 ],
		[ 1e-12, 1e-8, 1e-4, 1 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 4;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var i;
	var resid;
	var maxNorm = 0.0;
	var j;
	var colSum;
	var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );

	// Residuals should be small relative to matrix norm
	for ( i = 0; i < n; i++ ) {
		if ( WI[ i ] === 0.0 ) {
			resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
			assert.ok( resid < 1e-3, 'residual ' + i + ': ' + resid );
		}
	}
	// Balancing should produce non-trivial SCALE factors (not all 1)
	var anyScaled = false;
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
	assert.ok( out.abnrm <= maxNorm * 1.01, 'abnrm should not exceed original 1-norm' );
	assert.ok( out.abnrm > 0 );
});

test( 'dgeevx: ndarray wrapper validates arguments and computes eigenvalues', function t() {
	var A = colMajor([
		[ 1, 0, 0 ],
		[ 0, 2, 0 ],
		[ 0, 0, 3 ]
	]);
	var n = 3;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var out = ndarrayFn( 'both', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );
	assert.throws( function bad() {
		ndarrayFn( 'INVALID', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	}, /balanc/ );
	assert.throws( function bad() {
		ndarrayFn( 'both', 'X', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	}, /jobvl/ );
	assert.throws( function bad() {
		ndarrayFn( 'both', 'compute-vectors', 'X', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	}, /jobvr/ );
	assert.throws( function bad() {
		ndarrayFn( 'both', 'compute-vectors', 'compute-vectors', 'X', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	}, /sense/ );
	assert.throws( function bad() {
		ndarrayFn( 'both', 'compute-vectors', 'compute-vectors', 'none', -1, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	}, /nonnegative/ );
});

test( 'dgeevx: sense = both computes reciprocal condition numbers for a diagonal matrix', function t() {
	var A = colMajor([
		[ 1, 0 ],
		[ 0, 2 ]
	]);
	var n = 2;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'both', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );

	// Diagonal matrix with eigenvalues 1, 2: S = 1 for both, SEP = 1
	assert.ok( Math.abs( RCONDE[ 0 ] - 1.0 ) < 1e-13, 'RCONDE[0] == 1' );
	assert.ok( Math.abs( RCONDE[ 1 ] - 1.0 ) < 1e-13, 'RCONDE[1] == 1' );
	assert.ok( Math.abs( RCONDV[ 0 ] - 1.0 ) < 1e-13, 'RCONDV[0] == 1' );
	assert.ok( Math.abs( RCONDV[ 1 ] - 1.0 ) < 1e-13, 'RCONDV[1] == 1' );
});

test( 'dgeevx: SENSE=eigenvalues on a 3x3 diagonal matrix (only RCONDE computed)', function t() {
	var A = colMajor([
		[ 1, 0, 0 ],
		[ 0, 2, 0 ],
		[ 0, 0, 4 ]
	]);
	var n = 3;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var out = dgeevx( 'none', 'compute-vectors', 'compute-vectors', 'eigenvalues', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );
	assert.ok( Math.abs( RCONDE[ 0 ] - 1.0 ) < 1e-13 );
	assert.ok( Math.abs( RCONDE[ 1 ] - 1.0 ) < 1e-13 );
	assert.ok( Math.abs( RCONDE[ 2 ] - 1.0 ) < 1e-13 );
});

test( 'dgeevx: SENSE=right-vectors on a 3x3 diagonal matrix (RCONDV = gap)', function t() {
	var A = colMajor([
		[ 1, 0, 0 ],
		[ 0, 2, 0 ],
		[ 0, 0, 4 ]
	]);
	var n = 3;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var out = dgeevx( 'none', 'compute-vectors', 'compute-vectors', 'right-vectors', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );

	// For diagonal (1,2,4): minimum gap(1) = 1, gap(2) = 1, gap(4) = 2
	assert.ok( Math.abs( RCONDV[ 0 ] - 1.0 ) < 1e-12, 'RCONDV[0] == 1: got ' + RCONDV[ 0 ] );
	assert.ok( Math.abs( RCONDV[ 1 ] - 1.0 ) < 1e-12, 'RCONDV[1] == 1: got ' + RCONDV[ 1 ] );
	assert.ok( Math.abs( RCONDV[ 2 ] - 2.0 ) < 1e-12, 'RCONDV[2] == 2: got ' + RCONDV[ 2 ] );
});

test( 'dgeevx: SENSE=both on a 3x3 upper-triangular matrix', function t() {
	var A = colMajor([
		[ 1, 0.5, 0.25 ],
		[ 0, 2, 0.5 ],
		[ 0, 0, 4 ]
	]);
	var n = 3;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );
	var out = dgeevx( 'none', 'compute-vectors', 'compute-vectors', 'both', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, ws.iwork, 1, 0 );
	assert.equal( out.info, 0 );

	// Reference values captured from the Fortran fixture upper3_sense_B.
	assert.ok( Math.abs( RCONDE[ 0 ] - 0.8944271909999159 ) < 1e-10, 'RCONDE[0]: got ' + RCONDE[ 0 ] );
	assert.ok( Math.abs( RCONDE[ 1 ] - 0.8677218312746247 ) < 1e-10, 'RCONDE[1]: got ' + RCONDE[ 1 ] );
	assert.ok( Math.abs( RCONDE[ 2 ] - 0.9630868246861536 ) < 1e-10, 'RCONDE[2]: got ' + RCONDE[ 2 ] );
	assert.ok( Math.abs( RCONDV[ 0 ] - 0.8571428571428571 ) < 1e-10, 'RCONDV[0]: got ' + RCONDV[ 0 ] );
	assert.ok( Math.abs( RCONDV[ 1 ] - 1.0 ) < 1e-10, 'RCONDV[1]: got ' + RCONDV[ 1 ] );
	assert.ok( Math.abs( RCONDV[ 2 ] - 2.0 ) < 1e-10, 'RCONDV[2]: got ' + RCONDV[ 2 ] );
});

test( 'dgeevx: ndarray wrapper throws on undersized work array', function t() {
	var A = colMajor( [ [ 1, 0 ], [ 0, 2 ] ] );
	var n = 2;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );

	// Supply a work array that is too small (only 1 element; need max(1, 2*9)=18)
	var tinyWork = new Float64Array( 1 );
	assert.throws( function bad() {
		ndarrayFn( 'none', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, tinyWork, 1, 0, ws.iwork, 1, 0 );
	}, /work/ );
});

test( 'dgeevx: ndarray wrapper throws on undersized iwork array', function t() {
	var A = colMajor( [ [ 1, 0 ], [ 0, 2 ] ] );
	var n = 2;
	var ws = makeWorkspace( n );
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var SCALE = new Float64Array( n );
	var RCONDE = new Float64Array( n );
	var RCONDV = new Float64Array( n );

	// Supply an iwork array that is too small (0 elements; need max(1, 2*(2-1))=2)
	var tinyIwork = new Int32Array( 0 );
	assert.throws( function bad() {
		ndarrayFn( 'none', 'compute-vectors', 'compute-vectors', 'none', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, ws.work, 1, 0, tinyIwork, 1, 0 );
	}, /iwork/ );
});
