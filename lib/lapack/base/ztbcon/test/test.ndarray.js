/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztbcon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// Build upper-band Complex128Array from a real N-by-N column-major matrix.
// LDAB = KD+1; AB[KD + i - j, j] = A[i,j] for max(0,j-KD) <= i <= j.
function packUpperBandReal( A, N, KD ) {
	var LDAB = KD + 1;
	var AB = new Complex128Array( LDAB * N );
	var v = reinterpret( AB, 0 );
	var i, j, idx;
	for ( j = 0; j < N; j++ ) {
		var ilo = Math.max( 0, j - KD );
		for ( i = ilo; i <= j; i++ ) {
			idx = (KD + i - j) + j*LDAB;
			v[ 2*idx ] = A[ i + j*N ];
			v[ 2*idx + 1 ] = 0.0;
		}
	}
	return AB;
}

function packLowerBandReal( A, N, KD ) {
	var LDAB = KD + 1;
	var AB = new Complex128Array( LDAB * N );
	var v = reinterpret( AB, 0 );
	var i, j, idx;
	for ( j = 0; j < N; j++ ) {
		var ihi = Math.min( N-1, j + KD );
		for ( i = j; i <= ihi; i++ ) {
			idx = (i - j) + j*LDAB;
			v[ 2*idx ] = A[ i + j*N ];
			v[ 2*idx + 1 ] = 0.0;
		}
	}
	return AB;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof ztbcon, 'function', 'main export is a function' );
});

test( 'ztbcon: throws TypeError for invalid uplo', function t() {
	var AB = new Complex128Array( 4 );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 4 );
	var rwork = new Float64Array( 2 );
	assert.throws( function throws() {
		ztbcon( 'one-norm', 'invalid', 'non-unit', 2, 0, AB, 1, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	}, TypeError );
});

test( 'ztbcon: throws TypeError for invalid diag', function t() {
	var AB = new Complex128Array( 4 );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 4 );
	var rwork = new Float64Array( 2 );
	assert.throws( function throws() {
		ztbcon( 'one-norm', 'upper', 'invalid', 2, 0, AB, 1, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	}, TypeError );
});

test( 'ztbcon: throws RangeError for negative N', function t() {
	var AB = new Complex128Array( 4 );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 4 );
	var rwork = new Float64Array( 2 );
	assert.throws( function throws() {
		ztbcon( 'one-norm', 'upper', 'non-unit', -1, 0, AB, 1, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	}, RangeError );
});

test( 'ztbcon: N=0 quick return (rcond=1)', function t() {
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = ztbcon( 'one-norm', 'upper', 'non-unit', 0, 0, new Complex128Array( 0 ), 1, 1, 0, rcond, new Complex128Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'ztbcon: zero matrix returns rcond=0', function t() {
	var N = 3;
	var KD = 0;
	var AB = new Complex128Array( (KD+1)*N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'ztbcon: identity 3x3 KD=0 upper non-unit (one-norm)', function t() {
	var N = 3;
	var KD = 0;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var AB = packUpperBandReal( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'ztbcon: identity 3x3 KD=0 upper non-unit (inf-norm)', function t() {
	var N = 3;
	var KD = 0;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var AB = packUpperBandReal( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'inf-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'ztbcon: upper unit KD=1 4x4 (one-norm)', function t() {
	var N = 4;
	var KD = 1;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max(0, j-KD); i <= j; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AB = packUpperBandReal( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'one-norm', 'upper', 'unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztbcon: upper unit KD=1 4x4 (inf-norm)', function t() {
	var N = 4;
	var KD = 1;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max(0, j-KD); i <= j; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AB = packUpperBandReal( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'inf-norm', 'upper', 'unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztbcon: lower non-unit diagonal KD=0 4x4 (one-norm)', function t() {
	var N = 4;
	var KD = 0;
	var A = new Float64Array( N*N );
	A[ 0 ] = 4.0; A[ 5 ] = 3.0; A[ 10 ] = 2.0; A[ 15 ] = 1.0;
	var AB = packLowerBandReal( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'one-norm', 'lower', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'ztbcon: lower non-unit diagonal KD=0 4x4 (inf-norm)', function t() {
	var N = 4;
	var KD = 0;
	var A = new Float64Array( N*N );
	A[ 0 ] = 4.0; A[ 5 ] = 3.0; A[ 10 ] = 2.0; A[ 15 ] = 1.0;
	var AB = packLowerBandReal( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'inf-norm', 'lower', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'ztbcon: lower unit KD=1 4x4 (one-norm)', function t() {
	var N = 4;
	var KD = 1;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i <= Math.min(N-1, j+KD); i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AB = packLowerBandReal( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'one-norm', 'lower', 'unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztbcon: lower unit KD=1 4x4 (inf-norm)', function t() {
	var N = 4;
	var KD = 1;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i <= Math.min(N-1, j+KD); i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AB = packLowerBandReal( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'inf-norm', 'lower', 'unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztbcon: ill-conditioned KD=0 (small rcond)', function t() {
	var N = 4;
	var KD = 0;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 5 ] = 1e-6; A[ 10 ] = 1.0; A[ 15 ] = 1.0;
	var AB = packUpperBandReal( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] < 1e-5 );
});

test( 'ztbcon: well-conditioned upper KD=2 5x5 complex (one-norm)', function t() {
	var N = 5;
	var KD = 2;
	var LDAB = KD + 1;
	var AB = new Complex128Array( LDAB * N );
	var v = reinterpret( AB, 0 );
	var i, j, idx;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max(0, j-KD); i <= j; i++ ) {
			idx = (KD + i - j) + j*LDAB;
			if ( i === j ) {
				v[ 2*idx ] = 5.0; v[ 2*idx + 1 ] = 0.5;
			} else if ( j - i === 1 ) {
				v[ 2*idx ] = 1.0; v[ 2*idx + 1 ] = 0.2;
			} else if ( j - i === 2 ) {
				v[ 2*idx ] = 0.5; v[ 2*idx + 1 ] = 0.0;
			}
		}
	}
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, LDAB, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztbcon: well-conditioned lower KD=2 5x5 complex (inf-norm)', function t() {
	var N = 5;
	var KD = 2;
	var LDAB = KD + 1;
	var AB = new Complex128Array( LDAB * N );
	var v = reinterpret( AB, 0 );
	var i, j, idx;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i <= Math.min(N-1, j+KD); i++ ) {
			idx = (i - j) + j*LDAB;
			if ( i === j ) {
				v[ 2*idx ] = 5.0; v[ 2*idx + 1 ] = 0.5;
			} else if ( i - j === 1 ) {
				v[ 2*idx ] = 1.0; v[ 2*idx + 1 ] = 0.2;
			} else if ( i - j === 2 ) {
				v[ 2*idx ] = 0.5; v[ 2*idx + 1 ] = 0.0;
			}
		}
	}
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'inf-norm', 'lower', 'non-unit', N, KD, AB, 1, LDAB, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztbcon: 6x6 dense complex upper KD=5 exercises reverse-comm loop', function t() {
	var N = 6;
	var KD = 5;
	var LDAB = KD + 1;
	var AB = new Complex128Array( LDAB * N );
	var v = reinterpret( AB, 0 );
	var i, j, idx;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			idx = (KD + i - j) + j*LDAB;
			if ( i === j ) {
				v[ 2*idx ] = 5.0; v[ 2*idx + 1 ] = 0.5;
			} else {
				v[ 2*idx ] = ( ((i*3) + (j*7)) % 5 ) - 2;
				v[ 2*idx + 1 ] = ( ((i*5) + (j*3)) % 3 ) - 1;
			}
		}
	}
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, LDAB, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'ztbcon: N=1 KD=0 upper non-unit', function t() {
	var N = 1;
	var KD = 0;
	var AB = new Complex128Array( 1 );
	var v = reinterpret( AB, 0 );
	v[ 0 ] = 2.0; v[ 1 ] = 0.0;
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});
