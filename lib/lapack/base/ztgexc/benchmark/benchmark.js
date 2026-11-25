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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import ztgexc from './../lib/ztgexc.js';


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
	const A = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const B = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const Q = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const Z = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const ilst = new Int32Array( [ 1 ] );
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
	const AView0 = reinterpret( A, 0 );
	const AInit = AView0.slice();
	const BView0 = reinterpret( B, 0 );
	const BInit = BView0.slice();
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
			// Restore the structured inputs the routine overwrites:
			AView0.set( AInit );
			BView0.set( BInit );
			out = ztgexc( 'column-major', true, true, N, A, N, B, N, Q, N, Z, N, N - 1, ilst );
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
		bench( format( '%s:N=%d', pkg, N ), f );
	}
}

main();
