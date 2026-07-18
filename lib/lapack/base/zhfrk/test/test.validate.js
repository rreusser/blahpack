/**
* Property-based validation for zhfrk, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `hf` -> Hermitian C in Rectangular
* Full Packed (RFP) storage; `rk` -> Hermitian rank-k update, RESIDUAL property
*   C = alpha*A*Aᴴ + beta*C   (trans = 'no-transpose',        A is N x K)
*   C = alpha*Aᴴ*A + beta*C    (trans = 'conjugate-transpose', A is K x N)
* with alpha, beta REAL scalars. Checked against an independent naive matmul
* oracle over ONLY the referenced (uplo) triangle of C.
*
* RFP is a storage format only, so we bridge the Hermitian C through the
* already-validated converters ztrttf (TR->RFP) and ztfttr (RFP->TR); A is an
* ordinary dense matrix. Swept over transr x uplo x trans x (N,K) x scalars, then
* fuzzed for bit-exact layout invariance (L3). Only the referenced (uplo)
* triangle of C is realized; the RFP buffer and unused dense slots are
* NaN-poisoned so a wrong read trips assertFinite.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { rfpAlloc, rfpLayouts } from '../../../../../test/harness/rfp.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhfrk from './../lib/ndarray.js';
import ztrttf from '../../ztrttf/lib/ndarray.js';
import ztfttr from '../../ztfttr/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var TRANSRS = [ 'no-transpose', 'conjugate-transpose' ];
var UPLOS = [ 'upper', 'lower' ];
var FLAGS = [
	[ 'no-transpose', 'n' ],
	[ 'conjugate-transpose', 'c' ]
];
var NS = [ 1, 2, 3, 5, 8, 16, 17, 33 ];
var KS = [ 0, 1, 2, 4, 7, 16 ];
var COMBOS = [ 'gg', 'g0', 'g1', '0g' ]; // real alpha/beta: general/0/1

var DT = { 'order': 'col' }; // tight col-major for the TR<->RFP conversion buffers

// alpha/beta are REAL scalars (plain numbers) for the Hermitian rank-k update.
function realSpec( spec, rng ) {
	if ( spec === '0' ) {
		return 0.0;
	}
	if ( spec === '1' ) {
		return 1.0;
	}
	return rng.normal();
}

// Hermitian C0 (dense TR, referenced uplo triangle) -> RFP buffer.
function toRFP( C0, transr, uplo, n, rfpLayout ) {
	var C = schemes.dense.realize( sc, C0, { 'part': uplo }, DT );
	var rfp = rfpAlloc( sc, n, rfpLayout );
	ztrttf( transr, uplo, n, C.data, C.args[ 0 ], C.args[ 1 ], C.args[ 2 ], rfp.data, rfp.stride, rfp.offset );
	return rfp;
}

// RFP buffer -> dense TR, then read the referenced (uplo) triangle into a
// LogicalMatrix (opposite triangle zeroed).
function readTriFromRFP( rfp, transr, uplo, n ) {
	var out = schemes.dense.realize( sc, new LogicalMatrix( sc, n, n ), { 'part': uplo }, DT );
	ztfttr( transr, uplo, n, rfp.data, rfp.stride, rfp.offset, out.data, out.args[ 0 ], out.args[ 1 ], out.args[ 2 ] );
	var C = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				C.set( i, j, sc.read( out.data, out.args[ 2 ] + ( i * out.args[ 0 ] ) + ( j * out.args[ 1 ] ) ) );
			} else {
				C.set( i, j, sc.zero );
			}
		}
	}
	return C;
}

// expected C over ONLY the uplo triangle: alpha*P + beta*C0 (opposite zeroed),
// alpha/beta REAL.
function expectedTri( P, C0, alpha, beta, n, uplo ) {
	var E = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				E.set( i, j, sc.add( sc.scale( P.get( i, j ), alpha ), sc.scale( C0.get( i, j ), beta ) ) );
			} else {
				E.set( i, j, sc.zero );
			}
		}
	}
	return E;
}

// Steps 2-3-5: residual property over transr x uplo x trans x size x scalars.
test( 'zhfrk: C = alpha*op(A)*op(A)ᴴ + beta*C (transr x uplo x trans x sizes x scalars)', function t() {
	TRANSRS.forEach( function eachTransr( transr ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			FLAGS.forEach( function eachFlag( fl ) {
				var code = fl[ 1 ];
				var nota = ( code === 'n' );
				NS.forEach( function eachN( n ) {
					KS.forEach( function eachK( k ) {
						var rng = new RNG( 0x100 + ( n * 10 ) + k );

						// A is N x K for no-transpose, K x N otherwise.
						var A = nota ? logical.general( sc, rng, n, k ) : logical.general( sc, rng, k, n );
						var C0 = logical.hermitian( sc, rng, n );

						// Oracle: P = A*Aᴴ (no-transpose) or Aᴴ*A (conjugate-transpose).
						var P = nota
							? ref.matmul( sc, A, A, { 'transb': 'c' } )
							: ref.matmul( sc, A, A, { 'transa': 'c' } );

						COMBOS.forEach( function eachCombo( combo ) {
							var alpha = realSpec( combo[ 0 ], rng );
							var beta = realSpec( combo[ 1 ], rng );

							var RA = schemes.dense.realize( sc, A, { 'part': 'full' }, DT );
							var rfp = toRFP( C0, transr, uplo, n, { 'stride': 1, 'lead': 0, 'tail': 0 } );

							zhfrk( transr, uplo, fl[ 0 ], n, k, alpha, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], beta, rfp.data, rfp.stride, rfp.offset );

							var got = readTriFromRFP( rfp, transr, uplo, n );
							var expected = expectedTri( P, C0, alpha, beta, n, uplo );
							var label = 'zhfrk ' + transr + ' ' + uplo + ' ' + code + ' n=' + n + ' k=' + k + ' ' + combo;
							checked( 'zhfrk', 'reconstruct', function run() {
								check.assertReconstruct( sc, got, expected, { 'label': label } );
							});
						});
					});
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz. The RFP C buffer is addressed with a single
// stride (pure-addressing scaling of the tight buffer) and A is an ordinary
// dense matrix; a correct zhfrk is BIT-EXACT across every RFP x A layout.
test( 'zhfrk: bit-exact across RFP x A layouts', function t() {
	var n = 6;
	var k = 4;
	var denseLayouts = schemes.dense.layouts();
	TRANSRS.forEach( function eachTransr( transr ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			FLAGS.forEach( function eachFlag( fl ) {
				var code = fl[ 1 ];
				var nota = ( code === 'n' );
				var variants = [];
				rfpLayouts().forEach( function eachR( rL ) {
					denseLayouts.forEach( function eachD( dL ) {
						variants.push( { 'r': rL, 'd': dL } );
					});
				});
				checked( 'zhfrk', 'layout-invariance', function run() {
					layoutInvariant( variants, function build( v ) {
						var rng = new RNG( 0xF00D ); // identical operand values every variant
						var A = nota ? logical.general( sc, rng, n, k ) : logical.general( sc, rng, k, n );
						var C0 = logical.hermitian( sc, rng, n );
						var alpha = rng.normal();
						var beta = rng.normal();
						var RA = schemes.dense.realize( sc, A, { 'part': 'full' }, v.d );
						var rfp = toRFP( C0, transr, uplo, n, v.r );
						zhfrk( transr, uplo, fl[ 0 ], n, k, alpha, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], beta, rfp.data, rfp.stride, rfp.offset );
						return check.flattenLogical( sc, readTriFromRFP( rfp, transr, uplo, n ) );
					}, { 'label': 'zhfrk ' + transr + ' ' + uplo + ' ' + code + ' RFP x A layout invariance' } );
				});
			});
		});
	});
});
