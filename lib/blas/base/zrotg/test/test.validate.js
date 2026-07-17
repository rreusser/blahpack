/**
* Property-based validation for zrotg, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; Level-1 generator of a Givens
* plane rotation with real cosine `c` and complex sine `s`. Operands are
* single-element complex/real arrays addressed purely by offset (no stride arg),
* so addressing is fuzzable via the per-operand offsets -> L3.
*
* Oracle = the DEFINING relations of the rotation the routine implements,
*   [ c s; -conj(s) c ] [a0; b0] = [r; 0]  (c real, s complex),
* i.e. with outputs c (real), s (complex), r (= a on return, complex):
*   (i)   c^2 + |s|^2 = 1
*   (ii)  c*a0 + s*b0 = r
*   (iii) -conj(s)*a0 + c*b0 = 0
*/

import test from 'node:test';
import { RNG, scalar as S, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zrotg from './../lib/ndarray.js';

var sc = S.complex;
var scr = S.real;

function Z( re, im ) {
	return { 're': re, 'im': im };
}


// CASES: rng -> [ a0, b0 ] (complex values) //

var CASES = [
	function c0( r ) { return [ sc.random( r ), sc.random( r ) ]; },
	function c1( r ) { return [ sc.random( r ), sc.random( r ) ]; },
	function c2( r ) { return [ sc.scale( sc.random( r ), 5.0 ), sc.scale( sc.random( r ), 0.05 ) ]; },
	function c3( r ) { return [ sc.scale( sc.random( r ), 0.05 ), sc.scale( sc.random( r ), 5.0 ) ]; },

	// Edge cases:
	function e0() { return [ Z( 0.0, 0.0 ), Z( 0.0, 0.0 ) ]; },        // both zero
	function e1( r ) { return [ sc.random( r ), Z( 0.0, 0.0 ) ]; },    // b = 0
	function e2( r ) { return [ Z( 0.0, 0.0 ), sc.random( r ) ]; },    // a = 0
	function e3( r ) { return [ Z( 0.0, r.normal() ), Z( 0.0, r.normal() ) ]; }, // pure imaginary
	function e4( r ) { return [ Z( r.normal(), 0.0 ), Z( r.normal(), 0.0 ) ]; },  // pure real
	function e5( r ) { return [ Z( 0.0, 0.0 ), Z( 0.0, r.normal() ) ]; }, // a=0, b pure imaginary
	function e6() { return [ Z( 1e300, 1e-300 ), Z( 1e-300, 1e300 ) ]; }, // extreme scale
	function e7() { return [ Z( 1e-300, 0.0 ), Z( 0.0, 1e-300 ) ]; },     // tiny
	function e8( r ) { return [ sc.scale( sc.random( r ), 1e-160 ), sc.scale( sc.random( r ), 1e160 ) ]; }
];


// TESTS //

test( 'zrotg: property (Givens defining relations) across a0/b0 cases', function t() {
	checked( 'zrotg', 'property', function run() {
		var t100 = check.tol( 1, 100 );
		CASES.forEach( function each( mk, k ) {
			var rng = new RNG( 0x100 + k );
			var in0 = mk( rng );
			var a0 = in0[ 0 ];
			var b0 = in0[ 1 ];
			var A = schemes.realizeVector( sc, [ a0 ], { 'stride': 1 } );
			var B = schemes.realizeVector( sc, [ b0 ], { 'stride': 1 } );
			var C = schemes.realizeVector( scr, [ 0.0 ], { 'stride': 1 } );
			var Sr = schemes.realizeVector( sc, [ Z( 0.0, 0.0 ) ], { 'stride': 1 } );
			var c;
			var s;
			var r;
			var s2;
			var scale;
			var lhs;
			var res;
			zrotg( A.data, A.args[ 1 ], B.data, B.args[ 1 ], C.data, C.args[ 1 ], Sr.data, Sr.args[ 1 ] );
			c = C.read( 0 );
			s = Sr.read( 0 );
			r = A.read( 0 ); // a overwritten with r
			check.assertFinite( scr, [ c ], 'zrotg c k='+k );
			check.assertFinite( sc, [ s, r ], 'zrotg s,r k='+k );

			// (i) c^2 + |s|^2 = 1:
			s2 = ( s.re*s.re ) + ( s.im*s.im );
			check.assertScaled( Math.abs( ( ( c*c ) + s2 ) - 1.0 ), 1.0, t100, 'zrotg (i) c^2+|s|^2=1 k='+k );

			scale = sc.abs( a0 ) + sc.abs( b0 );

			// (ii) c*a0 + s*b0 = r:
			lhs = sc.add( sc.scale( a0, c ), sc.mul( s, b0 ) );
			check.assertScaled( sc.abs( sc.sub( lhs, r ) ), scale, t100, 'zrotg (ii) c*a+s*b=r k='+k );

			// (iii) -conj(s)*a0 + c*b0 = 0:
			res = sc.add( sc.neg( sc.mul( sc.conj( s ), a0 ) ), sc.scale( b0, c ) );
			check.assertScaled( sc.abs( res ), scale, t100, 'zrotg (iii) -conj(s)*a+c*b=0 k='+k );
		});
	});
});

test( 'zrotg: layout invariance (bit-exact across per-operand offsets)', function t() {
	var variants = [ 0, 1, 2, 4, 7 ];
	var a0 = Z( 1.5, -0.5 );
	var b0 = Z( -0.7, 2.1 );
	checked( 'zrotg', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( v, idx ) {
			var la = variants[ idx ];
			var lb = variants[ ( idx + 1 ) % variants.length ];
			var lc = variants[ ( idx + 2 ) % variants.length ];
			var ls = variants[ ( idx + 3 ) % variants.length ];
			var A = schemes.realizeVector( sc, [ a0 ], { 'stride': 1, 'lead': la } );
			var B = schemes.realizeVector( sc, [ b0 ], { 'stride': 1, 'lead': lb } );
			var C = schemes.realizeVector( scr, [ 0.0 ], { 'stride': 1, 'lead': lc } );
			var Sr = schemes.realizeVector( sc, [ Z( 0.0, 0.0 ) ], { 'stride': 1, 'lead': ls } );
			var c;
			var s;
			var r;
			zrotg( A.data, A.args[ 1 ], B.data, B.args[ 1 ], C.data, C.args[ 1 ], Sr.data, Sr.args[ 1 ] );
			c = C.read( 0 );
			s = Sr.read( 0 );
			r = A.read( 0 );

			// Flatten outputs c, s, r:
			return [ c, s.re, s.im, r.re, r.im ];
		}, { 'label': 'zrotg layout invariance' } );
	});
});
