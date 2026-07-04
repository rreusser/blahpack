#!/usr/bin/env node

/**
* Conformance script: adds native addon loading pattern to index.js files.
*
* Replaces the simple `var main = require('./main.js'); module.exports = main;`
* pattern with the stdlib tryRequire/isError fallback pattern.
*
* Usage:
*   node bin/conform-index-js.js [--dry-run] [module-path]
*   node bin/conform-index-js.js --all [--dry-run]
*/

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );

var args = process.argv.slice( 2 );
var dryRun = args.includes( '--dry-run' );
var all = args.includes( '--all' );
var target = args.find( function( a ) { return a[ 0 ] !== '-'; } );

// We use a single permissive approach: find // MODULES // and replace everything after it.
// This avoids fragile regex matching of the exact export block format.

function findModules() {
	var results = [];
	var pkgs = [ 'blas', 'lapack' ];
	var i;
	var j;
	var pkg;
	var routines;
	var dir;
	var modDir;

	for ( i = 0; i < pkgs.length; i++ ) {
		pkg = pkgs[ i ];
		dir = path.join( 'lib', pkg, 'base' );
		if ( !fs.existsSync( dir ) ) {
			continue;
		}
		routines = fs.readdirSync( dir );
		for ( j = 0; j < routines.length; j++ ) {
			modDir = path.join( dir, routines[ j ] );
			var indexJs = path.join( modDir, 'lib', 'index.js' );
			if ( fs.existsSync( indexJs ) ) {
				results.push( modDir );
			}
		}
	}
	return results;
}

function getRoutineName( modDir ) {
	// Extract routine name from package.json or directory name
	var pkgPath = path.join( modDir, 'package.json' );
	if ( fs.existsSync( pkgPath ) ) {
		try {
			var pkg = JSON.parse( fs.readFileSync( pkgPath, 'utf8' ) );
			if ( pkg.name ) {
				var parts = pkg.name.split( '/' );
				return parts[ parts.length - 1 ];
			}
		} catch ( e ) {
			// fall through
		}
	}
	return path.basename( modDir );
}

function buildNewExportBlock( routineName ) {
	return '// MODULES //\n' +
		'\n' +
		'var join = require( \'path\' ).join;\n' +
		'var tryRequire = require( \'@stdlib/utils/try-require\' );\n' +
		'var isError = require( \'@stdlib/assert/is-error\' );\n' +
		'var main = require( \'./main.js\' );\n' +
		'\n' +
		'\n' +
		'// MAIN //\n' +
		'\n' +
		'var ' + routineName + ';\n' +
		'var tmp = tryRequire( join( __dirname, \'./native.js\' ) );\n' +
		'if ( isError( tmp ) ) {\n' +
		'\t' + routineName + ' = main;\n' +
		'} else {\n' +
		'\t' + routineName + ' = tmp;\n' +
		'}\n' +
		'\n' +
		'\n' +
		'// EXPORTS //\n' +
		'\n' +
		'module.exports = ' + routineName + ';\n' +
		'\n' +
		'// exports: { "ndarray": "' + routineName + '.ndarray" }\n';
}

function conformIndexJs( modDir ) {
	var indexPath = path.join( modDir, 'lib', 'index.js' );
	var content = fs.readFileSync( indexPath, 'utf8' );
	var routineName = getRoutineName( modDir );

	// Check if already has tryRequire pattern
	if ( content.indexOf( 'tryRequire' ) !== -1 ) {
		return 0;
	}

	// Find the MODULES section and replace everything from there to end of file
	var modulesIdx = content.indexOf( '// MODULES //' );
	if ( modulesIdx === -1 ) {
		console.error( modDir + ': WARNING - could not find // MODULES // section, skipping' );
		return 0;
	}

	var newContent = content.substring( 0, modulesIdx ) + buildNewExportBlock( routineName );

	if ( newContent === content ) {
		return 0;
	}

	if ( dryRun ) {
		console.log( modDir + ': would replace export block' );
		return 1;
	}

	fs.writeFileSync( indexPath, newContent );
	console.log( modDir + ': replaced export block' );
	return 1;
}

// Main
var modules;
var totalChanges = 0;
var i;

if ( all ) {
	modules = findModules();
} else if ( target ) {
	modules = [ target ];
} else {
	console.error( 'Usage: node bin/conform-index-js.js [--all] [--dry-run] [module-path]' );
	process.exit( 1 );
}

for ( i = 0; i < modules.length; i++ ) {
	totalChanges += conformIndexJs( modules[ i ] );
}

console.log( '\nTotal: ' + totalChanges + ' changes across ' + modules.length + ' modules' + ( dryRun ? ' (dry run)' : '' ) );
