'use strict';

// ESLint rule: spec-ld-bounds
//
// Every leading-dimension bound a layout wrapper (<routine>.js) throws on is
// either a spec check or the array's storage extent from the spec
// (CONVENTIONS V5, V11):
//
//   - a generated prologue check (lint/lib/prologue.cjs: the reference
//     `INFO = -k` check, with its row-major restatement), or
//   - a check on an LD whose reference check the generator could not translate
//     (`js: null` in spec.checks; hand-translated, not derivable), or
//   - `LDX < max( 1, R )`, where R is the array's `rows` from the spec
//     (column-major) or its `cols` (row-major). A check that applies to both
//     layouts is allowed only when rows and cols are the same expression.
//
// Anything else is an invented constraint: too strict (rejects calls the
// reference accepts, e.g. dlangb's `LDAB < max( 1, N )` for band storage of
// kl+ku+1 rows), too lax, or unknowable from the spec (no rows/cols) — remove
// it, or make it the spec bound.
//
// "Throws on an LD bound" means: an `if` whose consequent is a single `throw`
// and whose test contains `<LD> <` for an LD argument of the wrapper. The
// layout is read from a leading `order === '<layout>' &&` in the test or from
// an enclosing `if ( order === '<layout>' )` (its `else` is the other layout).

var specTarget = require( '../../lib/spec-target.cjs' );
var P = require( '../../lib/prologue.cjs' );

var OTHER = { 'row-major': 'column-major', 'column-major': 'row-major' };

function lc( s ) {
	return String( s ).toLowerCase();
}

// `order === '<layout>'` → layout, else null.
function orderTest( node ) {
	if ( node && node.type === 'BinaryExpression' && node.operator === '===' && node.left.type === 'Identifier' && node.left.name === 'order' && node.right.type === 'Literal' && OTHER[ node.right.value ] ) {
		return node.right.value;
	}
	return null;
}

// `order === 'L' && rest` → { layout, rest }; else { layout: null, rest: test }.
function split( test ) {
	var l;
	if ( test.type === 'LogicalExpression' && test.operator === '&&' ) {
		l = orderTest( test.left );
		if ( l ) {
			return { 'layout': l, 'rest': test.right };
		}
	}
	return { 'layout': null, 'rest': test };
}

function throwsOnly( stmt ) {
	var c = stmt.consequent;
	if ( c.type === 'BlockStatement' ) {
		return c.body.length === 1 && c.body[ 0 ].type === 'ThrowStatement';
	}
	return c.type === 'ThrowStatement';
}

// `max( 1, X )` / `max( X, 1 )` → X; anything else unchanged. (A spec extent
// such as dlange's `max( M, 1 )` already includes the floor.)
function core( js ) {
	var m = /^max\( 1, (.*) \)$/.exec( js ) || /^max\( (.*), 1 \)$/.exec( js );
	return m ? m[ 1 ] : js;
}

// The spec LD arguments of the wrapper: code name → { param, arr, untranslated }.
// An LD is a param of role `ld`, or the `ld` an array declares (a 2-D
// workspace's LDWORK can carry role `lwork`, as in dlarzb).
function ldArgs( spec, nm, actual ) {
	var out = {};
	spec.params.forEach( function each( p ) {
		var name;
		var arr;
		arr = null;
		spec.params.forEach( function find( a ) {
			if ( ( p.of && ( lc( a.fortran ) === lc( p.of ) || lc( a.name ) === lc( p.of ) ) ) || ( a.ld && lc( a.ld ) === lc( p.fortran ) ) ) {
				arr = a;
			}
		});
		if ( !arr || ( p.role !== 'ld' && !( arr.ld && lc( arr.ld ) === lc( p.fortran ) ) ) ) {
			return;
		}
		name = nm.map[ lc( p.name ) ] || spelled( actual, p.fortran );
		if ( !name ) {
			return;
		}
		out[ name ] = {
			'param': p,
			'arr': arr,
			// The reference checks this LD, but the spec could not translate
			// the check (`js: null`) or reduce it (a 2-D workspace's LDWORK,
			// recorded as a note: dtrsna's `LDWORK.LT.1 .OR. ( WANTSP .AND.
			// LDWORK.LT.N )`). The code carries it by hand.
			'untranslated': spec.checks.some( function some( c ) {
				return lc( c.param ) === lc( p.fortran ) && c.js === null;
			}) || ( spec.notes || [] ).some( function some( n ) {
				return lc( n ).indexOf( 'workspace check for ' + lc( p.fortran ) + ' ' ) === 0;
			})
		};
	});
	return out;
}

// How the wrapper spells a parameter (names compare case-insensitively, S7).
function spelled( actual, name ) {
	var i;
	for ( i = 0; i < actual.length; i++ ) {
		if ( lc( actual[ i ] ) === lc( name ) ) {
			return actual[ i ];
		}
	}
	return null;
}

// The spec extent (renamed into the wrapper's names) or null.
function extent( arr, key, nm ) {
	var e = arr && arr[ key ];
	var js;
	if ( !e || !e.js ) {
		return null;
	}
	js = P.rename( e.js, nm.expr );
	return js ? core( js ) : null;
}

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'Every leading-dimension bound in <routine>.js is a spec check or `max( 1, <spec rows|cols> )` (CONVENTIONS V5, V11)'
		},
		'schema': [],
		'messages': {
			'bound': '`{{test}}` is not a spec check, and {{why}}. Make it `{{want}}` (spec {{what}} of {{arr}}, {{layout}}) or remove it.',
			'nobound': '`{{test}}` is not a spec check, and the spec gives no {{what}} for {{arr}} ({{layout}}): remove it.',
			'layout': '`{{test}}` is not a spec check and applies to both layouts, but {{arr}} is not square in the spec (rows `{{rows}}`, columns `{{cols}}`): check each layout (`{{ld}} < max( 1, {{rows}} )` column-major, `{{ld}} < max( 1, {{cols}} )` row-major) or remove it.'
		}
	},
	'create': function create( context ) {
		var source = context.sourceCode || context.getSourceCode();
		return {
			'Program:exit': function onExit( program ) {
				var r = specTarget.resolve( context, program );
				var generated;
				var lds;
				var nm;
				if ( !r || r.form !== 'wrapper' || !r.matches ) {
					return;
				}
				nm = P.nameMap( r.spec, 'wrapper', r.params );
				lds = ldArgs( r.spec, nm, r.params );
				if ( Object.keys( lds ).length === 0 ) {
					return;
				}
				generated = P.prologue( r.spec, 'wrapper', r.params ).map( function m( c ) {
					return P.unwrap( c.test );
				});

				function isGenerated( text, layout, guarded ) {
					var forms = [ text ];
					if ( layout && !guarded ) {
						forms.push( 'order === \'' + layout + '\' && ' + text );
						forms.push( 'order === \'' + layout + '\' && ( ' + text + ' )' );
					}
					return generated.some( function some( g ) {
						return forms.some( function f( t ) {
							return P.sameTokens( g, t );
						});
					});
				}

				function check( stmt, ctx ) {
					var text = P.unwrap( source.getText( stmt.test ) );
					var s = split( stmt.test );
					var layout = s.layout || ctx;
					var rest = P.unwrap( P.tidy( source.getText( s.rest ) ) );
					var names = Object.keys( lds ).filter( function f( n ) {
						return new RegExp( '(^|[^\\w$])' + n + '\\s*<' ).test( text );
					});
					var ld;
					var e;
					var rows;
					var cols;
					var want;
					var what;
					var m;
					if ( names.length === 0 || isGenerated( text, layout, !!s.layout ) ) {
						return;
					}
					ld = names[ 0 ];
					e = lds[ ld ];
					if ( names.length === 1 && e.untranslated ) {
						return;
					}
					rows = extent( e.arr, 'rows', nm );
					cols = extent( e.arr, 'cols', nm );
					if ( layout ) {
						want = ( layout === 'column-major' ) ? rows : cols;
						what = ( layout === 'column-major' ) ? 'rows' : 'columns';
					} else if ( rows && cols && P.sameTokens( rows, cols ) ) {
						want = rows;
						what = 'rows';
					} else if ( rows && cols ) {
						context.report({
							'node': stmt.test,
							'messageId': 'layout',
							'data': { 'test': P.tidy( text ), 'arr': e.arr.name, 'rows': rows, 'cols': cols, 'ld': ld }
						});
						return;
					} else {
						want = null;
						what = 'rows and columns';
					}
					if ( !want ) {
						context.report({
							'node': stmt.test,
							'messageId': 'nobound',
							'data': { 'test': P.tidy( text ), 'what': what, 'arr': e.arr ? e.arr.name : ld, 'layout': layout || 'both layouts' }
						});
						return;
					}
					want = ld + ' < max( 1, ' + want + ' )';
					if ( names.length === 1 && P.sameTokens( rest, want ) ) {
						return;
					}
					m = /^(\w+) < (.*)$/.exec( rest );
					context.report({
						'node': stmt.test,
						'messageId': 'bound',
						'data': {
							'test': P.tidy( text ),
							'why': ( m && m[ 1 ] === ld ) ? 'its bound `' + m[ 2 ] + '` is not the array extent' : 'it is not a single `' + ld + ' < max( 1, … )` bound',
							'want': want,
							'what': what,
							'arr': e.arr.name,
							'layout': layout || 'both layouts'
						}
					});
				}

				( function walk( node, ctx ) {
					var k;
					var v;
					var l;
					if ( !node || typeof node.type !== 'string' ) {
						return;
					}
					if ( node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression' ) {
						if ( node !== r.fn ) {
							return;
						}
						walk( node.body, ctx );
						return;
					}
					if ( node.type === 'IfStatement' ) {
						if ( throwsOnly( node ) ) {
							check( node, ctx );
						}
						l = orderTest( node.test );
						walk( node.consequent, l || ctx );
						walk( node.alternate, l ? OTHER[ l ] : ctx );
						return;
					}
					for ( k in node ) {
						if ( k === 'parent' || k === 'range' || k === 'loc' ) {
							continue;
						}
						v = node[ k ];
						if ( Array.isArray( v ) ) {
							v.forEach( function each( c ) {
								walk( c, ctx );
							});
						} else if ( v && typeof v === 'object' ) {
							walk( v, ctx );
						}
					}
				})( r.fn, null );
			}
		};
	}
};

module.exports = rule;
