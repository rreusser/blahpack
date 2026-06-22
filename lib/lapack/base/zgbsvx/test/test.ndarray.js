/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines-per-function, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbsvx from './../lib/ndarray.js';
import { ndarray as zgbsvxNdarray } from './../lib/index.js';


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Creates workspace arrays for zgbsvx.
*
* @private
* @param {NonNegativeInteger} n - matrix order
* @returns {Object} workspace arrays
*/
function makeWork( n ) {
	return {
		'WORK': new Complex128Array( 2 * Math.max( 1, n ) ),
		'RWORK': new Float64Array( Math.max( 1, n ) )
	};
}

/**
* Stores a dense complex matrix into band storage format.
*
* @private
* @param {Float64Array} dense - dense matrix data (interleaved re/im, col-major N-by-N)
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @returns {Complex128Array} band matrix in band storage (KL+KU+1 by N)
*/
function denseToGB( dense, N, kl, ku ) {
	var bandRow;
	var nRows;
	var AB;
	var di;
	var bi;
	var i;
	var j;

	nRows = kl + ku + 1;
	AB = new Float64Array( (2 * nRows) * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max( 0, j-ku ); i < Math.min( N, j+kl+1 ); i++ ) {
			bandRow = (ku + i) - j;
			di = 2 * (i + (j * N));
			bi = 2 * (bandRow + (j * nRows));
			AB[ bi ] = dense[ di ];
			AB[ bi + 1 ] = dense[ di + 1 ];
		}
	}
	return new Complex128Array( AB );
}

/**
* Performs band-matrix-vector multiply: b = AB * x (using dense interpretation).
*
* @private
* @param {Float64Array} dense - N-by-N dense complex data (interleaved re/im, col-major)
* @param {Array} xdata - interleaved re/im values for x (length 2*N)
* @param {NonNegativeInteger} N - matrix order
* @returns {Float64Array} b (interleaved re/im, length 2*N)
*/
function zmatvec( dense, xdata, N ) {
	var are;
	var aim;
	var xre;
	var xim;
	var b;
	var i;
	var j;

	b = new Float64Array( 2 * N );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			are = dense[ 2 * (i + (j * N)) ];
			aim = dense[ (2 * (i + (j * N))) + 1 ];
			xre = xdata[ 2 * j ];
			xim = xdata[ (2 * j) + 1 ];
			b[ 2 * i ] += (are * xre) - (aim * xim);
			b[ (2 * i) + 1 ] += (are * xim) + (aim * xre);
		}
	}
	return b;
}

/**
* Performs band-matrix-conjugate-transpose-vector multiply: b = AB^H * x.
*
* @private
* @param {Float64Array} dense - N-by-N dense complex data
* @param {Array} xdata - interleaved re/im values for x
* @param {NonNegativeInteger} N - matrix order
* @returns {Float64Array} b (interleaved re/im, length 2*N)
*/
function zmatvecH( dense, xdata, N ) {
	var are;
	var aim;
	var xre;
	var xim;
	var b;
	var i;
	var j;

	b = new Float64Array( 2 * N );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			are = dense[ 2 * (j + (i * N)) ];
			aim = -dense[ (2 * (j + (i * N))) + 1 ];
			xre = xdata[ 2 * j ];
			xim = xdata[ (2 * j) + 1 ];
			b[ 2 * i ] += (are * xre) - (aim * xim);
			b[ (2 * i) + 1 ] += (are * xim) + (aim * xre);
		}
	}
	return b;
}


// FIXTURES //

// 4x4 tridiagonal complex test matrix (KL=1, KU=1) stored as dense col-major
// A = [ (4,1)  (1,-1)  0      0     ]
//     [ (1,0.5)(3,2)  (1,-0.5) 0     ]
//     [ 0      (0.5,0)(2,1)  (1,0.3) ]
//     [ 0      0      (0.5,0)(3,-1)  ]
var N = 4;
var KL = 1;
var KU = 1;
var A_DENSE = new Float64Array([
	// Col 0
	4,
	1,
	1,
	0.5,
	0,
	0,
	0,
	0,

	// Col 1
	1,
	-1,
	3,
	2,
	0.5,
	0,
	0,
	0,

	// Col 2
	0,
	0,
	1,
	-0.5,
	2,
	1,
	0.5,
	0,

	// Col 3
	0,
	0,
	0,
	0,
	1,
	0.3,
	3,
	-1
]);


// TESTS //

test( 'zgbsvx: main export is a function', function t() {
	assert.strictEqual( typeof zgbsvx, 'function' );
});

test( 'zgbsvx: fact=not-factored, trans=no-transpose', function t() {
	var result;
	var bData;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var Xv;
	var AB;
	var r;
	var c;
	var w;
	var B;
	var X;

	nrhs = 1;
	nRows = KL + KU + 1;
	AB = denseToGB( A_DENSE, N, KL, KU );
	AFB = new Complex128Array( ( (2 * KL) + KU + 1 ) * N );
	IPIV = new Int32Array( N );
	r = new Float64Array( N );
	c = new Float64Array( N );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( N );
	bData = zmatvec( A_DENSE, [ 1, 0, 1, 0, 1, 0, 1, 0 ], N );
	B = new Complex128Array( bData );
	X = new Complex128Array( N * nrhs );
	result = zgbsvx( 'not-factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0 );
	assert.equal( result.equed, 'none' );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), [ 1, 0, 1, 0, 1, 0, 1, 0 ], 1e-12, 'x' );
	assert.ok( result.rcond > 0, 'rcond > 0' );
	assert.ok( result.rpvgrw > 0, 'rpvgrw > 0' );
});

test( 'zgbsvx: fact=not-factored, trans=conjugate-transpose', function t() {
	var result;
	var bData;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var Xv;
	var AB;
	var r;
	var c;
	var w;
	var B;
	var X;

	nrhs = 1;
	nRows = KL + KU + 1;
	AB = denseToGB( A_DENSE, N, KL, KU );
	AFB = new Complex128Array( ( (2 * KL) + KU + 1 ) * N );
	IPIV = new Int32Array( N );
	r = new Float64Array( N );
	c = new Float64Array( N );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( N );
	bData = zmatvecH( A_DENSE, [ 1, 0, 1, 0, 1, 0, 1, 0 ], N );
	B = new Complex128Array( bData );
	X = new Complex128Array( N * nrhs );
	result = zgbsvx( 'not-factored', 'conjugate-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0 );
	assert.equal( result.equed, 'none' );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), [ 1, 0, 1, 0, 1, 0, 1, 0 ], 1e-12, 'x' );
	assert.ok( result.rcond > 0, 'rcond > 0' );
});

test( 'zgbsvx: fact=equilibrate', function t() {
	var result;
	var nRows;
	var dense;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var Xv;
	var AB;
	var kl;
	var ku;
	var r;
	var c;
	var w;
	var B;
	var X;
	var n;

	n = 3;
	kl = 1;
	ku = 1;
	nrhs = 1;
	nRows = kl + ku + 1;
	dense = new Float64Array([
		// Col 0         col 1         col 2
		1e6,
		0,
		1,
		0,
		0,
		0,
		1,
		0,
		1e-3,
		0,
		1,
		0,
		0,
		0,
		1,
		0,
		1e3,
		0
	]);
	AB = denseToGB( dense, n, kl, ku );
	AFB = new Complex128Array( ( (2 * kl) + ku + 1 ) * n );
	IPIV = new Int32Array( n );
	r = new Float64Array( n );
	c = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( n );
	B = new Complex128Array( [ 1e6 + 1, 0, 1.001 + 1, 0, 1 + 1e3, 0 ] );
	X = new Complex128Array( n * nrhs );
	result = zgbsvx( 'equilibrate', 'no-transpose', n, kl, ku, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * kl) + ku + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0 );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), [ 1, 0, 1, 0, 1, 0 ], 1e-4, 'x' );
	assert.ok( result.rcond > 0, 'rcond > 0' );
});

test( 'zgbsvx: fact=factored (reuse factorization)', function t() {
	var result;
	var bData;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var Xv;
	var AB;
	var r;
	var c;
	var w;
	var B;
	var X;

	nrhs = 1;
	nRows = KL + KU + 1;
	AB = denseToGB( A_DENSE, N, KL, KU );
	AFB = new Complex128Array( ( (2 * KL) + KU + 1 ) * N );
	IPIV = new Int32Array( N );
	r = new Float64Array( N );
	c = new Float64Array( N );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( N );
	bData = zmatvec( A_DENSE, [ 1, 0, 1, 0, 1, 0, 1, 0 ], N );
	B = new Complex128Array( bData );
	X = new Complex128Array( N * nrhs );
	zgbsvx( 'not-factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	AB = denseToGB( A_DENSE, N, KL, KU );
	bData = zmatvec( A_DENSE, [ 2, 1, -1, 0.5, 0.5, -0.5, 1, 1 ], N );
	B = new Complex128Array( bData );
	X = new Complex128Array( N * nrhs );
	result = zgbsvx( 'factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), [ 2, 1, -1, 0.5, 0.5, -0.5, 1, 1 ], 1e-12, 'x' ); // eslint-disable-line max-len
	assert.ok( result.rcond > 0, 'rcond > 0' );
});

test( 'zgbsvx: singular matrix', function t() {
	var result;
	var dense;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var kl;
	var ku;
	var r;
	var c;
	var w;
	var B;
	var X;
	var n;

	n = 3;
	kl = 1;
	ku = 1;
	nrhs = 1;
	nRows = kl + ku + 1;
	dense = new Float64Array([
		// Col 0
		1,
		0,
		1,
		0,
		0,
		0,

		// Col 1
		2,
		0,
		2,
		0,
		1,
		0,

		// Col 2
		0,
		0,
		0,
		0,
		1,
		0
	]);
	AB = denseToGB( dense, n, kl, ku );
	AFB = new Complex128Array( ( (2 * kl) + ku + 1 ) * n );
	IPIV = new Int32Array( n );
	r = new Float64Array( n );
	c = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( n );
	B = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
	X = new Complex128Array( n * nrhs );
	result = zgbsvx( 'not-factored', 'no-transpose', n, kl, ku, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * kl) + ku + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.ok( result.info > 0, 'info > 0 for singular matrix' );
	assert.equal( result.rcond, 0.0 );
});

test( 'zgbsvx: N=0 quick return', function t() {
	var result;
	var RWORK;
	var IPIV;
	var FERR;
	var BERR;
	var WORK;
	var AFB;
	var AB;
	var r;
	var c;
	var B;
	var X;

	AB = new Complex128Array( 1 );
	AFB = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	r = new Float64Array( 1 );
	c = new Float64Array( 1 );
	B = new Complex128Array( 1 );
	X = new Complex128Array( 1 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	WORK = new Complex128Array( 2 );
	RWORK = new Float64Array( 1 );
	result = zgbsvx( 'not-factored', 'no-transpose', 0, 0, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0 );
	assert.equal( result.rcond, 1.0 );
	assert.equal( result.rpvgrw, 1.0 );
});

test( 'zgbsvx: multiple right-hand sides', function t() {
	var result;
	var bData;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var Xv;
	var AB;
	var b1;
	var b2;
	var r;
	var c;
	var w;
	var i;
	var B;
	var X;

	nrhs = 2;
	nRows = KL + KU + 1;
	AB = denseToGB( A_DENSE, N, KL, KU );
	AFB = new Complex128Array( ( (2 * KL) + KU + 1 ) * N );
	IPIV = new Int32Array( N );
	r = new Float64Array( N );
	c = new Float64Array( N );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( N );
	b1 = zmatvec( A_DENSE, [ 1, 0, 1, 0, 1, 0, 1, 0 ], N );
	b2 = zmatvec( A_DENSE, [ 2, 1, -1, 0.5, 0.5, -0.5, 1, 1 ], N );
	bData = new Float64Array( (2 * N) * nrhs );
	for ( i = 0; i < 2 * N; i++ ) {
		bData[ i ] = b1[ i ];
		bData[ (2 * N) + i ] = b2[ i ];
	}
	B = new Complex128Array( bData );
	X = new Complex128Array( N * nrhs );
	result = zgbsvx( 'not-factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0 );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), [
		1,
		0,
		1,
		0,
		1,
		0,
		1,
		0,
		2,
		1,
		-1,
		0.5,
		0.5,
		-0.5,
		1,
		1
	], 1e-12, 'x' );
	assert.ok( result.rcond > 0, 'rcond > 0' );
});

test( 'zgbsvx: fact=equilibrate, trans=conjugate-transpose', function t() {
	var result;
	var nRows;
	var dense;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var kl;
	var ku;
	var r;
	var c;
	var w;
	var B;
	var X;
	var n;

	n = 3;
	kl = 1;
	ku = 1;
	nrhs = 1;
	nRows = kl + ku + 1;
	dense = new Float64Array([
		1e6,
		0,
		1,
		0,
		0,
		0,
		1,
		0,
		1e-3,
		0,
		1,
		0,
		0,
		0,
		1,
		0,
		1e3,
		0
	]);
	AB = denseToGB( dense, n, kl, ku );
	AFB = new Complex128Array( ( (2 * kl) + ku + 1 ) * n );
	IPIV = new Int32Array( n );
	r = new Float64Array( n );
	c = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( n );
	B = new Complex128Array( [ 1e6 + 1, 0, 1.001 + 1, 0, 1 + 1e3, 0 ] );
	X = new Complex128Array( n * nrhs );
	result = zgbsvx( 'equilibrate', 'conjugate-transpose', n, kl, ku, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * kl) + ku + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0 );
	assert.ok( result.rcond > 0, 'rcond > 0' );
});

test( 'zgbsvx: ndarray interface', function t() {
	assert.strictEqual( typeof zgbsvxNdarray, 'function' );
});
