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
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dgges from './../lib/dgges.js';


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
	const A = uniform( N * N, -10.0, 10.0, options );
	const B = uniform( N * N, -10.0, 10.0, options );
	const ALPHAR = uniform( N * N, -10.0, 10.0, options );
	const ALPHAI = uniform( N * N, -10.0, 10.0, options );
	const BETA = uniform( N * N, -10.0, 10.0, options );
	const VSL = uniform( N * N, -10.0, 10.0, options );
	const VSR = uniform( N * N, -10.0, 10.0, options );
	const WORK = uniform( (4 * N * N) + (64 * N), -10.0, 10.0, options );
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
			dgges( 'column-major', 'compute-vectors', 'compute-vectors', 'not-sorted', select, N, A, N, B, N, sdim, ALPHAR, 1, ALPHAI, 1, BETA, 1, VSL, N, VSR, N, WORK, BWORK );
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
		bench( format( '%s:N=%d', pkg, N ), f );
	}
}

main();
