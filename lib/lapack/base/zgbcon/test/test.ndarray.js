import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbtrf from './../../zgbtrf/lib/base.js';
import zgbcon from './../lib/ndarray.js';

// FIXTURES //

import tridiag_1norm from './fixtures/tridiag_1norm.json' with { type: 'json' };
import tridiag_inorm from './fixtures/tridiag_inorm.json' with { type: 'json' };
import kl2_ku1_1norm from './fixtures/kl2_ku1_1norm.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Create complex banded matrix. entries = [ [row, col, re, im], ... ]
* ldab = number of rows, n = number of cols. All in complex elements.
*/
function complexBandedMatrix( ldab, n, entries ) {
	var ab = new Complex128Array( ldab * n );
	var abv = reinterpret( ab, 0 );
	var idx;
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		idx = ( ( entries[ i ][ 1 ] * ldab ) + entries[ i ][ 0 ] ) * 2;
		abv[ idx ] = entries[ i ][ 2 ];
		abv[ idx + 1 ] = entries[ i ][ 3 ];
	}
	return ab;
}

test( 'zgbcon: tridiag 1-norm (KL=1, KU=1, N=4)', function t() {
	var rcond;
	var rwork;
	var work;
	var ipiv;
	var info;
	var ldab;
	var tc;
	var ab;
	var n;

	tc = tridiag_1norm;
	n = 4;
	ldab = 6; // We used LDAB=6 in Fortran test

	// Banded storage for zgbtrf: KL=1,KU=1 => main at row kl+ku=2, super at row kl+ku-1=1, sub at row kl+ku+1=3
	// But LDAB must be >= 2*KL+KU+1 = 4. With ldab=6, row kl+ku=2 is main.
	ab = complexBandedMatrix( ldab, n, [
		[ 2, 0, 4.0, 1.0 ], [ 3, 0, -1.0, 0.0 ],
		[ 1, 1, -1.0, 0.0 ], [ 2, 1, 4.0, 1.0 ], [ 3, 1, -1.0, 0.0 ],
		[ 1, 2, -1.0, 0.0 ], [ 2, 2, 4.0, 1.0 ], [ 3, 2, -1.0, 0.0 ],
		[ 1, 3, -1.0, 0.0 ], [ 2, 3, 4.0, 1.0 ]
	]);
	ipiv = new Int32Array( n );
	work = new Complex128Array( 2 * n );
	rwork = new Float64Array( n );
	rcond = new Float64Array( 1 );

	info = zgbtrf( n, n, 1, 1, ab, 1, ldab, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'zgbtrf info' );

	info = zgbcon( 'one-norm', n, 1, 1, ab, 1, ldab, 0, ipiv, 1, 0, tc.anorm, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'zgbcon: tridiag infinity-norm (KL=1, KU=1, N=4)', function t() {
	var tc = tridiag_inorm;
	var n = 4;
	var ldab = 6;
	var ab = complexBandedMatrix( ldab, n, [
		[ 2, 0, 4.0, 1.0 ], [ 3, 0, -1.0, 0.0 ],
		[ 1, 1, -1.0, 0.0 ], [ 2, 1, 4.0, 1.0 ], [ 3, 1, -1.0, 0.0 ],
		[ 1, 2, -1.0, 0.0 ], [ 2, 2, 4.0, 1.0 ], [ 3, 2, -1.0, 0.0 ],
		[ 1, 3, -1.0, 0.0 ], [ 2, 3, 4.0, 1.0 ]
	]);
	var ipiv = new Int32Array( n );
	var work = new Complex128Array( 2 * n );
	var rwork = new Float64Array( n );
	var rcond = new Float64Array( 1 );

	var info = zgbtrf( n, n, 1, 1, ab, 1, ldab, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
	info = zgbcon( 'inf-norm', n, 1, 1, ab, 1, ldab, 0, ipiv, 1, 0, tc.anorm, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'zgbcon: KL=2, KU=1, N=4', function t() {
	var tc = kl2_ku1_1norm;
	var n = 4;
	var ldab = 6;
	var ab = complexBandedMatrix( ldab, n, [
		[ 3, 0, 5.0, 1.0 ], [ 4, 0, 2.0, 0.5 ], [ 5, 0, 1.0, 0.0 ],
		[ 2, 1, 1.0, 0.0 ], [ 3, 1, 6.0, 1.0 ], [ 4, 1, 1.0, 0.5 ], [ 5, 1, 2.0, 1.0 ],
		[ 2, 2, 2.0, 0.5 ], [ 3, 2, 7.0, 2.0 ], [ 4, 2, 3.0, 0.0 ],
		[ 2, 3, 1.0, 1.0 ], [ 3, 3, 8.0, 1.0 ]
	]);
	var ipiv = new Int32Array( n );
	var work = new Complex128Array( 2 * n );
	var rwork = new Float64Array( n );
	var rcond = new Float64Array( 1 );

	var info = zgbtrf( n, n, 2, 1, ab, 1, ldab, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
	info = zgbcon( 'one-norm', n, 2, 1, ab, 1, ldab, 0, ipiv, 1, 0, tc.anorm, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'zgbcon: N=0 (rcond=1)', function t() {
	var ab = new Complex128Array( 1 );
	var work = new Complex128Array( 0 );
	var rwork = new Float64Array( 0 );
	var rcond = new Float64Array( 1 );
	var ipiv = new Int32Array( 0 );
	var info = zgbcon( 'one-norm', 0, 0, 0, ab, 1, 1, 0, ipiv, 1, 0, 0.0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( rcond[ 0 ], 1.0 );
});

test( 'zgbcon: N=1', function t() {
	var tc = n_one;
	var ab = new Complex128Array( 6 );
	var abv = reinterpret( ab, 0 );
	abv[ 0 ] = 3.0;
	abv[ 1 ] = 1.0;
	var ipiv = new Int32Array( 1 );
	var work = new Complex128Array( 2 );
	var rwork = new Float64Array( 1 );
	var rcond = new Float64Array( 1 );

	var info = zgbtrf( 1, 1, 0, 0, ab, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
	info = zgbcon( 'one-norm', 1, 0, 0, ab, 1, 6, 0, ipiv, 1, 0, 4.0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, 0 );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'zgbcon: anorm=0 (rcond=0)', function t() {
	var n = 4;
	var ldab = 6;
	var ab = complexBandedMatrix( ldab, n, [
		[ 2, 0, 4.0, 1.0 ], [ 3, 0, -1.0, 0.0 ],
		[ 1, 1, -1.0, 0.0 ], [ 2, 1, 4.0, 1.0 ], [ 3, 1, -1.0, 0.0 ],
		[ 1, 2, -1.0, 0.0 ], [ 2, 2, 4.0, 1.0 ], [ 3, 2, -1.0, 0.0 ],
		[ 1, 3, -1.0, 0.0 ], [ 2, 3, 4.0, 1.0 ]
	]);
	var ipiv = new Int32Array( n );
	var work = new Complex128Array( 2 * n );
	var rwork = new Float64Array( n );
	var rcond = new Float64Array( 1 );

	var info = zgbtrf( n, n, 1, 1, ab, 1, ldab, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
	info = zgbcon( 'one-norm', n, 1, 1, ab, 1, ldab, 0, ipiv, 1, 0, 0.0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( rcond[ 0 ], 0.0 );
});
