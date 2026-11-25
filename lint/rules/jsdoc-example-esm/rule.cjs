'use strict';

// @example blocks in module sources are ESM: no CommonJS `require`. See README.md.

var H = require( '../../lib/doc-health.cjs' );

module.exports = {
	'meta': {
		'type': 'suggestion',
		'docs': { 'description': 'require @example code to use ESM imports' },
		'schema': [],
		'messages': {
			'commonjs': '{{problem}} (fix: node bin/codemod-spec/example-esm.cjs)'
		}
	},
	'create': function create( context ) {
		var filename = ( context.filename || ( context.getFilename && context.getFilename() ) || '' ).replace( /\\/g, '/' );
		var sourceCode = context.sourceCode || context.getSourceCode();
		if ( !H.SOURCE.test( filename ) ) {
			return {};
		}
		return {
			'Program:exit': function onExit() {
				sourceCode.getAllComments().forEach( function each( c ) {
					if ( c.type !== 'Block' || c.value.charAt( 0 ) !== '*' || !/@example/.test( c.value ) ) {
						return;
					}
					H.parse( c.value ).tags.forEach( function tag( t ) {
						var problem = ( t.title === 'example' ) ? H.exampleProblem( t.description ) : null;
						if ( problem ) {
							context.report({ 'loc': H.lineLoc( c, t.lineNumber ), 'messageId': 'commonjs', 'data': { 'problem': problem } });
						}
					});
				});
			}
		};
	}
};
