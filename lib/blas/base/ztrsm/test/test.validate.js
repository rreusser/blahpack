/**
* Property-based validation for ztrsm, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tr` -> triangular dense
* (schemes.dense, logical.triangular); `sm` (triangular solve, multiple RHS) ->
* RESIDUAL: after solving, plug X back in and check op(A)*X (left) or X*op(A)
* (right) reproduces alpha*B0. The FULL logical triangular matrix (opposite
* triangle zero, unit diagonal = 1) is the independent oracle. op(A) covers
* no-transpose, transpose, AND conjugate-transpose.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import ztrsm from './../lib/ndarray.js';

const sc = S.complex; // z-routine
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

// Read the M x N solution X back out of physical storage into a LogicalMatrix.
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

// expected = alpha * B0 as a LogicalMatrix.
function scaleLogical( B0, alpha, m, n ) {
	const E = new LogicalMatrix( sc, m, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			E.set( i, j, sc.mul( alpha, B0.get( i, j ) ) );
		}
	}
	return E;
}

// Backward-error residual for a triangular solve. A solve's residual must be
// normalized by ‖A‖·‖X‖ + ‖E‖ (NOT ‖E‖ alone): for ill-conditioned A (e.g. a
// unit-diagonal triangle with O(1) off-diagonals) ‖X‖ >> ‖E‖/‖A‖, so an
// ‖E‖-only scale inflates a backward-stable residual by the condition number.
function assertSolveResidual( A, X, opAX, E, label, factor ) {
	const R = new LogicalMatrix( sc, E.rows, E.cols );
	let i, j;
	for ( j = 0; j < E.cols; j++ ) {
		for ( i = 0; i < E.rows; i++ ) {
			R.set( i, j, sc.sub( opAX.get( i, j ), E.get( i, j ) ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => out-of-bounds read into poisoned storage
	const scale = ( norms.frobenius( sc, A ) * norms.frobenius( sc, X ) ) + norms.frobenius( sc, E );
	const n = Math.max( E.rows, E.cols, A.rows );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: residual property across all flags and a size sweep.
test( 'ztrsm: solve residual (side x uplo x transa x diag x sizes)', function t() {
	SIDES.forEach( function eachSide( side ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			TRANS.forEach( function eachTrans( transa ) {
				DIAGS.forEach( function eachDiag( diag ) {
					SIZES.forEach( function eachM( M ) {
						SIZES.forEach( function eachN( N ) {
							runResidual( side, uplo, transa, diag, M, N );
						});
					});
				});
			});
		});
	});
});

function runResidual( side, uplo, transa, diag, M, N ) {
	const na = ( side === 'left' ) ? M : N; // order of triangular A
	const unit = ( diag === 'unit' );
	const rng = new RNG( 0x100 + ( M * 10 ) + N ); // reproducible; log on failure
	const A = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
	const B0 = logical.general( sc, rng, M, N );
	const alpha = ( N % 2 === 0 ) ? sc.one : sc.random( rng ); // include alpha=1

	const layout = schemes.dense.layouts()[ 0 ];
	const Ar = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );

	ztrsm( side, uplo, transa, diag, M, N, sc.apiScalar( alpha ), Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	const X = readB( Br, M, N );
	const code = transCode( transa );
	const opAX = ( side === 'left' )
		? ref.matmul( sc, A, X, { 'transa': code } )
		: ref.matmul( sc, X, A, { 'transb': code } );
	const E = scaleLogical( B0, alpha, M, N );
	const label = 'ztrsm '+side+' '+uplo+' '+transa+' '+diag+' M='+M+' N='+N;
	checked( 'ztrsm', 'residual', function run() {
		assertSolveResidual( A, X, opAX, E, label, 100 );
	});
}

// Step 4: layout-invariance fuzz — solution must be bit-exact across storage layouts.
test( 'ztrsm: bit-exact across storage layouts', function t() {
	const combos = [
		[ 'left', 'upper', 'no-transpose', 'non-unit' ],
		[ 'left', 'lower', 'transpose', 'unit' ],
		[ 'right', 'upper', 'conjugate-transpose', 'non-unit' ],
		[ 'right', 'lower', 'conjugate-transpose', 'unit' ]
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
		checked( 'ztrsm', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.layouts(), function build( layout ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
				const B0 = logical.general( sc, rng, M, N );
				const alpha = sc.random( rng );
				const Ar = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, layout );
				const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
				ztrsm( side, uplo, transa, diag, M, N, sc.apiScalar( alpha ), Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
				return check.flattenLogical( sc, readB( Br, M, N ) );
			}, { 'label': 'ztrsm '+side+' '+uplo+' '+transa+' '+diag+' layout invariance' } );
		});
	});
});
