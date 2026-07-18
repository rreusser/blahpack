

// MODULES //

import { readFileSync } from 'node:fs';
import bench from '@stdlib/bench/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dseupd from './../lib/ndarray.js';


// VARIABLES //

// Genuine post-convergence snapshot recorded from the ARPACK Fortran reference.
const fixtureURL = new URL( './../../../../../test/fixtures/dseupd.jsonl', import.meta.url );
const TC = JSON.parse( readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' )[ 0 ] );

const howmny = 'A'; // ARPACK code: compute all Ritz vectors
const bmat = 'I'; // ARPACK code: standard eigenproblem


// MAIN //

bench( pkg+':ndarray', function benchmark( b ) {
	let iparam, select, resid, workd, workl, info, ipntr, z, d, v, i;

	const n = TC.n;
	const nev = TC.nev;
	const ncv = TC.ncv;

	b.tic();
	for ( i = 0; i < b.iterations; i++ ) {
		v = Float64Array.from( TC.v );
		workl = Float64Array.from( TC.workl );
		workd = Float64Array.from( TC.workd );
		resid = Float64Array.from( TC.resid );
		iparam = TC.iparam.slice();
		ipntr = TC.ipntr.slice();
		select = new Array( ncv );
		d = new Float64Array( nev );
		z = new Float64Array( n * nev );
		info = dseupd( true, howmny, select, 1, 0, d, 1, 0, z, 1, n, 0, TC.sigma, bmat, n, 'LM', nev, TC.tol, resid, 1, 0, ncv, v, 1, n, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, TC.lworkl );
		if ( info !== 0 ) {
			b.fail( 'should return 0' );
		}
	}
	b.toc();
	if ( isnan( d[ 0 ] ) ) {
		b.fail( 'should not return NaN' );
	}
	b.pass( 'benchmark finished' );
	b.end();
});
