/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtbcon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// Build an upper-triangular band matrix in band storage from full N-by-N column-major matrix.
// LDAB = KD+1. AB[KD + i - j, j] = A[i,j] for max(0,j-KD) <= i <= j.
function packUpperBand( A, N, KD ) {
	var LDAB = KD + 1;
	var AB = new Float64Array( LDAB * N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		var ilo = Math.max( 0, j - KD );
		for ( i = ilo; i <= j; i++ ) {
			AB[ KD + i - j + j*LDAB ] = A[ i + j*N ];
		}
	}
	return AB;
}

// Build a lower-triangular band matrix in band storage from full N-by-N column-major matrix.
// LDAB = KD+1. AB[i - j, j] = A[i,j] for j <= i <= min(N-1, j+KD).
function packLowerBand( A, N, KD ) {
	var LDAB = KD + 1;
	var AB = new Float64Array( LDAB * N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		var ihi = Math.min( N-1, j + KD );
		for ( i = j; i <= ihi; i++ ) {
			AB[ i - j + j*LDAB ] = A[ i + j*N ];
		}
	}
	return AB;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dtbcon, 'function', 'main export is a function' );
});

test( 'dtbcon: throws TypeError for invalid uplo', function t() {
	var AB = new Float64Array( 4 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 6 );
	var iwork = new Int32Array( 2 );
	assert.throws( function throws() {
		dtbcon( 'one-norm', 'invalid', 'non-unit', 2, 0, AB, 1, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	}, TypeError );
});

test( 'dtbcon: throws TypeError for invalid diag', function t() {
	var AB = new Float64Array( 4 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 6 );
	var iwork = new Int32Array( 2 );
	assert.throws( function throws() {
		dtbcon( 'one-norm', 'upper', 'invalid', 2, 0, AB, 1, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	}, TypeError );
});

test( 'dtbcon: throws RangeError for negative N', function t() {
	var AB = new Float64Array( 4 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 6 );
	var iwork = new Int32Array( 2 );
	assert.throws( function throws() {
		dtbcon( 'one-norm', 'upper', 'non-unit', -1, 0, AB, 1, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	}, RangeError );
});

test( 'dtbcon: N=0 quick return (rcond=1)', function t() {
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dtbcon( 'one-norm', 'upper', 'non-unit', 0, 0, new Float64Array( 0 ), 1, 1, 0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'dtbcon: zero matrix returns rcond=0', function t() {
	var N = 3;
	var KD = 0;
	var AB = new Float64Array( (KD+1)*N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dtbcon: identity 3x3 KD=0 upper non-unit (one-norm)', function t() {
	var N = 3;
	var KD = 0;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var AB = packUpperBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dtbcon: identity 3x3 KD=0 upper non-unit (inf-norm)', function t() {
	var N = 3;
	var KD = 0;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var AB = packUpperBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'inf-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dtbcon: upper unit KD=1 4x4 (one-norm)', function t() {
	var N = 4;
	var KD = 1;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max(0, j-KD); i <= j; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AB = packUpperBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'one-norm', 'upper', 'unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtbcon: upper unit KD=1 4x4 (inf-norm)', function t() {
	var N = 4;
	var KD = 1;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max(0, j-KD); i <= j; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AB = packUpperBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'inf-norm', 'upper', 'unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtbcon: lower non-unit diagonal KD=0 4x4 (one-norm)', function t() {
	var N = 4;
	var KD = 0;
	var A = new Float64Array( N*N );
	A[ 0 ] = 4.0; A[ 5 ] = 3.0; A[ 10 ] = 2.0; A[ 15 ] = 1.0;
	var AB = packLowerBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'one-norm', 'lower', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dtbcon: lower non-unit diagonal KD=0 4x4 (inf-norm)', function t() {
	var N = 4;
	var KD = 0;
	var A = new Float64Array( N*N );
	A[ 0 ] = 4.0; A[ 5 ] = 3.0; A[ 10 ] = 2.0; A[ 15 ] = 1.0;
	var AB = packLowerBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'inf-norm', 'lower', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dtbcon: lower unit KD=1 4x4 (one-norm)', function t() {
	var N = 4;
	var KD = 1;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i <= Math.min(N-1, j+KD); i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AB = packLowerBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'one-norm', 'lower', 'unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtbcon: lower unit KD=1 4x4 (inf-norm)', function t() {
	var N = 4;
	var KD = 1;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i <= Math.min(N-1, j+KD); i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AB = packLowerBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'inf-norm', 'lower', 'unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtbcon: ill-conditioned KD=0 (small rcond)', function t() {
	// Diag [1, 1e-6, 1, 1] ill-conditioned
	var N = 4;
	var KD = 0;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 5 ] = 1e-6; A[ 10 ] = 1.0; A[ 15 ] = 1.0;
	var AB = packUpperBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] < 1e-5 );
});

test( 'dtbcon: well-conditioned upper KD=2 5x5 (one-norm)', function t() {
	var N = 5;
	var KD = 2;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max(0, j-KD); i <= j; i++ ) {
			if ( i === j ) {
				A[ i + j*N ] = 5.0;
			} else if ( j - i === 1 ) {
				A[ i + j*N ] = 1.0;
			} else if ( j - i === 2 ) {
				A[ i + j*N ] = 0.5;
			}
		}
	}
	var AB = packUpperBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtbcon: well-conditioned upper KD=2 5x5 (inf-norm)', function t() {
	var N = 5;
	var KD = 2;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max(0, j-KD); i <= j; i++ ) {
			if ( i === j ) {
				A[ i + j*N ] = 5.0;
			} else if ( j - i === 1 ) {
				A[ i + j*N ] = 1.0;
			} else if ( j - i === 2 ) {
				A[ i + j*N ] = 0.5;
			}
		}
	}
	var AB = packUpperBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'inf-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtbcon: well-conditioned lower KD=2 5x5 (one-norm)', function t() {
	var N = 5;
	var KD = 2;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i <= Math.min(N-1, j+KD); i++ ) {
			if ( i === j ) {
				A[ i + j*N ] = 5.0;
			} else if ( i - j === 1 ) {
				A[ i + j*N ] = 1.0;
			} else if ( i - j === 2 ) {
				A[ i + j*N ] = 0.5;
			}
		}
	}
	var AB = packLowerBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'one-norm', 'lower', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtbcon: well-conditioned lower KD=2 5x5 (inf-norm)', function t() {
	var N = 5;
	var KD = 2;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i <= Math.min(N-1, j+KD); i++ ) {
			if ( i === j ) {
				A[ i + j*N ] = 5.0;
			} else if ( i - j === 1 ) {
				A[ i + j*N ] = 1.0;
			} else if ( i - j === 2 ) {
				A[ i + j*N ] = 0.5;
			}
		}
	}
	var AB = packLowerBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'inf-norm', 'lower', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtbcon: 6x6 dense upper KD=5 exercises full reverse-comm loop', function t() {
	var N = 6;
	var KD = 5;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				A[ i + j*N ] = 5.0;
			} else {
				A[ i + j*N ] = ( ((i*3) + (j*7)) % 5 ) - 2;
			}
		}
	}
	var AB = packUpperBand( A, N, KD );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dtbcon: N=1 KD=0 upper non-unit', function t() {
	var N = 1;
	var KD = 0;
	var AB = new Float64Array( [ 2.0 ] );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtbcon( 'one-norm', 'upper', 'non-unit', N, KD, AB, 1, KD+1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});
