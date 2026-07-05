

// MODULES //

import { readFileSync } from 'node:fs';
import bench from '@stdlib/bench/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import dseupd from './../lib/dseupd.js';


// VARIABLES //

// Genuine post-convergence snapshot recorded from the ARPACK Fortran reference.
var fixtureURL = new URL( './../../../../../test/fixtures/dseupd.jsonl', import.meta.url );
var TC = JSON.parse( readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' )[ 0 ] );

var howmny = 'A'; // ARPACK code: compute all Ritz vectors
var bmat = 'I'; // ARPACK code: standard eigenproblem


// MAIN //

bench( pkg, function benchmark( b ) {
	var iparam;
	var select;
	var resid;
	var workd;
	var workl;
	var info;
	var ncv;
	var nev;
	var ipntr;
	var z;
	var d;
	var v;
	var n;
	var i;

	n = TC.n;
	nev = TC.nev;
	ncv = TC.ncv;

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
		info = dseupd( true, howmny, select, 1, d, 1, z, n, TC.sigma, bmat, n, 'LM', nev, TC.tol, resid, 1, ncv, v, n, iparam, 1, ipntr, 1, workd, 1, workl, 1, TC.lworkl );
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
