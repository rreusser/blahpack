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
 * Locate the reference Fortran source for a routine.
 */
function readFortran( routine ) {
	var candidates = [
		path.join( ROOT, 'data', 'lapack-3.12.0', 'SRC', routine + '.f' ),
		path.join( ROOT, 'data', 'lapack-3.12.0', 'SRC', routine + '.F' ),
		path.join( ROOT, 'data', 'BLAS-3.12.0', routine + '.f' ),
		path.join( ROOT, 'data', 'lapack-3.12.0', 'SRC', 'DEPRECATED', routine + '.f' )
	];
	var i;
	var c;
	for ( i = 0; i < candidates.length; i++ ) {
		c = readFile( candidates[ i ] );
		if ( c !== null ) {
			return c;
		}
	}
	return null;
}

/**
 * Split a comma-separated argument string into trimmed uppercase identifiers.
 */
function splitFortranArgs( s ) {
	return s.split( ',' )
		.map( function map( a ) {
			return a.replace( /=.*$/, '' ).trim().toUpperCase();
		})
		.filter( function filter( a ) {
			return a.length > 0;
		});
}

/**
 * Extract the uppercase argument list from a fixed-form Fortran declaration.
 * Handles continuation lines and both SUBROUTINE and (typed) FUNCTION forms.
 */
function fortranArgs( content, routine ) {
	var lines = content.split( '\n' );
	var re = new RegExp( '\\b(?:SUBROUTINE|FUNCTION)\\s+' + routine.toUpperCase() + '\\s*\\(', 'i' );
	var buf = null;
	var depth = 0;
	var line;
	var frag;
	var i;
	var j;
	var ch;

	for ( i = 0; i < lines.length; i++ ) {
		line = lines[ i ];
		if ( /^[*cC!]/.test( line ) ) {
			continue;
		}
		if ( buf === null ) {
			if ( !re.test( line ) ) {
				continue;
			}
			frag = line.slice( line.indexOf( '(' ) );
		} else {
			frag = line.slice( 6 );
		}
		for ( j = 0; j < frag.length; j++ ) {
			ch = frag[ j ];
			if ( ch === '(' ) {
				depth += 1;
				if ( depth === 1 ) {
					buf = '';
					continue;
				}
			} else if ( ch === ')' ) {
				depth -= 1;
				if ( depth === 0 ) {
					return splitFortranArgs( buf );
				}
			}
			if ( buf !== null ) {
				buf += ch;
			}
		}
	}
	return [];
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

module.exports = {
	ROOT: ROOT,
	FORTRAN_WORK_ARGS: FORTRAN_WORK_ARGS,
	clearCache: clearCache,
	readFile: readFile,
	fileExists: fileExists,
	grepFile: grepFile,
	grepCount: grepCount,
	getRoutineName: getRoutineName,
	getPrefix: getPrefix,
	isZPrefix: isZPrefix,
	isDPrefix: isDPrefix,
	getPkg: getPkg,
	discoverModules: discoverModules,
	resolveModule: resolveModule,
	readFortran: readFortran,
	fortranArgs: fortranArgs,
	jsParams: jsParams,
	result: result,
	pass: pass,
	fail: fail,
	warn: warn,
	skip: skip
};
