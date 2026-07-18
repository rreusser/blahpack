/**
* Property-based validation for drotm, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 pure vector operation
* applying a MODIFIED Givens transformation H (selected by `param[0]` = DFLAG) to
* a pair of vectors, in place on BOTH:
*   x_i := H11*x_i + H12*y_i
*   y_i := H21*x_i + H22*y_i   (using the ORIGINAL x_i, y_i, applied together)
* where H depends on the flag:
*   flag = -2 : H = I                (no-op)
*   flag = -1 : H = [[h11,h12],[h21,h22]]   (full)
*   flag =  0 : H = [[1,h12],[h21,1]]
*   flag =  1 : H = [[h11,1],[-1,h22]]
* with param = [flag, h11, h21, h12, h22].
*
* Validated component-wise against an INDEPENDENT oracle (H reconstructed from
* flag + param), then layout-fuzzed bit-exact across strided (incl. negative)
* vector layouts. drotm is purely elementwise (no reduction, and the JS base
* uses a single strided loop with NO Fortran INCX==INCY fast path), so it must be
* bit-exact across ALL vector layouts.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import drotm from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const FLAGS = [ -2.0, -1.0, 0.0, 1.0 ];

function values( rng, n ) {
	const v = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		v.push( sc.random( rng ) );
	}
	return v;
}

// Read a strided vector back out of physical storage as an N-length array.
function readVector( V, n ) {
	const out = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		out.push( V.read( i ) );
	}
	return out;
}

// Wrap an array of scalar values as an M x 1 LogicalMatrix (for flattenLogical).
function asColumn( arr ) {
	const M = new LogicalMatrix( sc, arr.length, 1 );
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		M.set( i, 0, arr[ i ] );
	}
	return M;
}

// Build a full 5-element param array [flag, h11, h21, h12, h22] with random
// entries in the referenced slots (unreferenced slots are harmless).
function makeParam( rng, flag ) {
	return [ flag, rng.normal(), rng.normal(), rng.normal(), rng.normal() ];
}

// INDEPENDENT reconstruction of H entries from flag + param (implied values NOT
// read from param), matching the reference convention exactly.
function Hentries( flag, p ) {
	if ( flag === -2.0 ) {
		return { 'h11': 1.0, 'h12': 0.0, 'h21': 0.0, 'h22': 1.0 };
	}
	if ( flag < 0.0 ) {
		return { 'h11': p[ 1 ], 'h12': p[ 3 ], 'h21': p[ 2 ], 'h22': p[ 4 ] };
	}
	if ( flag === 0.0 ) {
		return { 'h11': 1.0, 'h12': p[ 3 ], 'h21': p[ 2 ], 'h22': 1.0 };
	}
	return { 'h11': p[ 1 ], 'h12': 1.0, 'h21': -1.0, 'h22': p[ 4 ] };
}

// Component-wise scaled-error assertion for a got/expected pair of arrays.
function assertClose( got, exp, N, label ) {
	check.assertFinite( sc, got, label );
	let errSq = 0.0;
	let scaleSq = 0.0;
	let d, c, ii;
	for ( ii = 0; ii < N; ii++ ) {
		d = got[ ii ] - exp[ ii ];
		c = exp[ ii ];
		errSq += d * d;
		scaleSq += c * c;
	}
	check.assertScaled( Math.sqrt( errSq ), Math.sqrt( scaleSq ), check.tol( N, 20 ), label );
}

// Step 2: PROPERTY — modified Givens over a size sweep (incl. N=0,1) crossed with
// every flag form.
test( 'drotm: modified Givens on (x,y) (size sweep incl. N=0,1 x all flags)', function t() {
	SIZES.forEach( function eachN( N ) {
		FLAGS.forEach( function eachFlag( flag ) {
			const rng = new RNG( 0x100 + N );
			const x0 = values( rng, N );
			const y0 = values( rng, N );
			const p = makeParam( rng, flag );
			const H = Hentries( flag, p );

			const X = schemes.realizeVector( sc, x0, { 'stride': 1 } );
			const Y = schemes.realizeVector( sc, y0, { 'stride': 1 } );
			const P = schemes.realizeVector( sc, p, { 'stride': 1 } );
			drotm( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ], P.data, P.args[ 0 ], P.args[ 1 ] );

			const gotX = readVector( X, N );
			const gotY = readVector( Y, N );
			const expX = [];
			const expY = [];
			let i;
			for ( i = 0; i < N; i++ ) {
				expX.push( ( H.h11 * x0[ i ] ) + ( H.h12 * y0[ i ] ) );
				expY.push( ( H.h21 * x0[ i ] ) + ( H.h22 * y0[ i ] ) );
			}
			checked( 'drotm', 'property', function run() {
				assertClose( gotX, expX, N, 'drotm x N='+N+' flag='+flag );
				assertClose( gotY, expY, N, 'drotm y N='+N+' flag='+flag );
			});
		});
	});
});

// Step 3: LAYOUT INVARIANCE — output must be bit-exact across strided vector
// layouts (incl. negative strides); x, y, and param each at rotated layouts.
test( 'drotm: bit-exact across vector layouts', function t() {
	const N = 17;
	const flag = -1.0; // full H exercises all four entries
	const SEED = 0xF00D;
	const vLayouts = schemes.vectorLayouts();
	checked( 'drotm', 'layout-invariance', function run() {
		layoutInvariant( vLayouts, function build( vL, idx ) {
			const rng = new RNG( SEED ); // identical values every variant
			const x0 = values( rng, N );
			const y0 = values( rng, N );
			const p = makeParam( rng, flag );

			const X = schemes.realizeVector( sc, x0, vL );
			const Y = schemes.realizeVector( sc, y0, vLayouts[ ( idx + 2 ) % vLayouts.length ] );
			const P = schemes.realizeVector( sc, p, vLayouts[ ( idx + 3 ) % vLayouts.length ] );
			drotm( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ], P.data, P.args[ 0 ], P.args[ 1 ] );

			// Concatenate read-back x then y for a single bit-exact fingerprint.
			return check.flattenLogical( sc, asColumn( readVector( X, N ).concat( readVector( Y, N ) ) ) );
		}, { 'label': 'drotm layout invariance' } );
	});
});
