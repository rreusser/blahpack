'use strict';

var path = require( 'path' );

var RED = '\x1b[31m';
var GREEN = '\x1b[32m';
var YELLOW = '\x1b[33m';
var CYAN = '\x1b[36m';
var DIM = '\x1b[2m';
var BOLD = '\x1b[1m';
var NC = '\x1b[0m';

function statusColor( status ) {
	switch ( status ) {
	case 'pass': return GREEN;
	case 'fail': return RED;
	case 'warn': return YELLOW;
	case 'skip': return DIM;
	default: return NC;
	}
}

function statusLabel( status ) {
	switch ( status ) {
	case 'pass': return 'PASS';
	case 'fail': return 'FAIL';
	case 'warn': return 'WARN';
	case 'skip': return 'SKIP';
	default: return '????';
	}
}

/**
 * Format a single module's results for terminal output.
 */
function formatModule( moduleResult ) {
	var out = '';
	var r;
	var i;

	out += BOLD + moduleResult.module + NC;
	out += '  [' + statusColor( moduleResult.category === 'complete' ? 'pass' : ( moduleResult.category === 'scaffold' ? 'fail' : 'warn' ) ) + moduleResult.category + NC + ']\n';

	for ( i = 0; i < moduleResult.checks.length; i++ ) {
		r = moduleResult.checks[ i ];
		out += '  ' + statusColor( r.status ) + statusLabel( r.status ) + NC;
		out += '  ' + r.name;
		if ( r.status === 'fail' || r.status === 'warn' ) {
			if ( r.message ) {
				out += DIM + '  — ' + r.message + NC;
			}
		}
		out += '\n';
	}

	return out;
}

/**
 * Format a summary table for all modules.
 */
function formatSummary( allResults ) {
	var out = '';
	var counts = { complete: 0, 'in-progress': 0, scaffold: 0 };
	var failingModules = [];
	var totalChecks = { pass: 0, fail: 0, warn: 0, skip: 0 };
	var r;
	var c;
	var i;
	var j;

	for ( i = 0; i < allResults.length; i++ ) {
		r = allResults[ i ];
		counts[ r.category ] = ( counts[ r.category ] || 0 ) + 1;
		if ( r.category !== 'complete' ) {
			failingModules.push( r );
		}
		for ( j = 0; j < r.checks.length; j++ ) {
			c = r.checks[ j ];
			totalChecks[ c.status ] = ( totalChecks[ c.status ] || 0 ) + 1;
		}
	}

	out += BOLD + '=== Gate Summary ===' + NC + '\n\n';
	out += 'Modules:  ' + GREEN + counts.complete + ' complete' + NC;
	out += '  ' + YELLOW + counts[ 'in-progress' ] + ' in-progress' + NC;
	out += '  ' + RED + counts.scaffold + ' scaffold' + NC;
	out += '  (' + allResults.length + ' total)\n';
	out += 'Checks:   ' + GREEN + totalChecks.pass + ' pass' + NC;
	out += '  ' + RED + totalChecks.fail + ' fail' + NC;
	out += '  ' + YELLOW + totalChecks.warn + ' warn' + NC;
	out += '  ' + DIM + totalChecks.skip + ' skip' + NC + '\n';

	return out;
}

/**
 * Format failing modules with their failures.
 */
function formatFailing( allResults ) {
	var out = '';
	var failCount = 0;
	var r;
	var c;
	var i;
	var j;

	for ( i = 0; i < allResults.length; i++ ) {
		r = allResults[ i ];
		if ( r.category === 'complete' ) {
			continue;
		}
		failCount++;
		out += BOLD + r.module + NC + '  [' + statusColor( r.category === 'scaffold' ? 'fail' : 'warn' ) + r.category + NC + ']\n';
		for ( j = 0; j < r.checks.length; j++ ) {
			c = r.checks[ j ];
			if ( c.status === 'fail' || c.status === 'warn' ) {
				out += '  ' + statusColor( c.status ) + statusLabel( c.status ) + NC + '  ' + c.name;
				if ( c.message ) {
					out += DIM + '  — ' + c.message + NC;
				}
				out += '\n';
			}
		}
		out += '\n';
	}

	if ( failCount === 0 ) {
		out += GREEN + 'All modules pass!' + NC + '\n';
	}

	return out;
}

/**
 * Format as JSON.
 */
function formatJSON( allResults ) {
	var counts = { complete: 0, 'in-progress': 0, scaffold: 0 };
	var totalChecks = { pass: 0, fail: 0, warn: 0, skip: 0 };
	var i;
	var j;
	var r;
	var c;

	for ( i = 0; i < allResults.length; i++ ) {
		r = allResults[ i ];
		counts[ r.category ] = ( counts[ r.category ] || 0 ) + 1;
		for ( j = 0; j < r.checks.length; j++ ) {
			c = r.checks[ j ];
			totalChecks[ c.status ] = ( totalChecks[ c.status ] || 0 ) + 1;
		}
	}

	return JSON.stringify({
		timestamp: new Date().toISOString(),
		totals: {
			modules: allResults.length,
			complete: counts.complete,
			'in-progress': counts[ 'in-progress' ],
			scaffold: counts.scaffold,
			checks_passed: totalChecks.pass,
			checks_failed: totalChecks.fail,
			checks_warned: totalChecks.warn,
			checks_skipped: totalChecks.skip
		},
		modules: allResults
	}, null, 2 );
}

module.exports = {
	formatModule: formatModule,
	formatSummary: formatSummary,
	formatFailing: formatFailing,
	formatJSON: formatJSON
};
