/**
* Property-based validation for zgetrf2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> dense general
* (schemes.dense, logical.general); `trf2` (RECURSIVE LU with partial pivoting) ->
* reconstruction P*A = L*U (an EXACT identity for ANY A — conditioning is
* irrelevant). IPIV holds 0-based pivot indices: at step k, row k was
* interchanged with row IPIV[k] (see dgetf2/lib/base.js).
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgetrf2 from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

// LU with partial pivoting searches each sub-column with idamax, whose reference
// BLAS contract returns -1 for a non-positive stride (INCX<=0). A negative
// FIRST-dimension stride is therefore out of contract for the whole getrf/getf2
// family (it yields IPIV=-1 and out-of-bounds reads). Fuzz only positive-row-
// stride layouts; this still exercises offset, leading-dim padding, negative
// COLUMN stride, and the col<->row flip. See the getrf/getf2 LEARNINGS entry.
var POSROW = schemes.dense.layouts().filter( function posRow( L ) {
	return L.sgn1 !== -1;
});

// Rectangular (M, N) pairs (both M<N and M>N), straddling the NB=64 crossover.
var RECTS = [
	[ 5, 3 ], [ 3, 5 ], [ 8, 4 ], [ 4, 8 ], [ 17, 7 ], [ 7, 17 ],
	[ 33, 16 ], [ 16, 33 ], [ 64, 32 ], [ 32, 64 ], [ 65, 63 ], [ 63, 65 ],
	[ 100, 48 ], [ 48, 100 ]
];

// Read the unit-lower-trapezoidal L factor (M x minMN): strict-lower from
// storage, unit diagonal, zero above.
function readL( R, m, minMN ) {
	var F = new LogicalMatrix( sc, m, minMN );
	var i;
	var j;
	for ( j = 0; j < minMN; j++ ) {
		for ( i = 0; i < m; i++ ) {
			if ( i > j ) {
				F.set( i, j, R.read( i, j ) );
			} else if ( i === j ) {
				F.set( i, j, sc.one );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// Read the upper-trapezoidal U factor (minMN x N): upper (incl. diagonal) from
// storage, zero below.
function readU( R, minMN, n ) {
	var F = new LogicalMatrix( sc, minMN, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < minMN; i++ ) {
			if ( i <= j ) {
				F.set( i, j, R.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// Read the full factored storage (M x N) for bit-exact layout comparison.
function readFull( R, m, n ) {
	var F = new LogicalMatrix( sc, m, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

// Replay the recorded 0-based row interchanges forward (k = 0..minMN-1: swap
// rows k and IPIV[k]) on a copy of A0, yielding the permuted P*A0 = L*U.
function replaySwaps( A0, IPIV, minMN ) {
	var P = A0.copy();
	var tmp;
	var k;
	var jp;
	var j;
	for ( k = 0; k < minMN; k++ ) {
		jp = IPIV[ k ];
		if ( jp !== k ) {
			for ( j = 0; j < P.cols; j++ ) {
				tmp = P.get( k, j );
				P.set( k, j, P.get( jp, j ) );
				P.set( jp, j, tmp );
			}
		}
	}
	return P;
}

// Steps 2-3-5: reconstruction P*A = L*U across the (M,N) size sweep (square +
// rectangular + 0-dim) and EVERY storage layout. Because the blocked path
// dispatches to the optimized dgemm/dtrsm/dger, cross-storage-order agreement is
// certified HERE at backward-error tolerance (bit-exactness across orders is not
// expected — see the layout-invariance test below and the dgels LEARNINGS entry).
test( 'zgetrf2: P*A = L*U reconstruction (size sweep x all layouts)', function t() {
	var pairs = [];
	SIZES.forEach( function eachN( n ) {
		pairs.push( [ n, n ] );
	});
	RECTS.forEach( function eachR( p ) {
		pairs.push( p );
	});
	pairs.forEach( function eachPair( p ) {
		var m = p[ 0 ];
		var n = p[ 1 ];
		var minMN = Math.min( m, n );
		POSROW.forEach( function eachLayout( layout ) {
			var rng = new RNG( 0x100 + ( m * 100 ) + n ); // reproducible; log on failure
			var A0 = logical.general( sc, rng, m, n );
			var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var IPIV = new Int32Array( Math.max( minMN, 1 ) );
			zgetrf2( m, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], IPIV, 1, 0 );
			if ( minMN === 0 ) {
				return; // nothing to reconstruct
			}
			var L = readL( R, m, minMN );
			var U = readU( R, minMN, n );
			var LU = ref.matmul( sc, L, U );
			var PA0 = replaySwaps( A0, IPIV, minMN );
			checked( 'zgetrf2', 'reconstruct', function run() {
				check.assertReconstruct( sc, LU, PA0, { 'label': 'zgetrf2 m='+m+' n='+n } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz at M=N=40 (exercises blocking). The factored
// storage must be bit-exact across storage layouts WITHIN a single storage-order
// family — fuzzing offset, leading-dim padding, and stride SIGN leaves the
// arithmetic order intact, so any addressing bug surfaces as a bit difference. A
// col<->row storage-order FLIP legitimately reorders the panel's optimized
// dger/dscal (~1e-16 rounding, not a defect), so cross-order agreement is
// verified by the reconstruction property above, not by bit-equality here. See
// the dpotf2/dgels LEARNINGS entries ("optimized inner kernel reorders on
// col<->row flip").
var colLayouts = POSROW.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = POSROW.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zgetrf2: bit-exact within storage-order family (col / row)', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
});

function runInvariance( variants, fam ) {
	var m = 40;
	var n = 40;
	var minMN = 40;
	var SEED = 0xF00D;
	checked( 'zgetrf2', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.general( sc, rng, m, n );
			var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var IPIV = new Int32Array( minMN );
			zgetrf2( m, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], IPIV, 1, 0 );
			return check.flattenLogical( sc, readFull( R, m, n ) );
		}, { 'label': 'zgetrf2 layout invariance '+fam+'-major' } );
	});
}
