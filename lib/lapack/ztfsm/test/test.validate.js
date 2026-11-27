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

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const TRANSRS = [ 'no-transpose', 'conjugate-transpose' ];
const SIDES = [ 'left', 'right' ];
const UPLOS = [ 'upper', 'lower' ];
const TRANS = [ 'no-transpose', 'conjugate-transpose' ];
const DIAGS = [ 'non-unit', 'unit' ];
const SIZES = [ 0 ].concat( SIZES_SMALL );

const DT = { 'order': 'col' }; // tight col-major for the TR->RFP conversion buffer

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
	const A = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, DT );
	const rfp = rfpAlloc( sc, na, rfpLayout );
	ztrttf( transr, uplo, na, A.data, A.args[ 0 ], A.args[ 1 ], A.args[ 2 ], rfp.data, rfp.stride, rfp.offset );
	return rfp;
}

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

// Backward-error residual for a triangular solve (normalized by ‖A‖·‖X‖ + ‖E‖).
function assertSolveResidual( A, X, opAX, E, label, factor ) {
	const R = new LogicalMatrix( sc, E.rows, E.cols );
	let i, j;
	for ( j = 0; j < E.cols; j++ ) {
		for ( i = 0; i < E.rows; i++ ) {
			R.set( i, j, sc.sub( opAX.get( i, j ), E.get( i, j ) ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' );
	const scale = ( norms.frobenius( sc, A ) * norms.frobenius( sc, X ) ) + norms.frobenius( sc, E );
	const n = Math.max( E.rows, E.cols, A.rows );
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
	const na = ( side === 'left' ) ? M : N; // order of triangular A
	const unit = ( diag === 'unit' );
	const rng = new RNG( 0x100 + ( M * 10 ) + N );
	const A0 = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
	const B0 = logical.general( sc, rng, M, N );
	const alpha = ( N % 2 === 0 ) ? sc.one : sc.random( rng ); // include alpha=1

	const rfp = toRFP( A0, transr, uplo, unit, na, { 'stride': 1, 'lead': 0, 'tail': 0 } );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, DT );

	ztfsm( transr, side, uplo, trans, diag, M, N, sc.apiScalar( alpha ), rfp.data, rfp.stride, rfp.offset, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	const X = readB( Br, M, N );
	const code = transCode( trans );
	const opAX = ( side === 'left' )
		? ref.matmul( sc, A0, X, { 'transa': code } )
		: ref.matmul( sc, X, A0, { 'transb': code } );
	const E = scaleLogical( B0, alpha, M, N );
	const label = 'ztfsm '+transr+' '+side+' '+uplo+' '+trans+' '+diag+' M='+M+' N='+N;
	checked( 'ztfsm', 'residual', function run() {
		assertSolveResidual( A0, X, opAX, E, label, 100 );
	});
}

// Step 4: layout-invariance fuzz. The RFP buffer is addressed with a single
// stride (pure-addressing scaling of the tight buffer) and B is an ordinary
// dense matrix; a correct ztfsm is BIT-EXACT across every RFP x B layout.
test( 'ztfsm: bit-exact across RFP x B layouts', function t() {
	const combos = [
		[ 'no-transpose', 'left', 'upper', 'no-transpose', 'non-unit' ],
		[ 'conjugate-transpose', 'left', 'lower', 'conjugate-transpose', 'unit' ],
		[ 'no-transpose', 'right', 'upper', 'conjugate-transpose', 'non-unit' ],
		[ 'conjugate-transpose', 'right', 'lower', 'no-transpose', 'unit' ]
	];
	const M = 6;
	const N = 5;
	const denseLayouts = schemes.dense.layouts();
	combos.forEach( function eachCombo( c ) {
		const transr = c[ 0 ];
		const side = c[ 1 ];
		const uplo = c[ 2 ];
		const trans = c[ 3 ];
		const diag = c[ 4 ];
		const na = ( side === 'left' ) ? M : N;
		const unit = ( diag === 'unit' );
		const variants = [];
		rfpLayouts().forEach( function eachR( rL ) {
			denseLayouts.forEach( function eachD( dL ) {
				variants.push( { 'r': rL, 'd': dL } );
			});
		});
		checked( 'ztfsm', 'layout-invariance', function run() {
			layoutInvariant( variants, function build( v ) {
				const rng = new RNG( 0xBEEF ); // identical values every variant
				const A0 = logical.triangular( sc, rng, na, { 'uplo': uplo, 'unit': unit } );
				const B0 = logical.general( sc, rng, M, N );
				const alpha = sc.random( rng );
				const rfp = toRFP( A0, transr, uplo, unit, na, v.r );
				const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, v.d );
				ztfsm( transr, side, uplo, trans, diag, M, N, sc.apiScalar( alpha ), rfp.data, rfp.stride, rfp.offset, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
				return check.flattenLogical( sc, readB( Br, M, N ) );
			}, { 'label': 'ztfsm '+transr+' '+side+' '+uplo+' '+trans+' '+diag+' RFP x B layout invariance' } );
		});
	});
});
