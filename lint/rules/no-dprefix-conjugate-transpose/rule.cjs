'use strict';

// Flags "conjugate-transpose" string literals in d-prefix (real-valued) routines.
// Real routines don't have conjugate transposes — this is a copy-paste error
// from z-prefix (complex) routines.
//
// Fixable: replaces "conjugate-transpose" with "transpose". Comments (JSDoc
// copied from the Fortran, where TRANS = 'C' means transpose for real data) are
// reported too, without a fix: the sentence needs rewording, not a substitution.

var path = require( 'path' );
var moduleOf = require( '../../lib/module-path.cjs' ).moduleOf;

var rule = {
	'meta': {
		'docs': {
			'description': 'disallow "conjugate-transpose" in d-prefix (real-valued) routines'
		},
		'schema': [],
		'type': 'problem',
		'fixable': 'code'
	},
	'create': function main( context ) {
		var filename = ( context.filename || ( context.getFilename && context.getFilename() ) || '' );

		// Only applies to d-prefix routines
		var parts = filename.split( path.sep );
		var mod = moduleOf( filename );
		if ( !mod ) {
			return {};
		}
		var routine = mod.routine;
		if ( routine.charAt( 0 ) !== 'd' ) {
			return {};
		}

		return {
			'Program': function onProgram() {
				var source = context.sourceCode || context.getSourceCode();
				source.getAllComments().forEach( function each( c ) {
					if ( c.value.indexOf( 'conjugate-transpose' ) !== -1 ) {
						context.report({
							'loc': c.loc,
							'message': 'd-prefix routine documents "conjugate-transpose", which it does not accept — describe "transpose" only'
						});
					}
				});
			},
			'Literal': function onLiteral( node ) {
				if (
					typeof node.value === 'string' &&
					node.value === 'conjugate-transpose'
				) {
					context.report({
						'node': node,
						'message': 'd-prefix routine should not use "conjugate-transpose" — use "transpose" instead',
						'fix': function fix( fixer ) {
							return fixer.replaceText( node, "'" + 'transpose' + "'" );
						}
					});
				}
			}
		};
	}
};

module.exports = rule;
