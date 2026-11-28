#!/usr/bin/env node

// Microbenchmarks for the leaf-node BLAS/LAPACK functions that dominate
// the zggev workload. Tests at workload-relevant sizes and parameter
// combinations, reports throughput in GFLOPS and µs/call.
//
// Usage:
//   node bench/bench-blas.js
//   node bench/bench-blas.js --only zgemm
//   node bench/bench-blas.js --only zrot
//   node bench/bench-blas.js --target-ms 20     (quick pass)

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemm from '../lib/blas/zgemm/lib/strided.js';
import ztrmm from '../lib/blas/ztrmm/lib/strided.js';
import zgemv from '../lib/blas/zgemv/lib/strided.js';
import zrot from '../lib/lapack/zrot/lib/strided.js';

// The tables below use LAPACK's single-letter flags; these are the names the
// library takes.
var TRANS = { 'N': 'no-transpose', 'C': 'conjugate-transpose' };
var SIDE = { 'L': 'left', 'R': 'right' };
var UPLO = { 'U': 'upper', 'L': 'lower' };
var DIAG = { 'U': 'unit', 'N': 'non-unit' };

var CONE = new Complex128( 1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );

var ONLY = null;
var TARGET_MS = 1000;
var argv = process.argv.slice( 2 );
for ( var i = 0; i < argv.length; i++ ) {
	if ( argv[ i ] === '--only' && argv[ i + 1 ] ) {
		ONLY = argv[ i + 1 ];
		i += 1;
	} else if ( argv[ i ] === '--target-ms' && argv[ i + 1 ] ) {
		TARGET_MS = parseInt( argv[ i + 1 ], 10 );
		i += 1;
	}
}

// HELPERS //

function fillRandom( arr ) {
	var view = new Float64Array( arr.buffer );
	for ( var j = 0; j < view.length; j++ ) {
		view[ j ] = ( 2.0 * Math.random() ) - 1.0;
	}
	return arr;
}

function bench( label, fn, flopsPerCall, targetMs ) {
	targetMs = targetMs || TARGET_MS;

	// Calibrate
	var t0 = performance.now();
	fn();
	var calMs = performance.now() - t0;
	var iters = Math.max( 5, Math.min( 100000, Math.ceil( targetMs / calMs ) ) );

	// Warmup
	for ( var w = 0; w < Math.min( iters, 20 ); w++ ) {
		fn();
	}

	// Measure
	t0 = performance.now();
	for ( var k = 0; k < iters; k++ ) {
		fn();
	}
	var elapsed = performance.now() - t0;
	var usPerCall = ( elapsed * 1000 ) / iters;
	var gflops = ( flopsPerCall * iters ) / ( elapsed * 1e6 );

	console.log(
		'  ' + label.padEnd( 48 ) +
		usPerCall.toFixed( 1 ).padStart( 10 ) + ' us/call' +
		gflops.toFixed( 2 ).padStart( 8 ) + ' GFLOPS'
	);
}

// ================================================================
// ZGEMM: C = alpha*op(A)*op(B) + beta*C
// Workload: trans C/N and N/C, K=32, M=4..100, N=4..100
// FLOPS: 8*M*N*K per call
// ================================================================
function benchZgemm() {
	console.log( '' );
	console.log( '=' .repeat( 76 ) );
	console.log( '  ZGEMM — complex matrix-matrix multiply' );
	console.log( '  Workload profile: trans=C/N, K=32, M,N=4..100' );
	console.log( '=' .repeat( 76 ) );
	console.log( '' );

	var sizes = [
		// [transA, transB, M, N, K] — from zggev workload
		[ 'C', 'N', 32, 32, 32 ],
		[ 'C', 'N', 68, 32, 68 ],
		[ 'C', 'N', 100, 32, 68 ],
		[ 'C', 'N', 100, 32, 100 ],
		[ 'N', 'C', 68, 68, 32 ],
		[ 'N', 'C', 68, 100, 32 ],
		[ 'N', 'C', 100, 100, 32 ],
		// Larger sizes for scaling analysis
		[ 'N', 'N', 100, 100, 100 ],
		[ 'N', 'N', 200, 200, 200 ],
		[ 'C', 'N', 200, 32, 200 ],
	];

	for ( var i = 0; i < sizes.length; i++ ) {
		var ta = sizes[ i ][ 0 ];
		var tb = sizes[ i ][ 1 ];
		var M = sizes[ i ][ 2 ];
		var N = sizes[ i ][ 3 ];
		var K = sizes[ i ][ 4 ];

		var rowsA = ( ta === 'N' ) ? M : K;
		var colsA = ( ta === 'N' ) ? K : M;
		var rowsB = ( tb === 'N' ) ? K : N;
		var colsB = ( tb === 'N' ) ? N : K;

		var A = fillRandom( new Complex128Array( rowsA * colsA ) );
		var B = fillRandom( new Complex128Array( rowsB * colsB ) );
		var C = fillRandom( new Complex128Array( M * N ) );
		var flops = 8 * M * N * K;

		var label = ta + '/' + tb + ' M=' + M + ',N=' + N + ',K=' + K +
			' (' + ( flops / 1e6 ).toFixed( 1 ) + 'M flops)';

		bench( label, ( function closure( ta_, tb_, M_, N_, K_, A_, B_, C_ ) {
			return function callGemm() {
				zgemm( TRANS[ ta_ ], TRANS[ tb_ ], M_, N_, K_, CONE,
					A_, 1, ( ta_ === 'N' ) ? M_ : K_, 0,
					B_, 1, ( tb_ === 'N' ) ? K_ : N_, 0,
					CZERO, C_, 1, M_, 0 );
			};
		})( ta, tb, M, N, K, A, B, C ), flops );
	}
}

// ================================================================
// ZTRMM: B = alpha * B * op(A) (side='R')
// Workload: side=R, various uplo/trans/diag, N=32, M=4..100
// FLOPS: ~4*M*N*N per call
// ================================================================
function benchZtrmm() {
	console.log( '' );
	console.log( '=' .repeat( 76 ) );
	console.log( '  ZTRMM — complex triangular matrix-matrix multiply' );
	console.log( '  Workload profile: side=R, N=32, M=4..100' );
	console.log( '=' .repeat( 76 ) );
	console.log( '' );

	var configs = [
		// [side, uplo, trans, diag, M, N] — from zggev workload
		[ 'R', 'L', 'N', 'U', 32, 32 ],
		[ 'R', 'L', 'N', 'U', 68, 32 ],
		[ 'R', 'L', 'N', 'U', 100, 32 ],
		[ 'R', 'L', 'C', 'U', 100, 32 ],
		[ 'R', 'U', 'N', 'N', 100, 32 ],
		// Larger sizes
		[ 'R', 'L', 'N', 'U', 200, 32 ],
		[ 'R', 'L', 'N', 'U', 100, 100 ],
		[ 'L', 'L', 'N', 'U', 100, 100 ],
	];

	for ( var i = 0; i < configs.length; i++ ) {
		var side = configs[ i ][ 0 ];
		var uplo = configs[ i ][ 1 ];
		var trans = configs[ i ][ 2 ];
		var diag = configs[ i ][ 3 ];
		var M = configs[ i ][ 4 ];
		var N = configs[ i ][ 5 ];

		var Asize = ( side === 'L' ) ? M : N;
		var A = fillRandom( new Complex128Array( Asize * Asize ) );
		var B = fillRandom( new Complex128Array( M * N ) );
		var flops = 4 * M * N * N; // approximate

		var label = side + '/' + uplo + '/' + trans + '/' + diag +
			' M=' + M + ',N=' + N +
			' (' + ( flops / 1e6 ).toFixed( 1 ) + 'M flops)';

		bench( label, ( function closure( side_, uplo_, trans_, diag_, M_, N_, A_, B_ ) {
			return function callTrmm() {
				ztrmm( SIDE[ side_ ], UPLO[ uplo_ ], TRANS[ trans_ ], DIAG[ diag_ ], M_, N_, CONE,
					A_, 1, Asize, 0,
					B_, 1, M_, 0 );
			};
		})( side, uplo, trans, diag, M, N, A, B ), flops );
	}
}

// ================================================================
// ZGEMV: y = alpha*op(A)*x + beta*y
// Workload: trans=C, M varies widely, N=0..31
// FLOPS: 8*M*N per call
// ================================================================
function benchZgemv() {
	console.log( '' );
	console.log( '=' .repeat( 76 ) );
	console.log( '  ZGEMV — complex matrix-vector multiply' );
	console.log( '  Workload profile: trans=C, M=20..99, N=0..31' );
	console.log( '=' .repeat( 76 ) );
	console.log( '' );

	var configs = [
		// [trans, M, N] — from zggev workload (ztgevc)
		[ 'C', 50, 15 ],
		[ 'C', 84, 15 ],
		[ 'C', 68, 31 ],
		[ 'C', 99, 1 ],
		[ 'C', 95, 4 ],
		[ 'C', 80, 19 ],
		// trans=N for comparison
		[ 'N', 84, 15 ],
		[ 'N', 68, 31 ],
		// Larger sizes
		[ 'C', 200, 50 ],
		[ 'N', 200, 200 ],
		[ 'C', 500, 100 ],
	];

	for ( var i = 0; i < configs.length; i++ ) {
		var trans = configs[ i ][ 0 ];
		var M = configs[ i ][ 1 ];
		var N = configs[ i ][ 2 ];

		var A = fillRandom( new Complex128Array( M * N ) );
		var xLen = ( trans === 'N' ) ? N : M;
		var yLen = ( trans === 'N' ) ? M : N;
		var x = fillRandom( new Complex128Array( xLen ) );
		var y = fillRandom( new Complex128Array( yLen ) );
		var flops = 8 * M * N;

		var label = trans + ' M=' + M + ',N=' + N +
			' (' + ( flops / 1e3 ).toFixed( 0 ) + 'K flops)';

		bench( label, ( function closure( trans_, M_, N_, A_, x_, y_ ) {
			return function callGemv() {
				zgemv( TRANS[ trans_ ], M_, N_, CONE, A_, 1, M_, 0,
					x_, 1, 0, CZERO, y_, 1, 0 );
			};
		})( trans, M, N, A, x, y ), flops );
	}
}

// ================================================================
// ZROT: apply Givens rotation to vector pair
// Workload: N=5..100, 29K calls at N=100
// FLOPS: 12*N per call (6 flops per element, 2 elements per pair)
// ================================================================
function benchZrot() {
	console.log( '' );
	console.log( '=' .repeat( 76 ) );
	console.log( '  ZROT — complex Givens rotation' );
	console.log( '  Workload profile: N=5..100, 29K calls per zggev(100)' );
	console.log( '=' .repeat( 76 ) );
	console.log( '' );

	var sizes = [ 5, 10, 20, 50, 100, 200, 500 ];
	var s = new Complex128( 0.48, 0.64 );
	var c = 0.6;

	for ( var i = 0; i < sizes.length; i++ ) {
		var N = sizes[ i ];
		var cx = fillRandom( new Complex128Array( N ) );
		var cy = fillRandom( new Complex128Array( N ) );
		var flops = 12 * N;

		// Same array (common case in workload: H with different offsets)
		var label = 'N=' + N + ', cx===cy (same array, diff offsets)';
		var big = fillRandom( new Complex128Array( 2 * N ) );
		bench( label, ( function closure( N_, big_, c_, s_ ) {
			return function callRotSame() {
				zrot( N_, big_, 1, 0, big_, 1, N_, c_, s_ );
			};
		})( N, big, c, s ), flops );

		// Different arrays
		label = 'N=' + N + ', cx!==cy (different arrays)';
		bench( label, ( function closure( N_, cx_, cy_, c_, s_ ) {
			return function callRotDiff() {
				zrot( N_, cx_, 1, 0, cy_, 1, 0, c_, s_ );
			};
		})( N, cx, cy, c, s ), flops );
	}

	// Call overhead test
	console.log( '' );
	var tiny = fillRandom( new Complex128Array( 4 ) );
	bench( 'N=1 (measures call overhead)', ( function closure( tiny_, c_, s_ ) {
		return function callRotOverhead() {
			zrot( 1, tiny_, 1, 0, tiny_, 1, 1, c_, s_ );
		};
	})( tiny, c, s ), 12 );
}

// MAIN //

console.log( '' );
console.log( '=' .repeat( 76 ) );
console.log( '  BLAS/LAPACK LEAF-NODE BENCHMARKS' );
console.log( '  Sizes matched to zggev(N=100) workload profile' );
console.log( '=' .repeat( 76 ) );

if ( !ONLY || ONLY === 'zgemm' ) benchZgemm();
if ( !ONLY || ONLY === 'ztrmm' ) benchZtrmm();
if ( !ONLY || ONLY === 'zgemv' ) benchZgemv();
if ( !ONLY || ONLY === 'zrot' ) benchZrot();

console.log( '' );
