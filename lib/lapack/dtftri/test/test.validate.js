/**
* Property-based validation for dtftri, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `tf` -> triangular in Rectangular
* Full Packed (RFP) storage; `tri` (triangular inverse in RFP, a Level-3 BLAS
* algorithm delegating to dtrtri/dtrmm) -> RECONSTRUCTION: A0 * inv(A0) = I.
*
* RFP has no storage scheme of its own, so we bridge through the (independently
* validated) converters dtrttf (TR->RFP) and dtfttr (RFP->TR): build the FULL
* logical triangular oracle A0, convert TR->RFP, invert in RFP, convert the
* inverse RFP->TR, and check A0*inv(A0)=I with a backward-error residual. Swept
* over transr x uplo x diag x N, then fuzzed for bit-exact RFP layout invariance
* (L3). Unused RFP/dense slots are NaN-poisoned so any out-of-bounds read trips
* assertFinite.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { rfpAlloc, rfpLayouts } from '../../../../../test/harness/rfp.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dtftri from './../lib/ndarray.js';
import dtrttf from '../../dtrttf/lib/ndarray.js';
import dtfttr from '../../dtfttr/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const TRANSRS = [ 'no-transpose', 'transpose' ]; // RFP normal / transposed layout
const UPLOS = [ 'upper', 'lower' ];
const DIAGS = [ 'non-unit', 'unit' ];
const SIZES = SIZES_SMALL.concat( [ 48, 100 ] ); // reach past block boundaries

const DT = { 'order': 'col' }; // tight col-major for the TR conversion buffers

// Bridge: FULL triangular A0 --dtrttf--> RFP --dtftri--> RFP inverse --dtfttr-->
// FULL, returning the recovered inverse as a LogicalMatrix (opposite triangle
// exact zero; diagonal is stored in RFP so it is read back directly, including
// the unit-diagonal 1s that trttf copied and dtftri left untouched).
function invertRFP( A0, n, transr, uplo, unit, rfpLayout ) {
	const A = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': false }, DT );
	const rfp = rfpAlloc( sc, n, rfpLayout );
	dtrttf( transr, uplo, n, A.data, A.args[ 0 ], A.args[ 1 ], A.args[ 2 ], rfp.data, rfp.stride, rfp.offset );

	const info = dtftri( transr, uplo, diagStr( unit ), n, rfp.data, rfp.stride, rfp.offset );
	if ( info !== 0 ) {
		throw new Error( 'dtftri reported singular (info='+info+') for a well-conditioned triangular matrix' );
	}
	const Aout = schemes.dense.realize( sc, new LogicalMatrix( sc, n, n ), { 'part': uplo, 'unit': false }, DT );
	dtfttr( transr, uplo, n, rfp.data, rfp.stride, rfp.offset, Aout.data, Aout.args[ 0 ], Aout.args[ 1 ], Aout.args[ 2 ] );

	const F = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, sc.read( Aout.data, Aout.args[ 2 ] + ( i * Aout.args[ 0 ] ) + ( j * Aout.args[ 1 ] ) ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

function diagStr( unit ) {
	return unit ? 'unit' : 'non-unit';
}

// Backward-error residual for the inverse: ‖A0*inv(A0) - I‖ normalized by
// ‖A0‖·‖inv(A0)‖ + ‖I‖ (recovers the backward-stable ~n·eps quantity for an
// ill-conditioned unit-diagonal triangle; cf. dtrtri/dtrsm validation).
function assertInvResidual( A0, invA, n, label, factor ) {
	const P = ref.matmul( sc, A0, invA );
	const R = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' );
	const scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: reconstruction A0 * inv(A0) = I across transr x uplo x diag x N.
test( 'dtftri: inverse reconstruction A*inv(A)=I (transr x uplo x diag x sizes)', function t() {
	TRANSRS.forEach( function eachTransr( transr ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			DIAGS.forEach( function eachDiag( diag ) {
				const unit = ( diag === 'unit' );
				SIZES.forEach( function eachN( n ) {
					const rng = new RNG( 0x100 + n );
					const A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': unit } );
					const invA = invertRFP( A0, n, transr, uplo, unit, { 'stride': 1, 'lead': 0, 'tail': 0 } );
					const label = 'dtftri '+transr+' '+uplo+' '+diag+' n='+n;
					checked( 'dtftri', 'reconstruct', function run() {
						assertInvResidual( A0, invA, n, label, 100 );
					});
				});
			});
		});
	});
});

// Step 4: RFP layout-invariance fuzz. The RFP buffer is addressed with a single
// stride, so every layout is a pure-addressing scaling of the tight buffer —
// a correct dtftri is BIT-EXACT across ALL RFP layouts at once.
test( 'dtftri: bit-exact across RFP layouts', function t() {
	const n = 17;
	TRANSRS.forEach( function eachTransr( transr ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			DIAGS.forEach( function eachDiag( diag ) {
				const unit = ( diag === 'unit' );
				checked( 'dtftri', 'layout-invariance', function run() {
					layoutInvariant( rfpLayouts(), function build( layout ) {
						const rng = new RNG( 0xF00D ); // identical values every variant
						const A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': unit } );
						const invA = invertRFP( A0, n, transr, uplo, unit, layout );
						return check.flattenLogical( sc, invA );
					}, { 'label': 'dtftri '+transr+' '+uplo+' '+diag+' RFP layout invariance' } );
				});
			});
		});
	});
});
