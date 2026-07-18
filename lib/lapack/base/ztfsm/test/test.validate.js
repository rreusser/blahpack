/**
* Property-based validation for ztfsm, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tf` -> triangular A in
* Rectangular Full Packed (RFP) storage; `sm` (triangular solve, multiple RHS) ->
* RESIDUAL: ztfsm solves op(A)*X = alpha*B (side left) or X*op(A) = alpha*B (side
* right). After solving, plug X back in and check op(A0)*X (left) / X*op(A0)
* (right) reproduces alpha*B0 against the FULL logical triangular oracle A0.
*
* RFP is a storage format only, so we bridge the triangular A through the
* already-validated converter ztrttf (TR->RFP); B is an ordinary dense matrix.
* For complex RFP the transposed variants are the conjugate transpose ('C').
* Swept over transr x side x uplo x trans x diag x (M,N), then fuzzed for
* bit-exact layout invariance (L3). Only the referenced (uplo) triangle of A is
* realized; the RFP buffer and unused dense slots are NaN-poisoned so a wrong
* read trips assertFinite.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { rfpAlloc, rfpLayouts } from '../../../../../test/harness/rfp.js';
import { checked } from '../../../../../test/harness/ledger.js';
import ztfsm from './../lib/ndarray.js';
import ztrttf from '../../ztrttf/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var TRANSRS = [ 'no-transpose', 'conjugate-transpose' ];
var SIDES = [ 'left', 'right' ];
var UPLOS = [ 'upper', 'lower' ];
var TRANS = [ 'no-transpose', 'conjugate-transpose' ];
var DIAGS = [ 'non-unit', 'unit' ];
var SIZES = [ 0 ].concat( SIZES_SMALL );

var DT = { 'order': 'col' }; // tight col-major for the TR->RFP conversion buffer

function transCode( trans ) {
	if ( trans === 'transpose' ) {
		return 't';
	}
	if ( trans === 'conjugate-transpose' ) {
		return 'c';
	}
	return 'n';
}

// TR (dense) -> RFP buffer for the triangular operand A of order na.
function toRFP( A0, transr, uplo, unit, na, rfpLayout ) {
	var A = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, DT );
	var rfp = rfpAlloc( sc, na, rfpLayout );
	ztrttf( transr, uplo, na, A.data, A.args[ 0 ], A.args[ 1 ], A.args[ 2 ], rfp.data, rfp.stride, rfp.offset );
	return rfp;
}

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

// Backward-error residual for a triangular solve (normalized by ‖A‖·‖X‖ + ‖E‖).
function assertSolveResidual( A, X, opAX, E, label, factor ) {
	var R = new LogicalMatrix( sc, E.rows, E.cols );
	var i;
	var j;
	for ( j = 0; j < E.cols; j++ ) {
		for ( i = 0; i < E.rows; i++ ) {
			R.set( i, j, sc.sub( opAX.get( i, j ), E.get( i, j ) ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' );
	var scale = ( norms.frobenius( sc, A ) * norms.frobenius( sc, X ) ) + norms.frobenius( sc, E );
	var n = Math.max( E.rows, E.cols, A.rows );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: residual property across all flags and a size sweep.
test( 'ztfsm: solve residual (transr x side x uplo x trans x diag x sizes)', function t() {
	TRANSRS.forEach( function eachTransr( transr ) {
		SIDES.forEach( function eachSide( side ) {
			UPLOS.forEach( function eachUplo( uplo ) {
				TRANS.forEach( function eachTrans( trans ) {
					DIAGS.forEach( function eachDiag( diag ) {
						SIZES.forEach( function eachM( M ) {
							SIZES.forEach( function eachN( N ) {
								runResidual( transr, side, uplo, trans, diag, M, N );
							});
						});
					});
				});
			});
		});
	});
});

function runResidual( transr, side, uplo, trans, diag, M, N ) {
	var na = ( side === 'left' ) ? M : N; // order of triangular A
	var unit = ( diag === 'unit' );
	var rng = new RNG( 0x100 + ( M * 10 ) + N );
	var A0 = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
	var B0 = logical.general( sc, rng, M, N );
	var alpha = ( N % 2 === 0 ) ? sc.one : sc.random( rng ); // include alpha=1

	var rfp = toRFP( A0, transr, uplo, unit, na, { 'stride': 1, 'lead': 0, 'tail': 0 } );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, DT );

	ztfsm( transr, side, uplo, trans, diag, M, N, sc.apiScalar( alpha ), rfp.data, rfp.stride, rfp.offset, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	var X = readB( Br, M, N );
	var code = transCode( trans );
	var opAX = ( side === 'left' )
		? ref.matmul( sc, A0, X, { 'transa': code } )
		: ref.matmul( sc, X, A0, { 'transb': code } );
	var E = scaleLogical( B0, alpha, M, N );
	var label = 'ztfsm '+transr+' '+side+' '+uplo+' '+trans+' '+diag+' M='+M+' N='+N;
	checked( 'ztfsm', 'residual', function run() {
		assertSolveResidual( A0, X, opAX, E, label, 100 );
	});
}

// Step 4: layout-invariance fuzz. The RFP buffer is addressed with a single
// stride (pure-addressing scaling of the tight buffer) and B is an ordinary
// dense matrix; a correct ztfsm is BIT-EXACT across every RFP x B layout.
test( 'ztfsm: bit-exact across RFP x B layouts', function t() {
	var combos = [
		[ 'no-transpose', 'left', 'upper', 'no-transpose', 'non-unit' ],
		[ 'conjugate-transpose', 'left', 'lower', 'conjugate-transpose', 'unit' ],
		[ 'no-transpose', 'right', 'upper', 'conjugate-transpose', 'non-unit' ],
		[ 'conjugate-transpose', 'right', 'lower', 'no-transpose', 'unit' ]
	];
	var M = 6;
	var N = 5;
	var denseLayouts = schemes.dense.layouts();
	combos.forEach( function eachCombo( c ) {
		var transr = c[ 0 ];
		var side = c[ 1 ];
		var uplo = c[ 2 ];
		var trans = c[ 3 ];
		var diag = c[ 4 ];
		var na = ( side === 'left' ) ? M : N;
		var unit = ( diag === 'unit' );
		var variants = [];
		rfpLayouts().forEach( function eachR( rL ) {
			denseLayouts.forEach( function eachD( dL ) {
				variants.push( { 'r': rL, 'd': dL } );
			});
		});
		checked( 'ztfsm', 'layout-invariance', function run() {
			layoutInvariant( variants, function build( v ) {
				var rng = new RNG( 0xBEEF ); // identical values every variant
				var A0 = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
				var B0 = logical.general( sc, rng, M, N );
				var alpha = sc.random( rng );
				var rfp = toRFP( A0, transr, uplo, unit, na, v.r );
				var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, v.d );
				ztfsm( transr, side, uplo, trans, diag, M, N, sc.apiScalar( alpha ), rfp.data, rfp.stride, rfp.offset, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
				return check.flattenLogical( sc, readB( Br, M, N ) );
			}, { 'label': 'ztfsm '+transr+' '+side+' '+uplo+' '+trans+' '+diag+' RFP x B layout invariance' } );
		});
	});
});
