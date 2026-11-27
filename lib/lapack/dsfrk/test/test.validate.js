/**
* Property-based validation for dsfrk, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sf` -> symmetric C in Rectangular
* Full Packed (RFP) storage; `rk` -> rank-k update, RESIDUAL property
*   C = alpha*A*Aᵀ + beta*C   (trans = 'no-transpose', A is N x K)
*   C = alpha*Aᵀ*A + beta*C    (trans = 'transpose',    A is K x N)
* checked against an independent naive matmul oracle over ONLY the referenced
* (uplo) triangle of C.
*
* RFP is a storage format only, so we bridge the symmetric C through the
* already-validated converters dtrttf (TR->RFP) and dtfttr (RFP->TR); A is an
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
import dsfrk from './../lib/ndarray.js';
import dtrttf from '../../dtrttf/lib/ndarray.js';
import dtfttr from '../../dtfttr/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const TRANSRS = [ 'no-transpose', 'transpose' ];
const UPLOS = [ 'upper', 'lower' ];
const FLAGS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ]
];
const NS = [ 1, 2, 3, 5, 8, 16, 17, 33 ];
const KS = [ 0, 1, 2, 4, 7, 16 ];
const COMBOS = [ 'gg', 'g0', 'g1', '0g' ]; // alpha/beta: general/0/1

const DT = { 'order': 'col' }; // tight col-major for the TR<->RFP conversion buffers

function scalarSpec( spec, rng ) {
	if ( spec === '0' ) {
		return sc.zero;
	}
	if ( spec === '1' ) {
		return sc.one;
	}
	return sc.random( rng );
}

// symmetric C0 (dense TR, referenced uplo triangle) -> RFP buffer.
function toRFP( C0, transr, uplo, n, rfpLayout ) {
	const C = schemes.dense.realize( sc, C0, { 'part': uplo }, DT );
	const rfp = rfpAlloc( sc, n, rfpLayout );
	dtrttf( transr, uplo, n, C.data, C.args[ 0 ], C.args[ 1 ], C.args[ 2 ], rfp.data, rfp.stride, rfp.offset );
	return rfp;
}

// RFP buffer -> dense TR, then read the referenced (uplo) triangle into a
// LogicalMatrix (opposite triangle zeroed).
function readTriFromRFP( rfp, transr, uplo, n ) {
	const out = schemes.dense.realize( sc, new LogicalMatrix( sc, n, n ), { 'part': uplo }, DT );
	dtfttr( transr, uplo, n, rfp.data, rfp.stride, rfp.offset, out.data, out.args[ 0 ], out.args[ 1 ], out.args[ 2 ] );
	const C = new LogicalMatrix( sc, n, n );
	let i, j;
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

// expected C over ONLY the uplo triangle: alpha*P + beta*C0 (opposite zeroed).
function expectedTri( P, C0, alpha, beta, n, uplo ) {
	const E = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				E.set( i, j, sc.add( sc.mul( alpha, P.get( i, j ) ), sc.mul( beta, C0.get( i, j ) ) ) );
			} else {
				E.set( i, j, sc.zero );
			}
		}
	}
	return E;
}

// Steps 2-3-5: residual property over transr x uplo x trans x size x scalars.
test( 'dsfrk: C = alpha*op(A)*op(A)ᵀ + beta*C (transr x uplo x trans x sizes x scalars)', function t() {
	TRANSRS.forEach( function eachTransr( transr ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			FLAGS.forEach( function eachFlag( fl ) {
				const code = fl[ 1 ];
				const nota = ( code === 'n' );
				NS.forEach( function eachN( n ) {
					KS.forEach( function eachK( k ) {
						const rng = new RNG( 0x100 + ( n * 10 ) + k );

						// A is N x K for no-transpose, K x N otherwise.
						const A = nota ? logical.general( sc, rng, n, k ) : logical.general( sc, rng, k, n );
						const C0 = logical.symmetric( sc, rng, n );

						// Oracle: P = A*Aᵀ (no-transpose) or Aᵀ*A (transpose).
						const P = nota
							? ref.matmul( sc, A, A, { 'transb': 't' } )
							: ref.matmul( sc, A, A, { 'transa': 't' } );

						COMBOS.forEach( function eachCombo( combo ) {
							const alpha = scalarSpec( combo[ 0 ], rng );
							const beta = scalarSpec( combo[ 1 ], rng );

							const RA = schemes.dense.realize( sc, A, { 'part': 'full' }, DT );
							const rfp = toRFP( C0, transr, uplo, n, { 'stride': 1, 'lead': 0, 'tail': 0 } );

							dsfrk( transr, uplo, fl[ 0 ], n, k, sc.apiScalar( alpha ), RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], sc.apiScalar( beta ), rfp.data, rfp.stride, rfp.offset );

							const got = readTriFromRFP( rfp, transr, uplo, n );
							const expected = expectedTri( P, C0, alpha, beta, n, uplo );
							const label = 'dsfrk ' + transr + ' ' + uplo + ' ' + code + ' n=' + n + ' k=' + k + ' ' + combo;
							checked( 'dsfrk', 'reconstruct', function run() {
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
// dense matrix; a correct dsfrk is BIT-EXACT across every RFP x A layout.
test( 'dsfrk: bit-exact across RFP x A layouts', function t() {
	const n = 6;
	const k = 4;
	const denseLayouts = schemes.dense.layouts();
	TRANSRS.forEach( function eachTransr( transr ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			FLAGS.forEach( function eachFlag( fl ) {
				const code = fl[ 1 ];
				const nota = ( code === 'n' );
				const variants = [];
				rfpLayouts().forEach( function eachR( rL ) {
					denseLayouts.forEach( function eachD( dL ) {
						variants.push( { 'r': rL, 'd': dL } );
					});
				});
				checked( 'dsfrk', 'layout-invariance', function run() {
					layoutInvariant( variants, function build( v ) {
						const rng = new RNG( 0xF00D ); // identical operand values every variant
						const A = nota ? logical.general( sc, rng, n, k ) : logical.general( sc, rng, k, n );
						const C0 = logical.symmetric( sc, rng, n );
						const alpha = sc.random( rng );
						const beta = sc.random( rng );
						const RA = schemes.dense.realize( sc, A, { 'part': 'full' }, v.d );
						const rfp = toRFP( C0, transr, uplo, n, v.r );
						dsfrk( transr, uplo, fl[ 0 ], n, k, sc.apiScalar( alpha ), RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], sc.apiScalar( beta ), rfp.data, rfp.stride, rfp.offset );
						return check.flattenLogical( sc, readTriFromRFP( rfp, transr, uplo, n ) );
					}, { 'label': 'dsfrk ' + transr + ' ' + uplo + ' ' + code + ' RFP x A layout invariance' } );
				});
			});
		});
	});
});
