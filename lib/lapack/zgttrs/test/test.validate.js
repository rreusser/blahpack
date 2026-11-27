/**
* Property-based validation for zgttrs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `gt` -> general TRIDIAGONAL. The
* factor is THREE strided vectors DL/D/DU plus DU2 (fill, N-2) and IPIV (N); B is
* a dense N x nrhs matrix. Each factor vector is realized independently via
* `schemes.realizeVector`; the FULL logical tridiagonal A0 drives the oracle.
*
* `trs` (LU solve) is validated by RESIDUAL: factor A0 with the sibling zgttrf,
* solve with zgttrs, then check `op(A0)*X = B0` against the ORIGINAL matrix for
* every trans flag — including CONJUGATE-transpose, whose oracle uses conj(A^T).
*
* Layout invariance PRE-FACTORS once, freezes the factor values, then re-realizes
* those fixed vectors at every vector layout (incl. negative strides) with B at
* every dense layout, running ONLY zgttrs (counted loops, no pivot search) —
* bit-exact across all layouts.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgttrs from './../lib/ndarray.js';
import zgttrf from '../../zgttrf/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
const NRHS = [ 1, 2, 3 ];

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
	const DL = [];
	const D = [];
	const DU = [];
	let i;
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
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

function realizeInt( values, layout ) {
	const L = layout || {};
	const stride = ( L.stride === void 0 ) ? 1 : L.stride;
	const lead = ( L.lead === void 0 ) ? 0 : L.lead;
	const tail = ( L.tail === void 0 ) ? 0 : L.tail;
	const n = values.length;
	const span = ( n > 0 ) ? ( n - 1 ) * Math.abs( stride ) : 0;
	const offset = ( stride < 0 ) ? ( lead + span ) : lead;
	const len = lead + span + tail + 1;
	const data = new Int32Array( len ).fill( -999999 );
	let i;
	for ( i = 0; i < n; i++ ) {
		data[ offset + ( i * stride ) ] = values[ i ];
	}
	return { 'data': data, 'stride': stride, 'offset': offset };
}

function factorFrozen( A0, N ) {
	const diags = extractDiags( A0, N );
	const DLr = schemes.realizeVector( sc, diags.DL, { 'stride': 1 } );
	const Dr = schemes.realizeVector( sc, diags.D, { 'stride': 1 } );
	const DUr = schemes.realizeVector( sc, diags.DU, { 'stride': 1 } );
	const DU2r = schemes.realizeVector( sc, new Array( Math.max( N - 2, 0 ) ).fill( sc.zero ), { 'stride': 1 } );
	const ipiv = new Int32Array( N );
	zgttrf( N, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv, 1, 0 );

	const DL = [];
	const D = [];
	const DU = [];
	const DU2 = [];
	const IP = [];
	let i;
	for ( i = 0; i < N - 1; i++ ) { DL.push( DLr.read( i ) ); }
	for ( i = 0; i < N; i++ ) { D.push( Dr.read( i ) ); }
	for ( i = 0; i < N - 1; i++ ) { DU.push( DUr.read( i ) ); }
	for ( i = 0; i < N - 2; i++ ) { DU2.push( DU2r.read( i ) ); }
	for ( i = 0; i < N; i++ ) { IP.push( ipiv[ i ] ); }
	return { 'DL': DL, 'D': D, 'DU': DU, 'DU2': DU2, 'IP': IP };
}

function solveWith( fac, N, nrhs, trans, B0, vl, bl ) {
	const DLr = schemes.realizeVector( sc, fac.DL, vl );
	const Dr = schemes.realizeVector( sc, fac.D, vl );
	const DUr = schemes.realizeVector( sc, fac.DU, vl );
	const DU2r = schemes.realizeVector( sc, fac.DU2, vl );
	const ipiv = realizeInt( fac.IP, vl );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bl );

	zgttrs( trans, N, nrhs, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	const out = new LogicalMatrix( sc, N, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out.set( i, j, Br.read( i, j ) );
		}
	}
	return out;
}

test( 'zgttrs: LU solve residual op(A0)*X=B0 (trans x N x nrhs)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				const rng = new RNG( 0x100 + ( N * 10 ) + nrhs );
				const A0 = logical.tridiagonal( sc, rng, N );
				const B0 = logical.general( sc, rng, N, nrhs );
				const fac = factorFrozen( A0, N );
				const X = solveWith( fac, N, nrhs, trans, B0, { 'stride': 1 }, schemes.dense.layouts()[ 0 ] );
				const code = transCode( trans );
				checked( 'zgttrs', 'residual', function run() {
					let j;
					for ( j = 0; j < nrhs; j++ ) {
						check.assertResidual( sc, A0, logicalCol( X, N, j ), logicalCol( B0, N, j ), {
							'trans': code,
							'factor': 100,
							'label': 'zgttrs '+trans+' N='+N+' nrhs='+nrhs+' col='+j
						});
					}
				});
			});
		});
	});
});

test( 'zgttrs: bit-exact across vector+dense layouts (solve isolated)', function t() {
	const N = 12;
	const nrhs = 3;
	const SEED = 0xBEEF;
	const rng = new RNG( SEED );
	const A0 = logical.tridiagonal( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );
	const fac = factorFrozen( A0, N );
	const vLayouts = schemes.vectorLayouts();
	const dLayouts = schemes.dense.layouts();

	TRANS.forEach( function eachTrans( trans ) {
		checked( 'zgttrs', 'layout-invariance', function run() {
			layoutInvariant( vLayouts, function build( vl, idx ) {
				const bl = dLayouts[ idx % dLayouts.length ];
				const X = solveWith( fac, N, nrhs, trans, B0, vl, bl );
				return check.flattenLogical( sc, X );
			}, { 'label': 'zgttrs '+trans+' layout invariance' } );
		});
	});
});
