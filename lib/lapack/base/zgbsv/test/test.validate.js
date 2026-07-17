/**
* Property-based validation for zgbsv, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gb` -> GENERAL BANDED (schemes.banded
* with sub/super-bandwidths kl/ku, logical.banded); `sv` (banded LU linear-solve
* DRIVER: factor + solve in one call) -> RESIDUAL. zgbsv factors A by LU with partial
* pivoting (zgbtrf) and solves A*X = B in place (AB <- LU, B <- X, IPIV <- pivots). We
* check `A0*X = B0` against the ORIGINAL band matrix A0, independent of the
* factorization the driver produced: a wrong factorization would still have to yield
* an X that reproduces B0 through A0.
*
* Input is realized with `schemes.banded {kl,ku,luFill}` — ldab = 2*kl+ku+1, the top
* KL fill rows NaN-poisoned on entry (LAPACK: "need not be set"), filled by the
* factor. A0 is a.s. well-posed (banded Gaussian entries).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgbsv from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var NS = [ 2, 3, 5, 8, 16, 17, 33 ];
var NRHS = [ 1, 2, 3 ];

// (kl,ku) pairs clamped to [0,N-1], deduped: diagonal-only, tridiagonal, an
// asymmetric band, and a full-lower / no-upper band.
function bands( N ) {
	var hi = Math.max( 0, N - 1 );
	var raw = [ [ 0, 0 ], [ 1, 1 ], [ 2, 3 ], [ hi, 0 ] ];
	var seen = {};
	var out = [];
	raw.forEach( function each( p ) {
		var kl = Math.min( p[ 0 ], hi );
		var ku = Math.min( p[ 1 ], hi );
		var key = kl + ':' + ku;
		if ( !seen[ key ] ) {
			seen[ key ] = true;
			out.push( [ kl, ku ] );
		}
	});
	return out;
}

// Column j of physical B storage as an array of scalar values.
function readCol( R, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

// Column j of a LogicalMatrix as an array of scalar values.
function logicalCol( M, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Read the full N x nrhs solution back into a LogicalMatrix (bit-exact compare).
function readB( R, n, nrhs ) {
	var X = new LogicalMatrix( sc, n, nrhs );
	var i;
	var j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// Positive-first-dimension-stride banded layouts only: zgbsv -> zgbtrf's inner
// idamax pivot search walks the band-array first dimension and is out of contract
// for a negative first-dim stride (see LEARNINGS.md getrf/getf2 family).
var BANDED_POS = schemes.banded.layouts().filter( function pos( L ) {
	return L.sgn1 !== -1;
});

// Steps 2-3-5: residual property across (kl,ku) x N x nrhs. Factor+solve in one
// zgbsv call at a tight positive-sgn1 layout, then verify A0*X = B0 per RHS column
// against the ORIGINAL band matrix.
test( 'zgbsv: banded LU solve residual ((kl,ku) x N x nrhs)', function t() {
	NS.forEach( function eachN( N ) {
		bands( N ).forEach( function eachBand( b ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runResidual( N, b[ 0 ], b[ 1 ], nrhs );
			});
		});
	});
});

function runResidual( N, kl, ku, nrhs ) {
	var rng = new RNG( 0x3000 + ( N * 1000 ) + ( kl * 100 ) + ( ku * 10 ) + nrhs );
	var A0 = logical.banded( sc, rng, N, N, kl, ku );
	var B0 = logical.general( sc, rng, N, nrhs );

	var Ar = schemes.banded.realize( sc, A0.copy(), { 'kl': kl, 'ku': ku, 'luFill': true }, BANDED_POS[ 0 ] );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	var ipiv = new Int32Array( N );

	zgbsv( N, kl, ku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'zgbsv', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zgbsv N='+N+' kl='+kl+' ku='+ku+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz. zgbsv factors AB in place, so its output depends
// on the arithmetic order of the inner zgbtrf kernels (optimized dgemv/dger/dtbsv).
// A col<->row FLIP of EITHER operand legitimately reorders those inner loops (~1 ULP)
// while the residual A0*X=B0 still holds, so bit-exactness only holds WITHIN a single
// storage-order family for BOTH AB and B; cross-order agreement is certified by the
// residual property above. AB uses positive-sgn1 layouts (idamax pivot search); the
// family split keeps offset, leading-dim padding, gaps, and negative COLUMN/ROW
// strides within each order — the real addressing-bug detectors.
function byOrder( layouts, order ) {
	return layouts.filter( function pick( L ) {
		return ( order === 'row' ) === ( L.order === 'row' );
	});
}
var AB_COL = byOrder( BANDED_POS, 'col' );
var AB_ROW = byOrder( BANDED_POS, 'row' );
var B_COL = byOrder( schemes.dense.layouts(), 'col' );
var B_ROW = byOrder( schemes.dense.layouts(), 'row' );

test( 'zgbsv: bit-exact within a single storage-order family for AB and B (col / row)', function t() {
	runInvariance( AB_COL, B_COL, 'col' );
	runInvariance( AB_ROW, B_ROW, 'row' );
});

function runInvariance( abFamily, bFamily, fam ) {
	var N = 11;
	var kl = 2;
	var ku = 3;
	var nrhs = 3;
	var SEED = 0xF00D;

	// Pair AB- and B-layouts (each cycled within its own same-order family) so both
	// operands stay in one storage order while offset/pad/gap/stride-sign vary.
	var n = Math.max( abFamily.length, bFamily.length );
	var variants = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		variants.push({
			'a': abFamily[ i % abFamily.length ],
			'b': bFamily[ i % bFamily.length ]
		});
	}

	checked( 'zgbsv', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( v ) {
			var rng = new RNG( SEED ); // identical operand values every variant
			var A0 = logical.banded( sc, rng, N, N, kl, ku );
			var B0 = logical.general( sc, rng, N, nrhs );
			var Ar = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku, 'luFill': true }, v.a );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, v.b );
			var ipiv = new Int32Array( N );
			zgbsv( N, kl, ku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zgbsv '+fam+'-major layout invariance' } );
	});
}
