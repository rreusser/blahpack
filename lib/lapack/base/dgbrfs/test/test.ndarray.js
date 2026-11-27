/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbtrf from './../../dgbtrf/lib/base.js';
import dgbtrs from './../../dgbtrs/lib/base.js';
import dgbrfs from './../lib/ndarray.js';

// FIXTURES //

import tridiag_notrans from './fixtures/tridiag_notrans.json' with { type: 'json' };
import tridiag_trans from './fixtures/tridiag_trans.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import kl2_ku1 from './fixtures/kl2_ku1.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts two values are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are close.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates a real banded matrix.
*
* @private
* @param {integer} ldab - leading dimension (rows)
* @param {integer} n - number of columns
* @param {Array} entries - array of [row, col, value]
* @returns {Float64Array} banded matrix
*/
function bandedMatrix( ldab, n, entries ) {
	let i;

	const ab = new Float64Array( ldab * n );
	for ( i = 0; i < entries.length; i++ ) {
		ab[ ( entries[ i ][ 1 ] * ldab ) + entries[ i ][ 0 ] ] = entries[ i ][ 2 ];
	}
	return ab;
}

/**
* Copies original band matrix into factored storage layout.
*
* @private
* @param {integer} kl - number of subdiagonals
* @param {integer} ku - number of superdiagonals
* @param {integer} n - number of columns
* @param {integer} abLdab - leading dimension of AB
* @param {Float64Array} ab - original band matrix
* @param {integer} afbLdab - leading dimension of AFB
* @returns {Float64Array} factored band storage
*/
function copyBandToFactored( kl, ku, n, abLdab, ab, afbLdab ) {
	let i, j;

	const afb = new Float64Array( afbLdab * n );
	const origRows = kl + ku + 1;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < origRows; i++ ) {
			afb[ ( j * afbLdab ) + kl + i ] = ab[ ( j * abLdab ) + i ];
		}
	}
	return afb;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dgbrfs: tridiag_notrans (KL=1, KU=1, N=4)', function t() {
	let info;

	const tc = tridiag_notrans;
	const n = 4;
	const ab = bandedMatrix( 6, n, [
		[ 1, 0, 4.0 ],
		[ 2, 0, -1.0 ],
		[ 0, 1, 0.5 ],
		[ 1, 1, 4.0 ],
		[ 2, 1, -1.0 ],
		[ 0, 2, 0.5 ],
		[ 1, 2, 4.0 ],
		[ 2, 2, -1.0 ],
		[ 0, 3, 0.5 ],
		[ 1, 3, 4.0 ]
	]);
	const b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const afb = copyBandToFactored( 1, 1, n, 6, ab, 6 );
	const ipiv = new Int32Array( n );
	info = dgbtrf( n, n, 1, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'dgbtrf info' );
	const x = new Float64Array( n );
	x.set( b );
	info = dgbtrs( 'no-transpose', n, 1, 1, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'dgbtrs info' );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * n );
	const iwork = new Int32Array( n );
	info = dgbrfs( 'no-transpose', n, 1, 1, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});

test( 'dgbrfs: tridiag_trans (KL=1, KU=1, N=4)', function t() {
	let info;

	const tc = tridiag_trans;
	const n = 4;
	const ab = bandedMatrix( 6, n, [
		[ 1, 0, 4.0 ],
		[ 2, 0, -1.0 ],
		[ 0, 1, 0.5 ],
		[ 1, 1, 4.0 ],
		[ 2, 1, -1.0 ],
		[ 0, 2, 0.5 ],
		[ 1, 2, 4.0 ],
		[ 2, 2, -1.0 ],
		[ 0, 3, 0.5 ],
		[ 1, 3, 4.0 ]
	]);
	const b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const afb = copyBandToFactored( 1, 1, n, 6, ab, 6 );
	const ipiv = new Int32Array( n );
	info = dgbtrf( n, n, 1, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
	const x = new Float64Array( n );
	x.set( b );
	info = dgbtrs( 'transpose', n, 1, 1, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 );
	assert.equal( info, 0 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * n );
	const iwork = new Int32Array( n );
	info = dgbrfs( 'transpose', n, 1, 1, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});

test( 'dgbrfs: multi_rhs (KL=1, KU=1, N=4, NRHS=2)', function t() {
	let info;

	const tc = multi_rhs;
	const n = 4;
	const nrhs = 2;
	const ab = bandedMatrix( 6, n, [
		[ 1, 0, 4.0 ],
		[ 2, 0, -1.0 ],
		[ 0, 1, 0.5 ],
		[ 1, 1, 4.0 ],
		[ 2, 1, -1.0 ],
		[ 0, 2, 0.5 ],
		[ 1, 2, 4.0 ],
		[ 2, 2, -1.0 ],
		[ 0, 3, 0.5 ],
		[ 1, 3, 4.0 ]
	]);
	const b = new Float64Array( n * nrhs );
	b[ 0 ] = 1.0;
	b[ 1 ] = 2.0;
	b[ 2 ] = 3.0;
	b[ 3 ] = 4.0;
	b[ 4 ] = 0.5;
	b[ 5 ] = 1.5;
	b[ 6 ] = -1.0;
	b[ 7 ] = 2.0;
	const afb = copyBandToFactored( 1, 1, n, 6, ab, 6 );
	const ipiv = new Int32Array( n );
	info = dgbtrf( n, n, 1, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
	const x = new Float64Array( n * nrhs );
	x.set( b );
	info = dgbtrs( 'no-transpose', n, 1, 1, nrhs, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	const ferr = new Float64Array( nrhs );
	const berr = new Float64Array( nrhs );
	const work = new Float64Array( 3 * n );
	const iwork = new Int32Array( n );
	info = dgbrfs( 'no-transpose', n, 1, 1, nrhs, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( x ).slice( 0, n ), tc.x, 1e-10, 'x col1' );
	assertArrayClose( toArray( x ).slice( n, 2 * n ), tc.x2, 1e-10, 'x col2' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-6, 'berr' );
});

test( 'dgbrfs: n_zero', function t() {

	const tc = n_zero;
	const ab = new Float64Array( 1 );
	const afb = new Float64Array( 1 );
	const ipiv = new Int32Array( 0 );
	const b = new Float64Array( 1 );
	const x = new Float64Array( 1 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 1 );
	const iwork = new Int32Array( 1 );
	const info = dgbrfs( 'no-transpose', 0, 0, 0, 1, ab, 1, 1, 0, afb, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assert.equal( ferr[ 0 ], tc.ferr[ 0 ], 'ferr' );
	assert.equal( berr[ 0 ], tc.berr[ 0 ], 'berr' );
});

test( 'dgbrfs: nrhs_zero', function t() {

	const tc = nrhs_zero;
	const ab = new Float64Array( 1 );
	const afb = new Float64Array( 1 );
	const ipiv = new Int32Array( 4 );
	const b = new Float64Array( 1 );
	const x = new Float64Array( 1 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 1 );
	const iwork = new Int32Array( 4 );
	const info = dgbrfs( 'no-transpose', 4, 1, 1, 0, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, 4, 0, x, 1, 4, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbrfs: kl2_ku1 (KL=2, KU=1, N=4)', function t() {
	let info;

	const tc = kl2_ku1;
	const n = 4;
	const ab = bandedMatrix( 6, n, [
		[ 1, 0, 5.0 ],
		[ 2, 0, 2.0 ],
		[ 3, 0, 1.0 ],
		[ 0, 1, 1.0 ],
		[ 1, 1, 6.0 ],
		[ 2, 1, 1.0 ],
		[ 3, 1, 2.0 ],
		[ 0, 2, 2.0 ],
		[ 1, 2, 7.0 ],
		[ 2, 2, 3.0 ],
		[ 0, 3, 1.0 ],
		[ 1, 3, 8.0 ]
	]);
	const b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const afb = copyBandToFactored( 2, 1, n, 6, ab, 6 );
	const ipiv = new Int32Array( n );
	info = dgbtrf( n, n, 2, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'dgbtrf info' );
	const x = new Float64Array( n );
	x.set( b );
	info = dgbtrs( 'no-transpose', n, 2, 1, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 * n );
	const iwork = new Int32Array( n );
	info = dgbrfs( 'no-transpose', n, 2, 1, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});

test( 'dgbrfs: one_by_one (N=1, KL=0, KU=0)', function t() {
	let info;

	const tc = one_by_one;
	const ab = new Float64Array( 6 );
	ab[ 0 ] = 3.0;
	const afb = new Float64Array( 6 );
	afb[ 0 ] = 3.0;
	const b = new Float64Array( [ 5.0 ] );
	const ipiv = new Int32Array( 1 );
	info = dgbtrf( 1, 1, 0, 0, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
	const x = new Float64Array( 1 );
	x[ 0 ] = b[ 0 ];
	info = dgbtrs( 'no-transpose', 1, 0, 0, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	const ferr = new Float64Array( 1 );
	const berr = new Float64Array( 1 );
	const work = new Float64Array( 3 );
	const iwork = new Int32Array( 1 );
	info = dgbrfs( 'no-transpose', 1, 0, 0, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});

test( 'dgbrfs: FERR is normalized by max|X| even when no refinement step is taken (scale invariance)', function t() {
	// A = tridiag(1,4,1) (exactly representable), X is the exact solution and B = A*X exactly, so the residual is zero, BERR = 0, and the refinement loop exits on its first pass (LSTRES still holds its initial 3.0). FERR must then be EST / max_i |X(i)| with LSTRES reset to zero first; since max(|X|) = 0.5*scale < 3 for scale = 1, a stale LSTRES would divide by 3 instead. Scaling B and X by a power of two scales EST and max|X| identically, so FERR must be invariant.
	const xs = [ 0.5, -0.25, 0.125 ];
	const bs = [ 1.75, -0.375, 0.25 ];
	const ferr = [];
	const berr = [];
	let scale;
	let info;
	let i;
	let k;
	const AB = new Float64Array( [ 0, 4, 1, 1, 4, 1, 1, 4, 0 ] );
	const AFB = new Float64Array( [ 0, 0, 4, 1, 0, 1, 4, 1, 0, 1, 4, 0 ] );
	const IPIV = new Int32Array( 3 );
	dgbtrf( 3, 3, 1, 1, AFB, 1, 4, 0, IPIV, 1, 0 );
	for ( k = 0; k < 2; k++ ) {
		scale = ( k === 0 ) ? 1.0 : 8.0;
		const X = new Float64Array( 3 );
		const B = new Float64Array( 3 );
		for ( i = 0; i < 3; i++ ) {
			X[ i ] = scale * xs[ i ];
			B[ i ] = scale * bs[ i ];
		}
		const FERR = new Float64Array( 1 );
		const BERR = new Float64Array( 1 );
		const WORK = new Float64Array( 9 );
		const IWORK = new Int32Array( 3 );
		info = dgbrfs( 'no-transpose', 3, 1, 1, 1, AB, 1, 3, 0, AFB, 1, 4, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
		assert.equal( info, 0, 'info' );
		ferr.push( FERR[ 0 ] );
		berr.push( BERR[ 0 ] );
	}
	assert.equal( berr[ 0 ], 0.0, 'berr (scale 1)' );
	assert.equal( berr[ 1 ], 0.0, 'berr (scale 8)' );
	assert.ok( ferr[ 1 ] > 0.0, 'ferr > 0' );
	assert.ok( Math.abs( ferr[ 0 ] - ferr[ 1 ] ) <= 1e-12 * ferr[ 1 ], 'ferr invariant under scaling: ' + ferr[ 0 ] + ' vs ' + ferr[ 1 ] ); // eslint-disable-line max-len
});

test( 'dgbrfs: IWORK one element shorter than the declared N throws RangeError (ticket 0107)', function t() {
	const N = 3;
	function call( IWORK, offsetIWork ) {
		return dgbrfs( 'no-transpose', N, 1, 1, 1, new Float64Array( 3 * N ), 1, 3, 0, new Float64Array( 4 * N ), 1, 4, 0, new Int32Array( [ 1, 2, 3 ] ), 1, 0, new Float64Array( N ), 1, N, 0, new Float64Array( N ), 1, N, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 3 * N ), 1, 0, IWORK, 1, offsetIWork ); // eslint-disable-line max-len
	}
	assert.throws( function short() {
		call( new Int32Array( N - 1 ), 0 );
	}, /IWORK array must have at least 3 elements from offset 0/ );
	assert.throws( function shortFromOffset() {
		call( new Int32Array( N ), 1 );
	}, /IWORK array must have at least 3 elements from offset 1/ );
	assert.doesNotThrow( function atMinimum() {
		call( new Int32Array( N + 1 ), 1 );
	});
});
