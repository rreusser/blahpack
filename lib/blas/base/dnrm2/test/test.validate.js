/**
* Property-based validation for dnrm2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 reduction over a pure
* vector; returns a real scalar. Property: dnrm2 = ‖x‖₂ = sqrt(Σ|x_i|²),
* validated against the obvious-by-inspection oracle `Math.hypot(...components)`
* (which is a scaled/robust computation independent of dnrm2's own "blue"
* scaled algorithm), compared within a dimension-aware tolerance.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dnrm2 from './../lib/ndarray.js';

const sc = S.real; // d-routine

// Independent oracle: the Euclidean norm as sqrt(Σ of squared real components),
// obvious by inspection. Math.hypot is itself overflow/underflow-robust, so it
// is a fair, independent check on dnrm2's scaled algorithm.
function oracle( values ) {
	const comps = [];
	let k;
	for ( k = 0; k < values.length; k++ ) {
		sc.components( values[ k ] ).forEach( function push( c ) {
			comps.push( c );
		});
	}
	return Math.hypot.apply( null, comps );
}

// Step 2: property across the size sweep (incl. N=0,1) at stride 1.
test( 'dnrm2: Euclidean norm matches sqrt(sum of squares) (size sweep)', function t() {
	SIZES.forEach( function eachN( n ) {
		const rng = new RNG( 0x100 + n ); // reproducible; log on failure
		const values = [];
		let i;
		for ( i = 0; i < n; i++ ) {
			values.push( sc.random( rng ) );
		}
		const X = schemes.realizeVector( sc, values, { 'stride': 1 } );
		const got = dnrm2( n, X.data, X.args[ 0 ], X.args[ 1 ] );
		const exp = oracle( values );
		checked( 'dnrm2', 'property', function run() {
			if ( !Number.isFinite( got ) ) {
				throw new Error( 'dnrm2 n='+n+': non-finite result '+got );
			}
			check.assertScaled( Math.abs( got - exp ), Math.abs( exp ), check.tol( n, 20 ), 'dnrm2 norm n='+n );
		});
	});
});

// Step 2b: scaling robustness — exercise the overflow/underflow-safe scaled
// algorithm with very large and very small magnitudes (still within tolerance).
test( 'dnrm2: scaling robustness (extreme magnitudes)', function t() {
	[ 1e150, 1e-150, 1e200, 1e-200 ].forEach( function eachScale( s ) {
		const rng = new RNG( 0x900 );
		const n = 17;
		const values = [];
		let i;
		for ( i = 0; i < n; i++ ) {
			values.push( sc.random( rng ) * s );
		}
		const X = schemes.realizeVector( sc, values, { 'stride': 1 } );
		const got = dnrm2( n, X.data, X.args[ 0 ], X.args[ 1 ] );
		const exp = oracle( values );
		checked( 'dnrm2', 'property', function run() {
			if ( !Number.isFinite( got ) ) {
				throw new Error( 'dnrm2 scale='+s+': non-finite result '+got );
			}
			check.assertScaled( Math.abs( got - exp ), Math.abs( exp ), check.tol( n, 20 ), 'dnrm2 scale='+s );
		});
	});
});

// Step 4: layout-invariance — the reduction runs in ascending index order
// independent of stride sign/magnitude, so the scalar must be bit-exact across
// every vector layout (incl. negative strides and offsets).
test( 'dnrm2: bit-exact across vector storage layouts', function t() {
	const n = 17;
	const SEED = 0xF00D;
	checked( 'dnrm2', 'layout-invariance', function run() {
		layoutInvariant( schemes.vectorLayouts(), function build( layout ) {
			const rng = new RNG( SEED ); // identical values every variant
			const values = [];
			let i;
			for ( i = 0; i < n; i++ ) {
				values.push( sc.random( rng ) );
			}
			const X = schemes.realizeVector( sc, values, layout );
			const got = dnrm2( n, X.data, X.args[ 0 ], X.args[ 1 ] );
			return [ got ];
		}, { 'label': 'dnrm2 layout invariance' } );
	});
});
