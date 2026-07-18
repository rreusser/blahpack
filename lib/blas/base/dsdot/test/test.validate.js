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
import dsdot from './../lib/ndarray.js';

const sc = S.real;


// TESTS //

// L2 property: dsdot accumulates sum_i x_i*y_i in extended precision; the result still equals the mathematical dot product to scaled tolerance.
test( 'dsdot: dot product equals sum_i x_i*y_i (property)', function t() {
	checked( 'dsdot', 'property', function run() {
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
			const got = dsdot( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );

			// Independent oracle: naive ascending sum:
			let exp = sc.zero;
			for ( i = 0; i < N; i++ ) {
				exp = sc.add( exp, sc.mul( xv[ i ], yv[ i ] ) );
			}
			check.assertFinite( sc, [ got ], 'dsdot N='+N );
			check.assertScaled( sc.abs( sc.sub( got, exp ) ), sc.abs( exp ), check.tol( N, 20 ), 'dsdot N='+N );
		});
	});
});

// L3 layout invariance: output is bit-exact across all vector layouts (padded / gapped / negative strides).
test( 'dsdot: output is bit-exact across storage layouts', function t() {
	const N = 17;
	const SEED = 0x5D07;
	const vL = schemes.vectorLayouts();
	checked( 'dsdot', 'layout-invariance', function run() {
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
			const got = dsdot( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );
			return sc.components( got );
		}, { 'label': 'dsdot layout invariance' } );
	});
});
