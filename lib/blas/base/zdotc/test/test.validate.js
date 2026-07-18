/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len */

'use strict';

// MODULES //

import test from 'node:test';
import { RNG, scalar as S, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zdotc from './../lib/ndarray.js';

const sc = S.complex;


// HELPERS //

// Convert a returned Complex128 into the harness's { re, im } value form.
function val( z ) {
	return { 're': S.creal( z ), 'im': S.cimag( z ) };
}


// TESTS //

// L2 property: got == sum_i conj(x_i)*y_i, validated against an independent inline oracle across a size sweep (incl N=0,1).
test( 'zdotc: conjugated dot product equals sum_i conj(x_i)*y_i (property)', function t() {
	checked( 'zdotc', 'property', function run() {
		SIZES.forEach( function eachN( N ) {
			const rng = new RNG( 0x100 + N );
			const xv = [];
			const yv = [];
			let i;
			for ( i = 0; i < N; i++ ) {
				xv.push( sc.random( rng ) );
			}
			for ( i = 0; i < N; i++ ) {
				yv.push( sc.random( rng ) );
			}
			const X = schemes.realizeVector( sc, xv, { 'stride': 1 } );
			const Y = schemes.realizeVector( sc, yv, { 'stride': 1 } );
			const got = val( zdotc( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] ) );

			// Independent oracle: naive ascending sum of conj(x_i)*y_i:
			let exp = sc.zero;
			for ( i = 0; i < N; i++ ) {
				exp = sc.add( exp, sc.mul( sc.conj( xv[ i ] ), yv[ i ] ) );
			}
			check.assertFinite( sc, [ got ], 'zdotc N='+N );
			check.assertScaled( sc.abs( sc.sub( got, exp ) ), sc.abs( exp ), check.tol( N, 20 ), 'zdotc N='+N );
		});
	});
});

// L3 layout invariance: output is bit-exact across all vector layouts (padded / gapped / negative strides).
test( 'zdotc: output is bit-exact across storage layouts', function t() {
	const N = 17;
	const SEED = 0x2D0C;
	const vL = schemes.vectorLayouts();
	checked( 'zdotc', 'layout-invariance', function run() {
		layoutInvariant( vL, function build( layout, idx ) {
			const rng = new RNG( SEED ); // fixed seed => identical operand values
			const xv = [];
			const yv = [];
			let i;
			for ( i = 0; i < N; i++ ) {
				xv.push( sc.random( rng ) );
			}
			for ( i = 0; i < N; i++ ) {
				yv.push( sc.random( rng ) );
			}
			const X = schemes.realizeVector( sc, xv, vL[ idx ] );
			const Y = schemes.realizeVector( sc, yv, vL[ ( idx + 3 ) % vL.length ] );
			const got = val( zdotc( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] ) );
			return sc.components( got );
		}, { 'label': 'zdotc layout invariance' } );
	});
});
