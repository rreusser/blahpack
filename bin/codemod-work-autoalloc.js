#!/usr/bin/env node
'use strict';

/**
 * Codemod: add null-allocation branches to LAPACKE-style routine.js wrappers.
 *
 * For each module that fails the work-autoalloc gate check, inserts:
 *
 *   if ( WORK === null || WORK === void 0 ) {
 *       <minWork prep vars>
 *       WORK = new Float64Array( minWork );
 *       strideWORK = 1;
 *   }
 *
 * Size formulas come from (in priority order):
 *   1. ndarray.js — the `var minWork = ...` block already added by work-assert
 *   2. Fortran source comments — `LWORK >= MAX(...)` pattern
 *
 * Usage:
 *   node bin/codemod-work-autoalloc.js [--dry-run] [--all] [module-paths...]
 *
 * Options:
 *   --dry-run   Print changes without writing files
 *   --all       Process all modules that fail the gate check
 */

var path = require( 'path' );
var fs = require( 'fs' );
var util = require( './gate/util.js' );

var ROOT = util.ROOT;
var WORK_ARGS = util.FORTRAN_WORK_ARGS;

// Typed array constructor for each workspace type:
var ALLOC_TYPE = {
	WORK: 'Float64Array',
	RWORK: 'Float64Array',
	SWORK: 'Float32Array',
	IWORK: 'Int32Array',
	BWORK: 'Uint8Array'
};

var argv = process.argv.slice( 2 );
var dryRun = argv.indexOf( '--dry-run' ) !== -1;
var doAll = argv.indexOf( '--all' ) !== -1;
var modulePaths = argv.filter( function( a ) { return !a.startsWith( '--' ); } );

var stats = { fixed: 0, skipped: 0, alreadyOk: 0, errors: 0 };


// FORTRAN HELPERS //

/**
 * Translate a Fortran MAX(a,b,...) expression to JS Math.max( a, b, ... ).
 * Only handles simple numeric/identifier arguments (no nested MAX).
 */
function fortranExprToJS( s ) {
	s = s.trim();
	// MAX( a, b ) → Math.max( a, b ); MIN → Math.min
	s = s.replace( /\bMAX\s*\(/g, 'Math.max( ' );
	s = s.replace( /\bMIN\s*\(/g, 'Math.min( ' );
	// Fortran identifiers stay uppercase — they match the JS LAPACKE wrapper
	// convention where primary dimension params (N, M, K, etc.) are uppercase.
	// Add spaces around operators for readability:
	s = s.replace( /\*/g, ' * ' ).replace( /\+/g, ' + ' ).replace( /-/g, ' - ' );
	// Clean up double spaces:
	s = s.replace( /\s{2,}/g, ' ' ).trim();
	return s;
}

/**
 * Clean a raw Fortran LWORK/workspace expression string:
 *   - Strip Fortran ! inline comments
 *   - Strip trailing period / semicolon
 *   - Handle "N when NORM = '...'..." prose (take value before "when")
 *   - Stop at English prose that follows a complete expression
 *     (e.g. ", and for best performance" or "where NB is...")
 */
function cleanFortranLworkExpr( raw ) {
	var expr = raw.trim()
		.replace( /\s*!.*$/, '' )
		.replace( /[.;]\s*$/, '' )
		.trim();
	if ( / when /i.test( expr ) ) {
		expr = expr.replace( / when .*/i, '' ).trim();
	}
	// Walk paren-depth to stop before trailing English prose
	var depth = 0;
	var started = false;
	var i;
	var ch;
	for ( i = 0; i < expr.length; i++ ) {
		ch = expr[ i ];
		if ( ch === '(' ) { depth++; started = true; }
		else if ( ch === ')' ) { depth--; }
		else { started = true; }
		if ( depth === 0 && started && i + 1 < expr.length ) {
			var rest = expr.slice( i + 1 );
			if ( /^[,\s]+(and|or|where|if|for|when)\b/i.test( rest ) ) {
				return expr.slice( 0, i + 1 ).trim();
			}
		}
	}
	return expr;
}

/**
 * Extract the minimum workspace size from Fortran source comments.
 *
 * Tries two patterns in order:
 *   1. `LWORK >= MAX(...)` — explicit length arg constraint
 *   2. `WORK is ... array, dimension (N)` — inline dimension for arrays without LWORK
 *
 * @param {string} fortran - Fortran source
 * @param {string} workArg - e.g. 'WORK', 'IWORK', 'RWORK'
 * @param {string} lenArg - e.g. 'LWORK', 'LIWORK', 'LRWORK'
 * @param {string} varName - JS variable name to generate, e.g. 'minWork', 'minIwork'
 * @returns {{ prepLines: string[], minLine: string }|null}
 */
function extractSizeFromFortran( fortran, workArg, lenArg, varName ) {
	var lines = fortran.split( '\n' );
	var lenRe = new RegExp( '\\b' + lenArg + '\\s*>=\\s*(.+)', 'i' );
	// Matches "WORK is INTEGER array, dimension (N)" or "WORK is DOUBLE PRECISION array, dimension (N)"
	var dimRe = new RegExp( '\\b' + workArg + '\\b.*dimension\\s*\\(([^)]+)\\)', 'i' );
	var m;
	var expr;
	var i;

	// Pattern 1: LWORK >= expr
	for ( i = 0; i < lines.length; i++ ) {
		m = lenRe.exec( lines[ i ] );
		if ( m ) {
			expr = cleanFortranLworkExpr( m[ 1 ] );
			if ( expr ) {
				return {
					prepLines: [],
					minLine: 'var ' + varName + ' = ' + fortranExprToJS( expr ) + ';'
				};
			}
		}
	}

	// Pattern 2: dimension(N) inline — only useful for IWORK/RWORK without LIWORK param
	for ( i = 0; i < lines.length; i++ ) {
		m = dimRe.exec( lines[ i ] );
		if ( m ) {
			expr = cleanFortranLworkExpr( m[ 1 ] );
			if ( expr && expr !== '*' ) {
				return {
					prepLines: [],
					minLine: 'var ' + varName + ' = Math.max( 1, ' + fortranExprToJS( expr ) + ' );'
				};
			}
		}
	}

	return null;
}

/**
 * Extract minWork computation block from ndarray.js.
 * Finds `var minWork = ...` and collects the preceding `var` declarations
 * that feed into it (e.g. `var K = Math.min(M, N); var NB = 32;`).
 *
 * @param {string} content - ndarray.js source
 * @param {string} varName - e.g. 'minWork', 'minIwork', 'minRwork'
 * @returns {{ prepLines: string[], minLine: string }|null}
 */
function extractMinWorkFromNdarray( content, varName ) {
	var lines = content.split( '\n' );
	var minRe = new RegExp( '^\\s*var\\s+' + varName + '\\b' );
	var varRe = /^\s*var\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=/;
	var minIdx = -1;
	var prepLines = [];
	var i;
	var line;
	var trimmed;

	for ( i = 0; i < lines.length; i++ ) {
		if ( minRe.test( lines[ i ] ) ) {
			minIdx = i;
			break;
		}
	}
	if ( minIdx === -1 ) return null;

	// Handle multi-line statements (semicolon ends the statement):
	var minLine = lines[ minIdx ].trim();
	if ( minLine.indexOf( ';' ) === -1 ) {
		// continuation — gather until semicolon
		i = minIdx + 1;
		while ( i < lines.length && lines[ i ].indexOf( ';' ) === -1 ) {
			minLine += ' ' + lines[ i ].trim();
			i++;
		}
		if ( i < lines.length ) {
			minLine += ' ' + lines[ i ].trim();
		}
	}

	// Scan backward from minIdx collecting adjacent `var` declarations:
	i = minIdx - 1;
	while ( i >= 0 ) {
		line = lines[ i ];
		trimmed = line.trim();
		if ( trimmed === '' ) {
			i--;
			continue;
		}
		if ( varRe.test( line ) ) {
			prepLines.unshift( trimmed );
			i--;
		} else {
			break;
		}
	}

	return { prepLines: prepLines, minLine: minLine };
}

/**
 * Extract the next parameter after `workParam` in `jsParamList`.
 * This is the stride parameter (e.g. `strideWORK`).
 */
function strideParamFor( jsParamList, workParam ) {
	var idx = jsParamList.indexOf( workParam );
	if ( idx === -1 || idx + 1 >= jsParamList.length ) return null;
	var next = jsParamList[ idx + 1 ];
	// Must look like a stride param (starts with stride or contains Stride):
	if ( /^stride/i.test( next ) ) return next;
	return null;
}

/**
 * True if content already has a null-check branch for `paramName`.
 */
function hasNullBranch( content, paramName ) {
	return (
		new RegExp( '\\b' + paramName + '\\s*===\\s*null' ).test( content ) ||
		new RegExp( '\\b' + paramName + '\\s*==\\s*null' ).test( content ) ||
		new RegExp( '\\b' + paramName + '\\s*===\\s*void\\s+0' ).test( content )
	);
}

/**
 * Find the insertion point: index of the first line containing a workspace
 * `stride2offset` call, or the `return base(` line, whichever comes first.
 *
 * Returns the line index in `lines`.
 */
function findInsertionLine( lines, strideParams ) {
	var workStrideRe;
	var returnBaseIdx = -1;
	var strideIdx = -1;
	var i;
	var line;

	if ( strideParams.length > 0 ) {
		workStrideRe = new RegExp( 'stride2offset\\s*\\(.*(' + strideParams.join( '|' ) + ')' );
	}

	for ( i = 0; i < lines.length; i++ ) {
		line = lines[ i ];
		if ( returnBaseIdx === -1 && /\breturn\s+base\s*\(/.test( line ) ) {
			returnBaseIdx = i;
		}
		if ( strideIdx === -1 && workStrideRe && workStrideRe.test( line ) ) {
			strideIdx = i;
		}
	}

	// Use whichever comes first, prefer stride2offset so we inject before it:
	if ( strideIdx !== -1 && ( returnBaseIdx === -1 || strideIdx < returnBaseIdx ) ) {
		return strideIdx;
	}
	return returnBaseIdx;
}

/**
 * Detect the indentation string used in a file (tab or spaces).
 */
function detectIndent( content ) {
	var m = content.match( /^(\t| {2,4})/m );
	return m ? m[ 1 ] : '\t';
}

/**
 * Build the null-check block to insert.
 *
 * @param {Array<{fortranName, jsName, strideName, block}>} params
 * @param {string} indent
 * @returns {string}
 */
function buildNullBlock( params, indent ) {
	var lines = [];
	var i;
	var p;
	var j;

	for ( i = 0; i < params.length; i++ ) {
		p = params[ i ];
		lines.push( indent + 'if ( ' + p.jsName + ' === null || ' + p.jsName + ' === void 0 ) {' );
		if ( p.block ) {
			for ( j = 0; j < p.block.prepLines.length; j++ ) {
				lines.push( indent + indent + p.block.prepLines[ j ] );
			}
			lines.push( indent + indent + p.block.minLine );
			lines.push( indent + indent + p.jsName + ' = new ' + p.allocType + '( ' + p.jsVar + ' );' );
		} else {
			lines.push( indent + indent + p.jsName + ' = new ' + p.allocType + '( 1 );' + ' // TODO: set correct size' );
		}
		if ( p.strideName ) {
			lines.push( indent + indent + p.strideName + ' = 1;' );
		}
		lines.push( indent + '}' );
	}

	return lines.join( '\n' ) + '\n';
}


// MAIN PROCESSING //

function processModule( mod ) {
	var wrapperPath = path.join( mod.dir, 'lib', mod.routine + '.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );

	var wrapperContent = util.readFile( wrapperPath );
	var ndarrayContent = util.readFile( ndarrayPath );
	var fortran = util.readFortran( mod.routine );

	if ( !wrapperContent ) {
		console.log( 'SKIP (no wrapper): ' + mod.routine );
		stats.skipped++;
		return;
	}
	if ( !fortran ) {
		console.log( 'SKIP (no Fortran): ' + mod.routine );
		stats.skipped++;
		return;
	}

	var fArgs = util.fortranArgs( fortran, mod.routine );
	var workArgs = fArgs.filter( function( a ) { return WORK_ARGS.indexOf( a ) !== -1; } );

	if ( workArgs.length === 0 ) {
		stats.alreadyOk++;
		return;
	}

	var jsParamList = util.jsParams( wrapperContent, mod.routine );
	var jsParamLC = jsParamList.map( function( p ) { return p.toLowerCase(); } );

	// Gather params that still need null-check:
	var toFix = [];
	var i;
	var w;
	var idx;
	var jsName;
	var strideName;
	var block;

	// Map workspace type to: ndarray.js var name, Fortran len arg, JS var name
	var META = {
		WORK:  { ndVar: 'minWork',  lenArg: 'LWORK',  jsVar: 'minWork'  },
		RWORK: { ndVar: 'minRwork', lenArg: 'LRWORK', jsVar: 'minRwork' },
		IWORK: { ndVar: 'minIwork', lenArg: 'LIWORK', jsVar: 'minIwork' },
		SWORK: { ndVar: 'minWork',  lenArg: 'LWORK',  jsVar: 'minWork'  },
		BWORK: { ndVar: 'minBwork', lenArg: 'LWORK',  jsVar: 'minBwork' }
	};

	for ( i = 0; i < workArgs.length; i++ ) {
		w = workArgs[ i ];
		idx = jsParamLC.indexOf( w.toLowerCase() );
		if ( idx === -1 ) continue;
		jsName = jsParamList[ idx ];
		if ( hasNullBranch( wrapperContent, jsName ) ) continue;

		strideName = strideParamFor( jsParamList, jsName );

		var meta = META[ w ] || META.WORK;

		// Try to get size from ndarray.js first, then Fortran:
		block = null;
		if ( ndarrayContent ) {
			block = extractMinWorkFromNdarray( ndarrayContent, meta.ndVar );
			// Ensure the minLine uses the right JS var name:
			if ( block ) {
				block.minLine = block.minLine.replace(
					/^var\s+\w+\s*=/, 'var ' + meta.jsVar + ' ='
				);
			}
		}
		if ( !block ) {
			block = extractSizeFromFortran( fortran, w, meta.lenArg, meta.jsVar );
		}

		if ( !block ) {
			console.log( 'SKIP (' + w + ' size unknown): ' + mod.routine );
			stats.skipped++;
		}

		toFix.push({
			fortranName: w,
			jsName: jsName,
			strideName: strideName,
			block: block,
			allocType: ALLOC_TYPE[ w ] || 'Float64Array',
			jsVar: meta.jsVar
		});
	}

	if ( toFix.length === 0 ) {
		stats.alreadyOk++;
		return;
	}

	// Find insertion point:
	var lines = wrapperContent.split( '\n' );
	var strideParamsNeeded = toFix
		.filter( function( p ) { return p.strideName; } )
		.map( function( p ) { return p.strideName; } );

	var insertAt = findInsertionLine( lines, strideParamsNeeded );
	if ( insertAt === -1 ) {
		console.log( 'SKIP (no injection point): ' + mod.routine );
		stats.skipped++;
		return;
	}

	var indent = detectIndent( wrapperContent );
	var nullBlock = buildNullBlock( toFix, indent );

	// Insert before `insertAt`:
	var before = lines.slice( 0, insertAt ).join( '\n' );
	var after = lines.slice( insertAt ).join( '\n' );
	var newContent = before + '\n' + nullBlock + after;

	if ( dryRun ) {
		console.log( 'DRY-RUN ' + mod.routine + ' (' + wrapperPath + '):' );
		console.log( nullBlock );
	} else {
		fs.writeFileSync( wrapperPath, newContent, 'utf8' );
		console.log( 'FIXED: ' + mod.routine );
		stats.fixed++;
	}
}


// ENTRY POINT //

function main() {
	var modules;
	var i;

	if ( doAll ) {
		modules = util.discoverModules();
	} else if ( modulePaths.length > 0 ) {
		modules = modulePaths.map( function( p ) { return util.resolveModule( p ); } ).filter( Boolean );
	} else {
		console.error( 'Usage: node bin/codemod-work-autoalloc.js [--dry-run] [--all] [module-paths...]' );
		process.exit( 1 );
	}

	util.clearCache();
	for ( i = 0; i < modules.length; i++ ) {
		util.clearCache();
		processModule( modules[ i ] );
	}

	console.log( '\nDone: fixed=' + stats.fixed + ' skipped=' + stats.skipped + ' already-ok=' + stats.alreadyOk );
}

main();
