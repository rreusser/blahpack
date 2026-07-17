/**
* Property-based validation for dgttrs, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gt` -> general TRIDIAGONAL. The
* factor is THREE strided vectors DL/D/DU plus DU2 (fill, N-2) and IPIV (N); B is
* a dense N x nrhs matrix. Each factor vector is realized independently via
* `schemes.realizeVector`; the FULL logical tridiagonal A0 drives the oracle.
*
* `trs` (LU solve) is validated by RESIDUAL: factor A0 with the sibling dgttrf,
* solve with dgttrs, then check `op(A0)*X = B0` against the ORIGINAL matrix for
* every trans flag. Layout invariance PRE-FACTORS once, freezes the factor
* values, then re-realizes those fixed vectors at every vector layout (incl.
* negative strides) with B at every dense layout, running ONLY dgttrs — its inner
* loops are counted (not pointer-bounded) with no pivot search, so the solution is
* bit-exact across all layouts.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgttrs from './../lib/ndarray.js';
import dgttrf from '../../dgttrf/lib/ndarray.js';

var sc = S.real; // d-routine
var BS = sc.floatsPerElem; // B strides are in real-component units (1 real, 2 complex)
var LogicalMatrix = logical.LogicalMatrix;

var TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
var NRHS = [ 1, 2, 3 ];

function transCode( trans ) {
	if ( trans === 'transpose' ) {
		return 't';
	}
	if ( trans === 'conjugate-transpose' ) {
		return 'c';
	}
	return 'n';
}

function extractDiags( A0, N ) {
	var DL = [];
	var D = [];
	var DU = [];
	var i;
	for ( i = 0; i < N; i++ ) {
		D.push( A0.get( i, i ) );
	}
	for ( i = 0; i < N - 1; i++ ) {
		DL.push( A0.get( i + 1, i ) );
		DU.push( A0.get( i, i + 1 ) );
	}
	return { 'DL': DL, 'D': D, 'DU': DU };
}

function logicalCol( M, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

function realizeInt( values, layout ) {
	var L = layout || {};
	var stride = ( L.stride === void 0 ) ? 1 : L.stride;
	var lead = ( L.lead === void 0 ) ? 0 : L.lead;
	var tail = ( L.tail === void 0 ) ? 0 : L.tail;
	var n = values.length;
	var span = ( n > 0 ) ? ( n - 1 ) * Math.abs( stride ) : 0;
	var offset = ( stride < 0 ) ? ( lead + span ) : lead;
	var len = lead + span + tail + 1;
	var data = new Int32Array( len ).fill( -999999 );
	var i;
	for ( i = 0; i < n; i++ ) {
		data[ offset + ( i * stride ) ] = values[ i ];
	}
	return { 'data': data, 'stride': stride, 'offset': offset };
}

// Factor A0 (tight vectors) and return the FROZEN factored vectors + pivots as
// plain arrays (for re-realization at fuzzed layouts).
function factorFrozen( A0, N ) {
	var diags = extractDiags( A0, N );
	var DLr = schemes.realizeVector( sc, diags.DL, { 'stride': 1 } );
	var Dr = schemes.realizeVector( sc, diags.D, { 'stride': 1 } );
	var DUr = schemes.realizeVector( sc, diags.DU, { 'stride': 1 } );
	var DU2r = schemes.realizeVector( sc, new Array( Math.max( N - 2, 0 ) ).fill( sc.zero ), { 'stride': 1 } );
	var ipiv = new Int32Array( N );
	dgttrf( N, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv, 1, 0 );

	var DL = [];
	var D = [];
	var DU = [];
	var DU2 = [];
	var IP = [];
	var i;
	for ( i = 0; i < N - 1; i++ ) { DL.push( DLr.read( i ) ); }
	for ( i = 0; i < N; i++ ) { D.push( Dr.read( i ) ); }
	for ( i = 0; i < N - 1; i++ ) { DU.push( DUr.read( i ) ); }
	for ( i = 0; i < N - 2; i++ ) { DU2.push( DU2r.read( i ) ); }
	for ( i = 0; i < N; i++ ) { IP.push( ipiv[ i ] ); }
	return { 'DL': DL, 'D': D, 'DU': DU, 'DU2': DU2, 'IP': IP };
}

// Solve op(A)X=B with a frozen factor realized at vector layout `vl` and B at
// dense layout `bl`; return the solution columns.
function solveWith( fac, N, nrhs, trans, B0, vl, bl ) {
	var DLr = schemes.realizeVector( sc, fac.DL, vl );
	var Dr = schemes.realizeVector( sc, fac.D, vl );
	var DUr = schemes.realizeVector( sc, fac.DU, vl );
	var DU2r = schemes.realizeVector( sc, fac.DU2, vl );
	var ipiv = realizeInt( fac.IP, vl );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bl );

	dgttrs( trans, N, nrhs, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset, Br.data, Br.args[ 0 ] * BS, Br.args[ 1 ] * BS, Br.args[ 2 ] * BS );

	var out = new LogicalMatrix( sc, N, nrhs );
	var i;
	var j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out.set( i, j, Br.read( i, j ) );
		}
	}
	return out;
}

// Step 2: PROPERTY — solve residual over trans x N x nrhs (N>=1; N=1,2 edges).
test( 'dgttrs: LU solve residual op(A0)*X=B0 (trans x N x nrhs)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				var rng = new RNG( 0x100 + ( N * 10 ) + nrhs );
				var A0 = logical.tridiagonal( sc, rng, N );
				var B0 = logical.general( sc, rng, N, nrhs );
				var fac = factorFrozen( A0, N );
				var X = solveWith( fac, N, nrhs, trans, B0, { 'stride': 1 }, schemes.dense.layouts()[ 0 ] );
				var code = transCode( trans );
				checked( 'dgttrs', 'residual', function run() {
					var j;
					for ( j = 0; j < nrhs; j++ ) {
						check.assertResidual( sc, A0, logicalCol( X, N, j ), logicalCol( B0, N, j ), {
							'trans': code,
							'factor': 100,
							'label': 'dgttrs '+trans+' N='+N+' nrhs='+nrhs+' col='+j
						});
					}
				});
			});
		});
	});
});

// Step 3: LAYOUT INVARIANCE — solve isolated from factor. Factor ONCE, freeze,
// then re-realize the fixed factor vectors at every vector layout (incl. negative
// strides) with B at the matching dense layout; run only dgttrs. Bit-exact.
test( 'dgttrs: bit-exact across vector+dense layouts (solve isolated)', function t() {
	var N = 12;
	var nrhs = 3;
	var SEED = 0xBEEF;
	var rng = new RNG( SEED );
	var A0 = logical.tridiagonal( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );
	var fac = factorFrozen( A0, N );
	var vLayouts = schemes.vectorLayouts();
	var dLayouts = schemes.dense.layouts();

	TRANS.forEach( function eachTrans( trans ) {
		checked( 'dgttrs', 'layout-invariance', function run() {
			layoutInvariant( vLayouts, function build( vl, idx ) {
				var bl = dLayouts[ idx % dLayouts.length ];
				var X = solveWith( fac, N, nrhs, trans, B0, vl, bl );
				return check.flattenLogical( sc, X );
			}, { 'label': 'dgttrs '+trans+' layout invariance' } );
		});
	});
});
