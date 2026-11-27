/**
* Property-based validation for drot, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 pure vector operation
* applying a plane rotation to a pair of vectors, in place on BOTH:
*   x_i := c*x_i + s*y_i
*   y_i := c*y_i - s*x_i   (using the ORIGINAL x_i, y_i, applied simultaneously)
* Validated component-wise against an independent oracle, then layout-fuzzed
* bit-exact across strided (incl. negative) vector layouts. drot is elementwise
* (no reduction), so it must be bit-exact across ALL vector layouts.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import drot from './../lib/ndarray.js';

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

// A handful of rotations, incl. the identity (c=1, s=0).
function rotation( k ) {
	const thetas = [ 0.0, 0.3, 1.0, 2.5, -0.7, Math.PI / 4 ];
	const theta = thetas[ k % thetas.length ];
	return { 'c': Math.cos( theta ), 's': Math.sin( theta ) };
}

// Component-wise scaled-error assertion for a got/expected pair of arrays.
function assertClose( got, exp, N, label ) {
	check.assertFinite( sc, got, label );
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
	check.assertScaled( Math.sqrt( errSq ), Math.sqrt( scaleSq ), check.tol( N, 20 ), label );
}

// Step 2: PROPERTY — plane rotation over a size sweep incl. N=0,1 and identity.
test( 'drot: plane rotation on (x,y) (size sweep, incl. N=0,1, identity)', function t() {
	SIZES.forEach( function eachN( N ) {
		const rng = new RNG( 0x100 + N );
		const x0 = values( rng, N );
		const y0 = values( rng, N );
		const rot = rotation( N );
		const c = rot.c;
		const s = rot.s;

		const X = schemes.realizeVector( sc, x0, { 'stride': 1 } );
		const Y = schemes.realizeVector( sc, y0, { 'stride': 1 } );
		drot( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ], c, s );

		const gotX = readVector( X, N );
		const gotY = readVector( Y, N );
		const expX = [];
		const expY = [];
		let i;
		for ( i = 0; i < N; i++ ) {
			expX.push( sc.add( sc.scale( x0[ i ], c ), sc.scale( y0[ i ], s ) ) );
			expY.push( sc.sub( sc.scale( y0[ i ], c ), sc.scale( x0[ i ], s ) ) );
		}
		checked( 'drot', 'property', function run() {
			assertClose( gotX, expX, N, 'drot x N='+N );
			assertClose( gotY, expY, N, 'drot y N='+N );
		});
	});
});

// Step 3: LAYOUT INVARIANCE — output must be bit-exact across strided vector
// layouts (incl. negative strides), x and y at rotated layouts.
test( 'drot: bit-exact across vector layouts', function t() {
	const N = 17;
	const SEED = 0xF00D;
	const vLayouts = schemes.vectorLayouts();
	const c = Math.cos( 0.6 );
	const s = Math.sin( 0.6 );
	checked( 'drot', 'layout-invariance', function run() {
		layoutInvariant( vLayouts, function build( vL, idx ) {
			const rng = new RNG( SEED ); // identical values every variant
			const x0 = values( rng, N );
			const y0 = values( rng, N );

			const X = schemes.realizeVector( sc, x0, vL );
			const Y = schemes.realizeVector( sc, y0, vLayouts[ ( idx + 2 ) % vLayouts.length ] );
			drot( N, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ], c, s );

			// Concatenate read-back x then y for a single bit-exact fingerprint.
			return check.flattenLogical( sc, asColumn( readVector( X, N ).concat( readVector( Y, N ) ) ) );
		}, { 'label': 'drot layout invariance' } );
	});
});
