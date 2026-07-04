#!/usr/bin/env node

/**
* Conformance script: fixes package.json fields to match stdlib-js conventions.
*
* Safe mechanical changes only — no judgment calls.
*
* Usage:
*   node bin/conform-package-json.js [--dry-run] [module-path]
*   node bin/conform-package-json.js --all [--dry-run]
*
* Examples:
*   node bin/conform-package-json.js lib/lapack/base/dlacpy
*   node bin/conform-package-json.js --all --dry-run
*/

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );

var args = process.argv.slice( 2 );
var dryRun = args.includes( '--dry-run' );
var all = args.includes( '--all' );
var target = args.find( function( a ) { return a[ 0 ] !== '-'; } );

// Standard fields that every stdlib module should have:
var HOMEPAGE = 'https://github.com/stdlib-js/stdlib';
var REPOSITORY = {
	'type': 'git',
	'url': 'git://github.com/stdlib-js/stdlib.git'
};
var BUGS = {
	'url': 'https://github.com/stdlib-js/stdlib/issues'
};
var ENGINES = {
	'node': '>=0.10.0',
	'npm': '>2.7.0'
};
var OS = [
	'aix', 'darwin', 'freebsd', 'linux', 'macos',
	'openbsd', 'sunos', 'win32', 'windows'
];

function findModules() {
	var results = [];
	var pkgs = [ 'blas', 'lapack' ];
	var i;
	var j;
	var pkg;
	var routines;
	var dir;

	for ( i = 0; i < pkgs.length; i++ ) {
		pkg = pkgs[ i ];
		dir = path.join( 'lib', pkg, 'base' );
		if ( !fs.existsSync( dir ) ) {
			continue;
		}
		routines = fs.readdirSync( dir );
		for ( j = 0; j < routines.length; j++ ) {
			var modDir = path.join( dir, routines[ j ] );
			var pkgJson = path.join( modDir, 'package.json' );
			if ( fs.existsSync( pkgJson ) ) {
				results.push( modDir );
			}
		}
	}
	return results;
}

function conformPackageJson( modDir ) {
	var pkgPath = path.join( modDir, 'package.json' );
	var raw = fs.readFileSync( pkgPath, 'utf8' );
	var pkg = JSON.parse( raw );
	var changes = [];

	// 1. Fix "main" field
	if ( pkg.main !== './lib' ) {
		changes.push( 'main: "' + pkg.main + '" -> "./lib"' );
		pkg.main = './lib';
	}

	// 2. Remove "scripts.test" (stdlib has empty scripts)
	if ( pkg.scripts && pkg.scripts.test ) {
		changes.push( 'scripts: removed test script' );
		pkg.scripts = {};
	}

	// 3. Add "types" field
	if ( !pkg.types ) {
		changes.push( 'types: added "./docs/types"' );
		pkg.types = './docs/types';
	}

	// 4. Add "homepage"
	if ( !pkg.homepage ) {
		changes.push( 'homepage: added' );
		pkg.homepage = HOMEPAGE;
	}

	// 5. Add "repository"
	if ( !pkg.repository ) {
		changes.push( 'repository: added' );
		pkg.repository = REPOSITORY;
	}

	// 6. Add "bugs"
	if ( !pkg.bugs ) {
		changes.push( 'bugs: added' );
		pkg.bugs = BUGS;
	}

	// 7. Add "dependencies" and "devDependencies" (empty objects)
	if ( !pkg.dependencies ) {
		changes.push( 'dependencies: added {}' );
		pkg.dependencies = {};
	}
	if ( !pkg.devDependencies ) {
		changes.push( 'devDependencies: added {}' );
		pkg.devDependencies = {};
	}

	// 8. Add "engines"
	if ( !pkg.engines ) {
		changes.push( 'engines: added' );
		pkg.engines = ENGINES;
	}

	// 9. Add "os"
	if ( !pkg.os ) {
		changes.push( 'os: added' );
		pkg.os = OS;
	}

	if ( changes.length === 0 ) {
		return 0;
	}

	if ( dryRun ) {
		console.log( modDir + ': would make ' + changes.length + ' changes' );
		changes.forEach( function( c ) { console.log( '  ' + c ); } );
	} else {
		// Write with consistent field ordering matching stdlib
		var ordered = buildOrdered( pkg );
		fs.writeFileSync( pkgPath, JSON.stringify( ordered, null, '  ' ) + '\n' );
		console.log( modDir + ': ' + changes.length + ' changes' );
	}
	return changes.length;
}

function buildOrdered( pkg ) {
	// Match stdlib's field order
	var result = {};
	var fieldOrder = [
		'name', 'version', 'description', 'license', 'author',
		'contributors', 'main', 'browser', 'gypfile', 'directories',
		'types', 'scripts', 'homepage', 'repository', 'bugs',
		'dependencies', 'devDependencies', 'engines', 'os', 'keywords'
	];
	var i;
	var key;

	for ( i = 0; i < fieldOrder.length; i++ ) {
		key = fieldOrder[ i ];
		if ( pkg[ key ] !== undefined ) {
			result[ key ] = pkg[ key ];
		}
	}
	// Add any remaining fields not in the standard order
	var keys = Object.keys( pkg );
	for ( i = 0; i < keys.length; i++ ) {
		if ( result[ keys[ i ] ] === undefined ) {
			result[ keys[ i ] ] = pkg[ keys[ i ] ];
		}
	}
	return result;
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
	console.error( 'Usage: node bin/conform-package-json.js [--all] [--dry-run] [module-path]' );
	process.exit( 1 );
}

for ( i = 0; i < modules.length; i++ ) {
	totalChanges += conformPackageJson( modules[ i ] );
}

console.log( '\nTotal: ' + totalChanges + ' changes across ' + modules.length + ' modules' + ( dryRun ? ' (dry run)' : '' ) );
