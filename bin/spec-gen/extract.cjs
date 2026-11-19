'use strict';

// Stage A (developer-time; reads the gitignored Fortran sources).
//
// Extracts the Fortran facts the spec needs beyond the signature cache, and
// writes them to the committed cache data/fortran-checks.json:
//
//   package      blas | lapack | arpack (the source directory, CONVENTIONS F7)
//   checks       argument checks, in source order: { cond, info, guard? }
//                (`INFO = -k` in LAPACK/ARPACK; `INFO = k` before XERBLA in
//                reference BLAS). `guard` is the enclosing IF condition(s).
//   quick        top-level quick returns after the checks: { cond, body }
//   locals       the scalar definitions those conditions reference
//
// Everything downstream (bin/gen_spec, CI) reads the cache, never the sources
// (CONVENTIONS T6).

var path = require( 'path' );
var fs = require( 'fs' );

var ROOT = path.join( __dirname, '..', '..' );
var DIRS = [
	[ 'data/BLAS-3.12.0', 'blas' ],
	[ 'data/lapack-3.12.0/SRC', 'lapack' ],
	[ 'data/arpack-ng-3.9.1/SRC', 'arpack' ],
	[ 'data/arpack-ng-3.9.1/UTIL', 'arpack' ]
];
var OUT = path.join( ROOT, 'data', 'fortran-checks.json' );

// Statements (continuations joined, comments dropped, upper-cased, whitespace
// collapsed) for fixed-form `.f` and free-form `.f90`.
function statements( src, free ) {
	var out = [];
	var pending = null;
	src.split( '\n' ).forEach( function each( raw ) {
		var s;
		if ( free ) {
			s = raw.replace( /!.*$/, '' );
			if ( !s.trim() ) {
				return;
			}
			s = s.trim();
			if ( pending !== null ) {
				s = pending + ' ' + s.replace( /^&\s*/, '' );
				pending = null;
			}
			if ( /&$/.test( s ) ) {
				pending = s.slice( 0, -1 );
				return;
			}
			out.push( s );
			return;
		}
		if ( /^[cC*!]/.test( raw ) || /^\s*!/.test( raw ) ) {
			return;
		}
		s = raw.replace( /\s!.*$/, '' );
		if ( /^ {5}\S/.test( s ) && out.length ) {
			out[ out.length - 1 ] += ' ' + s.slice( 6 ).trim();
		} else if ( s.trim() ) {
			out.push( s.trim() );
		}
	});
	return out.map( norm );
}

function norm( s ) {
	return s.replace( /\s+/g, ' ' ).trim().toUpperCase();
}

// Strip a leading numeric statement label.
function unlabel( s ) {
	return s.replace( /^\d+\s+/, '' );
}

var DECL_RE = /^(?:(?:RECURSIVE |PURE |ELEMENTAL )*(?:(?:DOUBLE PRECISION|REAL(?:\(\w+\))?|INTEGER|COMPLEX(?:\*16|\(\w+\))?|LOGICAL|CHARACTER(?:\*\S+)?|DOUBLE COMPLEX)\s+)?(?:SUBROUTINE|FUNCTION)\b|(?:DOUBLE PRECISION|REAL|INTEGER|COMPLEX|LOGICAL|CHARACTER|DOUBLE COMPLEX|TYPE)\b(?!\s*=)|PARAMETER\b|EXTERNAL\b|INTRINSIC\b|DATA\b|SAVE\b|IMPLICIT\b|INCLUDE\b|USE\b|COMMON\b|EQUIVALENCE\b|INTERFACE\b|END INTERFACE\b)/;

// Index of the first executable statement.
function firstExecutable( st ) {
	var i;
	var inIface = false;
	for ( i = 0; i < st.length; i++ ) {
		if ( /^INTERFACE\b/.test( st[ i ] ) ) {
			inIface = true;
		}
		if ( inIface ) {
			if ( /^END INTERFACE\b/.test( st[ i ] ) ) {
				inIface = false;
			}
			continue;
		}
		if ( DECL_RE.test( st[ i ] ) ) {
			continue;
		}
		// statement function: NAME( args ) = expr, before any executable line
		if ( /^[A-Z][A-Z0-9_]*\s*\([A-Z0-9_, ]*\)\s*=/.test( st[ i ] ) && !/^(?:IF|DO|CALL|WHILE)\b/.test( st[ i ] ) ) {
			continue;
		}
		return i;
	}
	return st.length;
}

// Parse `IF( cond ) rest` with balanced parens. Returns { cond, rest } or null.
function parseIf( s ) {
	var m = /^(?:ELSE ?)?IF ?\(/.exec( s );
	var depth;
	var i;
	if ( !m ) {
		return null;
	}
	depth = 1;
	for ( i = m[ 0 ].length; i < s.length; i++ ) {
		if ( s[ i ] === '\'' ) {
			i = s.indexOf( '\'', i + 1 );
			if ( i < 0 ) {
				return null;
			}
			continue;
		}
		if ( s[ i ] === '(' ) {
			depth += 1;
		} else if ( s[ i ] === ')' ) {
			depth -= 1;
			if ( depth === 0 ) {
				return {
					'elseif': /^ELSE/.test( s ),
					'cond': s.slice( m[ 0 ].length, i ).trim(),
					'rest': s.slice( i + 1 ).trim()
				};
			}
		}
	}
	return null;
}

function isEndIf( s ) {
	return /^END ?IF\b/.test( s );
}

var INFO_RE = /^INFO ?= ?(-?) ?(\d+)$/;

// Argument checks: every `INFO = ±k` reached before the last CALL XERBLA,
// with the stack of enclosing (non-INFO) IF guards.
function argChecks( st, start, end ) {
	var out = [];
	var stack = []; // { cond, prior: [conds of earlier branches], isCheckChain }
	var i;
	var s;
	var p;
	var m;
	var top;
	function guards() {
		var g = [];
		stack.forEach( function each( lvl ) {
			lvl.prior.forEach( function eachPrior( c ) {
				g.push( '.NOT.( ' + c + ' )' );
			});
			if ( lvl.cond !== null && !/^INFO ?\.EQ\. ?0$/.test( lvl.cond ) ) {
				g.push( lvl.cond );
			}
		});
		return g;
	}
	function emit( cond, k, extra ) {
		var g = guards().concat( extra || [] );
		var rec = { 'cond': cond, 'info': k };
		if ( g.length ) {
			rec.guard = g.join( ' .AND. ' );
		}
		out.push( rec );
	}
	var loops = []; // open DO loops: label string, or 'END DO'
	for ( i = start; i < end; i++ ) {
		m = /^(\d+)\s/.exec( st[ i ] );
		while ( m && loops.length && loops[ loops.length - 1 ] === m[ 1 ] ) {
			loops.pop();
		}
		s = unlabel( st[ i ] );
		if ( ( m = /^DO (\d+)\b/.exec( s ) ) ) {
			loops.push( m[ 1 ] );
			continue;
		}
		if ( /^DO\b/.test( s ) ) {
			loops.push( 'END DO' );
			continue;
		}
		if ( /^END ?DO\b/.test( s ) ) {
			loops.pop();
			continue;
		}
		if ( loops.length ) {
			// Data-dependent errors raised inside the algorithm's loops
			// (e.g. DGEBAL's NaN check) are not argument checks.
			continue;
		}
		if ( ( m = INFO_RE.exec( s ) ) ) {
			// Bare `INFO = -k` inside an IF block: its condition is the
			// enclosing branch (handled when the branch opened, below).
			continue;
		}
		p = parseIf( s );
		if ( p && p.rest === 'THEN' ) {
			if ( p.elseif ) {
				top = stack[ stack.length - 1 ];
				if ( top ) {
					if ( !top.checkBranch ) {
						top.prior.push( top.cond );
					}
					top.cond = p.cond;
					top.checkBranch = false;
				}
			} else {
				stack.push( { 'cond': p.cond, 'prior': [], 'checkBranch': false } );
			}
			// Branch whose first statement is `INFO = ±k`: a check.
			m = INFO_RE.exec( unlabel( st[ i + 1 ] || '' ) );
			if ( m ) {
				top = stack[ stack.length - 1 ];
				top.checkBranch = true;
				var c = top.cond;
				top.cond = null;
				emit( c, ( m[ 1 ] ? -1 : 1 ) * Number( m[ 2 ] ) );
				top.cond = c;
			}
			continue;
		}
		if ( /^ELSE$/.test( s ) ) {
			top = stack[ stack.length - 1 ];
			if ( top ) {
				if ( !top.checkBranch ) {
					top.prior.push( top.cond );
				}
				top.cond = null;
				top.checkBranch = false;
			}
			continue;
		}
		if ( isEndIf( s ) ) {
			stack.pop();
			continue;
		}
		if ( p && ( m = INFO_RE.exec( p.rest ) ) ) {
			emit( p.cond, ( m[ 1 ] ? -1 : 1 ) * Number( m[ 2 ] ) );
		}
	}
	return out;
}

// Scalar definitions in the prologue (before the first quick-return/loop),
// recorded as [guard, expr] pairs; guard null = unconditional.
function locals( st, start, end ) {
	var out = {};
	var guard = null;
	var depth = 0;
	var i;
	var s;
	var m;
	var p;
	var loops = [];
	for ( i = start; i < end; i++ ) {
		m = /^(\d+)\s/.exec( st[ i ] );
		while ( m && loops.length && loops[ loops.length - 1 ] === m[ 1 ] ) {
			loops.pop();
		}
		s = unlabel( st[ i ] );
		if ( ( m = /^DO (\d+)\b/.exec( s ) ) ) {
			loops.push( m[ 1 ] );
			continue;
		}
		if ( /^DO\b/.test( s ) ) {
			loops.push( 'END DO' );
			continue;
		}
		if ( /^END ?DO\b/.test( s ) ) {
			loops.pop();
			continue;
		}
		p = parseIf( s );
		if ( loops.length ) {
			if ( ( m = /^([A-Z][A-Z0-9_]*) ?= ?(.+)$/.exec( s ) ) || ( p && ( m = /^([A-Z][A-Z0-9_]*) ?= ?(.+)$/.exec( p.rest ) ) ) ) {
				( out[ m[ 1 ] ] = out[ m[ 1 ] ] || [] ).push( [ '?', m[ 2 ] ] );
			}
			continue;
		}
		if ( p && p.rest === 'THEN' && !p.elseif ) {
			depth += 1;
			// `IF( INFO.EQ.0 ) THEN` wraps the workspace computation; while
			// checks run in order INFO is still 0, so it is no guard.
			guard = ( depth === 1 ) ? ( /^INFO ?\.EQ\. ?0$/.test( p.cond ) ? null : p.cond ) : '?';
			continue;
		}
		if ( p && p.rest === 'THEN' && p.elseif ) {
			guard = ( depth === 1 ) ? p.cond : '?';
			continue;
		}
		if ( /^ELSE$/.test( s ) ) {
			guard = ( depth === 1 ) ? 'ELSE' : '?';
			continue;
		}
		if ( isEndIf( s ) ) {
			depth = Math.max( 0, depth - 1 );
			guard = ( depth === 0 ) ? null : '?';
			continue;
		}
		if ( guard === '?' ) {
			// Assigned inside nested control flow: its value is not a
			// static expression. Record the local as opaque.
			if ( ( m = /^([A-Z][A-Z0-9_]*) ?= ?(.+)$/.exec( s ) ) || ( p && ( m = /^([A-Z][A-Z0-9_]*) ?= ?(.+)$/.exec( p.rest ) ) ) ) {
				( out[ m[ 1 ] ] = out[ m[ 1 ] ] || [] ).push( [ '?', m[ 2 ] ] );
			}
			continue;
		}
		if ( p && ( m = /^([A-Z][A-Z0-9_]*) ?= ?(.+)$/.exec( p.rest ) ) && m[ 1 ] !== 'INFO' ) {
			( out[ m[ 1 ] ] = out[ m[ 1 ] ] || [] ).push( [ ( guard ? '(' + guard + ') .AND. ' : '' ) + '(' + p.cond + ')', m[ 2 ] ] );
			continue;
		}
		if ( ( m = /^([A-Z][A-Z0-9_]*) ?= ?(.+)$/.exec( s ) ) && m[ 1 ] !== 'INFO' ) {
			( out[ m[ 1 ] ] = out[ m[ 1 ] ] || [] ).push( [ guard, m[ 2 ] ] );
		}
	}
	return out;
}

// Locals (transitively) referenced by the given conditions.
function usedLocals( texts, loc ) {
	var used = {};
	var queue = [];
	texts.forEach( function each( t ) {
		queue.push.apply( queue, t.match( /\b[A-Z][A-Z0-9_]*\b/g ) || [] );
	});
	while ( queue.length ) {
		var id = queue.pop();
		if ( used[ id ] || !loc[ id ] ) {
			continue;
		}
		used[ id ] = loc[ id ];
		if ( typeof loc[ id ] === 'string' ) {
			continue;
		}
		loc[ id ].forEach( function eachDef( def ) {
			queue.push.apply( queue, ( ( def[ 0 ] || '' ) + ' ' + def[ 1 ] ).match( /\b[A-Z][A-Z0-9_]*\b/g ) || [] );
		});
	}
	return used;
}

var ASSIGN_RE = /^[A-Z][A-Z0-9_]*(?: ?\([^=]*\))? ?= ?.+$/;

// Quick returns: after the checks, the top-level `IF( c ) RETURN` statements
// and `IF( c ) THEN <assignments> RETURN END IF` blocks, scanning past plain
// assignments and workspace-query blocks, up to the first other statement.
function quickReturns( st, start ) {
	var out = [];
	var i = start;
	var s;
	var p;
	var j;
	var body;
	while ( i < st.length ) {
		s = unlabel( st[ i ] );
		p = parseIf( s );
		if ( p && !p.elseif && p.rest === 'RETURN' ) {
			out.push( { 'cond': p.cond, 'body': [] } );
			i += 1;
			continue;
		}
		if ( p && !p.elseif && p.rest === 'THEN' ) {
			body = [];
			for ( j = i + 1; j < st.length; j++ ) {
				if ( isEndIf( st[ j ] ) || /^ELSE/.test( st[ j ] ) ) {
					break;
				}
				body.push( unlabel( st[ j ] ) );
			}
			if ( j < st.length && isEndIf( st[ j ] ) && body.length && body[ body.length - 1 ] === 'RETURN' && body.slice( 0, -1 ).every( function ok( b ) {
				var q = parseIf( b );
				return ASSIGN_RE.test( b ) || /^CALL /.test( b ) || ( q && !q.elseif && ( ASSIGN_RE.test( q.rest ) || /^CALL /.test( q.rest ) ) );
			}) ) {
				if ( !/LQUERY|LWORK ?\.EQ\. ?-1/.test( p.cond ) ) {
					out.push( { 'cond': p.cond, 'body': body.slice( 0, -1 ) } );
				}
				i = j + 1;
				continue;
			}
			break;
		}
		if ( p && !p.elseif && ASSIGN_RE.test( p.rest ) ) {
			i += 1;
			continue;
		}
		if ( ASSIGN_RE.test( s ) && !/^(?:IF|DO|CALL)\b/.test( s ) ) {
			i += 1;
			continue;
		}
		break;
	}
	return { 'list': out, 'end': i };
}

// The statement after the IF block that encloses the XERBLA call (skipping a
// trailing `ELSE IF( LQUERY ) THEN RETURN` branch).
function closeBlock( st, xer ) {
	var depth = /^IF\b/.test( st[ xer ] ) ? 0 : 1;
	var i = xer + 1;
	var s;
	var p;
	while ( depth > 0 && i < st.length ) {
		s = unlabel( st[ i ] );
		p = parseIf( s );
		if ( p && !p.elseif && p.rest === 'THEN' ) {
			depth += 1;
		} else if ( isEndIf( s ) ) {
			depth -= 1;
		}
		i += 1;
	}
	while ( i < st.length && /^RETURN$/.test( unlabel( st[ i ] ) ) ) {
		i += 1;
	}
	return i;
}

// Doc-comment constraints on INTEGER scalar arguments: every `NAME >= expr`
// (also >, <=, <) in that argument's `\\param` block, verbatim. These name the
// dimensions (`M >= 0`), leading-dimension rows (`LDA >= max(1,M)`) and
// workspace minimums (`LWORK >= max(1,3*N-1)`).
function docConstraints( src, names, arrays, dims ) {
	var out = {};
	var re = /^\*>\s*\\param\[[^\]]*\]\s*(\w+)\s*$/;
	var lines = src.split( '\n' );
	var cur = null;
	var buf = [];
	function flush() {
		var text;
		var m;
		var rel;
		if ( cur && arrays && arrays[ cur ] ) {
			text = buf.join( ' ' ).replace( /\s+/g, ' ' );
			m = /\bdimension\s*(?:at least\s*)?\(/i.exec( text );
			if ( m ) {
				dims[ cur ] = balanced( text.slice( m.index + m[ 0 ].length - 1 ) );
			}
		}
		if ( cur && names[ cur ] ) {
			text = buf.join( ' ' ).replace( /\s+/g, ' ' );
			rel = new RegExp( '\\b' + cur + '\\s*(>=|<=|>|<|\\.GE\\.|\\.GT\\.)\\s*((?:[^.;,(]|\\([^()]*(?:\\([^()]*\\)[^()]*)*\\)|\\.(?=\\d)|,(?=\\s*\\w+\\s*\\)))+)', 'gi' );
			while ( ( m = rel.exec( text ) ) ) {
				( out[ cur ] = out[ cur ] || [] ).push( ( m[ 1 ].toUpperCase().replace( '.GE.', '>=' ).replace( '.GT.', '>' ) + ' ' + m[ 2 ].replace( /\s+(?:if|and|when|where|for|otherwise)\b.*$/i, '' ).trim() ).toUpperCase() );
			}
			// Reference BLAS phrasing: "M must be at least zero.",
			// "LDA must be at least max( 1, m ).", "INCX must not be zero."
			rel = /must be at least\s+((?:[^.(,]|\([^()]*(?:\([^()]*\)[^()]*)*\))+)[.,]/gi;
			while ( ( m = rel.exec( text ) ) ) {
				( out[ cur ] = out[ cur ] || [] ).push( '>= ' + ( /^zero$/i.test( m[ 1 ].trim() ) ? '0' : m[ 1 ].replace( /\s+/g, '' ).toUpperCase() ) );
			}
			if ( /must not be zero/i.test( text ) ) {
				( out[ cur ] = out[ cur ] || [] ).push( '!= 0' );
			}
		}
		cur = null;
		buf = [];
	}
	lines.forEach( function each( l ) {
		var m = re.exec( l );
		if ( m ) {
			flush();
			cur = m[ 1 ].toUpperCase();
			return;
		}
		if ( cur ) {
			if ( /^\*>/.test( l ) ) {
				buf.push( l.slice( 2 ) );
			} else {
				flush();
			}
		}
	});
	flush();
	return out;
}

// The balanced `( ... )` group at the start of text, upper-cased, no spaces.
function balanced( text ) {
	var depth = 0;
	var i;
	for ( i = 0; i < text.length; i++ ) {
		if ( text[ i ] === '(' ) {
			depth += 1;
		} else if ( text[ i ] === ')' ) {
			depth -= 1;
			if ( depth === 0 ) {
				return text.slice( 0, i + 1 ).replace( /\s+/g, '' ).toUpperCase();
			}
		}
	}
	return null;
}

// Declared array bounds of dummy arguments: `A( LDA, * )` → ['LDA','*'].
function declarations( st, start, args ) {
	var out = {};
	st.slice( 0, start ).forEach( function each( d ) {
		var m = /^(?:DOUBLE PRECISION|REAL(?:\*\d+|\(\w+\))?|INTEGER|COMPLEX(?:\*\d+|\(\w+\))?|DOUBLE COMPLEX|LOGICAL|CHARACTER(?:\*\S+)?)\s*(?:,\s*[A-Z() ]+)?(?:::)?\s*(.*)$/.exec( d );
		if ( !m ) {
			return;
		}
		m[ 1 ].split( /,(?![^()]*\))/ ).forEach( function eachEnt( e ) {
			var k = /^\s*([A-Z][A-Z0-9_]*)\s*(\(.*\))?\s*$/.exec( e );
			var b;
			if ( !k || !args[ k[ 1 ] ] || !k[ 2 ] ) {
				return;
			}
			b = balanced( k[ 2 ] );
			if ( b ) {
				out[ k[ 1 ] ] = b.slice( 1, -1 ).split( /,(?![^()]*\))/ );
			}
		});
	});
	return out;
}

function extractOne( src, free, sig ) {
	var st = statements( src, free );
	var start = firstExecutable( st );
	var xer = -1;
	var end;
	var checks;
	var after;
	var quick;
	var i;
	for ( i = start; i < st.length; i++ ) {
		if ( /\bCALL XERBLA\b/.test( st[ i ] ) ) {
			xer = i;
		}
	}
	// Checks end at the last XERBLA call; quick returns start after the
	// statement that closes it (END IF, or the RETURN that follows).
	end = ( xer >= 0 ) ? xer : start;
	checks = ( xer >= 0 ) ? argChecks( st, start, end ) : [];
	// LAPACK numbers bad arguments negatively; reference BLAS positively.
	if ( checks.some( function neg( c ) {
		return c.info < 0;
	}) ) {
		checks = checks.filter( function neg( c ) {
			return c.info < 0;
		});
	}
	after = ( xer >= 0 ) ? closeBlock( st, xer ) : start;
	quick = quickReturns( st, after );
	var loc = locals( st, start, quick.end );
	quick = quick.list;
	var texts = [];
	checks.forEach( function each( c ) {
		texts.push( c.cond, c.guard || '' );
	});
	quick.forEach( function each( q ) {
		texts.push( q.cond );
	});
	var rec = { 'checks': checks, 'quick': quick };
	var names = {};
	( ( sig && sig.arguments ) || [] ).forEach( function each( a ) {
		if ( /^INTEGER\s*$/i.test( a.type || '' ) ) {
			names[ a.name.toUpperCase() ] = true;
		}
	});
	var argset = {};
	( ( sig && sig.arguments ) || [] ).forEach( function each( a ) {
		argset[ a.name.toUpperCase() ] = true;
	});
	// The real dummy-argument list (the doc-derived cache can be out of order
	// or incomplete) and each argument's declared type.
	var head = /\b(SUBROUTINE|FUNCTION) ?[A-Z0-9_]+ ?\(([^)]*)\)/.exec( st.slice( 0, start ).join( '\n' ) );
	if ( head ) {
		rec.kind = head[ 1 ].toLowerCase();
		head = [ head[ 0 ], head[ 2 ] ];
		rec.args = head[ 1 ].split( ',' ).map( function t( x ) {
			return x.trim();
		}).filter( Boolean );
		rec.args.forEach( function each( a ) {
			argset[ a ] = true;
		});
	}
	var types = {};
	st.slice( 0, start ).forEach( function each( d ) {
		var m = /^(DOUBLE PRECISION|REAL(?:\*\d+|\(\w+\))?|INTEGER|COMPLEX(?:\*\d+|\(\w+\))?|DOUBLE COMPLEX|LOGICAL|CHARACTER(?:\*\S+)?)\s*(?:,\s*[A-Z() ]+)?(?:::)?\s*(.*)$/.exec( d );
		if ( !m ) {
			return;
		}
		m[ 2 ].split( /,(?![^()]*\))/ ).forEach( function eachEnt( e ) {
			var k = /^\s*([A-Z][A-Z0-9_]*)/.exec( e );
			if ( k && argset[ k[ 1 ] ] && !types[ k[ 1 ] ] ) {
				types[ k[ 1 ] ] = m[ 1 ];
			}
		});
	});
	if ( Object.keys( types ).length ) {
		rec.types = types;
	}
	var decl = declarations( st, start, argset );
	var docDims = {};
	var doc = docConstraints( src, names, decl, docDims );
	if ( Object.keys( doc ).length ) {
		rec.doc = doc;
	}
	if ( Object.keys( decl ).length ) {
		rec.decl = decl;
	}
	if ( Object.keys( docDims ).length ) {
		rec.docDims = docDims;
	}
	// PARAMETER constants are locals too (string value = the literal).
	st.slice( 0, start ).forEach( function each( d ) {
		var m = /^PARAMETER ?\((.*)\)$/.exec( d );
		var parts;
		if ( !m ) {
			return;
		}
		parts = m[ 1 ].split( /,(?![^()]*\))/ );
		parts.forEach( function eachPart( pr ) {
			var kv = /^\s*([A-Z][A-Z0-9_]*) ?= ?(.+?)\s*$/.exec( pr );
			if ( kv && !loc[ kv[ 1 ] ] ) {
				loc[ kv[ 1 ] ] = kv[ 2 ];
			}
		});
	});
	var used = usedLocals( texts, loc );
	if ( Object.keys( used ).length ) {
		rec.locals = used;
	}
	return rec;
}

function sortedJSON( obj ) {
	return JSON.stringify( obj, function replacer( k, v ) {
		if ( v && typeof v === 'object' && !Array.isArray( v ) ) {
			return Object.keys( v ).sort().reduce( function r( o, key ) {
				o[ key ] = v[ key ];
				return o;
			}, {} );
		}
		return v;
	}, '\t' ) + '\n';
}

function main() {
	var sigs = JSON.parse( fs.readFileSync( path.join( ROOT, 'data', 'fortran-signatures.json' ), 'utf8' ) );
	var all = {};
	var missing = 0;
	DIRS.forEach( function each( pair ) {
		var dir = path.join( ROOT, pair[ 0 ] );
		if ( !fs.existsSync( dir ) ) {
			process.stderr.write( 'missing ' + pair[ 0 ] + ' (run `npm run fetch-reference`)\n' );
			missing += 1;
			return;
		}
		fs.readdirSync( dir ).sort().forEach( function eachFile( f ) {
			var m = /^(.*)\.(f|f90)$/i.exec( f );
			var name;
			var rec;
			if ( !m ) {
				return;
			}
			name = m[ 1 ].toLowerCase();
			if ( !sigs[ name ] || all[ name ] ) {
				return;
			}
			rec = extractOne( fs.readFileSync( path.join( dir, f ), 'utf8' ), /90$/i.test( m[ 2 ] ), sigs[ name ] );
			rec.package = pair[ 1 ];
			all[ name ] = rec;
		});
	});
	if ( missing ) {
		process.exit( 1 );
	}
	fs.writeFileSync( OUT, sortedJSON( all ) );
	process.stderr.write( 'wrote Fortran checks for ' + Object.keys( all ).length + ' routines to ' + path.relative( ROOT, OUT ) + '\n' );
}

module.exports = { 'extractOne': extractOne, 'main': main, 'statements': statements };

if ( require.main === module ) {
	main();
}
