/**
* Property-based validation for dtrtrs, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tr` -> triangular dense
* (schemes.dense, logical.triangular); `trs` (triangular solve, multiple RHS) ->
* RESIDUAL: after solving, plug X back in and check op(A)*X = B0 per RHS column
* against the FULL logical triangular matrix (opposite triangle zero, unit
* diagonal = 1) as the independent oracle. `check.assertResidual` normalizes by
* ‖A‖·‖x‖ + ‖b‖ (backward error), so an ill-conditioned unit-diagonal triangle
* is still validated correctly.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dtrtrs from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
const DIAGS = [ 'non-unit', 'unit' ];
const NRHS = [ 1, 2, 3 ];
const SIZES = [ 0 ].concat( SIZES_SMALL ); // include a 0 dim

// Map an API transpose flag to a reference transpose code.
function transCode( trans ) {
	if ( trans === 'transpose' ) {
		return 't';
	}
	if ( trans === 'conjugate-transpose' ) {
		return 'c';
	}
	return 'n';
}

// Read column j of the solution X out of physical B storage as an array of
// scalar values.
function readCol( R, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

// Column j of a LogicalMatrix as an array of scalar values.
function logicalCol( M, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Read the full N x nrhs solution back into a LogicalMatrix (for bit-exact
// layout comparison).
function readB( R, n, nrhs ) {
	const X = new LogicalMatrix( sc, n, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// Steps 2-3-5: residual property across all flags, a size sweep, and nrhs.
// A single dense layout is used here; every layout is exercised by the
// invariance test below.
test( 'dtrtrs: triangular solve residual (uplo x trans x diag x N x nrhs)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( trans ) {
			DIAGS.forEach( function eachDiag( diag ) {
				SIZES.forEach( function eachN( N ) {
					NRHS.forEach( function eachNrhs( nrhs ) {
						runResidual( uplo, trans, diag, N, nrhs );
					});
				});
			});
		});
	});
});

function runResidual( uplo, trans, diag, N, nrhs ) {
	const unit = ( diag === 'unit' );
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
	const B0 = logical.general( sc, rng, N, nrhs );

	const layout = schemes.dense.layouts()[ 0 ];
	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );

	dtrtrs( uplo, trans, diag, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	const code = transCode( trans );
	checked( 'dtrtrs', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': 'dtrtrs '+uplo+' '+trans+' '+diag+' N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz — solution must be bit-exact across storage
// layouts. dtrtrs delegates to dtrsm (storage-order-independent, no pivot
// search), so it is bit-exact across ALL 7 layouts (col AND row, incl. negative
// strides); no col/row family split is needed.
test( 'dtrtrs: bit-exact across all storage layouts', function t() {
	const combos = [
		[ 'upper', 'no-transpose', 'non-unit' ],
		[ 'lower', 'transpose', 'unit' ],
		[ 'upper', 'conjugate-transpose', 'non-unit' ],
		[ 'lower', 'no-transpose', 'unit' ]
	];
	const N = 9;
	const nrhs = 3;
	const SEED = 0xBEEF;
	combos.forEach( function eachCombo( c ) {
		const uplo = c[ 0 ];
		const trans = c[ 1 ];
		const diag = c[ 2 ];
		const unit = ( diag === 'unit' );
		checked( 'dtrtrs', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.layouts(), function build( layout ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A0 = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
				const B0 = logical.general( sc, rng, N, nrhs );
				const Ar = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
				const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
				dtrtrs( uplo, trans, diag, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
				return check.flattenLogical( sc, readB( Br, N, nrhs ) );
			}, { 'label': 'dtrtrs '+uplo+' '+trans+' '+diag+' layout invariance' } );
		});
	});
});
