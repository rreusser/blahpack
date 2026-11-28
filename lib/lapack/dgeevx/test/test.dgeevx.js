/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dgeevx from './../lib/dgeevx.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'dgeevx (main): computes eigenvalues of a diagonal matrix', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const A = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
	const WR = new Float64Array( 3 );
	const WI = new Float64Array( 3 );
	const VL = new Float64Array( 9 );
	const VR = new Float64Array( 9 );
	const SCALE = new Float64Array( 3 );
	const RCONDE = new Float64Array( 3 );
	const RCONDV = new Float64Array( 3 );
	const out = dgeevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'none', 3, A, 3, WR, 1, WI, 1, VL, 3, VR, 3, ilo, ihi, SCALE, 1, abnrm, RCONDE, 1, RCONDV );
	assert.equal( out, 0 );
});

test( 'dgeevx (main): throws on invalid balanc', function t() {
	const A = new Float64Array( 4 );
	const WR = new Float64Array( 2 );
	const WI = new Float64Array( 2 );
	const VL = new Float64Array( 4 );
	const VR = new Float64Array( 4 );
	const SCALE = new Float64Array( 2 );
	const RCONDE = new Float64Array( 2 );
	const RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		dgeevx( 'column-major', 'INVALID', 'compute-vectors', 'compute-vectors', 'none', 2, A, 2, WR, 1, WI, 1, VL, 2, VR, 2, ilo, ihi, SCALE, 1, abnrm, RCONDE, 1, RCONDV );
	}, TypeError );
});

test( 'dgeevx (main): throws on invalid jobvl', function t() {
	const A = new Float64Array( 4 );
	const WR = new Float64Array( 2 );
	const WI = new Float64Array( 2 );
	const VL = new Float64Array( 4 );
	const VR = new Float64Array( 4 );
	const SCALE = new Float64Array( 2 );
	const RCONDE = new Float64Array( 2 );
	const RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		dgeevx( 'column-major', 'both', 'X', 'compute-vectors', 'none', 2, A, 2, WR, 1, WI, 1, VL, 2, VR, 2, ilo, ihi, SCALE, 1, abnrm, RCONDE, 1, RCONDV );
	}, TypeError );
});

test( 'dgeevx (main): throws on invalid jobvr', function t() {
	const A = new Float64Array( 4 );
	const WR = new Float64Array( 2 );
	const WI = new Float64Array( 2 );
	const VL = new Float64Array( 4 );
	const VR = new Float64Array( 4 );
	const SCALE = new Float64Array( 2 );
	const RCONDE = new Float64Array( 2 );
	const RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		dgeevx( 'column-major', 'both', 'compute-vectors', 'X', 'none', 2, A, 2, WR, 1, WI, 1, VL, 2, VR, 2, ilo, ihi, SCALE, 1, abnrm, RCONDE, 1, RCONDV );
	}, TypeError );
});

test( 'dgeevx (main): throws on invalid sense', function t() {
	const A = new Float64Array( 4 );
	const WR = new Float64Array( 2 );
	const WI = new Float64Array( 2 );
	const VL = new Float64Array( 4 );
	const VR = new Float64Array( 4 );
	const SCALE = new Float64Array( 2 );
	const RCONDE = new Float64Array( 2 );
	const RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		dgeevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'X', 2, A, 2, WR, 1, WI, 1, VL, 2, VR, 2, ilo, ihi, SCALE, 1, abnrm, RCONDE, 1, RCONDV );
	}, TypeError );
});

test( 'dgeevx (main): throws on negative N', function t() {
	const A = new Float64Array( 4 );
	const WR = new Float64Array( 2 );
	const WI = new Float64Array( 2 );
	const VL = new Float64Array( 4 );
	const VR = new Float64Array( 4 );
	const SCALE = new Float64Array( 2 );
	const RCONDE = new Float64Array( 2 );
	const RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		dgeevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'none', -1, A, 2, WR, 1, WI, 1, VL, 2, VR, 2, ilo, ihi, SCALE, 1, abnrm, RCONDE, 1, RCONDV );
	}, RangeError );
});

test( 'dgeevx (main): throws on small LDA', function t() {
	const A = new Float64Array( 4 );
	const WR = new Float64Array( 2 );
	const WI = new Float64Array( 2 );
	const VL = new Float64Array( 4 );
	const VR = new Float64Array( 4 );
	const SCALE = new Float64Array( 2 );
	const RCONDE = new Float64Array( 2 );
	const RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		dgeevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'none', 2, A, 1, WR, 1, WI, 1, VL, 2, VR, 2, ilo, ihi, SCALE, 1, abnrm, RCONDE, 1, RCONDV );
	}, RangeError );
});

test( 'dgeevx allocates a sufficient workspace when work and iwork are null (the optimum; tickets 0096, 0100)', function t() { // eslint-disable-line max-len
	const sizes = [ 3, 40 ];
	let seed = 11;
	let res, A0, N, i, s, k;
	function run( N, A0, work, iwork ) {
		const out = {
			'A': new Float64Array( A0 ),
			'WR': new Float64Array( N ),
			'WI': new Float64Array( N ),
			'VL': new Float64Array( N * N ),
			'VR': new Float64Array( N * N ),
			'SCALE': new Float64Array( N ),
			'abnrm': new Float64Array( 1 ),
			'RCONDE': new Float64Array( N ),
			'RCONDV': new Float64Array( N )
		};
		out.info = dgeevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'both', N, out.A, N, out.WR, 1, out.WI, 1, out.VL, N, out.VR, N, new Int32Array( 1 ), new Int32Array( 1 ), out.SCALE, 1, out.abnrm, out.RCONDE, 1, out.RCONDV, 1, work, iwork ); // eslint-disable-line max-len
		return out;
	}
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		A0 = new Float64Array( N * N );
		for ( i = 0; i < A0.length; i++ ) {
			seed = ( seed * 16807 ) % 2147483647;
			A0[ i ] = ( seed / 2147483647 ) - 0.5;
		}
		res = [ run( N, A0, null, null ), run( N, A0, new Float64Array( computeOptimalWorkSize( 'compute-vectors', 'compute-vectors', 'both', N ) ), new Int32Array( 2 * N ) ) ];
		assert.equal( res[ 0 ].info, 0, 'info' );
		for ( k in res[ 0 ] ) {
			if ( Object.prototype.hasOwnProperty.call( res[ 0 ], k ) ) {
				assert.deepEqual( res[ 0 ][ k ], res[ 1 ][ k ], k );
			}
		}
	}
});
