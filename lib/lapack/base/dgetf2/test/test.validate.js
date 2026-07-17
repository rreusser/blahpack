/**
* Property-based validation for dgetf2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `tf2` (unblocked LU with partial pivoting)
* -> reconstruction P*A = L*U.
*
* The reconstruction P*A = L*U is an EXACT algebraic identity for ANY general A
* (it is the definition of Gaussian elimination with the recorded row swaps, not
* a solve), so conditioning is irrelevant and plain random general A suffices.
* IPIV is 0-based: for j = 0..min(M,N)-1, in order, row j was interchanged with
* row IPIV[j].
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgetf2 from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

// The pivot search idamax walks each sub-column with strideA1; its reference
// BLAS contract returns -1 for a non-positive stride (INCX<=0), so a negative
// FIRST-dimension stride is out of contract for LU-with-pivoting (yields
// IPIV=-1 and out-of-bounds reads). Fuzz only positive-row-stride layouts; this
// still exercises offset, leading-dim padding, negative COLUMN stride, and the
// col<->row flip. See the getrf/getf2 LEARNINGS entry.
var POSROW = schemes.dense.layouts().filter( function posRow( L ) {
	return L.sgn1 !== -1;
});

// (M,N) sweep: squares straddling unroll/block thresholds + rectangular (M<N,
// M>N) + zero-dimension corners.
var PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 5, 3 ], [ 3, 5 ], [ 8, 4 ], [ 4, 8 ], [ 16, 7 ], [ 7, 16 ], [ 33, 17 ], [ 17, 33 ], [ 1, 4 ], [ 4, 1 ], [ 0, 0 ], [ 0, 3 ], [ 3, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// Allocate a poisoned-length Int32Array pivot vector under a strided layout.
function ipivRealize( n, layout ) {
	var L = layout || {};
	var stride = ( L.stride === void 0 ) ? 1 : L.stride;
	var lead = ( L.lead === void 0 ) ? 0 : L.lead;
	var tail = ( L.tail === void 0 ) ? 0 : L.tail;
	var span = ( n > 0 ) ? ( n - 1 ) * Math.abs( stride ) : 0;
	var offset = ( stride < 0 ) ? ( lead + span ) : lead;
	var data = new Int32Array( lead + span + tail + 1 );
	data.fill( -999999 ); // poison unused pivot slots
	return {
		'data': data,
		'stride': stride,
		'offset': offset,
		'read': function read( i ) {
			return data[ offset + ( i * stride ) ];
		}
	};
}

// Read the strict-lower + unit-diagonal part of the factored A as the M x minMN
// unit-lower-trapezoidal factor L.
function readL( R, M, minMN ) {
	var Lm = new LogicalMatrix( sc, M, minMN );
	var i;
	var j;
	for ( j = 0; j < minMN; j++ ) {
		for ( i = 0; i < M; i++ ) {
			if ( i > j ) {
				Lm.set( i, j, R.read( i, j ) );
			} else if ( i === j ) {
				Lm.set( i, j, sc.one );
			} else {
				Lm.set( i, j, sc.zero );
			}
		}
	}
	return Lm;
}

// Read the upper (incl. diagonal) part of the factored A as the minMN x N
// upper-trapezoidal factor U.
function readU( R, minMN, N ) {
	var Um = new LogicalMatrix( sc, minMN, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < minMN; i++ ) {
			if ( i <= j ) {
				Um.set( i, j, R.read( i, j ) );
			} else {
				Um.set( i, j, sc.zero );
			}
		}
	}
	return Um;
}

// Read the full factored A (M x N) back into a LogicalMatrix.
function readFull( R, M, N ) {
	var F = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

// Replay the recorded row interchanges onto a copy of A0, in the SAME k-order
// the routine applied them, to form P*A0.
function applyPivots( A0, ipiv, minMN ) {
	var PA = A0.copy();
	var tmp;
	var p;
	var c;
	var j;
	for ( j = 0; j < minMN; j++ ) {
		p = ipiv.read( j ); // 0-based
		if ( p !== j ) {
			for ( c = 0; c < PA.cols; c++ ) {
				tmp = PA.get( j, c );
				PA.set( j, c, PA.get( p, c ) );
				PA.set( p, c, tmp );
			}
		}
	}
	return PA;
}

// Steps 2-3-5: reconstruction across the (M,N) sweep and EVERY storage layout,
// at backward-error tolerance (the optimized dger/dscal reorder across storage
// order, so exactness is not expected here — that is the layout-invariance test
// below).
test( 'dgetf2: LU reconstruction P*A = L*U ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var minMN = Math.min( M, N );
		POSROW.forEach( function eachLayout( layout, li ) {
			var rng = new RNG( 0x100 + ( M * 100 ) + N ); // reproducible; log on failure
			var A0 = logical.general( sc, rng, M, N );
			var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var ipiv = ipivRealize( minMN, { 'stride': 1, 'lead': 0, 'tail': 0 } );
			dgetf2( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv.data, ipiv.stride, ipiv.offset );

			var Lm = readL( R, M, minMN );
			var Um = readU( R, minMN, N );
			var recon = ref.matmul( sc, Lm, Um );
			var PA = applyPivots( A0, ipiv, minMN );
			checked( 'dgetf2', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, PA, { 'label': 'dgetf2 M='+M+' N='+N+' layout='+li } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz. Within a single storage-order family the
// factored A must be bit-exact across offset, leading-dim padding, and stride
// SIGN; the col<->row FLIP legitimately reorders the optimized dger/dscal inner
// loops (~1 ULP), so cross-order agreement is certified by the reconstruction
// property above, not bit-equality (see the dpotf2/dgels LEARNINGS entries).
// IPIV vector layout is fuzzed in parallel; it must not perturb the factored A.
var IPIV_LAYOUTS = [
	{ 'stride': 1, 'lead': 0, 'tail': 0 },
	{ 'stride': 1, 'lead': 3, 'tail': 2 },
	{ 'stride': 2, 'lead': 1, 'tail': 0 },
	{ 'stride': -1, 'lead': 4, 'tail': 1 }
];

var colLayouts = POSROW.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = POSROW.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dgetf2: bit-exact within storage-order family (col / row)', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
});

function runInvariance( variants, fam ) {
	var M = 9;
	var N = 9;
	var minMN = Math.min( M, N );
	var SEED = 0xF00D;
	checked( 'dgetf2', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.general( sc, rng, M, N );
			var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var ipiv = ipivRealize( minMN, IPIV_LAYOUTS[ i % IPIV_LAYOUTS.length ] );
			dgetf2( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv.data, ipiv.stride, ipiv.offset );
			return check.flattenLogical( sc, readFull( R, M, N ) );
		}, { 'label': 'dgetf2 layout invariance '+fam+'-major' } );
	});
}
