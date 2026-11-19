// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import zlahefRk from './../lib/ndarray.js';


// VARIABLES //

const pkg = pkgJson.name;



// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	let IPIV, nb, A, e, W, i;
	nb = Math.min( N, 32 );
	A = new Complex128Array( N * N );
	const Ar = reinterpret( A, 0 );
	for ( i = 0; i < N; i++ ) {
		Ar[ ( i * N * 2 ) + ( i * 2 ) ] = 10.0 + i;
	}
	e = new Complex128Array( N );
	IPIV = new Int32Array( N );
	W = new Complex128Array( N * nb );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const kb = new Int32Array( 1 );
		let ii, y;

		b.tic();
		for ( ii = 0; ii < b.iterations; ii++ ) {
			y = zlahefRk( 'lower', N, nb, kb, A, 1, N, 0, e, 1, 0, IPIV, 1, 0, W, 1, N, 0 );
			if ( y !== 0 && y < 0 ) {
				b.fail( 'should not return a negative info' );
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
