/**
* Property-based validation for dzasum, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; Level-1 reduction over a pure
* complex vector; returns a real scalar. Property: dzasum = Σ(|Re(x_i)|+|Im(x_i)|)
* — note this is the L1-style component sum, NOT the sum of moduli — validated
* against the obvious-by-inspection oracle within a dimension-aware tolerance.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dzasum from './../lib/ndarray.js';

var sc = S.complex; // z-routine

// Independent oracle: Σ(|re|+|im|). dzasum sums the absolute values of the real
// and imaginary parts separately (NOT the complex modulus).
function oracle( values ) {
	var s = 0.0;
	var k;
	for ( k = 0; k < values.length; k++ ) {
		s += Math.abs( values[ k ].re ) + Math.abs( values[ k ].im );
	}
	return s;
}

// Step 2: property across the size sweep (incl. N=0,1) at stride 1.
test( 'dzasum: sum of |Re|+|Im| (size sweep)', function t() {
	SIZES.forEach( function eachN( n ) {
		var rng = new RNG( 0x100 + n ); // reproducible; log on failure
		var values = [];
		var i;
		for ( i = 0; i < n; i++ ) {
			values.push( sc.random( rng ) );
		}
		var X = schemes.realizeVector( sc, values, { 'stride': 1 } );
		var got = dzasum( n, X.data, X.args[ 0 ], X.args[ 1 ] );
		var exp = oracle( values );
		checked( 'dzasum', 'property', function run() {
			if ( !Number.isFinite( got ) ) {
				throw new Error( 'dzasum n='+n+': non-finite result '+got );
			}
			check.assertScaled( Math.abs( got - exp ), Math.abs( exp ), check.tol( n, 20 ), 'dzasum n='+n );
		});
	});
});

// Step 4: layout-invariance. NOTE: the reference DZASUM
// (data/BLAS-3.12.0/dzasum.f) accumulates one element at a time for ALL positive
// strides (no stride-1 unrolling), so every positive-stride layout is mutually
// bit-exact. But it returns 0 for INCX<=0 (no negative-stride support), so
// negative-stride layouts are excluded from the invariance set and pinned
// separately. See test/harness/LEARNINGS.md (asum-family entry).
test( 'dzasum: bit-exact across positive-stride offset/stride layouts', function t() {
	var n = 17;
	var SEED = 0xF00D;
	var positive = [
		{ 'stride': 1, 'lead': 0, 'tail': 0 },
		{ 'stride': 1, 'lead': 3, 'tail': 2 },
		{ 'stride': 2, 'lead': 1, 'tail': 0 },
		{ 'stride': 3, 'lead': 0, 'tail': 3 }
	];
	checked( 'dzasum', 'layout-invariance', function run() {
		layoutInvariant( positive, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var values = [];
			var i;
			for ( i = 0; i < n; i++ ) {
				values.push( sc.random( rng ) );
			}
			var X = schemes.realizeVector( sc, values, layout );
			var got = dzasum( n, X.data, X.args[ 0 ], X.args[ 1 ] );
			return [ got ];
		}, { 'label': 'dzasum positive-stride layout invariance' } );
	});
});

// Faithful-contract pin: reference DZASUM returns 0 for INCX <= 0.
test( 'dzasum: returns 0 for non-positive stride (reference contract)', function t() {
	var rng = new RNG( 0xF00D );
	var n = 17;
	var values = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		values.push( sc.random( rng ) );
	}
	var X = schemes.realizeVector( sc, values, { 'stride': -1, 'lead': 4, 'tail': 1 } );
	var got = dzasum( n, X.data, X.args[ 0 ], X.args[ 1 ] );
	if ( !Object.is( got, 0 ) ) {
		throw new Error( 'dzasum negative stride: expected 0, got '+got );
	}
});
