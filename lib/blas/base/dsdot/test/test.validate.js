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

var sc = S.real;


// TESTS //

// L2 property: dsdot accumulates sum_i x_i*y_i in extended precision; the result still equals the mathematical dot product to scaled tolerance.
test( 'dsdot: dot product equals sum_i x_i*y_i (property)', function t() {
	checked( 'dsdot', 'property', function run() {
		SIZES.forEach( function eachN( N ) {
			var rng = new RNG( 0x100 + N );
			var xv = [];
			var yv = [];
			var i;
			for ( i = 0; i < N; i++ ) {
				xv.push( sc.random( rng ) );
			}
			for ( i = 0; i < N; i++ ) {
				yv.push( sc.random( rng ) );
			}
			var X = schemes.realizeVector( sc, xv, { 'stride': 1 } );
			var Y = schemes.realizeVector( sc, yv, { 'stride': 1 } );
			var got = dsdot( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );

			// Independent oracle: naive ascending sum:
			var exp = sc.zero;
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
	var N = 17;
	var SEED = 0x5D07;
	var vL = schemes.vectorLayouts();
	checked( 'dsdot', 'layout-invariance', function run() {
		layoutInvariant( vL, function build( layout, idx ) {
			var rng = new RNG( SEED ); // fixed seed => identical operand values
			var xv = [];
			var yv = [];
			var i;
			for ( i = 0; i < N; i++ ) {
				xv.push( sc.random( rng ) );
			}
			for ( i = 0; i < N; i++ ) {
				yv.push( sc.random( rng ) );
			}
			var X = schemes.realizeVector( sc, xv, vL[ idx ] );
			var Y = schemes.realizeVector( sc, yv, vL[ ( idx + 3 ) % vL.length ] );
			var got = dsdot( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );
			return sc.components( got );
		}, { 'label': 'dsdot layout invariance' } );
	});
});
