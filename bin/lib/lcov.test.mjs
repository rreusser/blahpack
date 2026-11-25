/**
* Tests of the lcov merge (bin/lib/lcov.mjs): a file reported in several
* records, as when a test re-imports it through importWithDependencies.
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLcov } from './lcov.mjs';

function record( lines, branches ) {
	return [ 'SF:lib/x/base.js' ]
		.concat( lines.map( ( l ) => 'DA:' + l[ 0 ] + ',' + l[ 1 ] ) )
		.concat( branches.map( ( b, i ) => 'BRDA:' + b[ 0 ] + ',' + i + ',0,' + b[ 1 ] ) )
		.concat( [ 'end_of_record' ] ).join( '\n' );
}

test( 'lines: covered if any record covers them', () => {
	const r = parseLcov( record( [ [ 1, 1 ], [ 2, 0 ] ], [] ) + '\n' + record( [ [ 1, 0 ], [ 2, 3 ] ], [] ), '/' )[ 'lib/x/base.js' ];
	assert.deepEqual( [ r.lf, r.lh ], [ 2, 2 ] );
});

test( 'branches: records listing the same branches on a line merge by position', () => {
	// Original takes the false arm of line 10, the copy the true arm.
	const r = parseLcov( record( [], [ [ 10, 0 ], [ 10, 4 ] ] ) + '\n' + record( [], [ [ 10, 2 ], [ 10, 0 ] ] ), '/' )[ 'lib/x/base.js' ];
	assert.deepEqual( [ r.brf, r.brh ], [ 2, 2 ] );
});

test( 'branches: a copy listing fewer branches on a line adds none', () => {
	// The copy ran a function only coarsely: one entry where the original
	// has three. It must not add a zero-hit "branch".
	const r = parseLcov( record( [], [ [ 20, 1 ], [ 20, 1 ], [ 20, 1 ] ] ) + '\n' + record( [], [ [ 20, 0 ] ] ), '/' )[ 'lib/x/base.js' ];
	assert.deepEqual( [ r.brf, r.brh, r.uncoveredBranches.length ], [ 3, 3, 0 ] );
});

test( 'branches: the record listing more branches on a line sets them', () => {
	const r = parseLcov( record( [], [ [ 30, 0 ] ] ) + '\n' + record( [], [ [ 30, 1 ], [ 30, 0 ] ] ), '/' )[ 'lib/x/base.js' ];
	assert.deepEqual( [ r.brf, r.brh, r.uncoveredBranches ], [ 2, 1, [ 30 ] ] );
});
