#!/usr/bin/env node
'use strict';

var path = require( 'path' );
var util = require( './conformance/util.js' );
var conformance = require( './conformance/index.js' );
var format = require( './conformance/format.js' );

// Parse CLI arguments
var args = process.argv.slice( 2 );
var opts = {
	all: false,
	json: false,
	fast: false,
	coverage: false,
	lint: true,
	failing: false,
	category: null,
	check: null,
	modules: []
};

var i;
var arg;
for ( i = 0; i < args.length; i++ ) {
	arg = args[ i ];
	if ( arg === '--all' ) {
		opts.all = true;
	} else if ( arg === '--json' ) {
		opts.json = true;
	} else if ( arg === '--fast' ) {
		opts.fast = true;
		opts.lint = false;
	} else if ( arg === '--coverage' ) {
		opts.coverage = true;
	} else if ( arg === '--no-lint' ) {
		opts.lint = false;
	} else if ( arg === '--failing' ) {
		opts.failing = true;
	} else if ( arg === '--category' ) {
		i++;
		opts.category = args[ i ];
	} else if ( arg === '--check' ) {
		i++;
		opts.check = args[ i ];
	} else if ( arg === '--help' || arg === '-h' ) {
		printUsage();
		process.exit( 0 );
	} else if ( !arg.startsWith( '-' ) ) {
		opts.modules.push( arg );
	} else {
		console.error( 'Unknown option: ' + arg );
		printUsage();
		process.exit( 1 );
	}
}

function printUsage() {
	console.log( 'Usage: node bin/conformance.js [options] [module-paths...]' );
	console.log( '' );
	console.log( 'Options:' );
	console.log( '  --all              Check all modules' );
	console.log( '  --json             Output as JSON' );
	console.log( '  --fast             File checks only (no lint, no coverage)' );
	console.log( '  --coverage         Include test coverage checks (slow)' );
	console.log( '  --no-lint          Skip ESLint checks' );
	console.log( '  --failing          Only show failing modules' );
	console.log( '  --category <cat>   Filter by category (scaffold, in-progress, complete)' );
	console.log( '  --check <name>     Run only one check category' );
	console.log( '  -h, --help         Show this help' );
	console.log( '' );
	console.log( 'Examples:' );
	console.log( '  node bin/conformance.js lib/blas/base/ddot        # Single module' );
	console.log( '  node bin/conformance.js --all                     # All modules' );
	console.log( '  node bin/conformance.js --all --fast              # Fast file checks only' );
	console.log( '  node bin/conformance.js --all --failing           # Show only failures' );
	console.log( '  node bin/conformance.js --all --json              # JSON output' );
	console.log( '  node bin/conformance.js --all --category scaffold # Filter by status' );
}

// Resolve modules
var modules;
if ( opts.all ) {
	modules = util.discoverModules();
	// For --all mode, default to no lint unless explicitly requested
	// (lint is slow per-module; --fast disables it, default enables it)
} else if ( opts.modules.length > 0 ) {
	modules = [];
	for ( i = 0; i < opts.modules.length; i++ ) {
		var mod = util.resolveModule( opts.modules[ i ] );
		if ( !mod ) {
			console.error( 'Module not found: ' + opts.modules[ i ] );
			process.exit( 1 );
		}
		modules.push( mod );
	}
	// Single module: enable coverage by default (can be overridden)
	if ( modules.length === 1 && !opts.fast ) {
		// Coverage only on explicit request (it's slow)
	}
} else {
	printUsage();
	process.exit( 1 );
}

// Run
var results = conformance.runConformance( modules, opts );

// Output
if ( opts.json ) {
	console.log( format.formatJSON( results ) );
} else if ( opts.all || modules.length > 5 ) {
	// Summary mode for many modules
	console.log( format.formatSummary( results ) );
	if ( opts.failing ) {
		console.log( format.formatFailing( results ) );
	} else {
		// Show failing modules by default in --all mode
		console.log( format.formatFailing( results ) );
	}
} else {
	// Detailed mode for single/few modules
	for ( i = 0; i < results.length; i++ ) {
		console.log( format.formatModule( results[ i ] ) );
	}
}

// Exit code: 0 if all complete, 1 if any failures
var hasFailure = false;
for ( i = 0; i < results.length; i++ ) {
	if ( results[ i ].category !== 'complete' ) {
		hasFailure = true;
		break;
	}
}
process.exit( hasFailure ? 1 : 0 );
