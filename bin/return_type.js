#!/usr/bin/env node

/**
 * Derive a module's public return type from its implementation.
 *
 * The implementation JSDoc (`@returns {Type}`) is the single source of truth
 * for the return type — NOT the committed index.d.ts (which is generated) and
 * NOT the test.ts (also generated). Both generators import this so the public
 * declaration and its type-test agree with the code, and the type-checker
 * asserts that agreement.
 *
 * Usage (library):
 *   var rt = require( './return_type.js' );
 *   rt.fromImpl( fs.readFileSync( 'lib/ndarray.js', 'utf8' ) );
 *   // -> { ts: 'number', imports: [] }
 */

'use strict';

// Map a JSDoc type to a TypeScript type + any @stdlib/types imports it needs.
var SCALAR = {
	'integer': 'number',
	'NonNegativeInteger': 'number',
	'PositiveInteger': 'number',
	'NegativeInteger': 'number',
	'number': 'number',
	'float': 'number',
	'double': 'number',
	'boolean': 'boolean',
	'string': 'string',
	'void': 'void'
};

var TYPED = {
	'Float64Array': { 'ts': 'Float64Array', 'imports': [] },
	'Float32Array': { 'ts': 'Float32Array', 'imports': [] },
	'Int32Array': { 'ts': 'Int32Array', 'imports': [] },
	'Uint8Array': { 'ts': 'Uint8Array', 'imports': [] },
	'Complex128Array': { 'ts': 'Complex128Array', 'imports': [ { 'name': 'Complex128Array', 'module': '@stdlib/types/array' } ] },
	'Complex64Array': { 'ts': 'Complex64Array', 'imports': [ { 'name': 'Complex64Array', 'module': '@stdlib/types/array' } ] },
	'Complex128': { 'ts': 'Complex128', 'imports': [ { 'name': 'Complex128', 'module': '@stdlib/types/complex' } ] },
	'Complex64': { 'ts': 'Complex64', 'imports': [ { 'name': 'Complex64', 'module': '@stdlib/types/complex' } ] }
};


// HELPERS //

/**
 * Return the name bound by `export default <name>` (or the first declared
 * function as a fallback).
 */
function exportedName( content ) {
	var m = content.match( /export\s+default\s+(\w+)/ );
	if ( m ) {
		return m[ 1 ];
	}
	m = content.match( /module\.exports\s*=\s*(\w+)/ );
	if ( m ) {
		return m[ 1 ];
	}
	m = content.match( /function\s+(\w+)\s*\(/ );
	return m ? m[ 1 ] : null;
}

/**
 * Extract the raw `@returns {Type}` JSDoc type for the exported function.
 *
 * Uses the last `@returns` that appears before the exported function's
 * declaration, which is the JSDoc block attached to it.
 */
function rawReturns( content ) {
	var name = exportedName( content );
	var cut = content.length;
	if ( name ) {
		var idx = content.search( new RegExp( 'function\\s+' + name + '\\s*\\(' ) );
		if ( idx >= 0 ) {
			cut = idx;
		}
	}
	var head = content.slice( 0, cut );
	var re = /@returns\s*\{([^}]*)\}/g;
	var last = null;
	var m;
	while ( ( m = re.exec( head ) ) ) {
		last = m[ 1 ].trim();
	}
	return last;
}

/**
 * Parse an `@returns {Object} result with a, b and c` description into a TS
 * object-literal type. Falls back to `Record<string, unknown>` when the field
 * list cannot be parsed.
 */
function objectType( content ) {
	var name = exportedName( content );
	var cut = content.length;
	if ( name ) {
		var idx = content.search( new RegExp( 'function\\s+' + name + '\\s*\\(' ) );
		if ( idx >= 0 ) {
			cut = idx;
		}
	}
	var m = content.slice( 0, cut ).match( /@returns\s*\{Object\}\s*[^\n]*?with\s+([^\n]+)/i );
	if ( !m ) {
		return { 'ts': 'Record<string, unknown>', 'imports': [] };
	}
	var fields = m[ 1 ]
		.replace( /\band\b/g, ',' )
		.split( ',' )
		.map( function trim( s ) { return s.trim().replace( /[`.]/g, '' ); } )
		.filter( function keep( s ) { return /^\w+$/.test( s ); } );
	if ( fields.length === 0 ) {
		return { 'ts': 'Record<string, unknown>', 'imports': [] };
	}
	var body = fields.map( function typed( f ) { return f + ': number'; } ).join( '; ' );
	return { 'ts': '{ ' + body + ' }', 'imports': [] };
}


// MAIN //

/**
 * Derive the TS return type from an implementation file's contents.
 *
 * @param {string} content - implementation source (ndarray.js/base.js)
 * @returns {Object} { ts, imports: [ { name, module } ] }
 */
function fromImpl( content ) {
	if ( !content ) {
		return { 'ts': 'void', 'imports': [] };
	}
	var raw = rawReturns( content );
	if ( !raw ) {
		return { 'ts': 'void', 'imports': [] };
	}
	if ( raw === 'Object' ) {
		return objectType( content );
	}
	if ( TYPED[ raw ] ) {
		return { 'ts': TYPED[ raw ].ts, 'imports': TYPED[ raw ].imports.slice() };
	}
	if ( SCALAR[ raw ] ) {
		return { 'ts': SCALAR[ raw ], 'imports': [] };
	}
	// Unknown — surface it rather than silently defaulting to Float64Array.
	return { 'ts': 'unknown', 'imports': [], 'unknown': raw };
}


// EXPORTS //

module.exports = {
	'fromImpl': fromImpl,
	'exportedName': exportedName,
	'rawReturns': rawReturns
};
