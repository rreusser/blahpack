#!/usr/bin/env node
// Profiling benchmark for zggev (generalized eigenvalue decomposition).
//
// Instruments every LAPACK/BLAS subroutine to show where time is spent.
// Outputs:
//   - Per-size flat profile (inclusive/exclusive time, call counts)
//   - Per-size call tree (parent→child timing breakdown)
//   - Scaling summary across matrix sizes
//
// Usage:
//   node bench/bench-zggev.js
//   node bench/bench-zggev.js --sizes 20,50,100
//   node bench/bench-zggev.js --target-ms 5000

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import instrument from './instrument.js';

// Install BEFORE loading any LAPACK modules
instrument.install();

const { default: zggev } = await import( '../lib/lapack/zggev/lib/strided.js' );

// Flags, by the single-letter names this script reports.
var JOB = { 'N': 'no-vectors', 'V': 'compute-vectors' };

/**
* Workspace for one zggev call of order N (optimal size, see zggev's docs).
*/
function workspace( N ) {
	return [ new Complex128Array( N + ( 32 * N ) + 4160 ), 1, 0, new Float64Array( 8 * N ), 1, 0 ];
}

// CONFIGURATION //

var argv = process.argv.slice( 2 );
var TARGET_MS = 2000;
var SIZES = [ 20, 50, 100, 200 ];
var i;
var v;

for ( i = 0; i < argv.length; i++ ) {
	if ( argv[ i ] === '--sizes' && argv[ i + 1 ] ) {
		SIZES = argv[ i + 1 ].split( ',' ).map( Number );
		i += 1;
	} else if ( argv[ i ] === '--target-ms' && argv[ i + 1 ] ) {
		TARGET_MS = parseInt( argv[ i + 1 ], 10 );
		i += 1;
	}
}

// HELPERS //

/**
* Generate a random Complex128Array of length n*n with entries in [-1, 1].
*/
function randomComplexMatrix( n ) {
	var view;
	var arr;
	var j;

	arr = new Complex128Array( n * n );
	view = new Float64Array( arr.buffer );
	for ( j = 0; j < view.length; j++ ) {
		view[ j ] = ( 2.0 * Math.random() ) - 1.0;
	}
	return arr;
}

/**
* Make a complex matrix diagonally dominant (well-conditioned).
*/
function makeDiagDominant( arr, n ) {
	var view;
	var j;

	view = new Float64Array( arr.buffer );
	for ( j = 0; j < n; j++ ) {
		// Add n*2 to real part of diagonal
		view[ 2 * ( ( j * n ) + j ) ] += n * 2.0;
	}
	return arr;
}

/**
* Run one call of zggev to estimate per-call time.
*/
function calibrate( N, jobvl, jobvr ) {
	var ALPHA;
	var BETA;
	var ms;
	var VL;
	var VR;
	var t0;
	var A;
	var B;

	A = makeDiagDominant( randomComplexMatrix( N ), N );
	B = makeDiagDominant( randomComplexMatrix( N ), N );
	ALPHA = new Complex128Array( N );
	BETA = new Complex128Array( N );
	VL = new Complex128Array( N * N );
	VR = new Complex128Array( N * N );

	t0 = performance.now();
	zggev( JOB[ jobvl ], JOB[ jobvr ], N,
		A, 1, N, 0,
		B, 1, N, 0,
		ALPHA, 1, 0,
		BETA, 1, 0,
		VL, 1, N, 0,
		VR, 1, N, 0,
		...workspace( N )
	);
	ms = performance.now() - t0;

	// Target TARGET_MS total, min 3 iters, max 200
	return Math.max( 3, Math.min( 200, Math.ceil( TARGET_MS / ms ) ) );
}

/**
* Run the profiling benchmark for a given configuration.
*
* @param {number} N - matrix size
* @param {string} jobvl - 'N' or 'V'
* @param {string} jobvr - 'N' or 'V'
* @param {number} iters - number of iterations
* @returns {Object} benchmark result
*/
function runBenchmark( N, jobvl, jobvr, iters ) {
	var totalMs;
	var ALPHA;
	var BETA;
	var snap;
	var VL;
	var VR;
	var t0;
	var A;
	var B;
	var k;

	instrument.reset();

	// Measured iterations
	t0 = performance.now();
	for ( k = 0; k < iters; k++ ) {
		A = makeDiagDominant( randomComplexMatrix( N ), N );
		B = makeDiagDominant( randomComplexMatrix( N ), N );
		ALPHA = new Complex128Array( N );
		BETA = new Complex128Array( N );
		VL = new Complex128Array( N * N );
		VR = new Complex128Array( N * N );
		zggev( JOB[ jobvl ], JOB[ jobvr ], N,
			A, 1, N, 0,
			B, 1, N, 0,
			ALPHA, 1, 0,
			BETA, 1, 0,
			VL, 1, N, 0,
			VR, 1, N, 0,
			...workspace( N )
		);
	}
	totalMs = performance.now() - t0;

	snap = instrument.snapshot();

	return {
		N: N,
		jobvl: jobvl,
		jobvr: jobvr,
		iters: iters,
		totalMs: totalMs,
		msPerCall: totalMs / iters,
		snap: snap
	};
}

// MAIN //

console.log( '' );
console.log( '=' .repeat( 80 ) );
console.log( '  ZGGEV PROFILING BENCHMARK' );
console.log( '  Generalized eigenvalue decomposition of complex matrix pairs' );
console.log( '=' .repeat( 80 ) );

// Warmup JIT with a small problem
( function warmup() {
	var A = makeDiagDominant( randomComplexMatrix( 10 ), 10 );
	var B = makeDiagDominant( randomComplexMatrix( 10 ), 10 );
	var AL = new Complex128Array( 10 );
	var BE = new Complex128Array( 10 );
	var VL = new Complex128Array( 100 );
	var VR = new Complex128Array( 100 );
	var k;

	for ( k = 0; k < 5; k++ ) {
		zggev( JOB.V, JOB.V, 10, A, 1, 10, 0, B, 1, 10, 0, AL, 1, 0, BE, 1, 0, VL, 1, 10, 0, VR, 1, 10, 0, ...workspace( 10 ) );
	}
})();

var results = [];

// Run benchmarks: full eigenvectors (V/V)
for ( i = 0; i < SIZES.length; i++ ) {
	v = SIZES[ i ];
	var iters = calibrate( v, 'V', 'V' );
	var result = runBenchmark( v, 'V', 'V', iters );
	results.push( result );

	console.log( '' );
	console.log( '-'.repeat( 80 ) );
	console.log( '  N=' + v + '  |  jobvl=V, jobvr=V (full eigenvectors)' +
		'  |  ' + iters + ' iters  |  ' +
		result.msPerCall.toFixed( 1 ) + ' ms/call' );
	console.log( '-'.repeat( 80 ) );

	instrument.printReport( result.totalMs );
	instrument.printCallTree( 'zggev', { maxDepth: 3, minPercent: 2.0 } );
}

// Run benchmarks: eigenvalues only (N/N)
for ( i = 0; i < SIZES.length; i++ ) {
	v = SIZES[ i ];
	var itersNN = calibrate( v, 'N', 'N' );
	var resultNN = runBenchmark( v, 'N', 'N', itersNN );
	results.push( resultNN );

	console.log( '' );
	console.log( '-'.repeat( 80 ) );
	console.log( '  N=' + v + '  |  jobvl=N, jobvr=N (eigenvalues only)' +
		'  |  ' + itersNN + ' iters  |  ' +
		resultNN.msPerCall.toFixed( 1 ) + ' ms/call' );
	console.log( '-'.repeat( 80 ) );

	instrument.printReport( resultNN.totalMs );
	instrument.printCallTree( 'zggev', { maxDepth: 3, minPercent: 2.0 } );
}

// SCALING SUMMARY //

console.log( '' );
console.log( '='.repeat( 80 ) );
console.log( '  SCALING SUMMARY' );
console.log( '='.repeat( 80 ) );
console.log( '' );

console.log(
	'  ' +
	'N'.padStart( 5 ) +
	'V/V (ms)'.padStart( 12 ) +
	'N/N (ms)'.padStart( 12 ) +
	'Eigvec cost'.padStart( 14 ) +
	'   Top bottleneck (V/V exclusive time)'
);
console.log( '  ' + '-'.repeat( 74 ) );

for ( i = 0; i < SIZES.length; i++ ) {
	v = SIZES[ i ];

	// Find the V/V and N/N results for this size
	var vvResult = null;
	var nnResult = null;
	var j;
	for ( j = 0; j < results.length; j++ ) {
		if ( results[ j ].N === v && results[ j ].jobvl === 'V' ) {
			vvResult = results[ j ];
		}
		if ( results[ j ].N === v && results[ j ].jobvl === 'N' ) {
			nnResult = results[ j ];
		}
	}

	if ( !vvResult || !nnResult ) {
		continue;
	}

	var eigvecCost = (
		( ( vvResult.msPerCall - nnResult.msPerCall ) / vvResult.msPerCall ) * 100
	).toFixed( 0 ) + '%';

	// Find top bottleneck by exclusive time
	var top = instrument.topK( vvResult.snap, 3 );
	var topByExcl = Object.keys( vvResult.snap )
		.map( function mapper( name ) {
			return { name: name, exclusive: vvResult.snap[ name ].exclusive };
		})
		.sort( function sorter( a, b ) {
			return b.exclusive - a.exclusive;
		})
		.slice( 0, 2 );

	var topStr = topByExcl.map( function mapper( t ) {
		return t.name + ' ' +
			( ( t.exclusive / vvResult.totalMs ) * 100 ).toFixed( 0 ) + '%';
	}).join( ', ' );

	console.log(
		'  ' +
		String( v ).padStart( 5 ) +
		vvResult.msPerCall.toFixed( 1 ).padStart( 12 ) +
		nnResult.msPerCall.toFixed( 1 ).padStart( 12 ) +
		eigvecCost.padStart( 14 ) +
		'   ' + topStr
	);
}

// FLOP estimate
console.log( '' );
console.log( '  Complexity note: zggev is O(N^3). Doubling N should ~8x the time.' );
console.log( '  If a subroutine grows faster than the total, it may have a' );
console.log( '  suboptimal implementation or excessive overhead.' );

// Scaling ratios
if ( SIZES.length >= 2 ) {
	console.log( '' );
	console.log( '  Scaling ratios (time[N] / time[N/2]):' );
	for ( i = 1; i < SIZES.length; i++ ) {
		var prev = null;
		var curr = null;
		for ( j = 0; j < results.length; j++ ) {
			if ( results[ j ].N === SIZES[ i - 1 ] && results[ j ].jobvl === 'V' ) {
				prev = results[ j ];
			}
			if ( results[ j ].N === SIZES[ i ] && results[ j ].jobvl === 'V' ) {
				curr = results[ j ];
			}
		}
		if ( prev && curr ) {
			var ratio = curr.msPerCall / prev.msPerCall;
			var sizeRatio = curr.N / prev.N;
			var expectedCubic = Math.pow( sizeRatio, 3 );
			console.log(
				'    N=' + prev.N + ' -> ' + curr.N + ':  ' +
				ratio.toFixed( 1 ) + 'x  (expected ~' +
				expectedCubic.toFixed( 1 ) + 'x for O(N^3))'
			);
		}
	}
}

console.log( '' );
