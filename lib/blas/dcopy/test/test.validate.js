/**
* Property-based validation for dcopy, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 pure vector operation
* `y := x`. Because a copy performs no arithmetic, the result must equal the
* source BIT-FOR-BIT — validated by exact equality against `expected[i] = x_i`
* over a size sweep, then layout-fuzzed bit-exact across strided (incl. negative)
* vector layouts.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dcopy from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

function values( rng, n ) {
	const v = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		v.push( sc.random( rng ) );
	}
	return v;
}

// Read the destination y back out of physical storage as an N-length array.
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

// Flatten an array of scalar values into real components.
function flat( arr ) {
	return check.flattenLogical( sc, asColumn( arr ) );
}

// Step 2: PROPERTY — y := x over a size sweep incl. N=0,1. Copy is exact.
test( 'dcopy: y := x (size sweep, incl. N=0,1, bit-exact)', function t() {
	SIZES.forEach( function eachN( N ) {
		const rng = new RNG( 0x100 + N );
		const x = values( rng, N );
		const y0 = values( rng, N ); // destination, fully overwritten

		const X = schemes.realizeVector( sc, x, { 'stride': 1 } );
		const Y = schemes.realizeVector( sc, y0, { 'stride': 1 } );
		dcopy( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );

		const got = readVector( Y, N );
		checked( 'dcopy', 'property', function run() {
			check.assertFinite( sc, got, 'dcopy N='+N );
			check.assertExactEqual( flat( got ), flat( x ), 'dcopy N='+N );
		});
	});
});

// Step 3: LAYOUT INVARIANCE — output must be bit-exact across strided vector
// layouts (incl. negative strides), x and y at rotated layouts.
test( 'dcopy: bit-exact across vector layouts', function t() {
	const N = 17;
	const SEED = 0xF00D;
	const vLayouts = schemes.vectorLayouts();
	checked( 'dcopy', 'layout-invariance', function run() {
		layoutInvariant( vLayouts, function build( vL, idx ) {
			const rng = new RNG( SEED ); // identical values every variant
			const x = values( rng, N );
			const y0 = values( rng, N );

			const X = schemes.realizeVector( sc, x, vL );
			const Y = schemes.realizeVector( sc, y0, vLayouts[ ( idx + 2 ) % vLayouts.length ] );
			dcopy( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ] );
			return flat( readVector( Y, N ) );
		}, { 'label': 'dcopy layout invariance' } );
	});
});
