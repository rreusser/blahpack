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
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import zgges from './../lib/ndarray.js';


// VARIABLES //

const pkg = pkgJson.name;
const options = {
	'dtype': 'float64'
};


// FUNCTIONS //

/**
* Eigenvalue selection callback (selects nothing).
*
* @private
* @returns {boolean} boolean
*/
function select() {
	return false;
}

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
	const ALPHA = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const BETA = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const VSL = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const VSR = new Complex128Array( uniform( 2 * ( N * N ), -10.0, 10.0, options ) );
	const WORK = new Complex128Array( uniform( 2 * ( (4 * N * N) + (64 * N) ), -10.0, 10.0, options ) );
	const RWORK = uniform( (4 * N * N) + (64 * N), -10.0, 10.0, options );
	const BWORK = new Uint8Array( (4 * N * N) + (64 * N) );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const sdim = new Int32Array( 1 );
		let i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			zgges( 'compute-vectors', 'compute-vectors', 'none', select, N, A, 1, N, 0, B, 1, N, 0, sdim, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, BWORK, 1, 0 );
		}
		b.toc();
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
