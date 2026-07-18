/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zgsvj1 from './../lib/zgsvj1.js';


// VARIABLES //

const options = {
	'dtype': 'float64'
};
const EPS = 2.220446049250313e-16;
const SFMIN = 2.2250738585072014e-308;
const TOL = 1.0e-10;


// FUNCTIONS //

/**
* Creates a benchmark function for an `N`x`N` complex matrix.
*
* @private
* @param {PositiveInteger} N - matrix dimension
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	let work, sva, n1, A, d, V, i;

	const raw = uniform( 2 * N * N, -1.0, 1.0, options );
	A = new Complex128Array( raw.buffer );
	d = new Complex128Array( N );
	for ( i = 0; i < N; i++ ) {
		reinterpret( d, 0 )[ 2 * i ] = 1.0;
	}
	sva = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		sva[ i ] = 1.0;
	}
	V = new Complex128Array( N * N );
	const view = reinterpret( V, 0 );
	for ( i = 0; i < N; i++ ) {
		view[ 2 * ( ( i * N ) + i ) ] = 1.0;
	}
	work = new Complex128Array( N );
	n1 = N >> 1;

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let info, k;
		b.tic();
		for ( k = 0; k < b.iterations; k++ ) {
			info = zgsvj1( 'column-major', 'no-v', N, N, n1, A, N, d, 1, sva, 1, 0, V, N, EPS, SFMIN, TOL, 1, work, 1, N );
			if ( isnan( info ) ) {
				b.fail( 'should not return NaN' );
			}
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
	let len, f, i;

	const min = 2; // 2^min
	const max = 5; // 2^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 2, i );
		f = createBenchmark( len );
		bench( format( '%s:N=%d', pkg, len ), f );
	}
}

main();
