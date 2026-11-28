'use strict';

// ESLint rule: spec-jsdoc
//
// The JSDoc of the exported function of base.js / strided.js / <routine>.js
// agrees with the spec (lint/lib/jsdoc-spec.cjs; CONVENTIONS J2, C1, C4, W5,
// S10, S11):
//
// - `@param`: one per parameter, in order, with the name the code uses and the
//   type the spec implies (arrays by dtype, `integer` strides,
//   `NonNegativeInteger` offsets and dimensions, `PositiveInteger` leading
//   dimensions, `(T|null)` wrapper workspace, …).
// - `@throws` (strided.js, <routine>.js): the leading `@throws` tags are the
//   generated prologue's, in order (`{TypeError} first argument must be a valid
//   order`). Further `@throws` (workspace checks) may follow.
// - `@returns`: the S11 type, or no `@returns` when nothing is returned.
//
// Fix: `node bin/codemod-spec/jsdoc.cjs <routine>`.

var specTarget = require( '../../lib/spec-target.cjs' );
var J = require( '../../lib/jsdoc-spec.cjs' );

function leadingJSDoc( source, fn ) {
	var node = fn;
	var comments;
	var c;
	if ( fn.parent && fn.parent.type === 'ExportDefaultDeclaration' ) {
		node = fn.parent;
	}
	comments = source.getCommentsBefore( node ).filter( function f( x ) {
		return x.type === 'Block' && x.value.charAt( 0 ) === '*';
	});
	c = comments[ comments.length - 1 ];
	return c || null;
}

function show( list ) {
	return list.map( function m( x ) {
		return '{' + x.type + '} ' + ( x.name || x.text );
	}).join( '; ' );
}

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'JSDoc @param / @throws / @returns agree with the spec (CONVENTIONS J2, C1, S11)'
		},
		'schema': [],
		'messages': {
			'noDoc': 'The exported function has no JSDoc comment.',
			'params': '@param tags differ from the spec (fix: `node bin/codemod-spec/jsdoc.cjs {{routine}}`).\n  expected {{want}}\n  got      {{got}}',
			'throws': '@throws tags differ from the generated prologue (fix: `node bin/codemod-spec/jsdoc.cjs {{routine}}`).\n  expected {{want}}\n  got      {{got}}',
			'returns': '@returns differs from the spec (S11): expected {{want}}, got {{got}}.'
		}
	},
	'create': function create( context ) {
		var source = context.sourceCode || context.getSourceCode();
		return {
			'Program:exit': function onExit( program ) {
				var r = specTarget.resolve( context, program );
				var doc;
				var tags;
				var want;
				var got;
				var ret;
				if ( !r || !r.matches ) {
					return;
				}
				doc = leadingJSDoc( source, r.fn );
				if ( !doc ) {
					context.report( { 'node': r.fn, 'messageId': 'noDoc' } );
					return;
				}
				tags = J.parseTags( doc.value );
				want = J.params( r.spec, r.form, r.params );
				// An `Object` parameter (ARPACK's reverse-communication state)
				// may name a `@typedef {Object} <Name>` declared in this file,
				// which lists the properties the routine stores on it.
				var typedefs = {};
				source.getAllComments().forEach( function each( c ) {
					var m = /@typedef \{Object\} (\w+)/.exec( c.value );
					if ( m ) {
						typedefs[ m[ 1 ] ] = true;
					}
				});
				if ( want.length !== tags.params.length || want.some( function some( w, i ) {
					var t = tags.params[ i ].type;
					return w.name !== tags.params[ i ].name || ( w.type !== t && !( w.type === 'Object' && typedefs[ t ] ) );
				}) ) {
					context.report( { 'node': doc, 'messageId': 'params', 'data': { 'routine': r.routine, 'want': show( want ), 'got': show( tags.params ) } } );
				}
				want = J.throwsDocs( r.spec, r.form, r.params );
				got = tags.throws.slice( 0, want.length );
				if ( got.length !== want.length || want.some( function some( w, i ) {
					return w.type !== got[ i ].type || w.text !== got[ i ].text;
				}) ) {
					context.report( { 'node': doc, 'messageId': 'throws', 'data': { 'routine': r.routine, 'want': show( want ), 'got': show( got ) } } );
				}
				ret = J.returns( r.spec );
				got = tags.returns.length ? tags.returns[ 0 ] : null;
				if ( tags.returns.length > 1 || ret !== got ) {
					context.report( { 'node': doc, 'messageId': 'returns', 'data': { 'want': ret ? '{' + ret + '}' : 'no @returns', 'got': got ? '{' + got + '}' : 'no @returns' } } );
				}
			}
		};
	}
};

module.exports = rule;
