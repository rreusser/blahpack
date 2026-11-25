'use strict';

// The exported function's JSDoc (and lib/index.js's module JSDoc, when it has
// one) opens with a complete one-sentence summary. See README.md.

var H = require( '../../lib/doc-health.cjs' );

module.exports = {
	'meta': {
		'type': 'suggestion',
		'docs': { 'description': 'require a complete one-sentence summary on exported functions and modules' },
		'schema': [],
		'messages': {
			'summary': '{{problem}}'
		}
	},
	'create': function create( context ) {
		var filename = ( context.filename || ( context.getFilename && context.getFilename() ) || '' ).replace( /\\/g, '/' );
		var sourceCode = context.sourceCode || context.getSourceCode();
		if ( !H.SOURCE.test( filename ) ) {
			return {};
		}
		function check( comment, node ) {
			var problem = H.summaryProblem( H.parse( comment.value ) );
			if ( problem ) {
				context.report({ 'loc': comment ? H.lineLoc( comment, 0 ) : node.loc, 'messageId': 'summary', 'data': { 'problem': problem } });
			}
		}
		return {
			'Program:exit': function onExit() {
				var found;
				var mod;
				if ( /\/lib\/index\.js$/.test( filename ) ) {
					// Module JSDoc is optional; when present it is the routine's summary.
					mod = sourceCode.getAllComments().filter( function f( c ) {
						return c.type === 'Block' && c.value.charAt( 0 ) === '*' && !/@license/.test( c.value );
					})[ 0 ];
					if ( mod ) {
						check( mod, sourceCode.ast );
					}
					return;
				}
				found = H.exportedFunctionDoc( sourceCode );
				if ( !found ) {
					return;
				}
				if ( !found.comment ) {
					context.report({ 'node': found.fn, 'messageId': 'summary', 'data': { 'problem': 'exported function has no JSDoc' } });
					return;
				}
				check( found.comment, found.fn );
			}
		};
	}
};
