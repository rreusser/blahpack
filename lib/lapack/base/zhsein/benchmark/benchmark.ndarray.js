

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import zhsein from './../lib/ndarray.js';


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
* @param {PositiveInteger} len - array length
* @returns {Function} benchmark function
*/
function createBenchmark( len ) {
	const N = len;
	const SELECT = new Uint8Array( N );
	const H = new Complex128Array( uniform( 2 * N * N, -10.0, 10.0, options ) );
	const h = reinterpret( H, 0 );
	const w = new Complex128Array( N );
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const WORK = new Complex128Array( N * N );
	const RWORK = new Float64Array( N );
	const IFAILL = new Int32Array( N );
	const IFAILR = new Int32Array( N );
	const wv = reinterpret( w, 0 );
	let i;
	let j;

	// Upper triangular H (a Hessenberg matrix with a zero subdiagonal): its eigenvalues are its diagonal.
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			h[ 2 * ( i + ( j * N ) ) ] = 0.0;
			h[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = 0.0;
		}
		wv[ 2 * j ] = h[ 2 * ( j + ( j * N ) ) ];
		wv[ ( 2 * j ) + 1 ] = h[ ( 2 * ( j + ( j * N ) ) ) + 1 ];
		SELECT[ j ] = 1;
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
		let y, i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			m[ 0 ] = N;
			y = zhsein( 'right', 'qr', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, w, 1, 0, VL, 1, N, 0, VR, 1, N, 0, N, m, WORK, 1, 0, RWORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
			if ( isnan( y ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnan( y ) ) {
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
	let len, f, i;

	const min = 1; // 10^min
	const max = 3; // 10^max

	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
