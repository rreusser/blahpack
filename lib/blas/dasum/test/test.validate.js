/**
* Property-based validation for dasum, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 reduction over a pure
* vector; returns a real scalar. Property: dasum = Σ|x_i|, validated against the
* obvious-by-inspection oracle (a straight sum of absolute values) within a
* dimension-aware tolerance.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dasum from './../lib/ndarray.js';

const sc = S.real; // d-routine

// Independent oracle: the sum of absolute values, obvious by inspection.
function oracle( values ) {
	let s = 0.0;
	let k;
	for ( k = 0; k < values.length; k++ ) {
		s += Math.abs( values[ k ] );
	}
	return s;
}

// Step 2: property across the size sweep (incl. N=0,1) at stride 1.
test( 'dasum: sum of absolute values (size sweep)', function t() {
	SIZES.forEach( function eachN( n ) {
		const rng = new RNG( 0x100 + n ); // reproducible; log on failure
		const values = [];
		let i;
		for ( i = 0; i < n; i++ ) {
			values.push( sc.random( rng ) );
		}
		const X = schemes.realizeVector( sc, values, { 'stride': 1 } );
		const got = dasum( n, X.data, X.args[ 0 ], X.args[ 1 ] );
		const exp = oracle( values );
		checked( 'dasum', 'property', function run() {
			if ( !Number.isFinite( got ) ) {
				throw new Error( 'dasum n='+n+': non-finite result '+got );
			}
			check.assertScaled( Math.abs( got - exp ), Math.abs( exp ), check.tol( n, 20 ), 'dasum n='+n );
		});
	});
});

// Step 4: layout-invariance. NOTE: the reference DASUM (data/BLAS-3.12.0/dasum.f)
// uses a 6-way UNROLLED accumulation for INCX==1 but a one-at-a-time loop for
// INCX!=1, so stride-1 and general strides regroup the sum differently and are
// NOT mutually bit-exact (1-ULP class difference). It also returns 0 for
// INCX<=0 (no negative-stride support). So invariance is asserted only over
// layout sets that share ONE arithmetic path and a supported (positive) stride.
// See test/harness/LEARNINGS.md (asum-family entry).
function buildDasum( n, SEED, layout ) {
	const rng = new RNG( SEED ); // identical values every variant
	const values = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		values.push( sc.random( rng ) );
	}
	const X = schemes.realizeVector( sc, values, layout );
	return [ dasum( n, X.data, X.args[ 0 ], X.args[ 1 ] ) ];
}

test( 'dasum: bit-exact across offset/stride layouts sharing one arithmetic path', function t() {
	const n = 17;
	const SEED = 0xF00D;
	// General path: positive strides >= 2, fuzzing lead/tail and stride magnitude
	// (all walk ascending indices one-at-a-time => identical rounding).
	const general = [
		{ 'stride': 2, 'lead': 0, 'tail': 0 },
		{ 'stride': 2, 'lead': 3, 'tail': 2 },
		{ 'stride': 3, 'lead': 1, 'tail': 0 },
		{ 'stride': 4, 'lead': 2, 'tail': 3 }
	];
	// Unrolled path: stride 1, fuzzing offset/padding only.
	const unrolled = [
		{ 'stride': 1, 'lead': 0, 'tail': 0 },
		{ 'stride': 1, 'lead': 5, 'tail': 2 }
	];
	checked( 'dasum', 'layout-invariance', function run() {
		layoutInvariant( general, function build( layout ) {
			return buildDasum( n, SEED, layout );
		}, { 'label': 'dasum general-path layout invariance' } );
		layoutInvariant( unrolled, function build( layout ) {
			return buildDasum( n, SEED, layout );
		}, { 'label': 'dasum stride-1 offset invariance' } );
	});
});

// Faithful-contract pin: reference DASUM returns 0 for INCX <= 0.
test( 'dasum: returns 0 for non-positive stride (reference contract)', function t() {
	const rng = new RNG( 0xF00D );
	const n = 17;
	const values = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		values.push( sc.random( rng ) );
	}
	const X = schemes.realizeVector( sc, values, { 'stride': -1, 'lead': 4, 'tail': 1 } );
	const got = dasum( n, X.data, X.args[ 0 ], X.args[ 1 ] );
	if ( !Object.is( got, 0 ) ) {
		throw new Error( 'dasum negative stride: expected 0, got '+got );
	}
});
