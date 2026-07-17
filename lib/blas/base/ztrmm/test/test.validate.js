/**
* Property-based validation for ztrmm, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tr` -> triangular dense
* (schemes.dense, logical.triangular); `mm` (triangular matrix-matrix multiply,
* in place) -> RESIDUAL/reconstruction: B := alpha*op(A)*B (left) or
* B := alpha*B*op(A) (right), op in {A, A^T, A^H}. The FULL logical triangular
* matrix (opposite triangle zero, unit diagonal = 1) is the independent oracle,
* densified by ref.matmul.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import ztrmm from './../lib/ndarray.js';

var sc = S.complex; // z-routine
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

// Read the M x N result B back out of physical storage into a LogicalMatrix.
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

// expected = alpha * P as a LogicalMatrix.
function scaleLogical( P, alpha, m, n ) {
	var E = new LogicalMatrix( sc, m, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			E.set( i, j, sc.mul( alpha, P.get( i, j ) ) );
		}
	}
	return E;
}

// Pick alpha covering 0, 1, and random (complex).
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
test( 'ztrmm: multiply reconstruction (side x uplo x transa x diag x sizes)', function t() {
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
	var na = ( side === 'left' ) ? M : N; // order of triangular A
	var unit = ( diag === 'unit' );
	var rng = new RNG( 0x100 + ( M * 10 ) + N ); // reproducible; log on failure
	var A = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
	var B0 = logical.general( sc, rng, M, N );
	var alpha = pickAlpha( rng, M, N );

	var layout = schemes.dense.layouts()[ 0 ];
	var Ar = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, layout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );

	ztrmm( side, uplo, transa, diag, M, N, sc.apiScalar( alpha ), Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	var gotB = readB( Br, M, N );
	var code = transCode( transa );
	var P = ( side === 'left' )
		? ref.matmul( sc, A, B0, { 'transa': code } )
		: ref.matmul( sc, B0, A, { 'transb': code } );
	var E = scaleLogical( P, alpha, M, N );
	var label = 'ztrmm '+side+' '+uplo+' '+transa+' '+diag+' M='+M+' N='+N;
	checked( 'ztrmm', 'residual', function run() {
		check.assertReconstruct( sc, gotB, E, { 'label': label, 'factor': 100 } );
	});
}

// Step 4: layout-invariance fuzz — result must be bit-exact across storage layouts.
test( 'ztrmm: bit-exact across storage layouts', function t() {
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
		checked( 'ztrmm', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.layouts(), function build( layout ) {
				var rng = new RNG( SEED ); // identical values every variant
				var A = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
				var B0 = logical.general( sc, rng, M, N );
				var alpha = sc.random( rng );
				var Ar = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, layout );
				var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
				ztrmm( side, uplo, transa, diag, M, N, sc.apiScalar( alpha ), Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
				return check.flattenLogical( sc, readB( Br, M, N ) );
			}, { 'label': 'ztrmm '+side+' '+uplo+' '+transa+' '+diag+' layout invariance' } );
		});
	});
});
