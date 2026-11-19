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
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import ztgsen from './../lib/ztgsen.js';


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
	const SELECT = uniform( N * N, -10.0, 10.0, options );
	const A = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const B = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const ALPHA = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const BETA = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const Q = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const Z = uniform( N * N, -10.0, 10.0, options );
	const DIF = uniform( N * N, -10.0, 10.0, options );
	const WORK = uniform( (4 * N * N) + (64 * N), -10.0, 10.0, options );
	const IWORK = new Int32Array( (4 * N * N) + (64 * N) );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const m = new Int32Array( 1 );
		const pl = new Float64Array( 1 );
		const pr = new Float64Array( 1 );
		let out, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			m[ 0 ] = N;
			pl[ 0 ] = 1.0;
			pr[ 0 ] = 1.0;
			out = {
				'info': ztgsen( 'column-major', N, true, true, SELECT, 1, N, A, N, B, N, ALPHA, 1, BETA, 1, Q, N, Z, N, m, pl, pr, DIF, 1, WORK, IWORK ),
				'm': m[ 0 ],
				'pl': pl[ 0 ],
				'pr': pr[ 0 ]
			};
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
