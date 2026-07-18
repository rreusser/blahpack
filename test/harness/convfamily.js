/**
* Shared property-based driver for the triangular STORAGE-FORMAT conversion
* family (tr <-> tf <-> tp: standard dense triangular, Rectangular Full Packed,
* standard packed).
*
* The six converters (trttf, tfttr, trttp, tpttr, tfttp, tpttf) are pure ADDRESS
* moves — they copy triangle entries between three storage layouts with NO
* arithmetic (the complex `conjugate-transpose` RFP variant only conjugates, an
* exact sign flip). They are therefore exact bijections, and correctness is
* validated by:
*
*   - ROUND-TRIP identity: a converter composed with its inverse reproduces the
*     referenced triangle BIT-EXACTLY.
*   - CROSS-PATH agreement: two independent routes to the same target format
*     (e.g. TR->RFP directly vs TR->TP->RFP) produce BYTE-IDENTICAL buffers.
*
* Because there is no arithmetic, every check is asserted with `Object.is`
* bit-equality (not a tolerance), and — the RFP/packed intermediates being
* opaque 1-D buffers written by one converter and read by the next — layout
* invariance is bit-exact across ALL storage layouts simultaneously (a single
* arithmetic-order "family"). Unused RFP/packed/dense slots are NaN-poisoned, so
* any out-of-bounds or unwritten read trips `assertFinite` before the exact
* compare (which would otherwise treat NaN===NaN under Object.is as a match).
*/

import test from 'node:test';
import { RNG, logical, schemes, check, SIZES_SMALL } from './index.js';
import { checked } from './ledger.js';

var LogicalMatrix = logical.LogicalMatrix;
var UPLOS = [ 'upper', 'lower' ];

// Curated 1-D layouts for the opaque RFP / packed buffers (stride sign, base
// offset, leading/trailing poison pad). k ranges contiguously 0..npk-1.
function linearLayouts() {
	return [
		{ 'stride': 1, 'lead': 0, 'tail': 0 },
		{ 'stride': 1, 'lead': 3, 'tail': 2 },
		{ 'stride': 2, 'lead': 0, 'tail': 1 },
		{ 'stride': 3, 'lead': 2, 'tail': 0 },
		{ 'stride': -1, 'lead': 4, 'tail': 1 },
		{ 'stride': -2, 'lead': 1, 'tail': 2 }
	];
}
var TIGHT = { 'stride': 1, 'lead': 0, 'tail': 0 };

// A poisoned, opaque 1-D buffer of `npk` slots with a fuzzable stride/offset;
// slots are written by the routine under test, read back linearly by index k.
function linearAlloc( sc, npk, layout ) {
	var L = layout || {};
	var stride = ( L.stride === void 0 ) ? 1 : L.stride;
	var lead = ( L.lead === void 0 ) ? 0 : L.lead;
	var tail = ( L.tail === void 0 ) ? 0 : L.tail;
	var span = ( npk > 0 ) ? ( npk - 1 ) * Math.abs( stride ) : 0;
	var offset = ( stride < 0 ) ? ( lead + span ) : lead;
	var len = lead + span + tail + 1;
	var data = sc.alloc( len );
	return {
		'data': data,
		'stride': stride,
		'offset': offset,
		'read': function read( k ) {
			return sc.read( data, offset + ( k * stride ) );
		}
	};
}

// Poisoned dense n x n output buffer (referenced triangle written by routine).
function denseOut( sc, n, layout ) {
	return schemes.denseAlloc( sc, n, n, layout || { 'order': 'col' } );
}

// Read the referenced (uplo) triangle of a dense buffer back into a
// LogicalMatrix; opposite triangle -> exact zero (matches logical.triangular).
function readTri( sc, A, n, uplo ) {
	var F = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, sc.read( A.data, A.addr( i, j ) ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// Flatten an opaque linear buffer's npk slots to scalar VALUES (for finiteness)
// and to flat components (for bit-exact compare).
function readLinear( sc, buf, npk ) {
	var vals = [];
	var k;
	for ( k = 0; k < npk; k++ ) {
		vals.push( buf.read( k ) );
	}
	return vals;
}
function comps( sc, vals ) {
	var out = [];
	var i;
	var k;
	var c;
	for ( i = 0; i < vals.length; i++ ) {
		c = sc.components( vals[ i ] );
		for ( k = 0; k < c.length; k++ ) {
			out.push( c[ k ] );
		}
	}
	return out;
}


// FAMILY //

/**
* Build the check-runner bundle for one scalar type.
*
* @param {Object} sc - scalar trait (S.real | S.complex)
* @param {Object} R - { trttf,tfttr,trttp,tpttr,tfttp,tpttf } ndarray fns
* @param {Array<string>} transrs - RFP variants ('no-transpose' + T/C)
* @returns {Object} check runners
*/
function family( sc, R, transrs ) {
	// --- primitive conversions on a given set of layouts --- //

	// TR (dense) -> RFP buffer
	function TR2RFP( A0, n, transr, uplo, la, lr ) {
		var A = schemes.dense.realize( sc, A0, { 'part': uplo }, la );
		var npk = ( n * ( n + 1 ) ) / 2;
		var arf = linearAlloc( sc, npk, lr );
		R.trttf( transr, uplo, n, A.data, A.args[ 0 ], A.args[ 1 ], A.args[ 2 ], arf.data, arf.stride, arf.offset );
		return arf;
	}
	// TR (dense) -> packed buffer
	function TR2TP( A0, n, uplo, la, lp ) {
		var A = schemes.dense.realize( sc, A0, { 'part': uplo }, la );
		var npk = ( n * ( n + 1 ) ) / 2;
		var ap = linearAlloc( sc, npk, lp );
		R.trttp( uplo, n, A.data, A.args[ 0 ], A.args[ 1 ], A.args[ 2 ], ap.data, ap.stride, ap.offset );
		return ap;
	}

	// --- ROUND-TRIP: TR --trttf--> RFP --tfttr--> TR --- //
	function rtTF( n, transr, uplo, la, lr, lo ) {
		var rng = new RNG( 0x7F + n );
		var A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
		var arf = TR2RFP( A0, n, transr, uplo, la, lr );
		var Aout = denseOut( sc, n, lo );
		R.tfttr( transr, uplo, n, arf.data, arf.stride, arf.offset, Aout.data, Aout.s1, Aout.s2, Aout.offset );
		var F = readTri( sc, Aout, n, uplo );
		check.assertFinite( sc, F, 'rtTF recovered TR' );
		return { 'got': check.flattenLogical( sc, F ), 'want': check.flattenLogical( sc, A0 ) };
	}

	// --- ROUND-TRIP: TR --trttp--> TP --tpttr--> TR --- //
	function rtTP( n, uplo, la, lp, lo ) {
		var rng = new RNG( 0x7F + n );
		var A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
		var ap = TR2TP( A0, n, uplo, la, lp );
		var Aout = denseOut( sc, n, lo );
		R.tpttr( uplo, n, ap.data, ap.stride, ap.offset, Aout.data, Aout.s1, Aout.s2, Aout.offset );
		var F = readTri( sc, Aout, n, uplo );
		check.assertFinite( sc, F, 'rtTP recovered TR' );
		return { 'got': check.flattenLogical( sc, F ), 'want': check.flattenLogical( sc, A0 ) };
	}

	// --- ROUND-TRIP on RFP: RFP --tfttp--> TP --tpttf--> RFP (identity) --- //
	function rtRFP( n, transr, uplo, lr1, lp, lr2 ) {
		var rng = new RNG( 0x7F + n );
		var A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
		var npk = ( n * ( n + 1 ) ) / 2;
		var arf1 = TR2RFP( A0, n, transr, uplo, TIGHT, lr1 ); // valid RFP source
		var ap = linearAlloc( sc, npk, lp );
		R.tfttp( transr, uplo, n, arf1.data, arf1.stride, arf1.offset, ap.data, ap.stride, ap.offset );
		var arf2 = linearAlloc( sc, npk, lr2 );
		R.tpttf( transr, uplo, n, ap.data, ap.stride, ap.offset, arf2.data, arf2.stride, arf2.offset );
		var got = readLinear( sc, arf2, npk );
		var want = readLinear( sc, arf1, npk );
		check.assertFinite( sc, got, 'rtRFP recovered RFP' );
		return { 'got': comps( sc, got ), 'want': comps( sc, want ) };
	}

	// --- ROUND-TRIP on TP: TP --tpttf--> RFP --tfttp--> TP (identity) --- //
	function rtTPid( n, transr, uplo, lp1, lr, lp2 ) {
		var rng = new RNG( 0x7F + n );
		var A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
		var npk = ( n * ( n + 1 ) ) / 2;
		var ap1 = TR2TP( A0, n, uplo, TIGHT, lp1 ); // valid TP source
		var arf = linearAlloc( sc, npk, lr );
		R.tpttf( transr, uplo, n, ap1.data, ap1.stride, ap1.offset, arf.data, arf.stride, arf.offset );
		var ap2 = linearAlloc( sc, npk, lp2 );
		R.tfttp( transr, uplo, n, arf.data, arf.stride, arf.offset, ap2.data, ap2.stride, ap2.offset );
		var got = readLinear( sc, ap2, npk );
		var want = readLinear( sc, ap1, npk );
		check.assertFinite( sc, got, 'rtTPid recovered TP' );
		return { 'got': comps( sc, got ), 'want': comps( sc, want ) };
	}

	// --- CROSS-PATH RFP: trttf  vs  trttp+tpttf --- //
	function crossRFP( n, transr, uplo, la, lp, lr1, lr2 ) {
		var rng = new RNG( 0x2B + n );
		var A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
		var npk = ( n * ( n + 1 ) ) / 2;
		var arf1 = TR2RFP( A0, n, transr, uplo, la, lr1 );
		var ap = TR2TP( A0, n, uplo, la, lp );
		var arf2 = linearAlloc( sc, npk, lr2 );
		R.tpttf( transr, uplo, n, ap.data, ap.stride, ap.offset, arf2.data, arf2.stride, arf2.offset );
		var a = readLinear( sc, arf1, npk );
		var b = readLinear( sc, arf2, npk );
		check.assertFinite( sc, a, 'crossRFP direct' );
		check.assertFinite( sc, b, 'crossRFP via TP' );
		return { 'got': comps( sc, a ), 'want': comps( sc, b ) };
	}

	// --- CROSS-PATH TP: trttp  vs  trttf+tfttp --- //
	function crossTP( n, transr, uplo, la, lr, lp1, lp2 ) {
		var rng = new RNG( 0x2B + n );
		var A0 = logical.triangular( sc, rng, n, { 'uplo': uplo, 'unit': false } );
		var npk = ( n * ( n + 1 ) ) / 2;
		var ap1 = TR2TP( A0, n, uplo, la, lp1 );
		var arf = TR2RFP( A0, n, transr, uplo, la, lr );
		var ap2 = linearAlloc( sc, npk, lp2 );
		R.tfttp( transr, uplo, n, arf.data, arf.stride, arf.offset, ap2.data, ap2.stride, ap2.offset );
		var a = readLinear( sc, ap1, npk );
		var b = readLinear( sc, ap2, npk );
		check.assertFinite( sc, a, 'crossTP direct' );
		check.assertFinite( sc, b, 'crossTP via RFP' );
		return { 'got': comps( sc, a ), 'want': comps( sc, b ) };
	}

	// --- ledger-recording sweep + layout-invariance wrappers --- //

	// Correctness sweep (kind 'reconstruct'): tight layouts, transr x uplo x N.
	function sweep( subject, label, fn ) {
		test( subject+': '+label+' (transr x uplo x size sweep, bit-exact)', function t() {
			transrs.forEach( function eachT( transr ) {
				UPLOS.forEach( function eachU( uplo ) {
					SIZES_SMALL.forEach( function eachN( n ) {
						checked( subject, 'reconstruct', function run() {
							var r = fn( n, transr, uplo );
							check.assertExactEqual( r.got, r.want, subject+' '+label+' transr='+transr+' '+uplo+' n='+n );
						});
					});
				});
			});
		});
	}

	// Layout-invariance (kind 'layout-invariance'): pure address moves are
	// bit-exact across ALL storage layouts at once; zip dense + linear layouts.
	function invariance( subject, label, build ) {
		var dl = schemes.dense.layouts();
		var ll = linearLayouts();
		var m = Math.min( dl.length, ll.length );
		var variants = [];
		var i;
		for ( i = 0; i < m; i++ ) {
			variants.push( { 'd': dl[ i ], 'l': ll[ i ] } );
		}
		test( subject+': '+label+' bit-exact across all layouts', function t() {
			transrs.forEach( function eachT( transr ) {
				UPLOS.forEach( function eachU( uplo ) {
					checked( subject, 'layout-invariance', function run() {
						var outs = [];
						variants.forEach( function eachV( v ) {
							outs.push( build( transr, uplo, v.d, v.l ).got );
						});
						check.assertAllExactEqual( outs, subject+' '+label+' transr='+transr+' '+uplo );
					});
				});
			});
		});
	}

	return {
		'rtTF': rtTF,
		'rtTP': rtTP,
		'rtRFP': rtRFP,
		'rtTPid': rtTPid,
		'crossRFP': crossRFP,
		'crossTP': crossTP,
		'sweep': sweep,
		'invariance': invariance
	};
}

export { family };
