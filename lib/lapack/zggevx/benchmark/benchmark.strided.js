// MODULES //

import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import zggevx from './../lib/strided.js';


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
	const RCONDE = new Float64Array( N );
	const RCONDV = new Float64Array( N );
	const LSCALE = new Float64Array( N );
	const RSCALE = new Float64Array( N );
	const ALPHA = new Complex128Array( N );
	const Adata = uniform( 2 * N * N, -1.0, 1.0, {
		'dtype': 'float64'
	});
	const Bdata = uniform( 2 * N * N, -1.0, 1.0, {
		'dtype': 'float64'
	});
	const BETA = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		let A, B, r, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			A = new Complex128Array( new Float64Array( Adata ) );
			B = new Complex128Array( new Float64Array( Bdata ) );
			r = zggevx( 'none', 'compute-vectors', 'compute-vectors', 'none', N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, ilo, ihi, LSCALE, 1, 0, RSCALE, 1, 0, abnrm, bbnrm, RCONDE, 1, 0, RCONDV, 1, 0, new Complex128Array( Math.max( 2 * N * ( N + 1 ), N + ( N * 32 ) + 4160 ) ), 1, 0, new Float64Array( Math.max( 1, 6 * N ) ), 1, 0, new Int32Array( N + 6 ), 1, 0, new Uint8Array( Math.max( 1, N ) ), 1, 0 );
			if ( r !== 0 ) {
				b.fail( 'unexpected info: ' + r );
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
	let f, N, i;

	for ( i = 1; i <= 5; i++ ) {
		N = pow( 2, i );
		f = createBenchmark( N );
		bench( format( '%s:n=%d', pkg, N ), f );
	}
}

main();
