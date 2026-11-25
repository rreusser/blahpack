/* eslint-disable camelcase */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import pkgJson from './../package.json' with { type: 'json' };
import zpotrf from './../../zpotrf/lib/base.js';
import zpotrs from './../../zpotrs/lib/base.js';
import zla_porfsx_extended from './../lib/ndarray.js';


// VARIABLES //

const pkg = pkgJson.name;



// FUNCTIONS //

/**
* Build a diagonally dominant Hermitian positive-definite matrix.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Complex128Array} `A`
*/
function buildHpd( N ) {
	let idx, i, j;
	const A = new Complex128Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = 2 * ( i + ( j * N ) );
			if ( i === j ) {
				A.buffer[ idx ] = 4.0 * N;
			} else if ( i < j ) {
				A.buffer[ idx ] = 1.0 / ( 1 + j - i );
				A.buffer[ idx + 1 ] = 1.0 / ( 2 + j - i );
			} else {
				A.buffer[ idx ] = 1.0 / ( 1 + i - j );
				A.buffer[ idx + 1 ] = -1.0 / ( 2 + i - j );
			}
		}
	}
	return A;
}

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	let i;

	const A = buildHpd( N );
	const AF = new Complex128Array( A.length );
	for ( i = 0; i < 2 * N * N; i++ ) {
		AF.buffer[ i ] = A.buffer[ i ];
	}
	zpotrf( 'upper', N, AF, 1, N, 0 );

	const B = new Complex128Array( N );
	for ( i = 0; i < N; i++ ) {
		B.buffer[ 2 * i ] = 1.0;
	}
	const Y0 = new Complex128Array( N );
	for ( i = 0; i < 2 * N; i++ ) {
		Y0.buffer[ i ] = B.buffer[ i ];
	}
	zpotrs( 'upper', N, 1, AF, 1, N, 0, Y0, 1, N, 0 );

	const c = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		c[ i ] = 1.0;
	}
	const RES = new Complex128Array( N );
	const DY = new Complex128Array( N );
	const YT = new Complex128Array( N );
	const AYB = new Float64Array( N );
	const berr_out = new Float64Array( 1 );
	const err_bnds_norm = new Float64Array( 3 );
	const err_bnds_comp = new Float64Array( 3 );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let info, k, j;

		const Y = new Complex128Array( N );
		b.tic();
		for ( k = 0; k < b.iterations; k++ ) {
			for ( j = 0; j < 2 * N; j++ ) {
				Y.buffer[ j ] = Y0.buffer[ j ];
			}
			info = zla_porfsx_extended( 1, 'upper', N, 1, A, 1, N, 0, AF, 1, N, 0, false, c, 1, 0, B, 1, N, 0, Y, 1, N, 0, berr_out, 1, 0, 2, err_bnds_norm, 1, 1, 0, err_bnds_comp, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1.0, 10, 0.5, 0.25, false ); // eslint-disable-line max-len
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

	const min = 2;
	const max = 6;
	for ( i = min; i <= max; i++ ) {
		len = pow( 2, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:N=%d', pkg, len ), f );
	}
}

main();
