
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ddisna from './../lib/ndarray.js';


// VARIABLES //

var EPS = 1.1102230246251565e-16;
var SAFMIN = 2.2250738585072014e-308;
var OVERFLOW = 1.7976931348623157e+308;


// TESTS //

test( 'ddisna is a function', function t() {
	assert.strictEqual( typeof ddisna, 'function' );
});

test( 'ddisna returns 0 for valid input', function t() {
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 1.0, 2.0, 4.0 ] );
	var info = ddisna( 'eigenvalues', 3, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'ddisna throws TypeError for invalid job', function t() {
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	assert.throws( function () {
		ddisna( 'X', 3, 3, d, 1, 0, sep, 1, 0 );
	}, TypeError );
});

test( 'ddisna returns -2 for negative M', function t() {
	var sep = new Float64Array( 1 );
	var d = new Float64Array( [ 1.0 ] );
	var info = ddisna( 'eigenvalues', -1, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, -2 );
});

test( 'ddisna returns -3 for negative N (singular values)', function t() {
	var sep = new Float64Array( 1 );
	var d = new Float64Array( [ 1.0 ] );
	var info = ddisna( 'left-vectors', 3, -1, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, -3 );
});

test( 'ddisna returns -4 for unsorted eigenvalues', function t() {
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 1.0, 3.0, 2.0 ] );
	var info = ddisna( 'eigenvalues', 3, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, -4 );
});

test( 'ddisna returns 0 for k=0 (quick return)', function t() {
	var sep = new Float64Array( 1 );
	var d = new Float64Array( 1 );
	var info = ddisna( 'eigenvalues', 0, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'ddisna: single eigenvalue sets SEP to overflow', function t() {
	var sep = new Float64Array( 1 );
	var d = new Float64Array( [ 5.0 ] );
	var info = ddisna( 'eigenvalues', 1, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], OVERFLOW );
});

test( 'ddisna: two eigenvalues (increasing)', function t() {
	// d = [1.0, 3.0], gaps: |3-1|=2 for both
	var sep = new Float64Array( 2 );
	var d = new Float64Array( [ 1.0, 3.0 ] );
	var info = ddisna( 'eigenvalues', 2, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 2.0 );
	assert.strictEqual( sep[ 1 ], 2.0 );
});

test( 'ddisna: three eigenvalues (increasing)', function t() {
	// d = [1.0, 2.0, 5.0]
	// gaps: |2-1|=1, |5-2|=3
	// sep[0] = oldgap = 1
	// sep[1] = min(1, 3) = 1
	// sep[2] = 3
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 1.0, 2.0, 5.0 ] );
	var info = ddisna( 'eigenvalues', 3, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 1.0 );
	assert.strictEqual( sep[ 1 ], 1.0 );
	assert.strictEqual( sep[ 2 ], 3.0 );
});

test( 'ddisna: three eigenvalues (decreasing)', function t() {
	// d = [5.0, 2.0, 1.0]
	// gaps: |2-5|=3, |1-2|=1
	// sep[0] = oldgap = 3
	// sep[1] = min(3, 1) = 1
	// sep[2] = 1
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 5.0, 2.0, 1.0 ] );
	var info = ddisna( 'eigenvalues', 3, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 3.0 );
	assert.strictEqual( sep[ 1 ], 1.0 );
	assert.strictEqual( sep[ 2 ], 1.0 );
});

test( 'ddisna: four eigenvalues', function t() {
	// d = [1.0, 3.0, 6.0, 10.0]
	// gaps: 2, 3, 4
	// sep[0] = 2 (first gap)
	// sep[1] = min(2, 3) = 2
	// sep[2] = min(3, 4) = 3
	// sep[3] = 4 (last gap)
	var sep = new Float64Array( 4 );
	var d = new Float64Array( [ 1.0, 3.0, 6.0, 10.0 ] );
	var info = ddisna( 'eigenvalues', 4, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 2.0 );
	assert.strictEqual( sep[ 1 ], 2.0 );
	assert.strictEqual( sep[ 2 ], 3.0 );
	assert.strictEqual( sep[ 3 ], 4.0 );
});

test( 'ddisna: left singular vectors (M > N, increasing)', function t() {
	// job='left-vectors', M=5, N=3 => k=min(5,3)=3
	// d = [1.0, 3.0, 7.0] (singular values, increasing)
	// gaps: 2, 4
	// sep[0] = 2, sep[1] = min(2, 4) = 2, sep[2] = 4
	// Since left && M > N && incr: sep[0] = min(sep[0], d[0]) = min(2, 1) = 1
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 1.0, 3.0, 7.0 ] );
	var info = ddisna( 'left-vectors', 5, 3, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 1.0 );
	assert.strictEqual( sep[ 1 ], 2.0 );
	assert.strictEqual( sep[ 2 ], 4.0 );
});

test( 'ddisna: right singular vectors (M < N, increasing)', function t() {
	// job='right-vectors', M=3, N=5 => k=min(3,5)=3
	// d = [1.0, 3.0, 7.0] (increasing)
	// gaps: 2, 4
	// sep[0] = 2, sep[1] = 2, sep[2] = 4
	// Since right && M < N && incr: sep[0] = min(sep[0], d[0]) = min(2, 1) = 1
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 1.0, 3.0, 7.0 ] );
	var info = ddisna( 'right-vectors', 3, 5, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 1.0 );
	assert.strictEqual( sep[ 1 ], 2.0 );
	assert.strictEqual( sep[ 2 ], 4.0 );
});

test( 'ddisna: left singular vectors (M > N, decreasing)', function t() {
	// job='left-vectors', M=5, N=3 => k=3
	// d = [7.0, 3.0, 1.0] (decreasing)
	// gaps: 4, 2
	// sep[0] = 4, sep[1] = min(4, 2) = 2, sep[2] = 2
	// Since left && M > N && decr: sep[k-1] = min(sep[2], d[2]) = min(2, 1) = 1
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 7.0, 3.0, 1.0 ] );
	var info = ddisna( 'left-vectors', 5, 3, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 4.0 );
	assert.strictEqual( sep[ 1 ], 2.0 );
	assert.strictEqual( sep[ 2 ], 1.0 );
});

test( 'ddisna: right singular vectors (M > N, no extra adjustment)', function t() {
	// job='right-vectors', M=5, N=3 => k=3
	// d = [1.0, 3.0, 7.0] (increasing)
	// gaps: 2, 4
	// sep[0] = 2, sep[1] = 2, sep[2] = 4
	// Right && M > N (not M < N), so no adjustment
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 1.0, 3.0, 7.0 ] );
	var info = ddisna( 'right-vectors', 5, 3, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 2.0 );
	assert.strictEqual( sep[ 1 ], 2.0 );
	assert.strictEqual( sep[ 2 ], 4.0 );
});

test( 'ddisna: threshold clamping for small gaps', function t() {
	// d = [1.0, 1.0, 2.0], gaps: 0, 1
	// Anorm = max(|1|, |2|) = 2
	// thresh = max(EPS*2, SAFMIN)
	// sep[0] = max(0, thresh) = thresh
	// sep[1] = min(0, 1) = 0 => clamped to thresh
	// sep[2] = 1
	var thresh = Math.max( EPS * 2.0, SAFMIN );
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 1.0, 1.0, 2.0 ] );
	var info = ddisna( 'eigenvalues', 3, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], thresh );
	assert.strictEqual( sep[ 1 ], thresh );
	assert.strictEqual( sep[ 2 ], 1.0 );
});

test( 'ddisna: threshold for zero eigenvalues', function t() {
	// d = [0.0, 0.0] => anorm=0, thresh=EPS
	// Gap = 0, clamped to EPS
	var sep = new Float64Array( 2 );
	var d = new Float64Array( [ 0.0, 0.0 ] );
	var info = ddisna( 'eigenvalues', 2, 0, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], EPS );
	assert.strictEqual( sep[ 1 ], EPS );
});

test( 'ddisna: stride support for d', function t() {
	// d stored with stride 2: [1.0, ?, 3.0, ?, 6.0]
	// Eigenvalues are 1, 3, 6
	// gaps: 2, 3
	// sep[0] = 2, sep[1] = 2, sep[2] = 3
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 1.0, 99.0, 3.0, 99.0, 6.0 ] );
	var info = ddisna( 'eigenvalues', 3, 0, d, 2, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 2.0 );
	assert.strictEqual( sep[ 1 ], 2.0 );
	assert.strictEqual( sep[ 2 ], 3.0 );
});

test( 'ddisna: stride support for SEP', function t() {
	// SEP stored with stride 2
	var sep = new Float64Array( 5 );
	var d = new Float64Array( [ 1.0, 3.0, 6.0 ] );
	var info = ddisna( 'eigenvalues', 3, 0, d, 1, 0, sep, 2, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 2.0 );
	assert.strictEqual( sep[ 2 ], 2.0 );
	assert.strictEqual( sep[ 4 ], 3.0 );
});

test( 'ddisna: offset support', function t() {
	// d at offset 2: [?, ?, 1.0, 4.0, 8.0]
	// sep at offset 1: [?, sep0, sep1, sep2]
	var sep = new Float64Array( 4 );
	var d = new Float64Array( [ 99.0, 99.0, 1.0, 4.0, 8.0 ] );
	var info = ddisna( 'eigenvalues', 3, 0, d, 1, 2, sep, 1, 1 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 1 ], 3.0 );
	assert.strictEqual( sep[ 2 ], 3.0 );
	assert.strictEqual( sep[ 3 ], 4.0 );
});

test( 'ddisna: negative singular values return -4', function t() {
	var sep = new Float64Array( 2 );
	var d = new Float64Array( [ -1.0, 2.0 ] );
	var info = ddisna( 'left-vectors', 3, 2, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, -4 );
});

test( 'ddisna: singular values with M=N (no extra adjustment)', function t() {
	// job='left-vectors', M=N=3 => k=3, M>N is false, so no adjustment
	var sep = new Float64Array( 3 );
	var d = new Float64Array( [ 1.0, 3.0, 7.0 ] );
	var info = ddisna( 'left-vectors', 3, 3, d, 1, 0, sep, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( sep[ 0 ], 2.0 );
	assert.strictEqual( sep[ 1 ], 2.0 );
	assert.strictEqual( sep[ 2 ], 4.0 );
});

test( 'ddisna: rejects single-char Fortran flags', function t() {
	var sep = new Float64Array( 2 );
	var d = new Float64Array( [ 1.0, 3.0 ] );
	assert.throws( function () {
		ddisna( 'E', 2, 0, d, 1, 0, sep, 1, 0 );
	}, TypeError, 'single-char E is not accepted' );
});
