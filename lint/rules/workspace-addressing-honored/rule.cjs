'use strict';

// Caller-owned workspace contract (CONVENTIONS.md D5).
//
// Workspace (WORK/RWORK/IWORK/BWORK/...) is unobservable scratch: outputs carry
// no guarantee about its contents. Its addressing parameters therefore have
// different jobs:
//
//   * OFFSET — load-bearing. It is how a driver reuses one caller buffer by
//     handing each callee a slice (zggevx keeps an eigenvector pair at
//     WORK(1:2N) and passes ztgevc WORK(2N+1:)). A kernel that ignores it
//     overwrites the caller's other slices whenever the offset is nonzero
//     (test/harness/LEARNINGS.md 2026-11-17, ztgevc). Checked in base.js.
//
//   * STRIDE — kept in the signature for parity with stdlib's ndarray shape,
//     but only a unit stride is supported: nothing needs strided scratch.
//     ndarray.js must reject any other value, so the API never silently
//     accepts what the kernels do not honor. (Supporting non-unit workspace
//     strides is a future feature, if anyone asks for it.)
//
// base.js reports, only when the array itself is referenced in the body:
//   1. a declared `offsetX` that is never read;
//   2. the array forwarded with an integer literal `0` where its offset goes
//      (`W, s, 0` or `W, s1, s2, 0`), unless one of the next three arguments
//      mentions `offsetX` (the `(array, offset)` pair convention).
// Rebasing once at entry (`WORK = WORK.subarray( offsetWork );`) honors the
// offset. `reinterpret( W, 0 )` builds a view and is not a forwarding call.
//
// ndarray.js reports a workspace whose declared `strideX` is neither rejected
// (compared against the literal `1`) nor honored by base.js (read; never
// replaced by a literal when forwarding; scaling every varying element index).
// Supported ⇒ honored; unsupported ⇒ rejected. A WORK-named array whose
// contents are a documented output (dlasd5) is not scratch and takes the
// honored branch.

var path = require( 'path' );
var fs = require( 'fs' );
var espree = require( 'espree' );

var WORK_RE = /^(?:[irbsc]?work)$/i;


// FUNCTIONS //

function eachChild( node, fn ) {
	Object.keys( node ).forEach( function each( k ) {
		var v;
		if ( k === 'parent' || k === 'loc' || k === 'range' ) {
			return;
		}
		v = node[ k ];
		if ( Array.isArray( v ) ) {
			v.forEach( function c( x ) {
				if ( x && typeof x.type === 'string' ) {
					fn( x, node );
				}
			});
		} else if ( v && typeof v.type === 'string' ) {
			fn( v, node );
		}
	});
}

// Count references to each of `names` in `root` (excluding non-computed property keys).
function collectRefs( root, names ) {
	var refs = {};
	names.forEach( function init( n ) {
		refs[ n ] = 0;
	});
	(function walk( node, parent ) {
		if ( node.type === 'Identifier' && Object.prototype.hasOwnProperty.call( refs, node.name ) ) {
			if ( !( parent && parent.type === 'MemberExpression' && parent.property === node && !parent.computed ) && !( parent && parent.type === 'Property' && parent.key === node && !parent.computed ) ) {
				refs[ node.name ] += 1;
			}
		}
		eachChild( node, walk );
	})( root, null );
	return refs;
}

function walkAll( root, fn ) {
	(function walk( node ) {
		fn( node );
		eachChild( node, walk );
	})( root );
}

function signature( node ) {
	var params = node.params.filter( function isId( p ) {
		return p.type === 'Identifier';
	}).map( function name( p ) {
		return p.name;
	});
	return {
		'params': params,
		'lower': params.map( function lc( p ) {
			return p.toLowerCase();
		}),
		'works': params.filter( function isWork( p ) {
			return WORK_RE.test( p );
		})
	};
}

function partner( sig, kind, w ) {
	var i = sig.lower.indexOf( kind + w.toLowerCase() );
	return ( i === -1 ) ? null : { 'name': sig.params[ i ], 'index': i };
}


// Identifier names read in an expression (excluding non-computed property keys).
function identifiersIn( expr ) {
	var out = [];
	(function walk( node, parent ) {
		if ( node.type === 'Identifier' && !( parent && parent.type === 'MemberExpression' && parent.property === node && !parent.computed ) ) {
			out.push( node.name );
		}
		eachChild( node, walk );
	})( expr, null );
	return out;
}

// Does base.js `fn` honor the declared stride of workspace `w` everywhere? True only if
// the stride is read, `w` is never forwarded with a literal stride, and every element
// access on `w` (or a `reinterpret( w, ... )` view) with a varying index is scaled by a
// value derived from the stride (variables and local helper functions carry that taint).
function honorsStride( fn, w ) {
	var sig = signature( fn );
	var s = partner( sig, 'stride', w );
	var o = partner( sig, 'offset', w );
	var assigns = [];
	var views = {};
	var ok = true;
	if ( !s || !fn.body ) {
		return false;
	}
	if ( collectRefs( fn.body, [ s.name ] )[ s.name ] === 0 ) {
		return false;
	}
	walkAll( fn.body, function collect( n ) {
		if ( n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init ) {
			assigns.push( [ n.id.name, n.init ] );
		} else if ( n.type === 'AssignmentExpression' && n.left.type === 'Identifier' ) {
			assigns.push( [ n.left.name, n.right ] );
		} else if ( n.type === 'FunctionDeclaration' && n.id ) {
			assigns.push( [ n.id.name, n.body ] );
		}
	});
	function taint( seed ) {
		var t = {};
		var changed = true;
		if ( seed ) {
			t[ seed ] = true;
		}
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
	var st = taint( s.name );
	var ot = taint( o && o.name );
	views[ w ] = true;
	assigns.forEach( function each( a ) {
		if ( a[ 1 ].type === 'CallExpression' && a[ 1 ].arguments.some( function isW( x ) {
			return x.type === 'Identifier' && x.name === w;
		}) ) {
			views[ a[ 0 ] ] = true;
		}
	});
	walkAll( fn.body, function check( n ) {
		var i;
		var varying;
		var scaled;
		if ( n.type === 'CallExpression' && !( n.callee.type === 'Identifier' && /^reinterpret/.test( n.callee.name ) ) ) {
			for ( i = 0; i < n.arguments.length - 1; i++ ) {
				if ( n.arguments[ i ].type === 'Identifier' && n.arguments[ i ].name === w && n.arguments[ i + 1 ].type === 'Literal' && typeof n.arguments[ i + 1 ].value === 'number' ) {
					ok = false;
				}
			}
		}
		if ( n.type === 'MemberExpression' && n.computed && n.object.type === 'Identifier' && views[ n.object.name ] ) {
			varying = false;
			scaled = false;
			identifiersIn( n.property ).forEach( function each( id ) {
				if ( st[ id ] ) {
					scaled = true;
				} else if ( !ot[ id ] ) {
					varying = true;
				}
			});
			if ( varying && !scaled ) {
				ok = false;
			}
		}
	});
	return ok;
}

// The exported FunctionDeclaration of a module source, or null.
function exportedFunction( program ) {
	var exp = program.body.filter( function isExport( n ) {
		return n.type === 'ExportDefaultDeclaration';
	})[ 0 ];
	var target = exp && ( ( exp.declaration.type === 'Identifier' ) ? exp.declaration.name : ( exp.declaration.id && exp.declaration.id.name ) );
	var found = null;
	program.body.forEach( function each( n ) {
		var fn = ( n.type === 'ExportDefaultDeclaration' ) ? n.declaration : n;
		if ( fn.type === 'FunctionDeclaration' && fn.id && fn.id.name === target ) {
			found = fn;
		}
	});
	return found;
}


// CHECKS //

function checkBase( context, node ) {
	var sig = signature( node );
	var rebased = {};
	var refs;
	if ( sig.works.length === 0 || !node.body ) {
		return;
	}
	refs = collectRefs( node.body, sig.params );

	walkAll( node.body, function findRebase( n ) {
		var o;
		if ( n.type === 'AssignmentExpression' && n.left.type === 'Identifier' && sig.works.indexOf( n.left.name ) !== -1 ) {
			o = partner( sig, 'offset', n.left.name );
			if ( o && collectRefs( n.right, [ o.name ] )[ o.name ] > 0 ) {
				rebased[ n.left.name ] = true;
			}
		}
	});

	// 1. Declared offset never read.
	sig.works.forEach( function eachWork( w ) {
		var o = partner( sig, 'offset', w );
		if ( refs[ w ] > 0 && o && refs[ o.name ] === 0 ) {
			context.report({
				'node': node.params[ o.index ],
				'message': '`' + w + '` is used but its declared `' + o.name + '` is never read. Workspace offsets are how a driver reuses one buffer by handing callees slices; indexing from 0 overwrites the caller\'s other slices whenever ' + o.name + ' is nonzero.'
			});
		}
	});

	// 2. Forwarded with a literal 0 offset.
	function literalOffset( args, i ) {
		var w = args[ i ];
		var o;
		var j;
		var a;
		if ( w.type !== 'Identifier' || sig.works.indexOf( w.name ) === -1 || refs[ w.name ] === 0 || rebased[ w.name ] ) {
			return;
		}
		o = partner( sig, 'offset', w.name );
		if ( !o ) {
			return;
		}
		for ( j = i + 1; j <= i + 3 && j < args.length; j++ ) {
			if ( collectRefs( args[ j ], [ o.name ] )[ o.name ] > 0 ) {
				return;
			}
		}
		for ( j = i + 2; j <= i + 3 && j < args.length; j++ ) {
			a = args[ j ];
			if ( a.type === 'Literal' && a.raw === '0' ) {
				context.report({
					'node': a,
					'message': '`' + w.name + '` is forwarded with a literal offset `0`, discarding the declared `' + o.name + '`. Forward an offset derived from `' + o.name + '` so a caller-supplied slice is respected.'
				});
				return;
			}
			if ( a.type === 'Identifier' && sig.works.indexOf( a.name ) !== -1 ) {
				return;
			}
		}
	}
	walkAll( node.body, function eachCall( n ) {
		var i;
		if ( n.type !== 'CallExpression' || ( n.callee.type === 'Identifier' && /^reinterpret/.test( n.callee.name ) ) ) {
			return;
		}
		for ( i = 0; i < n.arguments.length; i++ ) {
			literalOffset( n.arguments, i );
		}
	});
}

function checkNdarray( context, node, honored ) {
	var sig = signature( node );
	if ( !node.body ) {
		return;
	}
	sig.works.forEach( function eachWork( w ) {
		var s = partner( sig, 'stride', w );
		var asserted = false;
		if ( !s ) {
			return;
		}
		walkAll( node.body, function find( n ) {
			var l;
			var r;
			if ( n.type === 'BinaryExpression' && /^[!=]==?$/.test( n.operator ) ) {
				l = n.left;
				r = n.right;
				if ( ( l.type === 'Identifier' && l.name === s.name && r.type === 'Literal' && r.value === 1 ) || ( r.type === 'Identifier' && r.name === s.name && l.type === 'Literal' && l.value === 1 ) ) {
					asserted = true;
				}
			}
		});
		if ( !asserted && !honored( w ) ) {
			context.report({
				'node': node.params[ s.index ],
				'message': 'Workspace `' + w + '` declares `' + s.name + '`, but ndarray.js never asserts it is 1 and base.js does not honor it. A stride must be either supported or rejected (CONVENTIONS.md D5): add `if ( ' + s.name + ' !== 1 ) { throw new RangeError( ... ); }`, or make base.js address `' + w + '` through `' + s.name + '` everywhere.'
			});
		}
	});
}


// RULE //

var rule = {
	'meta': {
		'docs': {
			'description': 'caller-owned workspace: base.js honors the declared offset; ndarray.js asserts a unit stride'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var file = context.filename || context.getFilename();
		var name = path.basename( file );
		if ( name === 'base.js' ) {
			return {
				'FunctionDeclaration': function check( node ) {
					checkBase( context, node );
				}
			};
		}
		if ( name === 'ndarray.js' ) {
			return {
				'Program': function check( program ) {
					var fn = exportedFunction( program );
					var baseFn = null;
					var baseFile = path.join( path.dirname( file ), 'base.js' );
					if ( !fn ) {
						return;
					}
					if ( fs.existsSync( baseFile ) ) {
						try {
							baseFn = exportedFunction( espree.parse( fs.readFileSync( baseFile, 'utf8' ), { 'ecmaVersion': 'latest', 'sourceType': 'module' } ) );
						} catch ( err ) {
							baseFn = null;
						}
					}
					checkNdarray( context, fn, function honored( w ) {
						return baseFn !== null && honorsStride( baseFn, w );
					});
				}
			};
		}
		return {};
	}
};

module.exports = rule;
