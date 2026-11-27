/**
* Converts the Doxygen prologue of a reference BLAS/LAPACK routine into
* web-renderable Markdown with KaTeX math (`$...$` inline, `$$...$$` display).
*
* The reference sources carry no TeX: their math is Fortran-flavoured ASCII
* inside `\verbatim` blocks (`u(j)**H * A = lambda(j) * u(j)**H * B`,
* `LDA >= max(1,N)`). This script recognises a conservative set of shapes and
* rewrites them as TeX:
*
*   - display equations: an indented, formula-shaped paragraph line
*   - inline math: `X**T`/`X**H`/`X**(-1)` powers and `NAME >= expr` bounds
*   - option tables (`= 'N': ...`, `< 0: ...`) become bullet lists
*   - ASCII art (matrix layouts, aligned tables) stays a fenced text block
*   - parameter references (`LWORK`, `WORK(1)`) become code spans
*
* Every math span is parsed by KaTeX; a span that fails falls back to a code
* span (inline) or a text block (display), and is counted in the report, so
* the output never contains math that does not render.
*
* Indices in the output are the Fortran (1-based) indices of the source.
*
* Usage:
*   node bin/fortran-docs.mjs <routine>...            # print Markdown to stdout
*   node bin/fortran-docs.mjs --out <dir> <routine>... # write <dir>/<routine>.md
*   node bin/fortran-docs.mjs --out <dir> --all        # every d/z/i/blas routine with a source
*   node bin/fortran-docs.mjs --readme <module-dir>...  # write the block into each module README
*   node bin/fortran-docs.mjs --readme --all            # ... for every module with a reference source
*   node bin/fortran-docs.mjs --report ...              # also print fallback stats to stderr
*
* README blocks sit between `<!-- fortran-docs:start ... -->` and
* `<!-- fortran-docs:end -->` (see bin/lib/fortran-docs-block.cjs); they render
* on GitHub and bin/docs lifts them into the documentation site.
*
* @module bin/fortran-docs
*/

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { createRequire } from 'node:module';

const ROOT = resolve( import.meta.dirname, '..' );
const require = createRequire( import.meta.url );
const katex = require( 'katex' );
const BLOCK = require( './lib/fortran-docs-block.cjs' );
const SRC_DIRS = [
	join( ROOT, 'data', 'lapack-3.12.0', 'SRC' ),
	join( ROOT, 'data', 'BLAS-3.12.0' ),
	join( ROOT, 'data', 'lapack-3.12.0', 'BLAS', 'SRC' ),
	join( ROOT, 'data', 'lapack-3.12.0', 'INSTALL' )
];

const GREEK = new Set([ 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma', 'tau', 'phi', 'chi', 'psi', 'omega' ]);
const CONNECTIVES = new Set([ 'or', 'and', 'if', 'for', 'where', 'with', 'then', 'when', 'otherwise', 'else' ]);
const FUNCS = { 'max': '\\max', 'min': '\\min', 'log': '\\log', 'exp': '\\exp', 'sin': '\\sin', 'cos': '\\cos', 'det': '\\det' };

const STATS = { 'inlineMath': 0, 'displayMath': 0, 'inlineFallback': 0, 'displayFallback': 0, 'textBlocks': 0, 'fallbacks': [] };


// SOURCE //

function findSource( routine ) {
	for ( const dir of SRC_DIRS ) {
		for ( const ext of [ '.f', '.f90' ] ) {
			const p = join( dir, routine + ext );
			if ( existsSync( p ) ) {
				return p;
			}
		}
	}
	return null;
}

/**
* Returns the `*>` / `!>` documentation lines of a source file, with the marker stripped.
*/
function docLines( src ) {
	const out = [];
	for ( const line of src.split( '\n' ) ) {
		const m = line.match( /^\s*[*!c]>(.*)$/i );
		if ( m ) {
			out.push( m[ 1 ].replace( /\s+$/, '' ) );
		} else if ( /^[^*!cC]\s*(\w[\w*() ]*\s)?(SUBROUTINE|FUNCTION|RECURSIVE|PURE|ELEMENTAL)\b/i.test( line ) && out.length ) {
			// The first code line (not a comment: the prologue's "Definition" block quotes the declaration).
			break;
		}
	}
	return out;
}

/**
* Splits documentation lines into `{ brief, sections: [{title, body}], params: [{dir, name, body}] }`.
*/
function parse( lines ) {
	const doc = { 'brief': '', 'sections': [], 'params': [] };
	let i = 0;
	const verbatim = () => {
		// A `\verbatim` block, or, when the next directive comes first, the plain lines before it
		// (some sections, e.g. dlaqr5's References, are written without `\verbatim`).
		const plain = [];
		while ( i < lines.length && !/\\verbatim/.test( lines[ i ] ) ) {
			if ( /^\s*\\\w/.test( lines[ i ] ) ) {
				return plain;
			}
			plain.push( lines[ i ] );
			i += 1;
		}
		if ( i >= lines.length ) {
			return plain;
		}
		const body = [];
		i += 1;
		while ( i < lines.length && !/\\endverbatim/.test( lines[ i ] ) ) {
			body.push( lines[ i ] );
			i += 1;
		}
		i += 1;
		return body;
	};
	while ( i < lines.length ) {
		const line = lines[ i ];
		let m;
		if ( ( m = line.match( /\\brief\s+(.*)$/ ) ) ) {
			let text = m[ 1 ];
			i += 1;
			while ( i < lines.length && lines[ i ].trim() && !/\\/.test( lines[ i ] ) ) {
				text += ' ' + lines[ i ].trim();
				i += 1;
			}
			doc.brief = text.replace( /<\/?b>/g, '' ).replace( /\\b\s+/g, '' ).replace( /\s+/g, ' ' ).trim();
		} else if ( ( m = line.match( /\\param\[([^\]]+)\]\s+(\w+)/ ) ) ) {
			i += 1;
			doc.params.push({ 'dir': m[ 1 ].replace( /\s/g, '' ), 'name': m[ 2 ], 'body': verbatim() });
		} else if ( ( m = line.match( /\\par\s+([^:]+):?/ ) ) ) {
			const title = m[ 1 ].trim();
			i += 1;
			if ( /^(Purpose|Further Details|References|Contributors)$/i.test( title ) ) {
				doc.sections.push({ title, 'body': verbatim() });
			}
		} else if ( /^\s*\\return\b/.test( line ) ) {
			i += 1;
			doc.sections.push({ 'title': 'Returns', 'body': verbatim() });
		} else if ( /^\s*\\details\b/.test( line ) ) {
			i += 1;
			doc.sections.push({ 'title': 'Further Details', 'body': verbatim() });
		} else {
			i += 1;
		}
	}
	return doc;
}


// MATH //

/**
* Returns the index just past the parenthesis group opening at `s[i]`, or -1.
*/
function closeParen( s, i ) {
	let depth = 0;
	for ( let j = i; j < s.length; j++ ) {
		if ( s[ j ] === '(' ) {
			depth += 1;
		} else if ( s[ j ] === ')' ) {
			depth -= 1;
			if ( depth === 0 ) {
				return j + 1;
			}
		}
	}
	return -1;
}

/**
* Converts a Fortran-ASCII expression to TeX. Throws on shapes it does not understand.
*/
function toTex( expr ) {
	let s = expr.trim().replace( /[.,;:]$/, '' ).trim();

	// sqrt( ... ) -> \sqrt{ ... }, abs( ... ) -> | ... |
	for ( const [ fn, open, close ] of [ [ 'sqrt', '\\sqrt{', '}' ], [ 'abs', '\\lvert ', ' \\rvert' ], [ 'conjg', '\\overline{', '}' ], [ 'conj', '\\overline{', '}' ] ] ) {
		const re = new RegExp( '\\b' + fn + '\\s*\\(', 'gi' );
		let m;
		while ( ( m = re.exec( s ) ) ) {
			const start = m.index + m[ 0 ].length - 1;
			const end = closeParen( s, start );
			if ( end < 0 ) {
				throw new Error( 'unbalanced ' + fn );
			}
			s = s.slice( 0, m.index ) + '\u0001' + open + s.slice( start + 1, end - 1 ) + close + '\u0002' + s.slice( end );
			re.lastIndex = 0;
		}
	}

	// Powers: X**T, X**H, X**(-1), X**2, (...)**H
	s = s.replace( /\*\*\s*\(\s*([^()]+?)\s*\)/g, '^{$1}' );
	s = s.replace( /\*\*\s*([A-Za-z0-9]+)/g, ( _, p ) => ( p.length === 1 ? '^' + p : '^{' + p + '}' ) );

	// Relations and ellipses.
	s = s.replace( />=/g, ' \\ge ' ).replace( /<=/g, ' \\le ' ).replace( /\/=|\.ne\./gi, ' \\ne ' ).replace( /!=/g, ' \\ne ' );
	s = s.replace( /(\.\s*){3,}/g, ' \\cdots ' ).replace( /\.\.\./g, ' \\ldots ' );

	// Multiplication: digit*digit -> \cdot, otherwise implicit.
	s = s.replace( /\s*\*\s*(?=-?\d)/g, ' \\cdot ' ).replace( /\s*\*\s*/g, ' \\, ' );

	// A lone `.` between operands is the ASCII product (`[ C S ] . [ F ]`).
	s = s.replace( /(^|\s)\.(?=\s)/g, '$1\\cdot' );

	// Quoted flag values.
	s = s.replace( /'([^']*)'/g, ( _, v ) => '\\text{\u0004' + v + '\u0004}' );

	// Words.
	s = s.replace( /\\?[A-Za-z][A-Za-z0-9_]*|\u0004[^\u0004]*\u0004/g, ( w, off ) => {
		if ( w[ 0 ] === '\\' || w[ 0 ] === '\u0004' ) {
			return w;
		}
		const lw = w.toLowerCase();
		if ( GREEK.has( w ) ) {
			return '\\' + w + ' ';
		}
		if ( FUNCS[ lw ] ) {
			return FUNCS[ lw ] + ' ';
		}
		if ( CONNECTIVES.has( w ) ) {
			return '\\quad\\text{' + w + '}\\quad ';
		}
		if ( w.length === 1 ) {
			return w;
		}
		if ( /^[A-Za-z]\d+$/.test( w ) ) {
			return w[ 0 ] + '_{' + w.slice( 1 ) + '}';
		}
		if ( /^[a-z]+$/.test( w ) && /^\s*\(/.test( s.slice( off + w.length ) ) ) {
			return '\\operatorname{' + w + '}';
		}
		return '\\mathrm{' + w.replace( /_/g, '\\_' ) + '}';
	});
	s = s.replace( /[\u0001\u0002]/g, '' ).replace( /\u0004([^\u0004]*)\u0004/g, ( _, v ) => "'" + v + "'" ).replace( /\s+/g, ' ' ).trim();

	// Reject anything that is clearly prose.
	if ( ( s.match( /\\mathrm\{[a-z]{4,}\}/g ) || [] ).length > 1 ) {
		throw new Error( 'prose' );
	}
	katex.renderToString( s, { 'throwOnError': true, 'strict': 'ignore' } );
	return s;
}

function inlineMath( expr ) {
	try {
		const tex = toTex( expr );
		STATS.inlineMath += 1;
		return '$' + tex + '$';
	} catch ( err ) {
		STATS.inlineFallback += 1;
		STATS.fallbacks.push( 'inline: ' + expr );
		return '`' + expr + '`';
	}
}

// INLINE MATH //

// Lowercase words that may appear as operands of an inline formula.
const MATH_WORDS = new Set([ ...GREEK, ...Object.keys( FUNCS ), 'sqrt', 'abs', 'sign', 'sgn', 'norm', 'op', 'conj', 'conjg', 'diag', 'inv', 'eps', 'ulp', 'safmin', 'smlnum', 'bignum', 'real', 'imag', 'dble', 'mod' ]);
const ENGLISH_SHORT = new Set([ 'or', 'of', 'is', 'in', 'to', 'if', 'by', 'as', 'at', 'on', 'be', 'an', 'it', 'no', 'so', 'we', 'up', 'do' ]);

/**
* Scans `s` from `i` for one operand: `-`? (number | 'flag' | word(index)? | (group)) (`**`power)?.
* Returns `{ end, words, indexed }` or null.
*/
function operand( s, i ) {
	let j = i;
	const words = [];
	if ( s[ j ] === '-' ) {
		j += 1;
	}
	let m;
	const rest = s.slice( j );
	if ( ( m = rest.match( /^\d+(?:\.\d+)?(?:[dDeE][-+]?\d+)?/ ) ) ) {
		j += m[ 0 ].length;
	} else if ( ( m = rest.match( /^'[^'\s]{1,3}'/ ) ) ) {
		j += m[ 0 ].length;
	} else if ( ( m = rest.match( /^[A-Za-z][A-Za-z0-9_]*/ ) ) ) {
		words.push( m[ 0 ] );
		j += m[ 0 ].length;
		if ( s[ j ] === '(' ) {
			const e = closeParen( s, j );
			if ( e < 0 ) {
				return null;
			}
			words.push( ...( s.slice( j, e ).match( /[A-Za-z][A-Za-z0-9_]*/g ) || [] ) );
			j = e;
		}
	} else if ( s[ j ] === '(' ) {
		const e = closeParen( s, j );
		if ( e < 0 ) {
			return null;
		}
		words.push( ...( s.slice( j, e ).match( /[A-Za-z][A-Za-z0-9_]*/g ) || [] ) );
		j = e;
	} else {
		return null;
	}
	if ( ( m = s.slice( j ).match( /^\*\*(?:\(-?[A-Za-z0-9]+\)|[A-Za-z0-9]+)/ ) ) ) {
		j += m[ 0 ].length;
	}
	return { 'end': j, words };
}

function mathyWord( w ) {
	if ( w.length === 1 || /^[A-Z][A-Z0-9_]*$/.test( w ) || MATH_WORDS.has( w.toLowerCase() ) || /^[a-z]\d+$/.test( w ) ) {
		return true;
	}
	return w.length <= 2 && !ENGLISH_SHORT.has( w.toLowerCase() );
}

const OP_RE = /^\s*(\*\*|>=|<=|\/=|!=|\.ne\.|[-+*/=<>])\s*/i;

/**
* Finds inline formulas in prose: maximal operand (op operand)+ runs whose operands are
* all math-like and which contain a power, product, relation or equation.
* Returns `[{ start, end, text, ops, lhs }]`.
*/
function mathRuns( s ) {
	const runs = [];
	let i = 0;
	while ( i < s.length ) {
		if ( !/[-A-Za-z0-9('(]/.test( s[ i ] ) || ( i > 0 && /[\w)]/.test( s[ i - 1 ] ) ) ) {
			i += 1;
			continue;
		}
		const first = operand( s, i );
		if ( !first || !first.words.every( mathyWord ) ) {
			i += 1;
			continue;
		}
		let end = first.end;
		const ops = [];
		const pow = /\*\*/.test( s.slice( i, end ) );
		let hasPow = pow;
		for ( ;; ) {
			const om = s.slice( end ).match( OP_RE );
			if ( !om ) {
				break;
			}
			const next = operand( s, end + om[ 0 ].length );
			if ( !next || !next.words.every( mathyWord ) || /[\w(]/.test( s[ next.end ] || '' ) ) {
				break;
			}
			ops.push( om[ 1 ] );
			hasPow = hasPow || /\*\*/.test( s.slice( end, next.end ) );
			end = next.end;
		}
		const trigger = hasPow || ops.some( ( o ) => /^(\*|>=|<=|\/=|!=|\.ne\.|=|<|>)$/i.test( o ) );
		if ( trigger && ( ops.length || hasPow ) ) {
			runs.push({ 'start': i, end, 'text': s.slice( i, end ), ops, 'lhs': first.words[ 0 ] || null, hasPow });
			i = end;
		} else {
			i = first.end > i ? first.end : i + 1;
		}
	}
	return runs;
}


// MARKDOWN //

/**
* Applies inline conversions to a prose string.
*/
function prose( text, names ) {
	// Fortran type names are not products.
	text = text.replace( /\b(COMPLEX|REAL|INTEGER|CHARACTER|LOGICAL|DOUBLE COMPLEX)\*(\d+|\(\*\))/g, '\u0007$1\u0008$2' );
	return prose1( text, names ).replace( /\u0007([A-Z ]+)\u0008/g, '$1\\*' );
}

function prose1( text, names ) {
	const out = [];
	let last = 0;
	const emit = ( start, end, md ) => {
		out.push( words( text.slice( last, start ), names ), md );
		last = end;
	};
	for ( const r of mathRuns( text ) ) {
		// `INFO = 0`, `JOBZ = 'V'`: a parameter set to a value reads best as code.
		const onlyEq = r.ops.every( ( o ) => o === '=' ) && !r.hasPow;
		const isParam = r.lhs && names.has( r.lhs ) && r.lhs.length > 1;
		if ( onlyEq && ( isParam || /'/.test( r.text ) ) ) {
			emit( r.start, r.end, '`' + r.text + '`' );
		} else if ( r.ops.every( ( o ) => o === '/' || o === '-' || o === '+' ) && !r.hasPow ) {
			continue;
		} else {
			emit( r.start, r.end, inlineMath( r.text ) );
		}
	}
	out.push( words( text.slice( last ), names ) );
	return out.join( '' );
}

/**
* Inline conversions on text that holds no formula: standalone greek letters and parameter names.
*/
function words( text, names ) {
	const alts = [ ...names ].filter( ( n ) => /^\w+$/.test( n ) ).sort( ( a, b ) => b.length - a.length );
	const multi = alts.filter( ( n ) => n.length > 1 );
	const parts = [];
	const re = new RegExp( String.raw`(?<![\w'])(?:` +
		( alts.length ? String.raw`(?:` + alts.join( '|' ) + String.raw`)\([^()\s]*(?:\([^()]*\)[^()\s]*)*\)|` : '' ) +
		( multi.length ? String.raw`(?:` + multi.join( '|' ) + String.raw`)(?![\w('])|` : '' ) +
		String.raw`(?:` + [ ...GREEK ].join( '|' ) + String.raw`)(?![\w(]))`, 'g' );
	let last = 0;
	let m;
	while ( ( m = re.exec( text ) ) ) {
		parts.push( escapeMd( text.slice( last, m.index ) ) );
		parts.push( GREEK.has( m[ 0 ] ) ? inlineMath( m[ 0 ] ) : '`' + m[ 0 ] + '`' );
		last = m.index + m[ 0 ].length;
	}
	parts.push( escapeMd( text.slice( last ) ) );
	return parts.join( '' );
}

function escapeMd( s ) {
	return s.replace( /([\\*_[\]<>|$`])/g, '\\$1' );
}

function indentOf( line ) {
	return line.match( /^\s*/ )[ 0 ].length;
}

/**
* Is this line ASCII art / an aligned table rather than prose?
*/
function isArt( line ) {
	const t = line.trim();
	return /^[([|].*[)\]|][.,;]?$/.test( t ) || /\S\s{4,}\S/.test( t ) || /^[-=+|]{3,}/.test( t );
}

/**
* Does this line read as a formula rather than prose?
*/
function isFormula( line ) {
	const t = line.trim().replace( /[.,;]$/, '' );
	if ( !/[=<>]|\*\*|\*|\+/.test( t ) || t.length > 90 ) {
		return false;
	}
	const ws = t.replace( /'[^']*'/g, '' ).match( /[A-Za-z]{3,}/g ) || [];
	return ws.filter( ( w ) => !mathyWord( w ) && !CONNECTIVES.has( w ) ).length === 0;
}

function textBlock( lines ) {
	STATS.textBlocks += 1;
	const ind = Math.min( ...lines.filter( ( l ) => l.trim() ).map( indentOf ) );
	return '```text\n' + lines.map( ( l ) => l.slice( ind ) ).join( '\n' ).replace( /\n+$/, '' ) + '\n```';
}

function displayMath( line ) {
	try {
		const tex = toTex( line );
		STATS.displayMath += 1;
		return '$$\n' + tex + '\n$$';
	} catch ( err ) {
		STATS.displayFallback += 1;
		STATS.fallbacks.push( 'display: ' + line.trim() );
		return textBlock([ line ]);
	}
}

/**
* Converts a multi-line ASCII-art formula whose bracketed columns line up
* (`H * ( alpha ) = ( beta )` over `    (   x   )   (   0  )`) to TeX with
* `pmatrix`/`bmatrix`. Throws when the layout is not a pure bracket grid.
*/
function asciiMatrix( lines ) {
	const ind = Math.min( ...lines.map( indentOf ) );
	const rows = lines.map( ( l ) => l.slice( ind ) );
	const W = Math.max( ...rows.map( ( r ) => r.length ) );
	const grid = rows.map( ( r ) => r.padEnd( W ) );
	const PAIRS = { '(': ')', '[': ']' };

	// Top-level bracket pairs per line.
	const pairsOf = ( r ) => {
		const ps = [];
		const stack = [];
		for ( let c = 0; c < r.length; c++ ) {
			if ( PAIRS[ r[ c ] ] ) {
				stack.push( c );
			} else if ( r[ c ] === ')' || r[ c ] === ']' ) {
				const o = stack.pop();
				if ( o === void 0 ) {
					return null;
				}
				if ( !stack.length ) {
					ps.push( o + ':' + c );
				}
			}
		}
		return stack.length ? null : ps;
	};
	const perLine = grid.map( pairsOf );
	if ( perLine.some( ( p ) => p === null ) ) {
		throw new Error( 'unbalanced' );
	}
	const counts = {};
	perLine.flat().forEach( ( k ) => { counts[ k ] = ( counts[ k ] || 0 ) + 1; } );
	const groups = Object.keys( counts ).filter( ( k ) => counts[ k ] >= 2 ).map( ( k ) => k.split( ':' ).map( Number ) ).sort( ( a, b ) => a[ 0 ] - b[ 0 ] );
	if ( !groups.length ) {
		throw new Error( 'no grid' );
	}
	for ( let g = 1; g < groups.length; g++ ) {
		if ( groups[ g ][ 0 ] <= groups[ g - 1 ][ 1 ] ) {
			throw new Error( 'overlap' );
		}
	}

	// Every line must either carry each group's brackets or be blank across its span.
	const placeholders = [];
	let tex = '';
	let col = 0;
	const outside = ( a, b ) => {
		const segs = grid.map( ( r ) => r.slice( a, b ) ).filter( ( x ) => x.trim() );
		if ( segs.length > 1 ) {
			throw new Error( '2d text outside brackets' );
		}
		return segs.length ? ' ' + segs[ 0 ].trim().replace( /\s{4,}/g, ' \u0006 ' ) + ' ' : ' ';
	};
	for ( const [ o, c ] of groups ) {
		tex += outside( col, o );
		const inner = [];
		for ( const r of grid ) {
			if ( r[ o ] === '(' || r[ o ] === '[' ) {
				if ( r[ c ] !== PAIRS[ r[ o ] ] ) {
					throw new Error( 'ragged' );
				}
				inner.push( r.slice( o + 1, c ) );
			} else if ( r.slice( o, c + 1 ).trim() ) {
				throw new Error( 'stray text in bracket column' );
			}
		}
		// Cell boundaries: columns blank in every row.
		const w = Math.max( ...inner.map( ( x ) => x.length ) );
		const blank = [];
		for ( let k = 0; k < w; k++ ) {
			blank.push( inner.every( ( x ) => ( x[ k ] || ' ' ) === ' ' ) );
		}
		const cells = [];
		for ( let k = 0; k < w; ) {
			if ( blank[ k ] ) {
				k += 1;
				continue;
			}
			let e = k;
			while ( e < w && !blank[ e ] ) {
				e += 1;
			}
			cells.push([ k, e ]);
			k = e;
		}
		const body = inner.map( ( x ) => cells.map( ( [ a, b ] ) => {
			const t = x.slice( a, b ).trim();
			return t ? toTex( t ) : '';
		}).join( ' & ' ) ).join( ' \\\\ ' );
		const env = grid.find( ( r ) => r[ o ] === '(' || r[ o ] === '[' )[ o ] === '(' ? 'pmatrix' : 'bmatrix';
		placeholders.push( '\\begin{' + env + '} ' + body + ' \\end{' + env + '}' );
		tex += ' \u0005' + ( placeholders.length - 1 ) + '\u0005 ';
		col = c + 1;
	}
	tex += outside( col, W );
	let out = toTex( tex.replace( /\u0005(\d+)\u0005/g, 'MATRIXPH$1' ).replace( /\u0006/g, 'QQUADPH' ) );
	out = out.replace( /\\mathrm\{MATRIXPH(\d+)\}/g, ( _, n ) => placeholders[ Number( n ) ] ).replace( /\\mathrm\{QQUADPH\}/g, '\\qquad' );
	katex.renderToString( out, { 'throwOnError': true, 'strict': 'ignore' } );
	return out;
}

function artBlock( lines, fallback ) {
	try {
		const tex = asciiMatrix( lines );
		STATS.displayMath += 1;
		STATS.matrices = ( STATS.matrices || 0 ) + 1;
		return '$$\n' + tex + '\n$$';
	} catch ( err ) {
		return ( fallback && fallback() ) || textBlock( lines );
	}
}

const OPTION_RE = /^(?:=\s*'[^']*'|[=<>]\s*-?\w+|=\s*\d+\s*,\s*\.\.\.\s*,?\s*\w+)\s*:/;

function paragraphs( lines ) {
	const paras = [];
	let cur = [];
	for ( const l of lines ) {
		if ( l.trim() ) {
			cur.push( l );
		} else if ( cur.length ) {
			paras.push( cur );
			cur = [];
		}
	}
	if ( cur.length ) {
		paras.push( cur );
	}
	return paras;
}

/**
* Converts a verbatim body (array of lines) to Markdown.
*/
function body( lines, names ) {
	// Upstream placeholders ("TODO: put further details") carry nothing.
	const paras = paragraphs( lines.filter( ( l ) => !/^\s*TODO\b/.test( l ) ) );
	if ( !paras.length ) {
		return '';
	}
	const base = Math.min( ...paras.flat().map( indentOf ) );
	const out = [];
	for ( const p of paras ) {
		block( p, base, names, out );
	}
	return out.join( '\n\n' );
}

/**
* Renders one paragraph. A paragraph can mix a prose lead-in with deeper-indented
* formulas, art, or list items; those runs are split out and rendered on their own.
*/
function block( p, base, names, out ) {
	// A brace-style case analysis (`DLANGE = ( max(abs(A(i,j))), NORM = 'M'` / `( norm1(A), NORM = '1'`).
	const cs = cases( p );
	if ( cs ) {
		out.push( cs );
		return;
	}
	// Option list (possibly after a prose lead-in).
	const k = p.findIndex( ( l ) => OPTION_RE.test( l.trim() ) );
	if ( k >= 0 && ( k === 0 || indentOf( p[ k ] ) <= indentOf( p[ 0 ] ) + 4 ) ) {
		if ( k > 0 ) {
			block( p.slice( 0, k ), base, names, out );
		}
		out.push( options( p.slice( k ), names ) );
		return;
	}
	// Art (a matrix layout or aligned table), possibly with prose lines before/after it.
	const art = p.filter( isArt ).length;
	if ( art && ( art >= 2 || p.length === 1 ) && !( p.length === 1 && isFormula( p[ 0 ] ) ) ) {
		let a = 0;
		let b = p.length;
		while ( a < b && !isArt( p[ a ] ) && indentOf( p[ a ] ) <= lead0( p ) ) {
			a += 1;
		}
		while ( b > a && !isArt( p[ b - 1 ] ) && indentOf( p[ b - 1 ] ) <= lead0( p ) ) {
			b -= 1;
		}
		if ( a > 0 ) {
			out.push( prose( joinLines( p.slice( 0, a ) ), names ) );
		}
		const core = p.slice( a, b );
		out.push( core.length > 1 ? artBlock( core, () => table( core, names ) ) : textBlock( core ) );
		if ( b < p.length ) {
			out.push( prose( joinLines( p.slice( b ) ), names ) );
		}
		return;
	}
	// Whole paragraph is formula lines, set off from the prose margin.
	if ( p.every( ( l ) => indentOf( l ) > base + 1 && isFormula( l ) ) ) {
		p.forEach( ( l ) => out.push( displayMath( l ) ) );
		return;
	}
	// Multi-line 2-D formula set off from the margin (e.g. a stacked vector).
	if ( p.length > 1 && p.every( ( l ) => indentOf( l ) > base + 1 ) && p.some( ( l ) => /[([]/.test( l ) ) && p.some( isFormula ) ) {
		out.push( artBlock( p ) );
		return;
	}
	// Split out runs indented deeper than the paragraph's first line.
	const lead = indentOf( p[ 0 ] );
	const runs = [];
	for ( const l of p ) {
		const deep = indentOf( l ) > lead + 1;
		if ( runs.length && runs[ runs.length - 1 ].deep === deep ) {
			runs[ runs.length - 1 ].lines.push( l );
		} else {
			runs.push({ deep, 'lines': [ l ] });
		}
	}
	if ( runs.length === 1 ) {
		out.push( prose( joinLines( p ), names ) );
		return;
	}
	for ( const r of runs ) {
		if ( !r.deep ) {
			out.push( prose( joinLines( r.lines ), names ) );
		} else if ( r.lines.every( isFormula ) ) {
			r.lines.forEach( ( l ) => out.push( displayMath( l ) ) );
		} else if ( r.lines.length > 1 && r.lines.filter( isArt ).length >= 2 ) {
			out.push( artBlock( r.lines ) );
		} else {
			out.push( items( r.lines, names ) );
		}
	}
}

function lead0( p ) {
	return Math.min( ...p.map( indentOf ) );
}

/**
* An aligned grid whose cells are separated by 3+ spaces (e.g. the SIDE/TRANS
* table of the apply-Q routines) as a Markdown table, or null.
*/
function table( lines, names ) {
	const rows = lines.map( ( l ) => l.trim().split( /\s{3,}/ ) );
	const n = rows[ rows.length - 1 ].length;
	if ( n < 2 || rows.slice( 1 ).some( ( r ) => r.length !== n ) || lines.some( ( l ) => /[([]\s*$|^\s*[)\]]|---/.test( l ) ) ) {
		return null;
	}
	const head = rows[ 0 ].length === n - 1 ? [ '', ...rows[ 0 ] ] : rows[ 0 ];
	if ( head.length !== n ) {
		return null;
	}
	// Body cells must start in the same column on every row, and hold balanced brackets.
	const starts = ( l ) => {
		const st = [];
		const re = /(?:^|\s{3,})(\S)/g;
		let m;
		while ( ( m = re.exec( l ) ) ) {
			st.push( m.index + m[ 0 ].length - 1 );
		}
		return st.join( ',' );
	};
	const bal = ( c ) => ( c.match( /[([]/g ) || [] ).length === ( c.match( /[)\]]/g ) || [] ).length;
	const body = rows.slice( 1 ).flat();
	if ( new Set( lines.slice( 1 ).map( starts ) ).size !== 1 || !rows.flat().every( bal ) || body.every( ( c ) => /^[\d\s]+$/.test( c ) ) || rows.flat().some( ( c ) => /^=|,$/.test( c ) ) ) {
		return null;
	}
	const cell = ( c ) => ( c ? prose( c, names ).replace( /\|/g, '\\|' ) : ' ' );
	STATS.tables = ( STATS.tables || 0 ) + 1;
	return [ head, head.map( () => '---' ), ...rows.slice( 1 ) ].map( ( r, i ) => '| ' + ( i === 1 ? r.join( ' | ' ) : r.map( cell ).join( ' | ' ) ) + ' |' ).join( '\n' );
}

/**
* Converts a brace-style case analysis to a TeX `cases` environment, or returns null:
*
*     DLANGE = ( max(abs(A(i,j))), NORM = 'M' or 'm'
*              (
*              ( norm1(A),         NORM = '1', 'O' or 'o'
*
* Every line has a `(` in the same column, the first may carry a left-hand
* side before it, and each non-empty row is `expression, condition`.
*/
function cases( p ) {
	const col = p[ 0 ].indexOf( '(' );
	if ( p.length < 3 || col < 0 || !p.every( ( l ) => l[ col ] === '(' && !l.slice( 0, col ).trim() || l === p[ 0 ] ) ) {
		return null;
	}
	const lhs = p[ 0 ].slice( 0, col ).trim();
	if ( lhs && !/=$/.test( lhs ) ) {
		return null;
	}
	const rows = [];
	for ( const l of p ) {
		const t = l.slice( col + 1 ).trim();
		if ( !t ) {
			continue;
		}
		// Split at the first depth-0 comma.
		let depth = 0;
		let k = -1;
		for ( let j = 0; j < t.length; j++ ) {
			if ( t[ j ] === '(' ) {
				depth += 1;
			} else if ( t[ j ] === ')' ) {
				depth -= 1;
			} else if ( t[ j ] === ',' && depth === 0 ) {
				k = j;
				break;
			}
		}
		if ( k < 0 || depth < 0 ) {
			return null;
		}
		rows.push([ t.slice( 0, k ), t.slice( k + 1 ).trim() ]);
	}
	if ( rows.length < 2 ) {
		return null;
	}
	try {
		const text = ( c ) => '\\text{' + c.replace( /[\\{}$&#%_^~]/g, ( x ) => '\\' + x ) + '}';
		let tex = ( lhs ? toTex( lhs.replace( /=$/, '' ) ) + ' = ' : '' ) + '\\begin{cases} ' + rows.map( ( [ e, c ] ) => toTex( e ) + ' & ' + text( c ) ).join( ' \\\\ ' ) + ' \\end{cases}';
		tex = tex.replace( /\s+/g, ' ' );
		katex.renderToString( tex, { 'throwOnError': true, 'strict': 'ignore' } );
		STATS.displayMath += 1;
		STATS.cases = ( STATS.cases || 0 ) + 1;
		return '$$\n' + tex + '\n$$';
	} catch ( err ) {
		return null;
	}
}

/**
* Deeper-indented prose lines: one bullet per line at the run's margin, continuations folded in.
*/
function items( lines, names ) {
	const m = Math.min( ...lines.map( indentOf ) );
	const heads = lines.filter( ( l ) => indentOf( l ) === m ).length;
	if ( heads < 2 ) {
		return prose( joinLines( lines ), names );
	}
	const its = [];
	for ( const l of lines ) {
		if ( indentOf( l ) === m || !its.length ) {
			its.push([ l ]);
		} else {
			its[ its.length - 1 ].push( l );
		}
	}
	return its.map( ( it ) => '-   ' + prose( joinLines( it ), names ) ).join( '\n' );
}

function joinLines( lines ) {
	return lines.map( ( l ) => l.trim() ).join( ' ' ).replace( /\s+/g, ' ' );
}

function options( lines, names ) {
	const items = [];
	for ( const l of lines ) {
		const t = l.trim();
		const m = t.match( OPTION_RE );
		if ( m ) {
			items.push({ 'key': m[ 0 ].slice( 0, -1 ).trim(), 'text': t.slice( m[ 0 ].length ).trim() });
		} else if ( items.length ) {
			items[ items.length - 1 ].text += ' ' + t;
		} else {
			items.push({ 'key': null, 'text': t });
		}
	}
	return items.map( ( it ) => ( it.key === null ? prose( it.text, names ) : '-   `' + it.key.replace( /\s+/g, ' ' ) + '`: ' + prose( it.text, names ) ) ).join( '\n' );
}

/**
* Splits a parameter body's leading "X is TYPE array, dimension (...)" line from its description.
*/
function paramHead( name, lines ) {
	const first = ( lines.find( ( l ) => l.trim() ) || '' ).trim();
	const re = new RegExp( '^' + name + '\\s+is\\s+(.*)$', 'i' );
	const m = first.match( re );
	if ( !m ) {
		return { 'type': null, 'rest': lines };
	}
	const idx = lines.findIndex( ( l ) => l.trim() );
	let type = m[ 1 ].replace( /[.,]$/, '' );
	let j = idx + 1;

	// Dimension clauses can wrap onto the next line(s) until parentheses balance.
	const bal = ( s ) => ( s.match( /\(/g ) || [] ).length - ( s.match( /\)/g ) || [] ).length;
	while ( ( bal( type ) > 0 || /dimension\s*$/i.test( type ) ) && j < lines.length ) {
		type += ' ' + lines[ j ].trim();
		j += 1;
	}
	return { 'type': type.replace( /[.,]$/, '' ), 'rest': lines.slice( j ) };
}


// RENDER //

/**
* Renders a routine's documentation.
*
* Standalone (a translator's reference): title, brief, Purpose, every argument,
* Further Details, References.
*
* With `embed` (the README block): only what the module's own parameter docs
* cannot hold, the mathematical and implementation content: Purpose, Further
* Details and References, headings one level down under `## Reference notes`.
* `substantive` is false when that leaves a single plain sentence or so (e.g.
* "DCOPY copies a vector, x, to a vector, y."), which the README tagline
* already says.
*/
function render( routine, path, embed ) {
	const doc = parse( docLines( readFileSync( path, 'utf8' ) ) );
	const names = new Set( doc.params.map( ( p ) => p.name ) );
	const rel = path.slice( ROOT.length + 1 );
	const lib = /BLAS/.test( rel ) && !/lapack-3\.12\.0\/SRC/.test( rel ) ? 'BLAS' : 'LAPACK';
	const h = embed ? '#' : '';
	const out = [];
	const brief = doc.brief.replace( new RegExp( '^' + routine + '\\b\\s*', 'i' ), '' ).replace( /^./, ( c ) => c.toUpperCase() );
	const note = 'Indices are the 1-based Fortran indices of the source.';
	if ( embed ) {
		out.push( '## Reference notes', '' );
		out.push( 'The mathematical description from the reference ' + lib + ' 3.12.0 source of `' + routine.toUpperCase() + '`. ' + note );
	} else {
		out.push( '<!-- Generated by bin/fortran-docs.mjs from ' + rel + '. Do not edit. -->', '' );
		out.push( '# ' + routine.toUpperCase(), '' );
		if ( brief ) {
			out.push( '> ' + prose( brief, names ), '' );
		}
		out.push( 'Reference ' + lib + ' 3.12.0 documentation, converted to Markdown with KaTeX math. ' + note );
	}
	let substance = 0;
	for ( const sec of doc.sections.filter( ( s ) => s.title === 'Purpose' ) ) {
		const b = body( sec.body, names );
		out.push( '', h + '## Purpose', '', b );
		// Math, art, a table or list, a second paragraph, or several words the brief does not have.
		const briefWords = new Set( ( doc.brief.toLowerCase().match( /[a-z]{4,}/g ) || [] ) );
		const novel = new Set( ( joinLines( sec.body ).toLowerCase().match( /[a-z]{4,}/g ) || [] ).filter( ( w ) => !briefWords.has( w ) ) );
		substance += /\$|```|^\||^-   /m.test( b ) || b.split( /\n\n/ ).length > 1 || novel.size >= 8 ? 2 : 0;
	}
	if ( doc.params.length && !embed ) {
		out.push( '', h + '## Arguments' );
		for ( const p of doc.params ) {
			const { type, rest } = paramHead( p.name, p.body );
			out.push( '', h + '### ' + p.name + ' `[' + p.dir + ']`', '' );
			if ( type ) {
				out.push( '_' + type.replace( /\*/g, '\\*' ).replace( /_/g, '\\_' ) + '_', '' );
			}
			const b = body( rest, names );
			if ( b ) {
				out.push( b );
			} else if ( out[ out.length - 1 ] === '' ) {
				out.pop();
			}
		}
	}
	// Contributors usually lists names and affiliations; some (zlahqr) also record what changed in the algorithm.
	const prosey = ( sec ) => {
		const ws = joinLines( sec.body ).match( /[A-Za-z]{3,}/g ) || [];
		return ws.filter( ( w ) => /^[a-z]/.test( w ) ).length >= 15;
	};
	for ( const sec of doc.sections.filter( ( s ) => s.title !== 'Purpose' && !( embed && s.title === 'Contributors' && !prosey( s ) ) ) ) {
		const b = body( sec.body, names );
		if ( b ) {
			out.push( '', h + '## ' + sec.title, '', b );
			substance += 2;
		}
	}
	return { 'markdown': out.join( '\n' ).replace( /\n{3,}/g, '\n\n' ).trim() + '\n', rel, 'substantive': substance >= 1 };
}


/**
* Module directories (`lib/<pkg>/base/<routine>`) with a README.
*/
function modules() {
	const out = [];
	const libDir = join( ROOT, 'lib' );
	for ( const pkg of readdirSync( libDir ) ) {
		const base = join( libDir, pkg, 'base' );
		if ( !existsSync( base ) ) {
			continue;
		}
		for ( const r of readdirSync( base ) ) {
			if ( existsSync( join( base, r, 'README.md' ) ) ) {
				out.push( join( base, r ) );
			}
		}
	}
	return out.sort();
}

/**
* Writes (or refreshes) the reference-documentation block of each module README.
*/
function readmes( dirs, report ) {
	let written = 0;
	let unchanged = 0;
	const skipped = [];
	const thin = [];
	for ( const dir of dirs ) {
		const routine = basename( dir );
		const path = findSource( routine );
		if ( !path ) {
			skipped.push( routine );
			continue;
		}
		const file = join( dir, 'README.md' );
		const before = readFileSync( file, 'utf8' );
		const { markdown, rel, substantive } = render( routine, path, true );
		const after = BLOCK.upsert( before, substantive ? BLOCK.wrap( markdown, rel ) : null );
		if ( !substantive ) {
			thin.push( routine );
		}
		if ( after === before ) {
			unchanged += 1;
		} else {
			writeFileSync( file, after );
			written += 1;
		}
	}
	console.error( 'READMEs: ' + written + ' written, ' + unchanged + ' unchanged, ' + thin.length + ' with no reference notes beyond the tagline' + ( report && thin.length ? ' (' + thin.join( ', ' ) + ')' : '' ) + ', ' + skipped.length + ' without a reference source' + ( report && skipped.length ? ' (' + skipped.join( ', ' ) + ')' : '' ) );
}


// MAIN //

function main() {
	const args = process.argv.slice( 2 );
	let outDir = null;
	let all = false;
	let report = false;
	let readme = false;
	const routines = [];
	for ( let i = 0; i < args.length; i++ ) {
		if ( args[ i ] === '--out' ) {
			outDir = resolve( args[ ++i ] );
		} else if ( args[ i ] === '--all' ) {
			all = true;
		} else if ( args[ i ] === '--report' ) {
			report = true;
		} else if ( args[ i ] === '--readme' ) {
			readme = true;
		} else {
			routines.push( ( readme ? args[ i ] : args[ i ].toLowerCase() ) );
		}
	}
	if ( readme ) {
		readmes( all ? modules() : routines.map( ( r ) => resolve( r ) ), report );
		if ( report ) {
			console.error( JSON.stringify({ ...STATS, 'fallbacks': STATS.fallbacks.length }, null, 2 ) );
		}
		return;
	}
	if ( all ) {
		for ( const dir of SRC_DIRS ) {
			if ( !existsSync( dir ) ) {
				continue;
			}
			for ( const f of readdirSync( dir ) ) {
				const m = f.match( /^([a-z0-9_]+)\.f(90)?$/ );
				if ( m && /^(d|z|i|l|x|dz|iz|id)/.test( m[ 1 ] ) && !routines.includes( m[ 1 ] ) ) {
					routines.push( m[ 1 ] );
				}
			}
		}
	}
	if ( !routines.length ) {
		console.error( 'usage: node bin/fortran-docs.mjs [--out <dir>] [--report] (--all | <routine>...)' );
		process.exit( 2 );
	}
	if ( outDir ) {
		mkdirSync( outDir, { 'recursive': true } );
	}
	let missing = 0;
	for ( const r of routines ) {
		const path = findSource( r );
		if ( !path ) {
			console.error( 'no source for ' + r + ' (run bin/fetch-reference.sh)' );
			missing += 1;
			continue;
		}
		const md = render( r, path, false ).markdown;
		if ( outDir ) {
			writeFileSync( join( outDir, r + '.md' ), md );
		} else {
			process.stdout.write( md );
		}
	}
	if ( report ) {
		console.error( JSON.stringify({ ...STATS, 'fallbacks': STATS.fallbacks.length }, null, 2 ) );
		for ( const f of STATS.fallbacks.slice( 0, 60 ) ) {
			console.error( '  ' + f );
		}
	}
	if ( missing ) {
		process.exit( 1 );
	}
}

main();
