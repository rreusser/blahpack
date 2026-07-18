/**
* Property-based validation for dcabs1, following the /blahpack-validate process.
*
* Step 0 classification: a scalar->scalar magnitude helper. It takes a single
* complex number (as a 2-element [re, im] Float64Array — the reference contract;
* the routine reads z[0]/z[1], NOT a Complex128 accessor) and returns the
* dcabs1 metric `|re| + |im|`. Property: dcabs1(z) === Math.abs(re)+Math.abs(im),
* validated bit-exactly against the obvious-by-inspection oracle.
*
* Level ceiling: dcabs1 operates on a bare scalar. There is NO storage vector to
* stride/offset-fuzz, so layout invariance (L3) does not apply — L2 (property)
* is this routine's honest ceiling.
*/

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';

import { RNG } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dcabs1 from './../lib/index.js';

// Independent oracle, obvious by inspection.
function oracle( re, im ) {
	return Math.abs( re ) + Math.abs( im );
}

// A curated set of edge cases: sign combinations, zeros, and large/small
// magnitudes across both components.
const CASES = [
	[ 0.0, 0.0 ],
	[ 1.0, 0.0 ],
	[ 0.0, 1.0 ],
	[ -1.0, 0.0 ],
	[ 0.0, -1.0 ],
	[ 3.0, -4.0 ],
	[ -3.0, 4.0 ],
	[ -3.0, -4.0 ],
	[ 1e300, -1e-300 ],
	[ -1e-300, 1e300 ],
	[ 5e-324, 5e-324 ], // smallest subnormals
	[ 1.7976931348623157e308, 0.0 ], // near-overflow (sum stays finite here)
	[ Math.PI, -Math.E ]
];

test( 'dcabs1: |re| + |im| on curated edge cases (bit-exact)', function t() {
	checked( 'dcabs1', 'property', function run() {
		CASES.forEach( function each( c ) {
			const z = new Float64Array( [ c[ 0 ], c[ 1 ] ] );
			const got = dcabs1( z );
			const exp = oracle( c[ 0 ], c[ 1 ] );
			if ( !Object.is( got, exp ) ) {
				throw new Error( 'dcabs1(['+c[ 0 ]+','+c[ 1 ]+']): got '+got+', expected '+exp );
			}
		});
	});
});

test( 'dcabs1: |re| + |im| on random complex values (bit-exact)', function t() {
	const rng = new RNG( 0x100 + 1 ); // reproducible; log on failure
	checked( 'dcabs1', 'property', function run() {
		let i, re, im, z, got, exp;
		for ( i = 0; i < 500; i++ ) {
			// Mix of scales so both large and small magnitudes are exercised:
			re = rng.normal() * Math.pow( 10, rng.int( -6, 6 ) );
			im = rng.normal() * Math.pow( 10, rng.int( -6, 6 ) );
			z = new Float64Array( [ re, im ] );
			got = dcabs1( z );
			exp = oracle( re, im );
			if ( !Object.is( got, exp ) ) {
				throw new Error( 'dcabs1(['+re+','+im+']): got '+got+', expected '+exp );
			}
		}
	});
});
