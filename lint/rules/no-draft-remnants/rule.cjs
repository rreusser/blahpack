'use strict';

// Flags comments written in drafting voice ("Let me redo", "Actually, ...",
// "wait,", "Hmm", "wrong:"), left over from working a translation out in
// place. Such a comment marks code that was written by trial and error. In
// zhbgst it sat next to a superseded draft line that still ran and corrupted
// a result (ticket 0054). Replace the working-out with the conclusion, and
// check the code it describes against the Fortran.

// Words need a boundary on both sides; phrases ending in punctuation ("Actually,",
// "Wait -", "wrong:") must not require a word boundary after the punctuation.
// ("correction:" is not included: the reference's own *rfs comments say "to get
// correction:".)
var DRAFT = /\b(?:let me|let's|hmm+|oops|i think|(?:we )?need to fix|on second thought|redo|that'?s wrong|this is wrong|fix this)\b|\b(?:actually|wait)\s*[,:\-]|\bwrong:/i;

var rule = {
	'meta': {
		'docs': {
			'description': 'disallow drafting remnants ("Let me redo", "Actually,", "wait,") in comments'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var source = context.sourceCode || context.getSourceCode();
		return {
			'Program': function onProgram() {
				source.getAllComments().forEach( function each( c ) {
					var m = DRAFT.exec( c.value );
					if ( m ) {
						context.report({
							'loc': c.loc,
							'message': 'Drafting remnant in a comment ("' + m[ 0 ] + '"): check the code it describes against the Fortran, then replace the working-out with the conclusion (ticket 0054)'
						});
					}
				});
			}
		};
	}
};

module.exports = rule;
