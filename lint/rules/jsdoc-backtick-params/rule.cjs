'use strict';

// Flags @param tags that contain bare single-char Fortran flags like 'N', 'T'
// without backtick quoting. In stdlib conventions, these should be backtick-
// quoted in JSDoc: `'N'` not 'N'.
//
// Fixable: wraps the bare 'X' in backticks → `'X'`

var RE_BARE_FLAG = /'([A-Z])'/g;

var rule = {
	'meta': {
		'docs': {
			'description': 'require backtick-quoting of single-char Fortran flags in @param JSDoc'
		},
		'schema': [],
		'type': 'suggestion',
		'fixable': 'code'
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
				var match;
				var lineNum;
				var col;
				var before;
				for ( i = 0; i < comments.length; i++ ) {
					comment = comments[ i ];
					if ( comment.type !== 'Block' || comment.value.charAt( 0 ) !== '*' ) {
						continue;
					}
					lines = comment.value.split( '\n' );
					for ( j = 0; j < lines.length; j++ ) {
						line = lines[ j ];
						if ( !/@param/.test( line ) ) {
							continue;
						}
						RE_BARE_FLAG.lastIndex = 0;
						while ( ( match = RE_BARE_FLAG.exec( line ) ) !== null ) {
							// Check if already backtick-quoted
							col = match.index;
							before = line.substring( 0, col );
							if ( /`$/.test( before ) ) {
								continue;
							}
							lineNum = comment.loc.start.line + j;
							context.report({
								'loc': {
									'start': { 'line': lineNum, 'column': col },
									'end': { 'line': lineNum, 'column': col + match[0].length }
								},
								'message': "Single-char Fortran flag '" + match[1] + "' in @param should be backtick-quoted: `'" + match[1] + "'`",
								'fix': function createFix( m, c, cmt, ln ) {
									return function fix( fixer ) {
										// Calculate the absolute position in the source
										var offset = cmt.start + ln + m.index;
										var range = [ offset, offset + m[0].length ];
										return fixer.replaceTextRange( range, '`' + m[0] + '`' );
									};
								}( match, col, comment, lines.slice( 0, j ).join( '\n' ).length + 1 )
							});
						}
					}
				}
			}
		};
	}
};

module.exports = rule;
