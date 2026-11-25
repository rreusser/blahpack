'use strict';

// Every @param on a module's exported function says something beyond the
// parameter's name (`@param {integer} N - N` says nothing). See README.md.

var H = require( '../../lib/doc-health.cjs' );

module.exports = {
	'meta': {
		'type': 'suggestion',
		'docs': { 'description': 'require @param descriptions that say more than the parameter name' },
		'schema': [],
		'messages': {
			'placeholder': '@param `{{name}}` description only repeats its name; describe what it is (fix: node bin/codemod-spec/param-descriptions.cjs)'
		}
	},
	'create': function create( context ) {
		var filename = context.filename || ( context.getFilename && context.getFilename() ) || '';
		var sourceCode = context.sourceCode || context.getSourceCode();
		if ( !H.SOURCE.test( filename.replace( /\\/g, '/' ) ) ) {
			return {};
		}
		return {
			'Program:exit': function onExit() {
				var found = H.exportedFunctionDoc( sourceCode );
				var doc;
				if ( !found || !found.comment ) {
					return;
				}
				doc = H.parse( found.comment.value );
				doc.tags.forEach( function each( t ) {
					if ( t.title === 'param' && t.name && H.isPlaceholderParam( t.name, t.description ) ) {
						context.report({ 'loc': H.lineLoc( found.comment, t.lineNumber ), 'messageId': 'placeholder', 'data': { 'name': t.name } });
					}
				});
			}
		};
	}
};
