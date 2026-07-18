/**
* Property-based validation for dgttrf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gt` -> general TRIDIAGONAL, stored
* as THREE strided vectors DL (sub, N-1), D (diag, N), DU (super, N-1) — plus the
* factor's fill vector DU2 (N-2) and IPIV (N). There is no single-buffer scheme;
* each vector is realized independently via `schemes.realizeVector` (poisoned,
* strided, fuzzable) and the FULL logical tridiagonal A0 drives the oracle.
*
* `trf` (LU factor) is validated by RESIDUAL: factor A0 with dgttrf, then solve
* with the sibling dgttrs, and check `A0*X = B0` against the ORIGINAL matrix. A
* wrong factorization would have to yield an X reproducing B0 through A0, so the
* residual certifies the factor independently of dgttrs's own correctness.
*
* Layout invariance fuzzes the INPUT vector layouts of the FACTOR itself: dgttrf's
* only data-dependent branch is the scalar pivot compare `|d(i)| >= |dl(i)|`
* (element-wise, NOT an idamax over a strided column), so it carries none of the
* getrf negative-first-stride restriction — the factored DL/D/DU/DU2/IPIV are
* bit-exact across ALL vector layouts, incl. negative strides.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgttrf from './../lib/ndarray.js';
import dgttrs from '../../dgttrs/lib/ndarray.js';

const sc = S.real; // d-routine
const BS = sc.floatsPerElem; // B strides are in real-component units (1 real, 2 complex)
const NRHS = [ 1, 2, 3 ];

// Extract the three storage vectors DL/D/DU from a logical tridiagonal matrix.
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

// Column j of a LogicalMatrix as an array of scalar values.
function logicalCol( M, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Realize a poisoned integer pivot buffer at a vector layout (stride may be neg).
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

// Flatten the factored vectors + pivots into a flat numeric-component array for
// bit-exact layout comparison.
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

// Factor A0 (as three fresh vectors at `vl`) and solve A0*X=B0 in place; return
// the realized factor vectors and the solution columns.
function factorSolve( A0, B0, N, nrhs, vl ) {
	const diags = extractDiags( A0, N );
	const DLr = schemes.realizeVector( sc, diags.DL, vl );
	const Dr = schemes.realizeVector( sc, diags.D, vl );
	const DUr = schemes.realizeVector( sc, diags.DU, vl );
	const DU2r = schemes.realizeVector( sc, new Array( Math.max( N - 2, 0 ) ).fill( sc.zero ), vl );
	const ipiv = realizeInt( new Array( N ).fill( 0 ), vl );

	// Copy B0 into a poisoned dense buffer (tight col-major here):
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );

	dgttrf( N, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset );
	dgttrs( 'no-transpose', N, nrhs, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset, Br.data, Br.args[ 0 ] * BS, Br.args[ 1 ] * BS, Br.args[ 2 ] * BS );

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

// Step 2: PROPERTY — factor+solve residual over N x nrhs (N>=1; N=1,2 edges).
test( 'dgttrf: factor+solve residual A0*X=B0 (N x nrhs)', function t() {
	SIZES_SMALL.forEach( function eachN( N ) {
		NRHS.forEach( function eachNrhs( nrhs ) {
			const rng = new RNG( 0x100 + ( N * 10 ) + nrhs );
			const A0 = logical.tridiagonal( sc, rng, N );
			const B0 = logical.general( sc, rng, N, nrhs );
			const res = factorSolve( A0, B0, N, nrhs, { 'stride': 1 } );
			checked( 'dgttrf', 'residual', function run() {
				let j;
				for ( j = 0; j < nrhs; j++ ) {
					check.assertResidual( sc, A0, res.X[ j ], logicalCol( B0, N, j ), {
						'trans': 'n',
						'factor': 100,
						'label': 'dgttrf N='+N+' nrhs='+nrhs+' col='+j
					});
				}
			});
		});
	});
});

// Step 3: LAYOUT INVARIANCE — the factored DL/D/DU/DU2/IPIV must be bit-exact
// across all vector layouts (incl. negative strides). Pivot is a scalar compare,
// so no first-stride restriction applies.
test( 'dgttrf: factor bit-exact across vector layouts', function t() {
	const N = 12;
	const SEED = 0xF00D;
	const rng0 = new RNG( SEED );
	const A0 = logical.tridiagonal( sc, rng0, N );
	const diags = extractDiags( A0, N );

	checked( 'dgttrf', 'layout-invariance', function run() {
		layoutInvariant( schemes.vectorLayouts(), function build( vl ) {
			const DLr = schemes.realizeVector( sc, diags.DL, vl );
			const Dr = schemes.realizeVector( sc, diags.D, vl );
			const DUr = schemes.realizeVector( sc, diags.DU, vl );
			const DU2r = schemes.realizeVector( sc, new Array( Math.max( N - 2, 0 ) ).fill( sc.zero ), vl );
			const ipiv = realizeInt( new Array( N ).fill( 0 ), vl );
			dgttrf( N, DLr.data, DLr.args[ 0 ], DLr.args[ 1 ], Dr.data, Dr.args[ 0 ], Dr.args[ 1 ], DUr.data, DUr.args[ 0 ], DUr.args[ 1 ], DU2r.data, DU2r.args[ 0 ], DU2r.args[ 1 ], ipiv.data, ipiv.stride, ipiv.offset );
			return flatFactor( DLr, Dr, DUr, DU2r, ipiv, N );
		}, { 'label': 'dgttrf factor layout invariance' } );
	});
});
