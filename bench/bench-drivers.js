#!/usr/bin/env node
// Profiling benchmarks for LAPACK driver routines:
//   zgesv  — complex linear solve (A*x = B)
//   zgesvd — complex SVD
//   dgels  — real least-squares solve
//
// For each driver, shows subroutine-level profiling at multiple sizes.
//
// Usage:
//   node bench/bench-drivers.js
//   node bench/bench-drivers.js --only zgesv
//   node bench/bench-drivers.js --sizes 50,100,200

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import instrument from './instrument.js';

// Install BEFORE loading any LAPACK modules
instrument.install();

const { default: zgesv } = await import( '../lib/lapack/base/zgesv/lib/ndarray.js' );
const { default: zgesvd } = await import( '../lib/lapack/base/zgesvd/lib/ndarray.js' );

// zgesvd's job flags, by the single-letter names this script reports.
var JOB = { 'A': 'all-columns', 'N': 'none' };
var JOBVT = { 'A': 'all-rows', 'N': 'none' };

var ONLY = null;
var SIZES = [ 50, 100, 200 ];
var TARGET_MS = 2000;
var argv = process.argv.slice( 2 );
var i;

for ( i = 0; i < argv.length; i++ ) {
	if ( argv[ i ] === '--only' && argv[ i + 1 ] ) {
		ONLY = argv[ i + 1 ];
		i += 1;
	} else if ( argv[ i ] === '--sizes' && argv[ i + 1 ] ) {
		SIZES = argv[ i + 1 ].split( ',' ).map( Number );
		i += 1;
	} else if ( argv[ i ] === '--target-ms' && argv[ i + 1 ] ) {
		TARGET_MS = parseInt( argv[ i + 1 ], 10 );
		i += 1;
	}
}

// HELPERS //

function fillRandomComplex( arr ) {
	var view = new Float64Array( arr.buffer );
	for ( var j = 0; j < view.length; j++ ) {
		view[ j ] = ( 2.0 * Math.random() ) - 1.0;
	}
	return arr;
}

function fillRandomReal( arr ) {
	for ( var j = 0; j < arr.length; j++ ) {
		arr[ j ] = ( 2.0 * Math.random() ) - 1.0;
	}
	return arr;
}

function makeDiagDominantComplex( arr, n ) {
	var view = new Float64Array( arr.buffer );
	for ( var j = 0; j < n; j++ ) {
		view[ 2 * ( j * n + j ) ] += n * 2.0;
	}
	return arr;
}

function makeDiagDominantReal( arr, n, lda ) {
	for ( var j = 0; j < n; j++ ) {
		arr[ j + j * lda ] += n * 2.0;
	}
	return arr;
}

function calibrate( fn ) {
	var t0 = performance.now();
	fn();
	var ms = performance.now() - t0;
	return Math.max( 3, Math.min( 200, Math.ceil( TARGET_MS / ms ) ) );
}

function runProfile( label, fn, iters ) {
	instrument.reset();

	var t0 = performance.now();
	for ( var k = 0; k < iters; k++ ) {
		fn();
	}
	var totalMs = performance.now() - t0;

	console.log( '' );
	console.log( '-'.repeat( 80 ) );
	console.log( '  ' + label + '  |  ' + iters + ' iters  |  ' +
		( totalMs / iters ).toFixed( 1 ) + ' ms/call' );
	console.log( '-'.repeat( 80 ) );

	instrument.printReport( totalMs, { minPercent: 1.0 } );
	instrument.printCallTree( label.split( ' ' )[ 0 ].toLowerCase(), {
		maxDepth: 3, minPercent: 2.0
	});

	return { totalMs: totalMs, msPerCall: totalMs / iters };
}

// ================================================================
// ZGESV: solve A*X = B via LU factorization
// ================================================================
function benchZgesv() {
	console.log( '' );
	console.log( '=' .repeat( 80 ) );
	console.log( '  ZGESV — complex linear solve (LU factorization)' );
	console.log( '=' .repeat( 80 ) );

	var results = [];

	// Warmup
	( function warmup() {
		var N = 20;
		var A = makeDiagDominantComplex( fillRandomComplex( new Complex128Array( N * N ) ), N );
		var B = fillRandomComplex( new Complex128Array( N ) );
		var IPIV = new Int32Array( N );
		zgesv( N, 1, A, 1, N, 0, IPIV, 1, 0, B, 1, N, 0 );
	})();

	for ( i = 0; i < SIZES.length; i++ ) {
		var N = SIZES[ i ];
		var iters = calibrate( function cal() {
			var A = makeDiagDominantComplex( fillRandomComplex( new Complex128Array( N * N ) ), N );
			var B = fillRandomComplex( new Complex128Array( N ) );
			var IPIV = new Int32Array( N );
			zgesv( N, 1, A, 1, N, 0, IPIV, 1, 0, B, 1, N, 0 );
		});

		var result = runProfile( 'zgesv N=' + N + ' NRHS=1', function run() {
			var A = makeDiagDominantComplex( fillRandomComplex( new Complex128Array( N * N ) ), N );
			var B = fillRandomComplex( new Complex128Array( N ) );
			var IPIV = new Int32Array( N );
			zgesv( N, 1, A, 1, N, 0, IPIV, 1, 0, B, 1, N, 0 );
		}, iters );
		results.push( { N: N, ms: result.msPerCall } );
	}

	// Scaling summary
	console.log( '' );
	console.log( '  zgesv scaling:' );
	for ( i = 0; i < results.length; i++ ) {
		var r = results[ i ];
		var ratio = ( i > 0 ) ?
			( '  (' + ( r.ms / results[ i - 1 ].ms ).toFixed( 1 ) + 'x)' ) : '';
		console.log( '    N=' + String( r.N ).padStart( 4 ) + ':  ' +
			r.ms.toFixed( 1 ).padStart( 8 ) + ' ms/call' + ratio );
	}
}

// ================================================================
// ZGESVD: singular value decomposition
// ================================================================
function benchZgesvd() {
	console.log( '' );
	console.log( '=' .repeat( 80 ) );
	console.log( '  ZGESVD — complex singular value decomposition' );
	console.log( '=' .repeat( 80 ) );

	var results = [];

	function callZgesvd( jobu, jobvt, N ) {
		var lwork = Math.max( 1, 2 * N + N * 32 );
		var A = makeDiagDominantComplex( fillRandomComplex( new Complex128Array( N * N ) ), N );
		var S = new Float64Array( N );
		var U = new Complex128Array( ( jobu === 'A' ) ? N * N : 1 );
		var VT = new Complex128Array( ( jobvt === 'A' ) ? N * N : 1 );
		var WORK = new Complex128Array( lwork );
		var RWORK = new Float64Array( 5 * N );
		var su2 = ( jobu === 'A' ) ? N : 1;
		var svt2 = ( jobvt === 'A' ) ? N : 1;
		zgesvd( JOB[ jobu ], JOBVT[ jobvt ], N, N, A, 1, N, 0, S, 1, 0,
			U, 1, su2, 0, VT, 1, svt2, 0,
			WORK, 1, 0, RWORK, 1, 0 );
	}

	// Warmup
	callZgesvd( 'A', 'A', 20 );

	for ( i = 0; i < SIZES.length; i++ ) {
		var N = SIZES[ i ];
		var iters = calibrate( function cal() {
			callZgesvd( 'A', 'A', N );
		});

		var result = runProfile( 'zgesvd N=' + N + ' (full U,VT)', function run() {
			callZgesvd( 'A', 'A', N );
		}, iters );
		results.push( { N: N, ms: result.msPerCall } );

		// Also test singular values only (no U, VT)
		var iters2 = calibrate( function cal2() {
			callZgesvd( 'N', 'N', N );
		});

		runProfile( 'zgesvd N=' + N + ' (values only)', function run2() {
			callZgesvd( 'N', 'N', N );
		}, iters2 );
	}

	// Scaling summary
	console.log( '' );
	console.log( '  zgesvd (full U,VT) scaling:' );
	for ( i = 0; i < results.length; i++ ) {
		var r = results[ i ];
		var ratio = ( i > 0 ) ?
			( '  (' + ( r.ms / results[ i - 1 ].ms ).toFixed( 1 ) + 'x)' ) : '';
		console.log( '    N=' + String( r.N ).padStart( 4 ) + ':  ' +
			r.ms.toFixed( 1 ).padStart( 8 ) + ' ms/call' + ratio );
	}
}

// MAIN //

console.log( '' );
console.log( '=' .repeat( 80 ) );
console.log( '  LAPACK DRIVER BENCHMARKS' );
console.log( '=' .repeat( 80 ) );

if ( !ONLY || ONLY === 'zgesv' ) benchZgesv();
if ( !ONLY || ONLY === 'zgesvd' ) benchZgesvd();

console.log( '' );
