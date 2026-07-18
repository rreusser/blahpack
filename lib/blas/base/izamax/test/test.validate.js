/**
* Property-based validation for izamax, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; Level-1 reduction over a pure
* complex vector; returns an integer INDEX. Property: izamax returns the 0-based
* index of the first element maximizing the dcabs1 metric `|re| + |im|` (NOT the
* modulus), validated against an independent inline argmax oracle (exact integer
* equality).
*
* Contract note: the reference IZAMAX returns 0 (Fortran, 1-based) for
* `N < 1 OR INCX <= 0`. The 0-based JS port returns -1 for that "no index"
* case and does NOT offset-walk negative/zero strides. Mirrors the asum-family
* handling (see test/harness/LEARNINGS.md): the index is invariant across
* POSITIVE strides only, and the incx<=0 -> -1 contract is pinned separately.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, schemes, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import izamax from './../lib/ndarray.js';

const sc = S.complex; // z-routine

// Independent oracle: 0-based index of the first element maximizing |re|+|im|.
function argmaxCabs1( values ) {
	let best = -1;
	let bestv = -1.0;
	let v, k;
	for ( k = 0; k < values.length; k++ ) {
		v = Math.abs( values[ k ].re ) + Math.abs( values[ k ].im );
		if ( v > bestv ) {
			bestv = v;
			best = k;
		}
	}
	return best;
}

// Step 2: property across the size sweep (N >= 1) at stride 1, 2, 3. The
// LOGICAL index must be identical regardless of positive stride.
test( 'izamax: index of first max-(|re|+|im|) element (size + positive-stride sweep)', function t() {
	SIZES.forEach( function eachN( n ) {
		if ( n < 1 ) {
			return;
		}
		const rng = new RNG( 0x100 + n ); // reproducible; log on failure
		const values = [];
		let i;
		for ( i = 0; i < n; i++ ) {
			values.push( sc.random( rng ) );
		}
		const exp = argmaxCabs1( values );
		[ 1, 2, 3 ].forEach( function eachStride( stride ) {
			const X = schemes.realizeVector( sc, values, { 'stride': stride } );
			const got = izamax( n, X.data, X.args[ 0 ], X.args[ 1 ] );
			checked( 'izamax', 'property', function run() {
				if ( got !== exp ) {
					throw new Error( 'izamax n='+n+' stride='+stride+': got index '+got+', expected '+exp );
				}
			});
		});
	});
});

// Faithful-contract pin: N < 1 and INCX <= 0 both yield the "no index" sentinel
// (-1 in the 0-based port), and negative strides are NOT offset-walked.
test( 'izamax: N<1 or non-positive stride returns -1 (reference contract)', function t() {
	const rng = new RNG( 0xF00D );
	const n = 17;
	const values = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		values.push( sc.random( rng ) );
	}
	const X = schemes.realizeVector( sc, values, { 'stride': 1 } );

	// N < 1:
	if ( izamax( 0, X.data, 1, 0 ) !== -1 ) {
		throw new Error( 'izamax N=0: expected -1' );
	}
	// stride == 0:
	if ( izamax( n, X.data, 0, 0 ) !== -1 ) {
		throw new Error( 'izamax stride=0: expected -1' );
	}
	// stride < 0 (negative strides unsupported by the reference -> -1):
	const Xn = schemes.realizeVector( sc, values, { 'stride': -1, 'lead': 4, 'tail': 1 } );
	if ( izamax( n, Xn.data, Xn.args[ 0 ], Xn.args[ 1 ] ) !== -1 ) {
		throw new Error( 'izamax stride<0: expected -1' );
	}
});

// Step 4: layout-invariance across POSITIVE-stride layouts only (the reference
// does not offset-walk negative strides; there is no unrolled path, so all
// positive strides share one arithmetic path and must give the int-exact index).
function buildIzamax( n, SEED, layout ) {
	const rng = new RNG( SEED ); // identical values every variant
	const values = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		values.push( sc.random( rng ) );
	}
	const X = schemes.realizeVector( sc, values, layout );
	return [ izamax( n, X.data, X.args[ 0 ], X.args[ 1 ] ) ];
}

test( 'izamax: int-exact index across positive-stride offset/stride layouts', function t() {
	const n = 17;
	const SEED = 0xF00D;
	const positive = schemes.vectorLayouts().filter( function pos( L ) {
		return L.stride > 0;
	});
	checked( 'izamax', 'layout-invariance', function run() {
		layoutInvariant( positive, function build( layout ) {
			return buildIzamax( n, SEED, layout );
		}, { 'label': 'izamax positive-stride layout invariance' } );
	});
});
