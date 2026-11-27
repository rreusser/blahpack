/**
* Property-based validation for dtrmm, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tr` -> triangular dense
* (schemes.dense, logical.triangular); `mm` (triangular matrix-matrix multiply,
* in place) -> RESIDUAL/reconstruction: B := alpha*op(A)*B (left) or
* B := alpha*B*op(A) (right). The FULL logical triangular matrix (opposite
* triangle zero, unit diagonal = 1) is the independent oracle, densified by
* ref.matmul.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dtrmm from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const SIDES = [ 'left', 'right' ];
const UPLOS = [ 'upper', 'lower' ];
const TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
const DIAGS = [ 'non-unit', 'unit' ];
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

// Read the M x N result B back out of physical storage into a LogicalMatrix.
function readB( R, m, n ) {
	const X = new LogicalMatrix( sc, m, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// expected = alpha * P as a LogicalMatrix.
function scaleLogical( P, alpha, m, n ) {
	const E = new LogicalMatrix( sc, m, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			E.set( i, j, sc.mul( alpha, P.get( i, j ) ) );
		}
	}
	return E;
}

// Pick alpha covering 0, 1, and random.
function pickAlpha( rng, M, N ) {
	if ( ( M + N ) % 3 === 0 ) {
		return sc.zero; // include alpha=0
	}
	if ( N % 2 === 0 ) {
		return sc.one; // include alpha=1
	}
	return sc.random( rng );
}

// Steps 2-3-5: reconstruction property across all flags and a size sweep.
test( 'dtrmm: multiply reconstruction (side x uplo x transa x diag x sizes)', function t() {
	SIDES.forEach( function eachSide( side ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			TRANS.forEach( function eachTrans( transa ) {
				DIAGS.forEach( function eachDiag( diag ) {
					SIZES.forEach( function eachM( M ) {
						SIZES.forEach( function eachN( N ) {
							runReconstruct( side, uplo, transa, diag, M, N );
						});
					});
				});
			});
		});
	});
});

function runReconstruct( side, uplo, transa, diag, M, N ) {
	const na = ( side === 'left' ) ? M : N; // order of triangular A
	const unit = ( diag === 'unit' );
	const rng = new RNG( 0x100 + ( M * 10 ) + N ); // reproducible; log on failure
	const A = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
	const B0 = logical.general( sc, rng, M, N );
	const alpha = pickAlpha( rng, M, N );

	const layout = schemes.dense.layouts()[ 0 ];
	const Ar = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );

	dtrmm( side, uplo, transa, diag, M, N, sc.apiScalar( alpha ), Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	const gotB = readB( Br, M, N );
	const code = transCode( transa );
	const P = ( side === 'left' )
		? ref.matmul( sc, A, B0, { 'transa': code } )
		: ref.matmul( sc, B0, A, { 'transb': code } );
	const E = scaleLogical( P, alpha, M, N );
	const label = 'dtrmm '+side+' '+uplo+' '+transa+' '+diag+' M='+M+' N='+N;
	checked( 'dtrmm', 'residual', function run() {
		check.assertReconstruct( sc, gotB, E, { 'label': label, 'factor': 100 } );
	});
}

// Step 4: layout-invariance fuzz — result must be bit-exact across storage layouts.
test( 'dtrmm: bit-exact across storage layouts', function t() {
	const combos = [
		[ 'left', 'upper', 'no-transpose', 'non-unit' ],
		[ 'left', 'lower', 'transpose', 'unit' ],
		[ 'right', 'upper', 'conjugate-transpose', 'non-unit' ],
		[ 'right', 'lower', 'no-transpose', 'unit' ]
	];
	const M = 6;
	const N = 5;
	const SEED = 0xBEEF;
	combos.forEach( function eachCombo( c ) {
		const side = c[ 0 ];
		const uplo = c[ 1 ];
		const transa = c[ 2 ];
		const diag = c[ 3 ];
		const na = ( side === 'left' ) ? M : N;
		const unit = ( diag === 'unit' );
		checked( 'dtrmm', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.layouts(), function build( layout ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
				const B0 = logical.general( sc, rng, M, N );
				const alpha = sc.random( rng );
				const Ar = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, layout );
				const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
				dtrmm( side, uplo, transa, diag, M, N, sc.apiScalar( alpha ), Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
				return check.flattenLogical( sc, readB( Br, M, N ) );
			}, { 'label': 'dtrmm '+side+' '+uplo+' '+transa+' '+diag+' layout invariance' } );
		});
	});
});
