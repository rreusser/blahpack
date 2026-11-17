'use strict';

// A base.js kernel that USES a caller-owned workspace array must honor the
// addressing parameters it declares for it.
//
// Caller-owned workspace (WORK/RWORK/IWORK/BWORK/SWORK) comes with
// `strideX, offsetX`. The OFFSET is load-bearing: it is how a driver
// sub-allocates one caller buffer among its callees (zggevx keeps an
// eigenvector pair at WORK(1:2N) and hands ztgevc WORK(2N+1:)). A kernel that
// indexes the array from 0, or forwards it with a literal offset/stride,
// silently scribbles over the caller's other partitions whenever the offset is
// nonzero — and every call site that happens to pass 0 hides the bug
// (test/harness/LEARNINGS.md 2026-11-17, ztgevc).
//
// Two patterns are reported, both only when the array itself is referenced in
// the function body (a declared-but-unreferenced workspace, e.g. zhgeqz's
// complex WORK, is a legitimately unused Fortran argument):
//
//   1. a declared `offsetX` / `strideX` that is never read;
//   2. the array forwarded to a call with a numeric LITERAL in the next
//      argument slot (`dlacn2( N, WORK, 1, 2*N, ... )`), i.e. a hardcoded
//      stride in place of the declared one.
//
// Fixed-size bookkeeping arrays are not workspace parameters and are not
// checked. Only base.js is checked: it is the layer that does the addressing.

var path = require( 'path' );

var WORK_RE = /^(?:[irbsc]?work)$/i;


// FUNCTIONS //

function suffix( name ) {
	// WORK -> Work, RWORK -> RWork, iwork -> IWork (compare case-insensitively)
	return name.toLowerCase();
}

function collectRefs( body, names ) {
	var refs = {};
	names.forEach( function init( n ) {
		refs[ n ] = 0;
	});
	(function walk( node, parent ) {
		var keys;
		var v;
		var i;
		var k;
		if ( !node || typeof node.type !== 'string' ) {
			return;
		}
		if ( node.type === 'Identifier' && Object.prototype.hasOwnProperty.call( refs, node.name ) ) {
			if ( !( parent && parent.type === 'MemberExpression' && parent.property === node && !parent.computed ) && !( parent && parent.type === 'Property' && parent.key === node && !parent.computed ) ) {
				refs[ node.name ] += 1;
			}
		}
		keys = Object.keys( node );
		for ( i = 0; i < keys.length; i++ ) {
			k = keys[ i ];
			if ( k === 'parent' || k === 'loc' || k === 'range' ) {
				continue;
			}
			v = node[ k ];
			if ( Array.isArray( v ) ) {
				v.forEach( function each( c ) {
					walk( c, node );
				});
			} else if ( v && typeof v.type === 'string' ) {
				walk( v, node );
			}
		}
	})( body, null );
	return refs;
}


// Identifier names read in an expression (excluding non-computed property keys).
function identifiersIn( expr ) {
	var out = [];
	(function walk( node, parent ) {
		if ( !node || typeof node.type !== 'string' ) {
			return;
		}
		if ( node.type === 'Identifier' && !( parent && parent.type === 'MemberExpression' && parent.property === node && !parent.computed ) ) {
			out.push( node.name );
		}
		Object.keys( node ).forEach( function each( k ) {
			var v;
			if ( k === 'parent' || k === 'loc' || k === 'range' ) {
				return;
			}
			v = node[ k ];
			if ( Array.isArray( v ) ) {
				v.forEach( function c( x ) {
					walk( x, node );
				});
			} else if ( v && typeof v.type === 'string' ) {
				walk( v, node );
			}
		});
	})( expr, null );
	return out;
}

// For each used, non-rebased workspace that declares both a stride and an offset, the arrays that index it (the param itself plus any `reinterpret( W, ... )`-style view) and the variables tainted by its stride / offset (transitively, through variable initializers and assignments).
function buildViews( body, works, params, lower, refs, rebased ) {
	var assigns = [];
	var views = {};
	(function collect( n ) {
		if ( !n || typeof n.type !== 'string' ) {
			return;
		}
		if ( n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init ) {
			assigns.push( [ n.id.name, n.init ] );
		} else if ( n.type === 'FunctionDeclaration' && n.id ) {
			assigns.push( [ n.id.name, n.body ] ); // a local addressing helper (`function wi( i ) { return offsetWork + i*strideWork; }`) carries its body's taint
		} else if ( n.type === 'AssignmentExpression' && n.left.type === 'Identifier' ) {
			assigns.push( [ n.left.name, n.right ] );
		}
		Object.keys( n ).forEach( function each( k ) {
			var v;
			if ( k === 'parent' || k === 'loc' || k === 'range' ) {
				return;
			}
			v = n[ k ];
			if ( Array.isArray( v ) ) {
				v.forEach( collect );
			} else if ( v && typeof v.type === 'string' ) {
				collect( v );
			}
		});
	})( body );
	function taint( seed ) {
		var t = {};
		var changed = true;
		t[ seed ] = true;
		while ( changed ) {
			changed = false;
			assigns.forEach( function each( a ) {
				if ( !t[ a[ 0 ] ] && identifiersIn( a[ 1 ] ).some( function has( id ) {
					return t[ id ];
				}) ) {
					t[ a[ 0 ] ] = true;
					changed = true;
				}
			});
		}
		return t;
	}
	works.forEach( function each( w ) {
		var sName = params[ lower.indexOf( 'stride' + w.toLowerCase() ) ];
		var oName = params[ lower.indexOf( 'offset' + w.toLowerCase() ) ];
		var info;
		if ( !sName || !oName || refs[ w ] === 0 || rebased[ w ] ) {
			return;
		}
		info = {
			'sName': sName,
			'oName': oName,
			'strideTaint': taint( sName ),
			'offsetTaint': taint( oName )
		};
		views[ w ] = info;
		assigns.forEach( function eachAssign( a ) {
			if ( a[ 1 ].type === 'CallExpression' && a[ 1 ].arguments.some( function isW( x ) {
				return x.type === 'Identifier' && x.name === w;
			}) ) {
				views[ a[ 0 ] ] = info;
			}
		});
	});
	return views;
}


// RULE //

var rule = {
	'meta': {
		'docs': {
			'description': 'base.js must honor the declared offset/stride of every caller-owned workspace array it uses'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var filename = context.filename || context.getFilename();
		if ( path.basename( filename ) !== 'base.js' ) {
			return {};
		}
		function check( node ) {
			var params = node.params.filter( function isId( p ) {
				return p.type === 'Identifier';
			}).map( function name( p ) {
				return p.name;
			});
			var lower = params.map( function lc( p ) {
				return p.toLowerCase();
			});
			var works = params.filter( function isWork( p ) {
				return WORK_RE.test( p );
			});
			var rebased;
			var views;
			var refs;
			if ( works.length === 0 || !node.body ) {
				return;
			}
			refs = collectRefs( node.body, params );

			// A kernel may REBASE a workspace once at entry (`WORK = WORK.subarray( offsetWork );`) and then address it from 0; that honors the offset.
			rebased = {};
			(function findRebase( n ) {
				if ( !n || typeof n.type !== 'string' ) {
					return;
				}
				if ( n.type === 'AssignmentExpression' && n.left.type === 'Identifier' && works.indexOf( n.left.name ) !== -1 ) {
					var o = params[ lower.indexOf( 'offset' + suffix( n.left.name ) ) ];
					if ( o && collectRefs( n.right, [ o ] )[ o ] > 0 ) {
						rebased[ n.left.name ] = true;
					}
				}
				Object.keys( n ).forEach( function each( k ) {
					var v;
					if ( k === 'parent' || k === 'loc' || k === 'range' ) {
						return;
					}
					v = n[ k ];
					if ( Array.isArray( v ) ) {
						v.forEach( findRebase );
					} else if ( v && typeof v.type === 'string' ) {
						findRebase( v );
					}
				});
			})( node.body );
			views = buildViews( node.body, works, params, lower, refs, rebased );
			works.forEach( function eachWork( w ) {
				var s = suffix( w );
				if ( refs[ w ] === 0 ) {
					return; // declared but unused workspace: not this rule's concern
				}
				[ 'offset', 'stride' ].forEach( function eachKind( kind ) {
					var idx = lower.indexOf( kind + s );
					if ( idx === -1 ) {
						return;
					}
					if ( refs[ params[ idx ] ] === 0 ) {
						context.report({
							'node': node.params[ idx ],
							'message': '`' + w + '` is used but its declared `' + params[ idx ] + '` is never read. A declared ' + kind + ' must be honored: ' + ( ( kind === 'offset' ) ? 'a driver sub-allocates one buffer among callees by offset, so indexing from 0 overwrites the caller\'s other partitions whenever ' + params[ idx ] + ' is nonzero.' : 'a caller passing a non-unit ' + params[ idx ] + ' would get its workspace read and written at the wrong elements.' )
						});
					}
				});
			});
			// Pattern 3: forwarded with a numeric literal where its stride goes (`W, 1, ...`) while the kernel declares a stride for it.
			function reportLiteralStride( args, i ) {
				var w = args[ i ];
				var sName;
				var a;
				if ( w.type !== 'Identifier' || works.indexOf( w.name ) === -1 || refs[ w.name ] === 0 ) {
					return;
				}
				sName = params[ lower.indexOf( 'stride' + suffix( w.name ) ) ];
				a = args[ i + 1 ];
				if ( !sName || !a || a.type !== 'Literal' || typeof a.value !== 'number' ) {
					return;
				}
				context.report({
					'node': a,
					'message': '`' + w.name + '` is forwarded with a literal stride `' + a.raw + '`, discarding the declared `' + sName + '`. Forward a stride derived from `' + sName + '`.'
				});
			}

			// Pattern 4: element access `W[ i ]` (or a reinterpret view of W) whose index varies but never involves the declared stride.
			function reportUnstridedIndex( n, info ) {
				var ids = identifiersIn( n.property );
				var varying = false;
				var strided = false;
				ids.forEach( function each( id ) {
					if ( info.strideTaint[ id ] ) {
						strided = true;
					} else if ( !info.offsetTaint[ id ] ) {
						varying = true;
					}
				});
				if ( varying && !strided ) {
					context.report({
						'node': n.property,
						'message': 'Element access on `' + n.object.name + '` ignores the declared `' + info.sName + '`: the index varies but is never scaled by the stride. Index as `' + info.oName + ' + ( k * ' + info.sName + ' )`.'
					});
				}
			}

			// Pattern 2: forwarded with a literal `0` OFFSET (1D: `W, s, 0`; 2D: `W, s1, s2, 0`) while the kernel declares an offset for it.
			function reportLiteralOffset( args, i ) {
				var w = args[ i ];
				var oName;
				var j;
				var a;
				if ( w.type !== 'Identifier' || works.indexOf( w.name ) === -1 || refs[ w.name ] === 0 ) {
					return;
				}
				oName = params[ lower.indexOf( 'offset' + suffix( w.name ) ) ];
				if ( !oName || rebased[ w.name ] ) {
					return;
				}
				// The offset is honored if any of the next three arguments mentions it (covers `(array, offset)` pairs such as zlartg's).
				for ( j = i + 1; j <= i + 3 && j < args.length; j++ ) {
					if ( collectRefs( args[ j ], [ oName ] )[ oName ] > 0 ) {
						return;
					}
				}
				for ( j = i + 2; j <= i + 3 && j < args.length; j++ ) {
					a = args[ j ];
					if ( a.type === 'Literal' && a.raw === '0' ) {
						context.report({
							'node': a,
							'message': '`' + w.name + '` is forwarded with a literal offset `0`, discarding the declared `' + oName + '`. Forward an offset derived from `' + oName + '` so a caller-supplied sub-buffer is respected.'
						});
						return;
					}
					if ( a.type === 'Identifier' && works.indexOf( a.name ) !== -1 ) {
						return; // next array argument reached
					}
				}
			}
			(function walk( n ) {
				var keys;
				var v;
				var i;
				if ( !n || typeof n.type !== 'string' ) {
					return;
				}
				if ( n.type === 'CallExpression' ) {
					// `reinterpret( W, 0 )` builds a view (its 0 is a byte/element base, not a stride); views are checked at their use sites.
					if ( !( n.callee.type === 'Identifier' && /^reinterpret/.test( n.callee.name ) ) ) {
						for ( i = 0; i < n.arguments.length; i++ ) {
							reportLiteralOffset( n.arguments, i );
							reportLiteralStride( n.arguments, i );
						}
					}
				}
				if ( n.type === 'MemberExpression' && n.computed && n.object.type === 'Identifier' && views[ n.object.name ] ) {
					reportUnstridedIndex( n, views[ n.object.name ] );
				}
				keys = Object.keys( n );
				keys.forEach( function each( k ) {
					if ( k === 'parent' || k === 'loc' || k === 'range' ) {
						return;
					}
					v = n[ k ];
					if ( Array.isArray( v ) ) {
						v.forEach( walk );
					} else if ( v && typeof v.type === 'string' ) {
						walk( v );
					}
				});
			})( node.body );
		}
		return {
			'FunctionDeclaration': check
		};
	}
};

module.exports = rule;
