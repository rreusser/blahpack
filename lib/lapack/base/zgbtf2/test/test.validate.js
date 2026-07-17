/**
* Property-based validation for zgbtf2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `gb` -> general BANDED
* (schemes.banded with kl/ku + `luFill`, logical.banded); `tf2` (unblocked LU
* factorization with partial pivoting) -> because reconstruction from the LU
* fill storage (KL extra rows on top, top rows NaN-poisoned) is messy, we
* validate via FACTOR + SOLVE RESIDUAL: factor with zgbtf2, solve with the
* already-validated zgbtrs, then assert `A0*X = B0` per RHS column against the
* ORIGINAL band matrix A0 (full logical, both zero and band entries). A wrong
* factorization would still have to produce an X that reproduces B0 through A0.
*
* Pivoting caveat: zgbtf2 does an `izamax` PIVOT SEARCH over a band sub-column,
* which walks the band array's FIRST dimension. A negative band-row stride
* (sgn1 = -1) is out of contract for the whole pivoting family (izamax returns
* -1 -> IPIV=-1 -> out-of-bounds reads; see LEARNINGS.md getrf/getf2 entry), so
* every layout sweep is restricted to positive band-row stride.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgbtf2 from './../lib/ndarray.js';
import zgbtrs from '../../zgbtrs/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var NS = [ 2, 3, 5, 8, 16, 17, 33 ];
var NRHS = [ 1, 2, 3 ];

var POSROW = schemes.banded.layouts().filter( function posRow( L ) {
	return L.sgn1 !== -1;
});

function bandPairs( n ) {
	var hi = Math.max( 0, n - 1 );
	var raw = [ [ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 2, 3 ], [ 2, 2 ], [ hi, 0 ], [ 0, hi ] ];
	var seen = {};
	var out = [];
	raw.forEach( function each( p ) {
		var kl = Math.min( p[ 0 ], hi );
		var ku = Math.min( p[ 1 ], hi );
		var key = kl+','+ku;
		if ( !seen[ key ] ) {
			seen[ key ] = 1;
			out.push( [ kl, ku ] );
		}
	});
	return out;
}

function readCol( R, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

function logicalCol( M, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

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

// Steps 2-3-5: factor+solve residual A0*X = B0 across N x (kl,ku) x nrhs.
test( 'zgbtf2: banded LU factor+solve residual (N x (kl,ku) x nrhs)', function t() {
	NS.forEach( function eachN( N ) {
		bandPairs( N ).forEach( function eachBand( band ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runResidual( N, band[ 0 ], band[ 1 ], nrhs );
			});
		});
	});
});

function runResidual( N, kl, ku, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 100 ) + ( kl * 10 ) + ku ); // reproducible; log on failure
	var A0 = logical.banded( sc, rng, N, N, kl, ku );
	var B0 = logical.general( sc, rng, N, nrhs );

	var Ar = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku, 'luFill': true }, POSROW[ 0 ] );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	var ipiv = new Int32Array( N );

	zgbtf2( N, N, kl, ku, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0 );
	zgbtrs( 'no-transpose', N, kl, ku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'zgbtf2', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zgbtf2 N='+N+' kl='+kl+' ku='+ku+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz (col / row storage-order families; see the
// dgbtf2 sibling for the rationale).
var colBand = POSROW.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowBand = POSROW.filter( function isRow( L ) {
	return L.order === 'row';
});
var colDense = schemes.dense.layouts().filter( function cd( L ) {
	return L.sgn1 !== -1 && L.order !== 'row';
});
var rowDense = schemes.dense.layouts().filter( function rd( L ) {
	return L.sgn1 !== -1 && L.order === 'row';
});

test( 'zgbtf2: solution bit-exact within storage-order family (col / row)', function t() {
	runInvariance( 'col', colBand, colDense );
	runInvariance( 'row', rowBand, rowDense );
});

function runInvariance( fam, bandLayouts, denseLayouts ) {
	var N = 11;
	var kl = 2;
	var ku = 3;
	var nrhs = 2;
	var SEED = 0xF00D;

	checked( 'zgbtf2', 'layout-invariance', function run() {
		layoutInvariant( bandLayouts, function build( aL, idx ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.banded( sc, rng, N, N, kl, ku );
			var B0 = logical.general( sc, rng, N, nrhs );
			var Ar = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku, 'luFill': true }, aL );
			var bL = denseLayouts[ idx % denseLayouts.length ];
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bL );
			var ipiv = new Int32Array( N );
			zgbtf2( N, N, kl, ku, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0 );
			zgbtrs( 'no-transpose', N, kl, ku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zgbtf2 '+fam+'-major layout invariance' } );
	});
}
