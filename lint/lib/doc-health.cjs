'use strict';

// Documentation-health predicates, shared by the lint rules that gate them
// (jsdoc-param-description, jsdoc-summary, jsdoc-example-esm) and by the
// documentation site's report (bin/docs/extract.js → doc-health.json). One
// definition, so the gate and the report cannot disagree.

var doctrine = require( 'doctrine' );

/**
* Parses a JSDoc block comment's value (the text between `/*` and `*\/`).
*
* @param {string} value - comment value, starting with `*`
* @returns {Object} doctrine result `{ description, tags }` (tags carry `lineNumber`, 0-based within the comment)
*/
function parse( value ) {
	// doctrine silently drops EVERY tag of a comment whose @module names a
	// scoped package (`@module @scope/pkg`); strip that inner `@` first.
	var text = String( value ).replace( /(@module\s+)@/g, '$1' );
	try {
		return doctrine.parse( '/*' + text + '*/', { 'unwrap': true, 'sloppy': true, 'lineNumbers': true } );
	} catch ( err ) {
		return { 'description': '', 'tags': [] };
	}
}

function normalize( s ) {
	return String( s || '' ).replace( /[`'"*_.,:;\s-]/g, '' ).toLowerCase();
}

/**
* Returns whether a `@param` description says nothing beyond the parameter's name.
*
* @param {string} name - parameter name
* @param {string} description - description text
* @returns {boolean} boolean
*/
function isPlaceholderParam( name, description ) {
	var d = normalize( description );
	return d === '' || d === normalize( name );
}

/**
* Returns the first sentence of a description.
*
* @param {string} description - description text
* @returns {string} first sentence
*/
function firstSentence( description ) {
	var para = String( description || '' ).split( /\n\s*\n/ )[ 0 ].replace( /\s+/g, ' ' ).trim();
	var m = /^([\s\S]*?[.!?])(\s|$)/.exec( para );
	return ( m ) ? m[ 1 ] : para;
}

/**
* Returns a problem with a function's (or module's) summary, or null.
*
* @param {Object} doc - parsed JSDoc
* @returns {(string|null)} problem
*/
function summaryProblem( doc ) {
	var s = firstSentence( doc.description );
	var i;
	for ( i = 0; i < doc.tags.length; i++ ) {
		if ( doc.tags[ i ].title === 'license' ) {
			return 'a function JSDoc carries an `@license` tag; the license belongs in the file header, and the description belongs here';
		}
	}
	if ( !s ) {
		return 'no description: the JSDoc must open with a one-sentence summary';
	}
	if ( /\b(TODO|FIXME|TBD)\b/.test( s ) ) {
		return 'summary is a scaffold placeholder ("' + s + '")';
	}
	if ( /:\s*\.?$/.test( s ) ) {
		return 'summary ends mid-statement ("' + s + '"); it must stand alone as a complete sentence';
	}
	if ( !/[.!?]$/.test( s ) ) {
		return 'summary must be a sentence ending in a period ("' + s + '")';
	}
	return null;
}

/**
* Returns a problem with an `@example` body, or null.
*
* @param {string} code - example code
* @returns {(string|null)} problem
*/
function exampleProblem( code ) {
	if ( /\brequire\s*\(/.test( code ) ) {
		return '@example uses CommonJS `require`; the package is ESM, so examples must `import`';
	}
	return null;
}

/**
* Finds the JSDoc of the function a module default-exports (`function f(…)` + `export default f;`).
*
* @param {Object} sourceCode - ESLint SourceCode
* @returns {(Object|null)} `{ comment, fn }`
*/
function exportedFunctionDoc( sourceCode ) {
	var body = sourceCode.ast.body;
	var name = null;
	var fn = null;
	var comments;
	var c;
	var i;
	for ( i = 0; i < body.length; i++ ) {
		if ( body[ i ].type === 'ExportDefaultDeclaration' && body[ i ].declaration.type === 'Identifier' ) {
			name = body[ i ].declaration.name;
		}
	}
	for ( i = 0; i < body.length && name; i++ ) {
		if ( body[ i ].type === 'FunctionDeclaration' && body[ i ].id && body[ i ].id.name === name ) {
			fn = body[ i ];
		}
	}
	if ( !fn ) {
		return null;
	}
	// The nearest JSDoc block above the function, skipping line comments
	// (`// Signature note: …`, eslint directives) in between.
	comments = sourceCode.getCommentsBefore( fn ).filter( function f( x ) {
		return x.type === 'Block';
	});
	c = comments[ comments.length - 1 ];
	if ( !c || c.type !== 'Block' || c.value.charAt( 0 ) !== '*' ) {
		return { 'comment': null, 'fn': fn };
	}
	return { 'comment': c, 'fn': fn };
}

/**
* Returns the ESLint `loc` of a 0-based line within a comment.
*
* @param {Object} comment - comment node
* @param {number} line - 0-based line within the comment
* @returns {Object} loc
*/
function lineLoc( comment, line ) {
	var l = comment.loc.start.line + ( line || 0 );
	return { 'start': { 'line': l, 'column': 0 }, 'end': { 'line': l, 'column': 80 } };
}

// Module source files whose JSDoc is the public or internal contract.
var SOURCE = /(^|\/)lib\/(blas|lapack|arpack)\/base\/[^/]+\/lib\/[^/]+\.js$/;

module.exports = {
	'parse': parse,
	'isPlaceholderParam': isPlaceholderParam,
	'firstSentence': firstSentence,
	'summaryProblem': summaryProblem,
	'exampleProblem': exampleProblem,
	'exportedFunctionDoc': exportedFunctionDoc,
	'lineLoc': lineLoc,
	'SOURCE': SOURCE
};
