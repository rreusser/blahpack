/**
* Property-based validation for drotg, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; Level-1 generator of a real Givens
* plane rotation. Inputs (a0,b0) live in the 2-element strided array `ab`
* (overwritten to [r,z]); outputs c,s live in the 2-element strided array `cs`.
* Because operands are strided arrays with offsets, addressing IS fuzzable -> L3.
*
* Oracle = the DEFINING relations of the rotation (not BLAS's exact sign
* convention). With outputs c, s, r (= ab[0] on return):
*   (i)   c^2 + s^2 = 1
*   (ii)  c*a0 + s*b0 = r
*   (iii) -s*a0 + c*b0 = 0
* which encode  [ c s; -s c ] [a0; b0] = [r; 0]  with an orthonormal rotation.
*/

import test from 'node:test';
import { RNG, scalar as S, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import drotg from './../lib/ndarray.js';

var sc = S.real;


// CASES: rng -> [ a0, b0 ] //

var CASES = [
	function c0( r ) { return [ r.normal(), r.normal() ]; },
	function c1( r ) { return [ 5.0*r.normal(), 0.1*r.normal() ]; },   // anorm >> bnorm
	function c2( r ) { return [ 0.1*r.normal(), 5.0*r.normal() ]; },   // bnorm >> anorm
	function c3( r ) { return [ r.between( -1e6, 1e6 ), r.between( -1e-6, 1e-6 ) ]; },
	function c4( r ) { return [ r.between( -1e-6, 1e-6 ), r.between( -1e6, 1e6 ) ]; },
	function c5( r ) { return [ -r.normal(), r.normal() ]; },
	function c6( r ) { return [ r.normal(), -r.normal() ]; },
	function c7( r ) { return [ -r.normal(), -r.normal() ]; },

	// Edge cases:
	function e0() { return [ 0.0, 0.0 ]; },                            // both zero
	function e1( r ) { return [ r.normal(), 0.0 ]; },                  // b = 0
	function e2( r ) { return [ 0.0, r.normal() ]; },                  // a = 0
	function e3() { return [ 3.0, 4.0 ]; },
	function e4() { return [ -3.0, 4.0 ]; },
	function e5() { return [ 1e300, 1e-300 ]; },                       // extreme scale
	function e6() { return [ 1e-300, 1e300 ]; },
	function e7() { return [ 2.2250738585072014e-308, 6.675221575521604e-308 ]; }, // smallest-normal safe-scaling boundary (deep subnormals lose precision inherently, so are not asserted)
	function e8() { return [ 1e308, -1e308 ]; }                        // both near max
];


// TESTS //

test( 'drotg: property (Givens defining relations) across a0/b0 cases', function t() {
	checked( 'drotg', 'property', function run() {
		var t100 = check.tol( 1, 100 );
		CASES.forEach( function each( mk, k ) {
			var rng = new RNG( 0x100 + k );
			var in0 = mk( rng );
			var a0 = in0[ 0 ];
			var b0 = in0[ 1 ];
			var AB = schemes.realizeVector( sc, [ a0, b0 ], { 'stride': 1 } );
			var CS = schemes.realizeVector( sc, [ 0.0, 0.0 ], { 'stride': 1 } );
			var c;
			var s;
			var r;
			var scale;
			drotg( AB.data, AB.args[ 0 ], AB.args[ 1 ], CS.data, CS.args[ 0 ], CS.args[ 1 ] );
			c = CS.read( 0 );
			s = CS.read( 1 );
			r = AB.read( 0 );
			check.assertFinite( sc, [ c, s, r ], 'drotg outputs k='+k );

			// (i) c^2 + s^2 = 1 (orthonormality of the rotation):
			check.assertScaled( Math.abs( ( ( c*c ) + ( s*s ) ) - 1.0 ), 1.0, t100, 'drotg (i) c^2+s^2=1 k='+k );

			scale = Math.hypot( a0, b0 );

			// (ii) c*a0 + s*b0 = r:
			check.assertScaled( Math.abs( ( ( c*a0 ) + ( s*b0 ) ) - r ), scale, t100, 'drotg (ii) c*a+s*b=r k='+k );

			// (iii) -s*a0 + c*b0 = 0:
			check.assertScaled( Math.abs( ( -s*a0 ) + ( c*b0 ) ), scale, t100, 'drotg (iii) -s*a+c*b=0 k='+k );
		});
	});
});

test( 'drotg: layout invariance (bit-exact across ab/cs offset+stride layouts)', function t() {
	var layouts = schemes.vectorLayouts();
	var a0 = -2.5;
	var b0 = 1.3;
	checked( 'drotg', 'layout-invariance', function run() {
		layoutInvariant( layouts, function build( L, idx ) {
			var Lcs = layouts[ ( idx + 2 ) % layouts.length ];
			var AB = schemes.realizeVector( sc, [ a0, b0 ], L );
			var CS = schemes.realizeVector( sc, [ 0.0, 0.0 ], Lcs );
			drotg( AB.data, AB.args[ 0 ], AB.args[ 1 ], CS.data, CS.args[ 0 ], CS.args[ 1 ] );

			// Flatten outputs c, s, r:
			return [ CS.read( 0 ), CS.read( 1 ), AB.read( 0 ) ];
		}, { 'label': 'drotg layout invariance' } );
	});
});
