/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dgeev from './../lib/ndarray.js';


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
			out[ i + j * n ] = rows[ i ][ j ];
		}
	}
	return out;
}

/**
* Computes the 2-norm of a vector.
*/
function norm2( v, n ) {
	var s = 0.0;
	var i;
	for ( i = 0; i < n; i++ ) {
		s += v[ i ] * v[ i ];
	}
	return Math.sqrt( s );
}

/**
* Verifies A*v = lambda*v for real eigenvalue.
* Returns the max relative residual |A*v - lambda*v| / (|lambda| * |v| + eps).
*/
function checkRealEigenvector( A, n, lambda, v, offsetV, strideV ) {
	var Av;
	var maxErr;
	var err;
	var i;
	var j;

	Av = new Float64Array( n );
	for ( i = 0; i < n; i++ ) {
		Av[ i ] = 0.0;
		for ( j = 0; j < n; j++ ) {
			Av[ i ] += A[ i + j * n ] * v[ offsetV + j * strideV ];
		}
	}
	maxErr = 0.0;
	for ( i = 0; i < n; i++ ) {
		err = Math.abs( Av[ i ] - lambda * v[ offsetV + i * strideV ] );
		maxErr = Math.max( maxErr, err );
	}
	return maxErr;
}

/**
* Verifies A*(vr + i*vi) = (wr + i*wi)*(vr + i*vi) for complex eigenvalue pair.
* Returns the max absolute residual.
*/
function checkComplexEigenvector( A, n, wr, wi, vr, vi, strideV ) {
	var Avr;
	var Avi;
	var maxErr;
	var i;
	var j;

	Avr = new Float64Array( n );
	Avi = new Float64Array( n );
	for ( i = 0; i < n; i++ ) {
		Avr[ i ] = 0.0;
		Avi[ i ] = 0.0;
		for ( j = 0; j < n; j++ ) {
			Avr[ i ] += A[ i + j * n ] * vr[ j * strideV ];
			Avi[ i ] += A[ i + j * n ] * vi[ j * strideV ];
		}
	}
	maxErr = 0.0;
	for ( i = 0; i < n; i++ ) {
		maxErr = Math.max( maxErr,
			Math.abs( Avr[ i ] - ( wr * vr[ i * strideV ] - wi * vi[ i * strideV ] ) ),
			Math.abs( Avi[ i ] - ( wr * vi[ i * strideV ] + wi * vr[ i * strideV ] ) )
		);
	}
	return maxErr;
}

/**
* Sorts eigenvalues by real part then imaginary part for comparison.
*/
function sortedEigenvalues( wr, wi, n ) {
	var pairs = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		pairs.push( [ wr[ i ], wi[ i ] ] );
	}
	pairs.sort( function cmp( a, b ) {
		if ( a[ 0 ] !== b[ 0 ] ) return a[ 0 ] - b[ 0 ];
		return a[ 1 ] - b[ 1 ];
	});
	return pairs;
}


// TESTS //

test( 'dgeev: N=0 returns immediately', function t() {
	var A = new Float64Array( 1 );
	var WR = new Float64Array( 1 );
	var WI = new Float64Array( 1 );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var info;

	info = dgeev( 'compute-vectors', 'compute-vectors', 0, A, 1, 0, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dgeev: N=1 scalar eigenvalue', function t() {
	var A = new Float64Array( [ 7.5 ] );
	var WR = new Float64Array( 1 );
	var WI = new Float64Array( 1 );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var info;

	info = dgeev( 'compute-vectors', 'compute-vectors', 1, A, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( WR[ 0 ], 7.5 );
	assert.equal( WI[ 0 ], 0.0 );
	assert.equal( VL[ 0 ], 1.0 );
	assert.equal( VR[ 0 ], 1.0 );
});

test( 'dgeev: 4x4 diagonal matrix (all real eigenvalues)', function t() {
	var A = colMajor([
		[ 1, 0, 0, 0 ],
		[ 0, 2, 0, 0 ],
		[ 0, 0, 3, 0 ],
		[ 0, 0, 0, 4 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 4;
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var info;
	var expected;
	var actual;
	var i;
	var resid;

	info = dgeev( 'compute-vectors', 'compute-vectors', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0 );
	assert.equal( info, 0, 'info should be 0' );

	// All imaginary parts should be zero
	for ( i = 0; i < n; i++ ) {
		assert.equal( WI[ i ], 0.0, 'WI[' + i + '] should be 0' );
	}

	// Eigenvalues should be 1, 2, 3, 4 (in some order)
	expected = sortedEigenvalues( [ 1, 2, 3, 4 ], [ 0, 0, 0, 0 ], n );
	actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12,
			'eigenvalue ' + i + ' real part' );
	}

	// Verify A*v = lambda*v for each right eigenvector
	for ( i = 0; i < n; i++ ) {
		resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
		assert.ok( resid < 1e-12, 'right eigenvector ' + i + ' residual: ' + resid );
	}
});

test( 'dgeev: 4x4 with complex conjugate eigenvalue pairs', function t() {
	var A = colMajor([
		[ 0,  1, 0,  0 ],
		[-1,  0, 0,  0 ],
		[ 0,  0, 0,  2 ],
		[ 0,  0, -2, 0 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 4;
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VR = new Float64Array( n * n );
	var VL = new Float64Array( n * n );
	var info;
	var expected;
	var actual;
	var i;
	var resid;

	info = dgeev( 'compute-vectors', 'compute-vectors', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0 );
	assert.equal( info, 0, 'info should be 0' );

	expected = sortedEigenvalues( [ 0, 0, 0, 0 ], [ -2, -1, 1, 2 ], n );
	actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12,
			'eigenvalue ' + i + ' real part' );
		assert.ok( Math.abs( actual[ i ][ 1 ] - expected[ i ][ 1 ] ) < 1e-12,
			'eigenvalue ' + i + ' imag part' );
	}

	for ( i = 0; i < n; i++ ) {
		if ( WI[ i ] === 0.0 ) {
			resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
			assert.ok( resid < 1e-12, 'right eigenvector ' + i + ' residual: ' + resid );
		} else if ( WI[ i ] > 0.0 ) {
			resid = checkComplexEigenvector( Acopy, n, WR[ i ], WI[ i ],
				VR.subarray( i * n ), VR.subarray( ( i + 1 ) * n ), 1 );
			assert.ok( resid < 1e-12, 'complex right eigenvector ' + i + ' residual: ' + resid );
		}
	}
});

test( 'dgeev: eigenvalues only (JOBVL=N, JOBVR=N)', function t() {
	var A = colMajor([
		[ 4, -5,  0,  0 ],
		[ 2, -3,  0,  0 ],
		[ 0,  0,  1,  1 ],
		[ 0,  0, -1,  1 ]
	]);
	var n = 4;
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var info;
	var expected;
	var actual;
	var i;

	info = dgeev( 'no-vectors', 'no-vectors', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0 );
	assert.equal( info, 0, 'info should be 0' );

	expected = sortedEigenvalues( [ -1, 1, 1, 2 ], [ 0, -1, 1, 0 ], n );
	actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12,
			'eigenvalue ' + i + ' real part' );
		assert.ok( Math.abs( actual[ i ][ 1 ] - expected[ i ][ 1 ] ) < 1e-12,
			'eigenvalue ' + i + ' imag part' );
	}
});

test( 'dgeev: right eigenvectors only (JOBVR=V)', function t() {
	var A = colMajor([
		[ 1, 2, 3 ],
		[ 0, 4, 5 ],
		[ 0, 0, 6 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 3;
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( n * n );
	var info;
	var expected;
	var actual;
	var i;
	var resid;

	info = dgeev( 'no-vectors', 'compute-vectors', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, n, 0 );
	assert.equal( info, 0, 'info should be 0' );

	expected = sortedEigenvalues( [ 1, 4, 6 ], [ 0, 0, 0 ], n );
	actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12 );
	}

	for ( i = 0; i < n; i++ ) {
		resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
		assert.ok( resid < 1e-12, 'right eigenvector ' + i + ' residual: ' + resid );
	}
});

test( 'dgeev: left eigenvectors only (JOBVL=V)', function t() {
	var A = colMajor([
		[ 1, 2, 3 ],
		[ 0, 4, 5 ],
		[ 0, 0, 6 ]
	]);
	var n = 3;
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( 1 );
	var info;
	var expected;
	var actual;
	var i;
	var nrm;

	info = dgeev( 'compute-vectors', 'no-vectors', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, 1, 0 );
	assert.equal( info, 0, 'info should be 0' );

	expected = sortedEigenvalues( [ 1, 4, 6 ], [ 0, 0, 0 ], n );
	actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12 );
	}

	for ( i = 0; i < n; i++ ) {
		nrm = norm2( VL.subarray( i * n, ( i + 1 ) * n ), n );
		assert.ok( nrm > 0.5, 'left eigenvector ' + i + ' should be normalized, norm=' + nrm );
	}
});

test( 'dgeev: mixed real and complex eigenvalues', function t() {
	var A = colMajor([
		[ 1, 0, 0,  0 ],
		[ 0, 2, 0,  0 ],
		[ 0, 0, 0, -1 ],
		[ 0, 0, 1,  0 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 4;
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var info;
	var expected;
	var actual;
	var i;
	var resid;

	info = dgeev( 'compute-vectors', 'compute-vectors', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0 );
	assert.equal( info, 0 );

	expected = sortedEigenvalues( [ 0, 0, 1, 2 ], [ -1, 1, 0, 0 ], n );
	actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12,
			'eigenvalue ' + i + ' real part' );
		assert.ok( Math.abs( actual[ i ][ 1 ] - expected[ i ][ 1 ] ) < 1e-12,
			'eigenvalue ' + i + ' imag part' );
	}

	for ( i = 0; i < n; i++ ) {
		if ( WI[ i ] === 0.0 ) {
			resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
			assert.ok( resid < 1e-12, 'right eigenvector ' + i + ' residual: ' + resid );
		} else if ( WI[ i ] > 0.0 ) {
			resid = checkComplexEigenvector( Acopy, n, WR[ i ], WI[ i ],
				VR.subarray( i * n ), VR.subarray( ( i + 1 ) * n ), 1 );
			assert.ok( resid < 1e-12, 'complex right eigenvector ' + i + ' residual: ' + resid );
		}
	}
});

test( 'dgeev: general non-symmetric 3x3', function t() {
	var A = colMajor([
		[ 2, 1, 0 ],
		[ 0, 3, 1 ],
		[ 0, 0, 1 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 3;
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var info;
	var expected;
	var actual;
	var i;
	var resid;

	info = dgeev( 'compute-vectors', 'compute-vectors', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0 );
	assert.equal( info, 0 );

	expected = sortedEigenvalues( [ 1, 2, 3 ], [ 0, 0, 0 ], n );
	actual = sortedEigenvalues( WR, WI, n );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Math.abs( actual[ i ][ 0 ] - expected[ i ][ 0 ] ) < 1e-12 );
	}

	for ( i = 0; i < n; i++ ) {
		resid = checkRealEigenvector( Acopy, n, WR[ i ], VR, i * n, 1 );
		assert.ok( resid < 1e-12, 'right eigenvector ' + i + ' residual: ' + resid );
	}
});

test( 'dgeev: 2x2 with complex eigenvalues', function t() {
	// A = [[1, -1], [1, 1]] has eigenvalues 1 +/- i
	var A = colMajor([
		[ 1, -1 ],
		[ 1,  1 ]
	]);
	var Acopy = new Float64Array( A );
	var n = 2;
	var WR = new Float64Array( n );
	var WI = new Float64Array( n );
	var VL = new Float64Array( n * n );
	var VR = new Float64Array( n * n );
	var info;
	var resid;

	info = dgeev( 'compute-vectors', 'compute-vectors', n, A, 1, n, 0, WR, 1, 0, WI, 1, 0, VL, 1, n, 0, VR, 1, n, 0 );
	assert.equal( info, 0 );

	assert.ok( Math.abs( WR[ 0 ] - 1.0 ) < 1e-12, 'WR[0] = 1' );
	assert.ok( Math.abs( Math.abs( WI[ 0 ] ) - 1.0 ) < 1e-12, 'WI[0] = +/- 1' );
	assert.ok( Math.abs( WR[ 1 ] - 1.0 ) < 1e-12, 'WR[1] = 1' );
	assert.equal( WI[ 0 ] + WI[ 1 ], 0.0, 'WI conjugate pair' );

	if ( WI[ 0 ] > 0 ) {
		resid = checkComplexEigenvector( Acopy, n, WR[ 0 ], WI[ 0 ],
			VR.subarray( 0 ), VR.subarray( n ), 1 );
		assert.ok( resid < 1e-12, 'complex right eigenvector residual: ' + resid );
	}
});
