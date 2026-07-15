#!/usr/bin/env node
/**
* Aggregate the runtime validation ledger (test/.validation-ledger/*.jsonl) into
* a per-routine validation level and emit badges.
*
* The level ladder (honest — driven by checks that actually ran and passed):
*
*   L0  unvalidated     only export/structure checks; no behavioral validation
*   L1  fixture         fixed reference-value tests
*   L2  property        independent residual / reconstruction / structural /
*                       orthogonality validation (harness)
*   L3  layout-fuzzed   L2 + bit-exact invariance across storage layouts
*                       (offsets, strides, leading dims, row/col major, packed)
*   L4  cross/diff      L2/3 + cross-validation vs trusted routines and/or
*                       differential vs the reference Fortran
*
* Usage:
*   node bin/validation-level.js            # table + write summary.json
*   node bin/validation-level.js --badges   # also print a markdown badge per routine
*   node bin/validation-level.js --md       # emit a markdown table (for reports)
*/

'use strict';

// MODULES //

var fs = require( 'fs' );
var path = require( 'path' );


// VARIABLES //

var DIR = path.join( __dirname, '..', 'test', '.validation-ledger' );

var KIND_TIER = {
	'fixture': 1,
	'property': 2,
	'residual': 2,
	'reconstruct': 2,
	'structural': 2,
	'orthonormal': 2,
	'layout-invariance': 3,
	'cross-validation': 4,
	'differential': 4
};

var LEVEL_LABEL = [ 'L0-unvalidated', 'L1-fixture', 'L2-property', 'L3-layout--fuzzed', 'L4-cross%2Fdiff' ];
var LEVEL_COLOR = [ 'lightgrey', 'yellow', 'green', 'brightgreen', 'blueviolet' ];


// FUNCTIONS //

function readLedger() {
	var byRoutine = {};
	var frags;
	if ( !fs.existsSync( DIR ) ) {
		return byRoutine;
	}
	frags = fs.readdirSync( DIR ).filter( function isJsonl( f ) {
		return f.endsWith( '.jsonl' );
	});
	frags.forEach( function readFrag( f ) {
		var text = fs.readFileSync( path.join( DIR, f ), 'utf8' );
		text.split( '\n' ).forEach( function readLine( line ) {
			var rec;
			if ( !line.trim() ) {
				return;
			}
			rec = JSON.parse( line );
			if ( !byRoutine[ rec.routine ] ) {
				byRoutine[ rec.routine ] = {};
			}
			byRoutine[ rec.routine ][ rec.kind ] = ( byRoutine[ rec.routine ][ rec.kind ] || 0 ) + 1;
		});
	});
	return byRoutine;
}

function levelOf( kinds ) {
	var lvl = 0;
	Object.keys( kinds ).forEach( function each( k ) {
		var t = KIND_TIER[ k ] || 0;
		if ( t > lvl ) {
			lvl = t;
		}
	});
	return lvl;
}


// MAIN //

function main() {
	var args = process.argv.slice( 2 );
	var byRoutine = readLedger();
	var routines = Object.keys( byRoutine ).sort();
	var summary = {};
	var counts = [ 0, 0, 0, 0, 0 ];

	routines.forEach( function each( r ) {
		var kinds = byRoutine[ r ];
		var lvl = levelOf( kinds );
		summary[ r ] = {
			'level': lvl,
			'label': LEVEL_LABEL[ lvl ],
			'kinds': Object.keys( kinds ).sort()
		};
	});

	if ( args.indexOf( '--md' ) !== -1 ) {
		process.stdout.write( '| Routine | Level | Validated by |\n|---|---|---|\n' );
		routines.forEach( function each( r ) {
			var s = summary[ r ];
			process.stdout.write( '| `'+r+'` | '+s.label+' | '+s.kinds.join( ', ' )+' |\n' );
		});
	} else if ( args.indexOf( '--badges' ) !== -1 ) {
		routines.forEach( function each( r ) {
			var s = summary[ r ];
			process.stdout.write( '`'+r+'`: ![validation](https://img.shields.io/badge/validation-'+s.label+'-'+LEVEL_COLOR[ s.level ]+')\n' );
		});
	} else {
		process.stdout.write( 'Validation levels (from runtime ledger):\n\n' );
		if ( routines.length === 0 ) {
			process.stdout.write( '  (ledger empty — run the harness-based tests first)\n' );
		}
		routines.forEach( function each( r ) {
			var s = summary[ r ];
			var label = s.label.replace( /--/g, '-' ).replace( /%2F/g, '/' );
			process.stdout.write( '  ' + r.padEnd( 14 ) + ' ' + label.padEnd( 18 ) + ' [' + s.kinds.join( ', ' ) + ']\n' );
		});
		routines.forEach( function each( r ) {
			counts[ summary[ r ].level ] += 1;
		});
		process.stdout.write( '\n  totals: L0='+counts[0]+' L1='+counts[1]+' L2='+counts[2]+' L3='+counts[3]+' L4='+counts[4]+'\n' );
	}

	fs.mkdirSync( DIR, { 'recursive': true } );
	fs.writeFileSync( path.join( DIR, 'summary.json' ), JSON.stringify( summary, null, 2 ) );
}

main();
