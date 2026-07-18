/**
* Property-based validation for dpbequ, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pb` -> symmetric positive definite
* BANDED (schemes.banded, logical.positiveDefiniteBanded). dpbequ computes
* DETERMINISTIC symmetric diagonal equilibration from the DIAGONAL only, so this
* is a `reconstruct`-grade DIRECT-oracle match:
*
*   S(i)  = 1 / sqrt( A(i,i) )
*   scond = sqrt(min_i A(i,i)) / sqrt(max_i A(i,i))
*   amax  = max_i A(i,i)
*
* We recompute all outputs directly from the diagonal of the full logical A0 and
* assert per-element agreement, plus the defining EQUILIBRATION property: the
* diagonal of diag(S)*A*diag(S), i.e. S(i)^2 * A(i,i), is exactly 1. The routine
* reads ONLY the diagonal row of band storage, so off-diagonal band slots stay
* NaN-poisoned; correct diagonal-row addressing is the whole point and is swept
* over both uplo triangles and kd in {0,1,2}.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpbequ from './../lib/ndarray.js';

const sc = S.real; // d-routine

const UPLOS = [ 'upper', 'lower' ];
const KDS = [ 0, 1, 2 ];


// HELPERS //

// Diagonal value in the routine's convention: A(i,i) itself for real.
function diagVal( v ) {
	return v;
}

// Direct oracle for the scale factors + summary scalars over a logical A0.
function oracle( A0, N ) {
	const Sexp = new Array( N );
	const diag = new Array( N );
	let d, i;

	for ( i = 0; i < N; i++ ) {
		d = diagVal( A0.get( i, i ) );
		diag[ i ] = d;
		Sexp[ i ] = 1.0 / Math.sqrt( d );
	}
	const smin = Math.min.apply( null, diag );
	const amax = Math.max.apply( null, diag );
	return {
		'Sexp': Sexp,
		'diag': diag,
		'amax': amax,
		'scond': Math.sqrt( smin ) / Math.sqrt( amax )
	};
}


// STEP 2-3-5: DIRECT-oracle PROPERTY over a sweep of N x kd x uplo. //

test( 'dpbequ: scale factors == direct oracle + unit-diagonal equilibration (N, band)', function t() {
	SIZES_SMALL.forEach( function eachN( N ) {
		KDS.forEach( function eachKd( kd ) {
			UPLOS.forEach( function eachUplo( uplo ) {
				runProperty( N, kd, uplo );
			});
		});
	});
});

function runProperty( N, kd, uplo ) {
	const rng = new RNG( 0x100 + ( N * 13 ) + ( kd * 3 ) + ( uplo === 'upper' ? 1 : 2 ) );
	const A0 = logical.positiveDefiniteBanded( sc, rng, N, kd );
	const exp = oracle( A0, N );
	const TIGHT = schemes.banded.layouts()[ 0 ];
	const Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT );

	const s = sc.alloc( N ); // poisoned (NaN) -> unwritten slot trips assertScaled
	const res = dpbequ( uplo, N, kd, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], s, 1, 0 );

	const t = check.tol( N, 50 );
	const label = 'dpbequ N=' + N + ' kd=' + kd + ' uplo=' + uplo;

	checked( 'dpbequ', 'property', function run() {
		let i;
		if ( res.info !== 0 ) {
			throw new Error( label + ': info=' + res.info + ' (expected 0)' );
		}
		// Per-element scale factors vs oracle:
		for ( i = 0; i < N; i++ ) {
			check.assertScaled( Math.abs( s[ i ] - exp.Sexp[ i ] ), Math.abs( exp.Sexp[ i ] ), t, label + ' S[' + i + ']' );
		}
		// Summary scalars vs oracle:
		check.assertScaled( Math.abs( res.amax - exp.amax ), Math.abs( exp.amax ), t, label + ' amax' );
		check.assertScaled( Math.abs( res.scond - exp.scond ), Math.abs( exp.scond ), t, label + ' scond' );

		// Equilibration: diag of diag(S)*A*diag(S) is unit -> S(i)^2 * A(i,i) = 1:
		for ( i = 0; i < N; i++ ) {
			check.assertScaled( Math.abs( ( s[ i ] * s[ i ] * exp.diag[ i ] ) - 1.0 ), 1.0, t, label + ' equilibration[' + i + ']' );
		}
	} );
}


// STEP 4: LAYOUT INVARIANCE (bit-exact across all band-array layouts). //

// dpbequ only reads the diagonal band row by value, min/max-scans it, and
// computes 1/sqrt; none of this depends on iteration order or the band array's
// physical storage, so the outputs are bit-exact across ALL 7 layouts (col &
// row, incl. negative strides) -- a single invariance family. Exercised for
// both uplo triangles (their diagonal-row maps differ: kd vs 0).
test( 'dpbequ: bit-exact across all storage layouts', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		const N = 9;
		const kd = 2;
		const rng = new RNG( 0x900 + N + ( uplo === 'upper' ? 1 : 2 ) );
		const A0 = logical.positiveDefiniteBanded( sc, rng, N, kd );

		checked( 'dpbequ', 'layout-invariance', function run() {
			layoutInvariant( schemes.banded.layouts(), function build( layout ) {
				const Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, layout );
				const s = sc.alloc( N );
				const res = dpbequ( uplo, N, kd, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], s, 1, 0 );
				const out = [];
				let i;
				for ( i = 0; i < N; i++ ) {
					out.push( s[ i ] );
				}
				out.push( res.scond, res.amax );
				return out;
			}, { 'label': 'dpbequ layout invariance uplo=' + uplo } );
		} );
	});
});
