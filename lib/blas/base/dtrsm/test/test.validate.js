/**
* Property-based validation for dtrsm, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tr` -> triangular dense
* (schemes.dense, logical.triangular); `sm` (triangular solve, multiple RHS) ->
* RESIDUAL: after solving, plug X back in and check op(A)*X (left) or X*op(A)
* (right) reproduces alpha*B0. The FULL logical triangular matrix (opposite
* triangle zero, unit diagonal = 1) is the independent oracle.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dtrsm from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var SIDES = [ 'left', 'right' ];
var UPLOS = [ 'upper', 'lower' ];
var TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
var DIAGS = [ 'non-unit', 'unit' ];
var SIZES = [ 0 ].concat( SIZES_SMALL ); // include a 0 dim

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
	var X = new LogicalMatrix( sc, m, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// expected = alpha * B0 as a LogicalMatrix.
function scaleLogical( B0, alpha, m, n ) {
	var E = new LogicalMatrix( sc, m, n );
	var i;
	var j;
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
	var R = new LogicalMatrix( sc, E.rows, E.cols );
	var i;
	var j;
	for ( j = 0; j < E.cols; j++ ) {
		for ( i = 0; i < E.rows; i++ ) {
			R.set( i, j, sc.sub( opAX.get( i, j ), E.get( i, j ) ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => out-of-bounds read into poisoned storage
	var scale = ( norms.frobenius( sc, A ) * norms.frobenius( sc, X ) ) + norms.frobenius( sc, E );
	var n = Math.max( E.rows, E.cols, A.rows );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: residual property across all flags and a size sweep.
test( 'dtrsm: solve residual (side x uplo x transa x diag x sizes)', function t() {
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
	var na = ( side === 'left' ) ? M : N; // order of triangular A
	var unit = ( diag === 'unit' );
	var rng = new RNG( 0x100 + ( M * 10 ) + N ); // reproducible; log on failure
	var A = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
	var B0 = logical.general( sc, rng, M, N );
	var alpha = ( N % 2 === 0 ) ? sc.one : sc.random( rng ); // include alpha=1

	var layout = schemes.dense.layouts()[ 0 ];
	var Ar = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, layout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );

	dtrsm( side, uplo, transa, diag, M, N, sc.apiScalar( alpha ), Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	var X = readB( Br, M, N );
	var code = transCode( transa );
	var opAX = ( side === 'left' )
		? ref.matmul( sc, A, X, { 'transa': code } )
		: ref.matmul( sc, X, A, { 'transb': code } );
	var E = scaleLogical( B0, alpha, M, N );
	var label = 'dtrsm '+side+' '+uplo+' '+transa+' '+diag+' M='+M+' N='+N;
	checked( 'dtrsm', 'residual', function run() {
		assertSolveResidual( A, X, opAX, E, label, 100 );
	});
}

// Step 4: layout-invariance fuzz — solution must be bit-exact across storage layouts.
test( 'dtrsm: bit-exact across storage layouts', function t() {
	var combos = [
		[ 'left', 'upper', 'no-transpose', 'non-unit' ],
		[ 'left', 'lower', 'transpose', 'unit' ],
		[ 'right', 'upper', 'conjugate-transpose', 'non-unit' ],
		[ 'right', 'lower', 'no-transpose', 'unit' ]
	];
	var M = 6;
	var N = 5;
	var SEED = 0xBEEF;
	combos.forEach( function eachCombo( c ) {
		var side = c[ 0 ];
		var uplo = c[ 1 ];
		var transa = c[ 2 ];
		var diag = c[ 3 ];
		var na = ( side === 'left' ) ? M : N;
		var unit = ( diag === 'unit' );
		checked( 'dtrsm', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.layouts(), function build( layout ) {
				var rng = new RNG( SEED ); // identical values every variant
				var A = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
				var B0 = logical.general( sc, rng, M, N );
				var alpha = sc.random( rng );
				var Ar = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, layout );
				var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
				dtrsm( side, uplo, transa, diag, M, N, sc.apiScalar( alpha ), Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
				return check.flattenLogical( sc, readB( Br, M, N ) );
			}, { 'label': 'dtrsm '+side+' '+uplo+' '+transa+' '+diag+' layout invariance' } );
		});
	});
});
