'use strict';

// ESLint rule: spec-signature
//
// The parameter lists of base.js, ndarray.js and <routine>.js equal the
// projections of spec/<routine>.json (CONVENTIONS S1–S5, S7, S10, D1–D3, D5c,
// W2), computed by lint/lib/spec.cjs — the same lists `bin/spec show` prints.
// Names compare case-insensitively (S7). A module with no spec is an error:
// generate one with `bin/gen_spec <routine>`.

var specTarget = require( '../../lib/spec-target.cjs' );

function fmt( list ) {
	return '( ' + list.join( ', ' ) + ' )';
}

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'base.js / ndarray.js / <routine>.js parameters equal the spec projections (CONVENTIONS S1–S4, D1–D3)'
		},
		'schema': [],
		'messages': {
			'noSpec': 'No spec/{{routine}}.json: run `bin/gen_spec {{routine}}`.',
			'mismatch': '{{form}} signature differs from the spec projection.\n  expected {{want}}\n  got      {{got}}'
		}
	},
	'create': function create( context ) {
		return {
			'Program:exit': function onExit( program ) {
				var r = specTarget.resolve( context, program );
				if ( !r ) {
					return;
				}
				if ( !r.spec ) {
					context.report( { 'node': r.fn.id || r.fn, 'messageId': 'noSpec', 'data': { 'routine': r.routine } } );
					return;
				}
				if ( r.matches ) {
					return;
				}
				context.report({
					'node': r.fn.id || r.fn,
					'messageId': 'mismatch',
					'data': {
						'form': r.form,
						'want': fmt( specTarget.projection( r.spec, r.form ) ),
						'got': fmt( r.params )
					}
				});
			}
		};
	}
};

module.exports = rule;
