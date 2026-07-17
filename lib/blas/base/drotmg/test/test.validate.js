/**
* Property-based validation for drotmg, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; a scalar-in / scalar-out GENERATOR
* that constructs the modified Givens transform H (and updated diagonal D and
* x1) which annihilates the second component of the transformed pair. The
* defining, INDEPENDENT invariant (derived + numerically confirmed from the
* reference) is the UNSCALED row-2 annihilation:
*
*   H21 * x1_in + H22 * y1_in = 0     (for flag in {-1, 0, 1})
*
* This holds exactly for the regular flag=0 / flag=1 branches, trivially for the
* zero-H flag=-1 branches, and is preserved through the GAM rescaling loops
* (which only scale rows of H, keeping a zero row-2 result zero). The no-op
* branch flag=-2 (H = I) is emitted precisely when `d2_in * y1_in == 0`, i.e. the
* second factored component is already zero; that case is checked separately.
*
* Then layout-fuzzed bit-exact across strided (incl. negative) layouts of the
* D, x1, and param arrays: drotmg reads/writes each slot once by offset+k*stride,
* so only addressing changes and output must reproduce bit-for-bit.
*/

import test from 'node:test';

import { scalar as S, schemes, check } from '../../../../../test/harness/index.js';
import { layoutInvariant } from '../../../../../test/harness/invariance.js';
import { checked } from '../../../../../test/harness/ledger.js';
import drotmg from './../lib/ndarray.js';

var sc = S.real; // d-routine

// Input cases: [ d1, d2, x1, y1 ] covering every reference branch.
var CASES = [
	[ 2.0, 3.0, 5.0, 7.0 ],        // flag=1 (regular)
	[ 1.0, 4.0, 8.0, 3.0 ],        // flag=0 (regular)
	[ 10.0, 1.0, 5.0, 1.0 ],       // flag=0 (|dq1|>|dq2|)
	[ 2.0, 3.0, -5.0, 7.0 ],       // negative x1
	[ 2.0, 3.0, 5.0, -7.0 ],       // negative y1
	[ 1.0e-9, 2.0, 3.0, 4.0 ],     // dd1 rescale (small) -> flag=-1
	[ 1.0e9, 2.0, 3.0, 4.0 ],      // dd1 rescale (large) -> flag=-1
	[ 2.0, 1.0e-9, 3.0, 4.0 ],     // dd2 rescale (small) -> flag=-1
	[ 2.0, 1.0e9, 3.0, 4.0 ],      // dd2 rescale (large) -> flag=-1
	[ 5.0e7, 5.0e7, 1.0e4, 1.0e4 ],// both rescale -> flag=-1
	[ 2.0, 3.0, 5.0, 0.0 ],        // y1=0 -> flag=-2 (no-op)
	[ 2.0, 0.0, 5.0, 7.0 ],        // d2=0 -> flag=-2 (no-op)
	[ -1.0, 3.0, 5.0, 7.0 ]        // d1<0 -> zero-H flag=-1
];

// INDEPENDENT reconstruction of H entries from the RETURNED flag + param, using
// implied values (never reading poisoned/unwritten param slots).
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

function fail( msg ) {
	throw new Error( msg );
}

// Step 2: PROPERTY — the modified Givens annihilation invariant per input case.
test( 'drotmg: annihilates second component (all reference branches)', function t() {
	CASES.forEach( function eachCase( c ) {
		var d1 = c[ 0 ];
		var d2 = c[ 1 ];
		var x1v = c[ 2 ];
		var y1 = c[ 3 ];
		var tag = 'd1='+d1+' d2='+d2+' x1='+x1v+' y1='+y1;

		var D = sc.alloc( 2 );
		sc.write( D, 0, d1 );
		sc.write( D, 1, d2 );
		var X1 = sc.alloc( 1 );
		sc.write( X1, 0, x1v );
		var P = sc.alloc( 5 ); // poisoned; only referenced slots get written

		drotmg( D, 1, 0, X1, 1, 0, y1, P, 1, 0 );

		var flag = sc.read( P, 0 );
		var p = [ flag, sc.read( P, 1 ), sc.read( P, 2 ), sc.read( P, 3 ), sc.read( P, 4 ) ];
		var d1o = sc.read( D, 0 );
		var d2o = sc.read( D, 1 );
		var x1o = sc.read( X1, 0 );
		var H = Hentries( flag, p );

		checked( 'drotmg', 'property', function run() {
			// flag must be one of the four valid forms:
			if ( flag !== -2.0 && flag !== -1.0 && flag !== 0.0 && flag !== 1.0 ) {
				fail( 'drotmg '+tag+': invalid flag '+flag );
			}
			// Updated outputs must be finite:
			check.assertFinite( sc, [ d1o, d2o, x1o ], 'drotmg D/x1 '+tag );
			// Referenced H entries must be finite:
			check.assertFinite( sc, [ H.h11, H.h12, H.h21, H.h22 ], 'drotmg H '+tag );

			if ( flag === -2.0 ) {
				// No-op branch: H must be exactly the identity, and it is emitted
				// only when the second factored component is already zero.
				if ( H.h11 !== 1.0 || H.h12 !== 0.0 || H.h21 !== 0.0 || H.h22 !== 1.0 ) {
					fail( 'drotmg '+tag+': flag=-2 but H is not identity' );
				}
				if ( ( d2 * y1 ) !== 0.0 ) {
					fail( 'drotmg '+tag+': flag=-2 emitted but d2_in*y1_in != 0' );
				}
				return;
			}
			// Row-2 annihilation on the UNSCALED input vector:
			var resid = ( H.h21 * x1v ) + ( H.h22 * y1 );
			var scale = Math.abs( x1v ) + Math.abs( y1 );
			check.assertScaled( Math.abs( resid ), scale, check.tol( 2, 40 ), 'drotmg annihilation '+tag );
		});
	});
});

// Step 3: LAYOUT INVARIANCE — bit-exact across strided (incl. negative) layouts
// of the D, x1, and param arrays, for representative inputs (flag=1, flag=0,
// flag=-1-with-rescale).
test( 'drotmg: bit-exact across D/x1/param layouts', function t() {
	var vLayouts = schemes.vectorLayouts();
	var inputs = [
		[ 2.0, 3.0, 5.0, 7.0 ],       // flag=1
		[ 1.0, 4.0, 8.0, 3.0 ],       // flag=0
		[ 1.0e9, 2.0, 3.0, 4.0 ]      // flag=-1 (rescaled)
	];
	inputs.forEach( function eachInput( inp, k ) {
		var d1 = inp[ 0 ];
		var d2 = inp[ 1 ];
		var x1v = inp[ 2 ];
		var y1 = inp[ 3 ];
		checked( 'drotmg', 'layout-invariance', function run() {
			layoutInvariant( vLayouts, function build( vL, idx ) {
				var Dv = schemes.realizeVector( sc, [ d1, d2 ], vL );
				var X1v = schemes.realizeVector( sc, [ x1v ], vLayouts[ ( idx + 2 ) % vLayouts.length ] );
				var Pv = schemes.realizeVector( sc, [ 0.0, 0.0, 0.0, 0.0, 0.0 ], vLayouts[ ( idx + 4 ) % vLayouts.length ] );
				drotmg( Dv.data, Dv.args[ 0 ], Dv.args[ 1 ], X1v.data, X1v.args[ 0 ], X1v.args[ 1 ], y1, Pv.data, Pv.args[ 0 ], Pv.args[ 1 ] );

				// Flatten [ D(2), x1(1), param(5) ] read back through the layout.
				return [
					Dv.read( 0 ), Dv.read( 1 ),
					X1v.read( 0 ),
					Pv.read( 0 ), Pv.read( 1 ), Pv.read( 2 ), Pv.read( 3 ), Pv.read( 4 )
				];
			}, { 'label': 'drotmg layout invariance input '+k } );
		});
	});
});
