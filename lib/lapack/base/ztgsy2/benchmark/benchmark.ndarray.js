/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import ztgsy2 from './../lib/ndarray.js';


// VARIABLES //

const pkg = pkgJson.name;
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
	const C = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const D = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const E = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const F = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const scale = uniform( N * N, -10.0, 10.0, options );
	const rdsum = uniform( N * N, -10.0, 10.0, options );
	const rdscal = uniform( N * N, -10.0, 10.0, options );
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
	const DView = reinterpret( D, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( k = j + 1; k < N; k++ ) {
			DView[ 2 * ( k + ( j * N ) ) ] = 0.0;
			DView[ ( 2 * ( k + ( j * N ) ) ) + 1 ] = 0.0;
		}
	}
	const EView = reinterpret( E, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( k = j + 1; k < N; k++ ) {
			EView[ 2 * ( k + ( j * N ) ) ] = 0.0;
			EView[ ( 2 * ( k + ( j * N ) ) ) + 1 ] = 0.0;
		}
	}
	const CView = reinterpret( C, 0 );
	const CInit = CView.slice();
	const FView = reinterpret( F, 0 );
	const FInit = FView.slice();
	const rdsumInit = rdsum.slice();
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
			CView.set( CInit );
			FView.set( FInit );
			rdsum.set( rdsumInit );
			out = ztgsy2( 'no-transpose', 1, N, N, A, 1, N, 0, B, 1, N, 0, C, 1, N, 0, D, 1, N, 0, E, 1, N, 0, F, 1, N, 0, scale, rdsum, rdscal );
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
		bench( format( '%s:ndarray:N=%d', pkg, N ), f );
	}
}

main();
