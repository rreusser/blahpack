/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import ztgsen from './../lib/strided.js';


// VARIABLES //

const pkg = pkgJson.name;
/** @type {{ dtype: 'float64' }} */
const options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - problem size
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	const SELECT = new Uint8Array( N * N );
	const A = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const B = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const ALPHA = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const BETA = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const Q = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const Z = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const M = new Int32Array( [ 1 ] );
	const pl = new Float64Array( [ 1 ] );
	const pr = new Float64Array( [ 1 ] );
	const DIF = uniform( N * N, -10.0, 10.0, options );
	const WORK = new Complex128Array( uniform( 2 * ( (4 * N * N) + (64 * N) ), -10.0, 10.0, options ) );
	const IWORK = new Int32Array( (4 * N * N) + (64 * N) );
	let j, k;

	// Structured inputs: Upper triangular (Schur form with 1-by-1 blocks).
	const AView = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( k = j + 1; k < N; k++ ) {
			AView[ 2 * ( k + ( j * N ) ) ] = 0.0;
			AView[ ( 2 * ( k + ( j * N ) ) ) + 1 ] = 0.0;
		}
	}
	const BView = reinterpret( B, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( k = j + 1; k < N; k++ ) {
			BView[ 2 * ( k + ( j * N ) ) ] = 0.0;
			BView[ ( 2 * ( k + ( j * N ) ) ) + 1 ] = 0.0;
		}
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let out, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			out = ztgsen( 1, true, true, SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, Q, 1, N, 0, Z, 1, N, 0, M, pl, pr, DIF, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
			if ( isnan( out ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( out ) ) {
			b.fail( 'should not return NaN' );
		}
		b.pass( 'benchmark finished' );
		b.end();
	}
}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {
	let N, f, i;

	const min = 1; // 10^min
	const max = 2; // 10^max

	for ( i = min; i <= max; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:strided:N=%d', pkg, N ), f );
	}
}

main();
