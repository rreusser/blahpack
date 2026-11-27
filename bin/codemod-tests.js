#!/usr/bin/env node

// Codemod for test files — applies mechanical stdlib convention fixes.
//
// Usage:
//   node bin/codemod-tests.js lib/blas/dcopy/test/test.js
//   node bin/codemod-tests.js --dry-run lib/blas/{name}/test/test.js
//
// Fixes applied:
//   1. Remove stdlib/require-globals from eslint-disable (we require globals)
//   2. Add missing @stdlib requires for Float64Array etc.
//   3. Replace Array.from() with toArray() helper + add the helper
//   4. Within each test() callback, hoist var declarations to the top
//      (fixes no-use-before-define) and sort by length (stdlib/vars-order)
//   5. Add eslint-disable-line max-len to long lines
//   6. Add eslint-disable-line node/no-sync to readFileSync

'use strict';

var esprima = require( 'esprima' );
var escodegen = require( 'escodegen' );
var fs = require( 'fs' );

var dryRun = false;
var files = [];
var i;

for ( i = 2; i < process.argv.length; i++ ) {
	if ( process.argv[ i ] === '--dry-run' ) {
		dryRun = true;
	} else {
		files.push( process.argv[ i ] );
	}
}

if ( files.length === 0 ) {
	process.stderr.write(
		'Usage: node bin/codemod-tests.js [--dry-run] <files...>\n'
	);
	process.exit( 1 );
}

var GLOBAL_REQUIRES = {
	'Float64Array': '@stdlib/array/float64',
	'Float32Array': '@stdlib/array/float32',
	'Int32Array': '@stdlib/array/int32',
	'Complex128Array': '@stdlib/array/complex128',
	'Complex64Array': '@stdlib/array/complex64'
};

var TO_ARRAY_HELPER =
	'/**\n' +
	'* Converts a typed array to a plain array.\n' +
	'*\n' +
	'* @private\n' +
	'* @param {TypedArray} arr - input array\n' +
	'* @returns {Array} output array\n' +
	'*/\n' +
	'function toArray( arr ) {\n' +
	'\tvar out = [];\n' +
	'\tvar i;\n' +
	'\tfor ( i = 0; i < arr.length; i++ ) {\n' +
	'\t\tout.push( arr[ i ] );\n' +
	'\t}\n' +
	'\treturn out;\n' +
	'}';

function processFile( file ) {
	if ( !fs.existsSync( file ) ) {
		return false;
	}
	var src = fs.readFileSync( file, 'utf8' );
	var original = src;

	// --- Phase 1: Text-level transforms ---

	// 1a. Remove stdlib/require-globals from eslint-disable
	src = src.replace( /,\s*stdlib\/require-globals/g, '' );
	src = src.replace( /stdlib\/require-globals,\s*/g, '' );
	src = src.replace( /stdlib\/require-globals/g, '' );
	src = src.replace( /\/\*\s*eslint-disable\s*,\s*/g, '/* eslint-disable ' );
	src = src.replace( /,\s*\*\//g, ' */' );

	// 1b. Add missing @stdlib requires for globals
	var globalNames = Object.keys( GLOBAL_REQUIRES );
	var addRequires = [];
	globalNames.forEach( function checkGlobal( name ) {
		var useRE = new RegExp( '\\bnew\\s+' + name + '\\b' );
		var reqRE = new RegExp( 'var\\s+' + name + '\\s*=\\s*require' );
		if ( useRE.test( src ) && !reqRE.test( src ) ) {
			addRequires.push(
				'var ' + name + ' = require( \'' +
				GLOBAL_REQUIRES[ name ] + '\' );'
			);
		}
	});
	if ( addRequires.length > 0 ) {
		var lastReq = src.lastIndexOf( 'require(' );
		if ( lastReq !== -1 ) {
			var lineEnd = src.indexOf( '\n', lastReq );
			if ( lineEnd !== -1 ) {
				src = src.substring( 0, lineEnd + 1 ) +
					addRequires.join( '\n' ) + '\n' +
					src.substring( lineEnd + 1 );
			}
		}
	}

	// 1c. Replace Array.from(x) with toArray( x )
	var hadArrayFrom = /Array\.from\s*\(/.test( src );
	src = src.replace( /Array\.from\(\s*/g, 'toArray( ' );

	// 1d. Add toArray helper if needed and not present
	if ( hadArrayFrom && !/function toArray/.test( src ) ) {
		var testsMarker = src.indexOf( '// TESTS //' );
		var firstTest = src.indexOf( "test( '" );
		var insertBefore = ( testsMarker !== -1 ) ? testsMarker : firstTest;

		if ( insertBefore !== -1 ) {
			var hasFuncSection = /\/\/ FUNCTIONS \/\//.test( src );
			var block;
			if ( !hasFuncSection ) {
				block = '\n// FUNCTIONS //\n\n' + TO_ARRAY_HELPER + '\n\n\n';
			} else {
				block = TO_ARRAY_HELPER + '\n\n';
			}
			src = src.substring( 0, insertBefore ) + block +
				src.substring( insertBefore );
		}
	}

	// --- Phase 2: AST-level var hoisting in test callbacks ---

	var ast;
	try {
		ast = esprima.parseScript( src, { range: true, loc: true } );
	} catch ( e ) {
		process.stderr.write( 'Parse error in ' + file + ': ' + e.message + '\n' );
		return applyTextFixes( src, original, file );
	}

	// Find all test() call expressions with FunctionExpression callbacks
	var edits = [];

	function walk( node ) {
		if ( !node || typeof node !== 'object' ) {
			return;
		}
		if (
			node.type === 'ExpressionStatement' &&
			node.expression.type === 'CallExpression' &&
			node.expression.callee.type === 'Identifier' &&
			node.expression.callee.name === 'test' &&
			node.expression.arguments.length >= 2
		) {
			var fn = node.expression.arguments[ 1 ];
			if (
				fn.type === 'FunctionExpression' &&
				fn.body.type === 'BlockStatement'
			) {
				hoistVarsInBody( fn.body, edits );
			}
		}
		var keys = Object.keys( node );
		var j;
		var child;
		for ( j = 0; j < keys.length; j++ ) {
			child = node[ keys[j] ];
			if ( Array.isArray( child ) ) {
				child.forEach( walk );
			} else if ( child && typeof child === 'object' && child.type ) {
				walk( child );
			}
		}
	}

	function hoistVarsInBody( body, edits ) {
		var stmts = body.body;
		if ( !stmts || stmts.length === 0 ) {
			return;
		}

		// Collect all var declarations in this body
		var varDecls = [];
		var hasOutOfOrderVars = false;
		var seenNonVar = false;
		var j;
		var k;
		var stmt;

		for ( j = 0; j < stmts.length; j++ ) {
			stmt = stmts[ j ];
			if ( stmt.type === 'VariableDeclaration' ) {
				for ( k = 0; k < stmt.declarations.length; k++ ) {
					var d = stmt.declarations[ k ];
					varDecls.push({
						name: d.id.name,
						hasInit: d.init !== null,
						initSrc: d.init ?
							src.substring( d.init.range[0], d.init.range[1] ) :
							null,
						stmtRange: stmt.range,
						stmtIdx: j,
						afterNonVar: seenNonVar
					});
				}
				if ( seenNonVar ) {
					hasOutOfOrderVars = true;
				}
			} else {
				seenNonVar = true;
			}
		}

		if ( varDecls.length === 0 ) {
			return;
		}

		// Also check ExpressionStatement assignments to local vars
		var allLocalNames = {};
		varDecls.forEach( function( v ) { allLocalNames[ v.name ] = true; });

		var hasLocalRef = false;

		// Check var initializers
		varDecls.forEach( function checkRef( v ) {
			if ( !v.hasInit ) {
				return;
			}
			Object.keys( allLocalNames ).forEach( function( other ) {
				if ( other === v.name ) {
					return;
				}
				var re = new RegExp( '\\b' + other + '\\b' );
				if ( re.test( v.initSrc ) ) {
					hasLocalRef = true;
				}
			});
		});

		// Check ExpressionStatement assignments to local vars
		stmts.forEach( function checkExpr( s ) {
			if (
				s.type === 'ExpressionStatement' &&
				s.expression.type === 'AssignmentExpression' &&
				s.expression.left.type === 'Identifier' &&
				allLocalNames[ s.expression.left.name ]
			) {
				var rhsSrc = src.substring(
					s.expression.right.range[0],
					s.expression.right.range[1]
				);
				Object.keys( allLocalNames ).forEach( function( other ) {
					if ( other === s.expression.left.name ) {
						return;
					}
					var re = new RegExp( '\\b' + other + '\\b' );
					if ( re.test( rhsSrc ) ) {
						hasLocalRef = true;
					}
				});
			}
		});

		// Skip if no vars reference each other and all are already at top
		if ( !hasLocalRef && !hasOutOfOrderVars ) {
			return;
		}

		// Build the replacement: declare all vars at top, assign later
		var uniqueNames = [];
		var seen = {};
		varDecls.forEach( function( v ) {
			if ( !seen[ v.name ] ) {
				seen[ v.name ] = true;
				uniqueNames.push( v.name );
			}
		});

		// Sort by length descending (stdlib/vars-order)
		uniqueNames.sort( function( a, b ) {
			return b.length - a.length;
		});

		edits.push({
			bodyRange: body.range,
			stmts: stmts,
			varDecls: varDecls,
			uniqueNames: uniqueNames
		});
	}

	walk( ast );

	// Apply edits from bottom to top
	edits.sort( function( a, b ) {
		return b.bodyRange[0] - a.bodyRange[0];
	});

	edits.forEach( function applyEdit( edit ) {
		// Determine indentation
		var firstStmt = edit.stmts[0];
		var lineStart = src.lastIndexOf( '\n', firstStmt.range[0] ) + 1;
		var indent = '';
		while (
			lineStart + indent.length < firstStmt.range[0] &&
			/[\t ]/.test( src[ lineStart + indent.length ] )
		) {
			indent += src[ lineStart + indent.length ];
		}

		// Build new var block
		var varBlock = edit.uniqueNames.map( function( name ) {
			return indent + 'var ' + name + ';';
		}).join( '\n' );

		// Build new body: var declarations at top, then statements.
		// Only var declarations from the leading block (before any
		// non-var statement) get their assignments toposorted.
		// Var declarations after non-var statements become assignments
		// in-place (preserving position relative to other statements).
		var leadingAssigns = [];
		var bodyStmts = [];
		var seenNonVar2 = false;
		var j;
		var stmt;

		for ( j = 0; j < edit.stmts.length; j++ ) {
			stmt = edit.stmts[ j ];

			if ( stmt.type === 'VariableDeclaration' && !seenNonVar2 ) {
				// Leading var block: extract initializers for toposorting
				stmt.declarations.forEach( function( d ) {
					if ( !d.init ) {
						return;
					}
					var initSrc = src.substring(
						d.init.range[0], d.init.range[1]
					);
					var deps = [];
					edit.uniqueNames.forEach( function( other ) {
						if ( other === d.id.name ) {
							return;
						}
						var re = new RegExp( '\\b' + other + '\\b' );
						if ( re.test( initSrc ) ) {
							deps.push( other );
						}
					});
					leadingAssigns.push({
						name: d.id.name,
						line: indent + d.id.name + ' = ' + initSrc + ';',
						deps: deps
					});
				});
			} else if ( stmt.type === 'VariableDeclaration' && seenNonVar2 ) {
				// Late var: convert to assignment in-place
				stmt.declarations.forEach( function( d ) {
					if ( d.init ) {
						var initSrc = src.substring(
							d.init.range[0], d.init.range[1]
						);
						bodyStmts.push(
							indent + d.id.name + ' = ' + initSrc + ';'
						);
					}
				});
			} else {
				seenNonVar2 = true;
				var stmtSrc = src.substring( stmt.range[0], stmt.range[1] );
				stmtSrc = stmtSrc.replace( /^[\t ]+/, '' );
				bodyStmts.push( indent + stmtSrc );
			}
		}

		// Topological sort of leading assignments by dependency
		var sorted = [];
		var placed = {};
		var maxIter = leadingAssigns.length * leadingAssigns.length + 1;
		var iter = 0;
		while ( sorted.length < leadingAssigns.length && iter < maxIter ) {
			iter += 1;
			leadingAssigns.forEach( function( a ) {
				if ( placed[ a.name ] ) {
					return;
				}
				var ready = a.deps.every( function( dep ) {
					return placed[ dep ];
				});
				if ( ready ) {
					sorted.push( a );
					placed[ a.name ] = true;
				}
			});
		}

		// Fall back to original order for cycles
		if ( sorted.length < leadingAssigns.length ) {
			leadingAssigns.forEach( function( a ) {
				if ( !placed[ a.name ] ) {
					sorted.push( a );
				}
			});
		}

		// Combine: sorted leading assigns + remaining body statements
		var newStmts = sorted.map( function( a ) { return a.line; });
		bodyStmts.forEach( function( s ) {
			newStmts.push( s );
		});

		// Assemble the new body content
		var newBody = '\n' + varBlock + '\n\n' + newStmts.join( '\n' ) + '\n';

		// Replace the body content (between { and })
		var bodyStart = edit.bodyRange[0] + 1; // After {
		var bodyEnd = edit.bodyRange[1] - 1;    // Before }

		src = src.substring( 0, bodyStart ) + newBody +
			src.substring( bodyEnd );
	});

	return applyTextFixes( src, original, file );
}

// Known helper descriptions (params are read dynamically from the source)
var HELPER_DESCRIPTIONS = {
	'findCase': 'Returns a test case from the fixture data.',
	'tc': 'Returns a test case from the fixture data.',
	'assertArrayClose': 'Asserts that two arrays are element-wise approximately equal.',
	'assertClose': 'Asserts that two numbers are approximately equal.',
	'assertComplexClose': 'Asserts that two complex numbers are approximately equal.',
	'toArray': 'Converts a typed array to a plain array.',
	'complexToArray': 'Converts a complex array to a plain array of interleaved re/im.'
};

// Guess @param type and description from name
var PARAM_INFO = {
	'name': [ '{string}', 'test case name' ],
	'actual': [ '{*}', 'actual value' ],
	'expected': [ '{*}', 'expected value' ],
	'tol': [ '{number}', 'tolerance' ],
	'msg': [ '{string}', 'assertion message' ],
	'arr': [ '{TypedArray}', 'input array' ],
	'relErr': [ '{number}', 'relative error' ],
	'sb1': [ '{number}', 'stride for first dimension' ],
	'sb2': [ '{number}', 'stride for second dimension' ],
	'result': [ '{*}', 'result' ]
};

function guessParamInfo( name ) {
	return PARAM_INFO[ name ] || [ '{*}', name ];
}

/**
* Generates JSDoc for a function by reading its actual params from source.
*
* @private
* @param {string} funcName - function name
* @param {string} src - full source text
* @returns {(string|null)} JSDoc block or null
*/
function generateJSDoc( funcName, src ) {
	var desc = HELPER_DESCRIPTIONS[ funcName ];
	if ( !desc ) {
		desc = funcName + '.';
	}

	// Find the function and extract its params
	var re = new RegExp(
		'function\\s+' + funcName + '\\s*\\(([^)]*)\\)'
	);
	var match = src.match( re );
	if ( !match ) {
		return null;
	}
	var params = match[ 1 ].split( ',' ).map( function trim( s ) {
		return s.trim();
	}).filter( Boolean );

	// Check for return by finding the function body and looking for return
	var bodyStart = src.indexOf( '{', match.index + match[0].length );
	var hasReturn = false;
	if ( bodyStart !== -1 ) {
		// Find matching close brace (simple depth count)
		var depth = 1;
		var pos = bodyStart + 1;
		var bodyContent = '';
		while ( pos < src.length && depth > 0 ) {
			if ( src[ pos ] === '{' ) {
				depth += 1;
			} else if ( src[ pos ] === '}' ) {
				depth -= 1;
			}
			if ( depth > 0 ) {
				bodyContent += src[ pos ];
			}
			pos += 1;
		}
		// Only count returns at depth 0 (not inside nested functions)
		// Simple heuristic: check for 'return ' not inside a nested function
		var simpleBody = bodyContent.replace(
			/function\s*\w*\s*\([^)]*\)\s*\{[^}]*\}/g, ''
		);
		hasReturn = /\breturn\s+[^;]/.test( simpleBody );
	}

	var lines = [];
	lines.push( '/**' );
	lines.push( '* ' + desc );
	lines.push( '*' );
	lines.push( '* @private' );
	params.forEach( function addParam( p ) {
		var info = guessParamInfo( p );
		lines.push( '* @param ' + info[ 0 ] + ' ' + p +
			' - ' + info[ 1 ] );
	});
	if ( hasReturn ) {
		lines.push( '* @returns {*} result' );
	}
	lines.push( '*/' );
	return lines.join( '\n' ) + '\n';
}

function applyTextFixes( src, original, file ) {
	// --- Phase 3: Text-level fixes ---

	// 3a. Ensure eslint-disable header has no-restricted-syntax, first-unit-test
	var requiredDisables = [ 'no-restricted-syntax', 'stdlib/first-unit-test' ];
	var headerMatch = src.match(
		/^\/\*\s*eslint-disable\s+([^*]*)\*\//m
	);
	if ( headerMatch ) {
		var existing = headerMatch[1].split( /,\s*/ ).map(
			function trim( s ) { return s.trim(); }
		).filter( Boolean );
		var toAdd = requiredDisables.filter( function missing( r ) {
			return existing.indexOf( r ) === -1;
		});
		if ( toAdd.length > 0 ) {
			var allRules = existing.concat( toAdd ).join( ', ' );
			src = src.replace( headerMatch[0],
				'/* eslint-disable ' + allRules + ' */' );
		}
	} else {
		// No header — add one at the top
		src = '/* eslint-disable ' + requiredDisables.join( ', ' ) +
			' */\n\n' + src;
	}

	// 3b. Add names to anonymous functions in common patterns
	src = src.replace(
		/\.(map|find|filter|forEach|some|every|reduce)\(\s*function\s*\(/g,
		function addMethodName( match, method ) {
			return '.' + method + '( function ' + method + '(';
		}
	);
	// Also: assert.throws( function() { -> assert.throws( function throws() {
	src = src.replace(
		/assert\.throws\(\s*function\s*\(\s*\)/g,
		'assert.throws( function throws()'
	);

	// 3c. Rename HELPERS section to FUNCTIONS (valid section name)
	src = src.replace( /\/\/ HELPERS \/\//g, '// FUNCTIONS //' );

	// 3d. Ensure section headers have proper blank lines before them
	//     Pattern: \n\n\n// SECTION //  (two blank lines before)
	//     EXCEPTION: immediately following `'use strict';` the stdlib
	//     `section-header-empty-lines` rule requires exactly ONE empty line,
	//     so we must not add a second.
	src = src.replace(
		/([^\n])\n(\/\/ (?:MODULES|VARIABLES|FUNCTIONS|FIXTURES|TESTS|EXPORTS|MAIN) \/\/)/g,
		function replacer( match, prefix, header ) {
			return prefix + '\n\n\n' + header;
		}
	);
	// Also fix when there's only one blank line
	src = src.replace(
		/([^\n])\n\n(\/\/ (?:MODULES|VARIABLES|FUNCTIONS|FIXTURES|TESTS|EXPORTS|MAIN) \/\/)/g,
		'$1\n\n\n$2'
	);
	// Undo for the `'use strict';` case, which the stdlib rule requires to
	// have exactly one blank line before the section header.
	src = src.replace(
		/('use strict';)\n\n+(\/\/ (?:MODULES|VARIABLES|FUNCTIONS|FIXTURES|TESTS|EXPORTS|MAIN) \/\/)/g,
		'$1\n\n$2'
	);

	// 3e. Add JSDoc to helper functions if missing
	var funcRE = /^function\s+(\w+)\s*\(/gm;
	var funcMatch;
	while ( ( funcMatch = funcRE.exec( src ) ) !== null ) {
		var funcName = funcMatch[ 1 ];

		// Skip test callbacks (named 't')
		if ( funcName === 't' ) {
			continue;
		}

		// Check if there's already a JSDoc before this function
		var beforeIdx = funcMatch.index;
		var lineStart = src.lastIndexOf( '\n', beforeIdx - 1 );
		var prevLine = ( lineStart > 0 ) ?
			src.substring(
				src.lastIndexOf( '\n', lineStart - 1 ) + 1, lineStart
			) : '';
		if ( /\*\/\s*$/.test( prevLine ) ) {
			continue; // Already has JSDoc
		}

		var jsdoc = generateJSDoc( funcName, src );
		if ( jsdoc ) {
			src = src.substring( 0, funcMatch.index ) +
				jsdoc + src.substring( funcMatch.index );
			// Reset regex index since we modified the string
			funcRE.lastIndex = funcMatch.index + jsdoc.length +
				funcMatch[ 0 ].length;
		}
	}

	// 3d. Fix max-statements-per-line for inline functions:
	//     function(x) { return expr; }  ->  multiline
	src = src.replace(
		/function\s+(\w+)\(\s*([^)]*)\)\s*\{\s*return\s+([^;]+);\s*\}/g,
		function splitInline( match, name, params, body ) {
			// Only split if the line has 2+ statements
			if ( match.length < 40 ) {
				return match; // Short enough, leave it
			}
			return 'function ' + name + '( ' + params.trim() +
				' ) {\n\t\treturn ' + body.trim() + ';\n\t}';
		}
	);

	// 3e. Add eslint-disable-line node/no-sync to readFileSync
	src = src.replace(
		/(readFileSync\([^)]+\)[^;\n]*;)(?!\s*\/\/\s*eslint)/gm,
		function addSync( match ) {
			return match + ' // eslint-disable-line node/no-sync';
		}
	);

	// 3f. Add eslint-disable-line max-len to long lines
	var lines = src.split( '\n' );
	var j;
	for ( j = 0; j < lines.length; j++ ) {
		if (
			lines[ j ].length > 80 &&
			!/eslint-disable/.test( lines[ j ] ) &&
			!/^\s*\*/.test( lines[ j ] ) &&
			!/^\/\*/.test( lines[ j ] )
		) {
			lines[ j ] += ' // eslint-disable-line max-len';
		}
	}
	src = lines.join( '\n' );

	// 3g. Clean up multiple blank lines
	src = src.replace( /\n{4,}/g, '\n\n\n' );

	if ( src !== original ) {
		if ( dryRun ) {
			process.stdout.write( 'WOULD FIX: ' + file + '\n' );
		} else {
			fs.writeFileSync( file, src, 'utf8' );
			process.stdout.write( 'FIXED: ' + file + '\n' );
		}
		return true;
	}
	process.stdout.write( 'OK: ' + file + '\n' );
	return false;
}

var changed = 0;
files.forEach( function run( file ) {
	if ( processFile( file ) ) {
		changed += 1;
	}
});

process.stdout.write(
	'\n' + changed + ' files ' +
	( dryRun ? 'would be ' : '' ) + 'changed\n'
);
