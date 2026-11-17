'use strict';

// Flags @param tags or type annotations containing TODO.
// Matches: @param {TODO} or @param ... TODO

var rule = {
	'meta': {
		'docs': {
			'description': 'disallow TODO remnants in @param JSDoc tags'
		},
		'schema': [],
		'type': 'suggestion'
	},
	'create': function main( context ) {
		var source = ( context.sourceCode || context.getSourceCode() );

		return {
			'Program': function onProgram() {
				var comments = source.getAllComments();
				var i;
				var comment;
				var lines;
				var j;
				var line;
				for ( i = 0; i < comments.length; i++ ) {
					comment = comments[ i ];
					if ( comment.type !== 'Block' || comment.value.charAt( 0 ) !== '*' ) {
						continue;
					}
					lines = comment.value.split( '\n' );
					for ( j = 0; j < lines.length; j++ ) {
						line = lines[ j ];
						if ( /@param/.test( line ) && /TODO/.test( line ) ) {
							context.report({
								'loc': {
									'start': {
										'line': comment.loc.start.line + j,
										'column': 0
									},
									'end': {
										'line': comment.loc.start.line + j,
										'column': line.length
									}
								},
								'message': '@param contains TODO remnant — fill in the parameter description'
							});
						}
						if ( /\{TODO\}/.test( line ) ) {
							context.report({
								'loc': {
									'start': {
										'line': comment.loc.start.line + j,
										'column': 0
									},
									'end': {
										'line': comment.loc.start.line + j,
										'column': line.length
									}
								},
								'message': 'Type annotation contains {TODO} — fill in the type'
							});
						}
					}
				}
			}
		};
	}
};

module.exports = rule;
