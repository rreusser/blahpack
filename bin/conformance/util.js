'use strict';

var fs = require( 'fs' );
var path = require( 'path' );

var ROOT = path.resolve( __dirname, '..', '..' );

// Per-module file cache (cleared between modules)
var fileCache = new Map();

function clearCache() {
	fileCache.clear();
}

function readFile( filePath ) {
	if ( fileCache.has( filePath ) ) {
		return fileCache.get( filePath );
	}
	var content;
	try {
		content = fs.readFileSync( filePath, 'utf8' );
	} catch ( e ) {
		content = null;
	}
	fileCache.set( filePath, content );
	return content;
}

function fileExists( filePath ) {
	return readFile( filePath ) !== null;
}

function grepFile( filePath, pattern ) {
	var content = readFile( filePath );
	if ( !content ) {
		return [];
	}
	var lines = content.split( '\n' );
	var results = [];
	var i;
	for ( i = 0; i < lines.length; i++ ) {
		if ( pattern.test( lines[ i ] ) ) {
			results.push({
				line: i + 1,
				text: lines[ i ]
			});
		}
	}
	return results;
}

function grepCount( filePath, pattern ) {
	return grepFile( filePath, pattern ).length;
}

function getRoutineName( moduleDir ) {
	return path.basename( moduleDir );
}

function getPrefix( routineName ) {
	return routineName.charAt( 0 );
}

function isZPrefix( routineName ) {
	return getPrefix( routineName ) === 'z' || getPrefix( routineName ) === 'c';
}

function isDPrefix( routineName ) {
	return getPrefix( routineName ) === 'd' || getPrefix( routineName ) === 's';
}

function getPkg( moduleDir ) {
	var rel = path.relative( path.join( ROOT, 'lib' ), moduleDir );
	return rel.split( path.sep )[ 0 ];
}

function discoverModules( pathOrAll ) {
	var modules = [];
	var pkgs = [ 'blas', 'lapack' ];
	var pkgDir;
	var entries;
	var modDir;
	var i;
	var j;

	for ( i = 0; i < pkgs.length; i++ ) {
		pkgDir = path.join( ROOT, 'lib', pkgs[ i ], 'base' );
		if ( !fs.existsSync( pkgDir ) ) {
			continue;
		}
		entries = fs.readdirSync( pkgDir );
		for ( j = 0; j < entries.length; j++ ) {
			modDir = path.join( pkgDir, entries[ j ] );
			if ( !fs.statSync( modDir ).isDirectory() ) {
				continue;
			}
			// Must at least have lib/base.js to be considered a module
			if ( !fs.existsSync( path.join( modDir, 'lib', 'base.js' ) ) ) {
				continue;
			}
			modules.push({
				dir: modDir,
				pkg: pkgs[ i ],
				routine: entries[ j ]
			});
		}
	}
	modules.sort( function sort( a, b ) {
		if ( a.pkg < b.pkg ) return -1;
		if ( a.pkg > b.pkg ) return 1;
		if ( a.routine < b.routine ) return -1;
		if ( a.routine > b.routine ) return 1;
		return 0;
	});
	return modules;
}

function resolveModule( inputPath ) {
	var absPath = path.resolve( ROOT, inputPath );
	// Strip trailing slash
	if ( absPath.endsWith( '/' ) ) {
		absPath = absPath.slice( 0, -1 );
	}
	if ( !fs.existsSync( absPath ) ) {
		return null;
	}
	var routine = path.basename( absPath );
	var pkg = getPkg( absPath );
	return {
		dir: absPath,
		pkg: pkg,
		routine: routine
	};
}

function result( id, name, status, opts ) {
	opts = opts || {};
	return {
		id: id,
		name: name,
		status: status,
		count: opts.count || 0,
		locations: opts.locations || [],
		message: opts.message || ''
	};
}

function pass( id, name ) {
	return result( id, name, 'pass' );
}

function fail( id, name, count, locations, message ) {
	return result( id, name, 'fail', {
		count: count,
		locations: locations || [],
		message: message || ( count + ' violation(s)' )
	});
}

function warn( id, name, count, locations, message ) {
	return result( id, name, 'warn', {
		count: count,
		locations: locations || [],
		message: message || ( count + ' warning(s)' )
	});
}

function skip( id, name, message ) {
	return result( id, name, 'skip', { message: message || 'not applicable' });
}

// Fortran workspace argument names (caller-provided scratch):
var FORTRAN_WORK_ARGS = [ 'WORK', 'RWORK', 'IWORK', 'SWORK', 'BWORK' ];

/**
 * Uppercase argument names of a routine's reference Fortran signature, read
 * from the committed parsed-Fortran cache (data/fortran-signatures.json).
 * Returns null when the routine is not in the cache. Checks must not read the
 * Fortran sources themselves: they are gitignored, so a check that reads them
 * silently does less in CI than locally.
 */
var FORTRAN_SIGNATURES = null;
function fortranArgNames( routine ) {
	var entry;
	if ( FORTRAN_SIGNATURES === null ) {
		FORTRAN_SIGNATURES = JSON.parse( fs.readFileSync( path.join( ROOT, 'data', 'fortran-signatures.json' ), 'utf8' ) );
	}
	entry = FORTRAN_SIGNATURES[ String( routine ).toLowerCase() ];
	if ( !entry ) {
		return null;
	}
	return entry.arguments.map( function name( a ) {
		return String( a.name ).toUpperCase();
	});
}

/**
 * Extract the parameter list of the primary exported function in a JS file.
 */
function jsParams( content, routine ) {
	if ( !content ) {
		return [];
	}
	var re = new RegExp( 'function\\s+' + routine + '\\s*\\(', 'i' );
	var m = re.exec( content );
	if ( !m && routine.indexOf( '_' ) !== -1 ) {
		// The JS implementation strips underscores from the reference routine
		// name (e.g. `dsytrf_rk` is implemented as `function dsytrfrk`), so fall
		// back to the underscore-free form before giving up.
		re = new RegExp( 'function\\s+' + routine.replace( /_/g, '' ) + '\\s*\\(', 'i' );
		m = re.exec( content );
	}
	if ( !m ) {
		return [];
	}
	var start = content.indexOf( '(', m.index );
	var depth = 0;
	var i;
	var ch;
	for ( i = start; i < content.length; i++ ) {
		ch = content[ i ];
		if ( ch === '(' ) {
			depth += 1;
		} else if ( ch === ')' ) {
			depth -= 1;
			if ( depth === 0 ) {
				return content.slice( start + 1, i )
					.split( ',' )
					.map( function map( a ) {
						return a.replace( /=.*$/, '' ).trim();
					})
					.filter( function filter( a ) {
						return a.length > 0 && !/^\/\//.test( a );
					});
			}
		}
	}
	return [];
}

/**
* The code on a line that a single-char-flag check should look at, or `null`
* when the line is a comment, a require or an eslint directive. A trailing
* comment is stripped rather than exempting the line, so it can't hide a flag,
* and ilaenv/iparmq arguments are removed: their OPTS are the reference's own
* letters (CONVENTIONS X3).
*/
function flagCheckCode( text ) {
	if ( /^\s*(?:\/\/|\/?\*)|eslint|require/.test( text ) ) {
		return null;
	}
	return text.replace( /\s\/\/.*$/, '' ).replace( /\b(?:ilaenv|iparmq)\s*\([^)]*\)/g, '' );
}

module.exports = {
	ROOT: ROOT,
	FORTRAN_WORK_ARGS: FORTRAN_WORK_ARGS,
	clearCache: clearCache,
	readFile: readFile,
	fileExists: fileExists,
	grepFile: grepFile,
	flagCheckCode: flagCheckCode,
	grepCount: grepCount,
	getRoutineName: getRoutineName,
	getPrefix: getPrefix,
	isZPrefix: isZPrefix,
	isDPrefix: isDPrefix,
	getPkg: getPkg,
	discoverModules: discoverModules,
	resolveModule: resolveModule,
	fortranArgNames: fortranArgNames,
	jsParams: jsParams,
	result: result,
	pass: pass,
	fail: fail,
	warn: warn,
	skip: skip
};
