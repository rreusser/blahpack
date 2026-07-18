/**
* Property-based validation for zaxpy, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 pure vector operation
* `y := alpha*x + y`. Validated component-wise against an independent oracle
* `expected[i] = alpha*x_i + y0_i`, then layout-fuzzed bit-exact across strided
* (incl. negative) vector layouts.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zaxpy from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

function values( rng, n ) {
	const v = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		v.push( sc.random( rng ) );
	}
	return v;
}

// Read the updated y back out of physical storage as an N-length array.
function readVector( Y, n ) {
	const out = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		out.push( Y.read( i ) );
	}
	return out;
}

// Wrap an array of scalar values as an N x 1 LogicalMatrix (for flattenLogical).
function asColumn( arr ) {
	const M = new LogicalMatrix( sc, arr.length, 1 );
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		M.set( i, 0, arr[ i ] );
	}
	return M;
}

// Step 2: PROPERTY — y := alpha*x + y over a size sweep incl. N=0,1 and alpha=0.
test( 'zaxpy: y := alpha*x + y (size sweep, incl. N=0,1, alpha=0)', function t() {
	SIZES.forEach( function eachN( N ) {
		const rng = new RNG( 0x100 + N );
		const x = values( rng, N );
		const y0 = values( rng, N );
		const alpha = ( N % 5 === 0 ) ? sc.zero : sc.random( rng );

		const X = schemes.realizeVector( sc, x, { 'stride': 1 } );
		const Y = schemes.realizeVector( sc, y0, { 'stride': 1 } );
		zaxpy( N, sc.apiScalar( alpha ), X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );

		const got = readVector( Y, N );
		const exp = [];
		let i;
		for ( i = 0; i < N; i++ ) {
			exp.push( sc.add( sc.mul( alpha, x[ i ] ), y0[ i ] ) );
		}
		checked( 'zaxpy', 'property', function run() {
			check.assertFinite( sc, got, 'zaxpy N='+N );
			let errSq = 0.0;
			let scaleSq = 0.0;
			let d, c, k, ii;
			for ( ii = 0; ii < N; ii++ ) {
				d = sc.components( sc.sub( got[ ii ], exp[ ii ] ) );
				c = sc.components( exp[ ii ] );
				for ( k = 0; k < d.length; k++ ) {
					errSq += d[ k ] * d[ k ];
					scaleSq += c[ k ] * c[ k ];
				}
			}
			check.assertScaled( Math.sqrt( errSq ), Math.sqrt( scaleSq ), check.tol( N, 20 ), 'zaxpy N='+N );
		});
	});
});

// Step 3: LAYOUT INVARIANCE — output must be bit-exact across strided vector
// layouts (incl. negative strides), x and y at rotated layouts.
test( 'zaxpy: bit-exact across vector layouts', function t() {
	const N = 17;
	const SEED = 0xF00D;
	const vLayouts = schemes.vectorLayouts();
	checked( 'zaxpy', 'layout-invariance', function run() {
		layoutInvariant( vLayouts, function build( vL, idx ) {
			const rng = new RNG( SEED ); // identical values every variant
			const x = values( rng, N );
			const y0 = values( rng, N );
			const alpha = sc.random( rng );

			const X = schemes.realizeVector( sc, x, vL );
			const Y = schemes.realizeVector( sc, y0, vLayouts[ ( idx + 2 ) % vLayouts.length ] );
			zaxpy( N, sc.apiScalar( alpha ), X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );
			return check.flattenLogical( sc, asColumn( readVector( Y, N ) ) );
		}, { 'label': 'zaxpy layout invariance' } );
	});
});
