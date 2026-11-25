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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import dhsein from './../lib/ndarray.js';


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
	const SELECT = new Uint8Array( N ).fill( 1 );
	const H = uniform( N * N, -10.0, 10.0, options );
	const WR = uniform( N, -10.0, 10.0, options );
	const WI = new Float64Array( N );
	const VL = uniform( N * N, -10.0, 10.0, options );
	const VR = uniform( N * N, -10.0, 10.0, options );
	const WORK = uniform( (4 * N * N) + (64 * N), -10.0, 10.0, options );
	const IFAILL = new Int32Array( N * N );
	const IFAILR = new Int32Array( N * N );
	let i, j;

	// Make `H` upper triangular (a special case of upper Hessenberg), so that its eigenvalues are its diagonal entries:
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			H[ ( j * N ) + i ] = 0.0;
		}
		WR[ j ] = H[ ( j * N ) + j ];
	}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const m = new Int32Array( 1 );
		let out, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			m[ 0 ] = N;
			out = dhsein( 'left', 'qr', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
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
