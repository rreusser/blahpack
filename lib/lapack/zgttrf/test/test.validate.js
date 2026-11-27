/**
* Property-based validation for zgttrf, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `gt` -> general TRIDIAGONAL,
* stored as THREE strided vectors DL (sub, N-1), D (diag, N), DU (super, N-1) —
* plus the factor's fill vector DU2 (N-2) and IPIV (N). No single-buffer scheme;
* each vector is realized independently via `schemes.realizeVector` (poisoned,
* strided, fuzzable) and the FULL logical tridiagonal A0 drives the oracle.
*
* `trf` (LU factor) is validated by RESIDUAL: factor A0 with zgttrf, then solve
* with the sibling zgttrs, and check `A0*X = B0` against the ORIGINAL matrix.
*
* Layout invariance fuzzes the INPUT vector layouts of the FACTOR itself: zgttrf's
* only data-dependent branch is the scalar pivot compare `cabs1(d) >= cabs1(dl)`
* (element-wise, NOT an idamax over a strided column), so the factored
* DL/D/DU/DU2/IPIV are bit-exact across ALL vector layouts, incl. negative strides.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgttrf from './../lib/ndarray.js';
import zgttrs from '../../zgttrs/lib/ndarray.js';

const sc = S.complex; // z-routine
const NRHS = [ 1, 2, 3 ];

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

function flatFactor( DLr, Dr, DUr, DU2r, ipiv, N ) {
	const out = [];
	let c, k, i;
	for ( i = 0; i < N - 1; i++ ) {
		c = sc.components( DLr.read( i ) );
		for ( k = 0; k < c.length; k++ ) { out.push( c[ k ] ); }
	}
	for ( i = 0; i < N; i++ ) {
		c = sc.components( Dr.read( i ) );
		for ( k = 0; k < c.length; k++ ) { out.push( c[ k ] ); }
	}
	for ( i = 0; i < N - 1; i++ ) {
		c = sc.components( DUr.read( i ) );
		for ( k = 0; k < c.length; k++ ) { out.push( c[ k ] ); }
	}
	for ( i = 0; i < N - 2; i++ ) {
		c = sc.components( DU2r.read( i ) );
		for ( k = 0; k < c.length; k++ ) { out.push( c[ k ] ); }
	}
	for ( i = 0; i < N; i++ ) {
		out.push( ipiv.data[ ipiv.offset + ( i * ipiv.stride ) ] );
	}
	return out;
}

function factorSolve( A0, B0, N, nrhs, vl ) {
	const diags = extractDiags( A0, N );
	const DLr = schemes.realizeVector( sc, diags.DL, vl );
	const Dr = schemes.realizeVector( sc, diags.D, vl );
	const DUr = schemes.realizeVector( sc, diags.DU, vl );
	const DU2r = schemes.realizeVector( sc, new Array( Math.max( N - 2, 0 ) ).fill( sc.zero ), vl );
	const ipiv = realizeInt( new Array( N ).fill( 0 ), vl );

	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );

	zgttrf( N, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset );
	zgttrs( 'no-transpose', N, nrhs, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	const X = [];
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		const col = [];
		for ( i = 0; i < N; i++ ) {
			col.push( Br.read( i, j ) );
		}
		X.push( col );
	}
	return { 'DLr': DLr, 'Dr': Dr, 'DUr': DUr, 'DU2r': DU2r, 'ipiv': ipiv, 'X': X };
}

test( 'zgttrf: factor+solve residual A0*X=B0 (N x nrhs)', function t() {
	SIZES_SMALL.forEach( function eachN( N ) {
		NRHS.forEach( function eachNrhs( nrhs ) {
			const rng = new RNG( 0x100 + ( N * 10 ) + nrhs );
			const A0 = logical.tridiagonal( sc, rng, N );
			const B0 = logical.general( sc, rng, N, nrhs );
			const res = factorSolve( A0, B0, N, nrhs, { 'stride': 1 } );
			checked( 'zgttrf', 'residual', function run() {
				let j;
				for ( j = 0; j < nrhs; j++ ) {
					check.assertResidual( sc, A0, res.X[ j ], logicalCol( B0, N, j ), {
						'trans': 'n',
						'factor': 100,
						'label': 'zgttrf N='+N+' nrhs='+nrhs+' col='+j
					});
				}
			});
		});
	});
});

test( 'zgttrf: factor bit-exact across vector layouts', function t() {
	const N = 12;
	const SEED = 0xF00D;
	const rng0 = new RNG( SEED );
	const A0 = logical.tridiagonal( sc, rng0, N );
	const diags = extractDiags( A0, N );

	checked( 'zgttrf', 'layout-invariance', function run() {
		layoutInvariant( schemes.vectorLayouts(), function build( vl ) {
			const DLr = schemes.realizeVector( sc, diags.DL, vl );
			const Dr = schemes.realizeVector( sc, diags.D, vl );
			const DUr = schemes.realizeVector( sc, diags.DU, vl );
			const DU2r = schemes.realizeVector( sc, new Array( Math.max( N - 2, 0 ) ).fill( sc.zero ), vl );
			const ipiv = realizeInt( new Array( N ).fill( 0 ), vl );
			zgttrf( N, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset );
			return flatFactor( DLr, Dr, DUr, DU2r, ipiv, N );
		}, { 'label': 'zgttrf factor layout invariance' } );
	});
});
