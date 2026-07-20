'use strict';

/*
* base() call-arity check.
*
* Every layer that calls the strided kernel — `ndarray.js` and the layout
* wrapper `<routine>.js` — must pass EXACTLY as many arguments as `base.js`
* declares parameters. The ndarray form is already strided (1:1 with base),
* and the wrapper merely derives strides/offsets from `order`/`LD*` before
* calling base, so its `base(...)` call is 1:1 too.
*
* When a call passes one arg too many, JavaScript silently binds the surplus
* to nothing and every parameter after the insertion point receives the wrong
* value. The classic source is a vestigial OUTPUT param (LAPACK `M`, `INFO`,
* `ILO`/`IHI`, `EQUED`, ...) that the kernel returns in its result object but
* the wrapper still forwards positionally:
*
*   - INTERIOR surplus  -> the shift corrupts real trailing args (WORK, strides)
*                          and the documented signature CRASHES / reads OOB.
*   - TRAILING surplus  -> base ignores the extra arg (no crash) but the docs
*                          advertise a writable out-param the kernel never fills.
*
* This class produced 16 real defects (see test/harness/LEARNINGS.md, 2026-07-19
* "forwarded-output-param class"); `dtrsna`/`dlaqps`/`zgesvx`/`dgebal`/`zgebal`/
* `zlahef` crashed on their documented signatures. The `signature-conformance`
* ESLint rule did NOT catch them — its flexible achievable-count model admits
* the inflated arity. This deterministic base-vs-call comparison does.
*
* There is no exception/skip mechanism: a mismatch is fixed in the code (align
* the call to `base.length`) — never suppressed.
*/

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'base-arity';

var readFile = util.readFile;
var jsParams = util.jsParams;


// FUNCTIONS //

/**
* Count the top-level arguments of every real `base(...)` call in a source,
* skipping comments, imports, and string/template contents.
*
* @param {string} content - JS source
* @returns {Array<Object>} [ { line, argc } ]
*/
function baseCalls( content ) {
	var calls = [];
	var re = /(^|[^.\w])base\s*\(/g;
	var m;
	var lineStart;
	var lineEnd;
	var lineText;
	var trimmed;
	var open;
	var depth;
	var argc;
	var seen;
	var quote;
	var i;
	var ch;
	var prev;

	while ( ( m = re.exec( content ) ) !== null ) {
		open = ( m.index + m[ 0 ].length ) - 1; // index of '('

		lineStart = content.lastIndexOf( '\n', m.index ) + 1;
		lineEnd = content.indexOf( '\n', m.index );
		if ( lineEnd === -1 ) {
			lineEnd = content.length;
		}
		lineText = content.slice( lineStart, lineEnd );
		trimmed = lineText.replace( /^\s+/, '' );

		// Skip JSDoc/comment lines, and the `import base from ...` declaration:
		if ( trimmed.charAt( 0 ) === '*' || trimmed.slice( 0, 2 ) === '//' ) {
			continue;
		}
		if ( /\b(?:import|require)\b/.test( lineText ) ) {
			continue;
		}

		depth = 0;
		argc = 0;
		seen = false;
		quote = '';
		prev = '';
		for ( i = open; i < content.length; i++ ) {
			ch = content[ i ];
			if ( quote ) {
				if ( ch === quote && prev !== '\\' ) {
					quote = '';
				}
				prev = ch;
				continue;
			}
			if ( ch === '\'' || ch === '"' || ch === '`' ) {
				quote = ch;
				seen = true;
				prev = ch;
				continue;
			}
			if ( ch === '(' || ch === '[' || ch === '{' ) {
				depth += 1;
			} else if ( ch === ')' || ch === ']' || ch === '}' ) {
				depth -= 1;
				if ( depth === 0 ) {
					break;
				}
			} else if ( ch === ',' && depth === 1 ) {
				argc += 1;
				prev = ch;
				continue;
			}
			if ( depth >= 1 && !/\s/.test( ch ) ) {
				seen = true;
			}
			prev = ch;
		}
		calls.push({
			'line': content.slice( 0, m.index ).split( '\n' ).length,
			'argc': ( seen ? argc + 1 : 0 )
		});
	}
	return calls;
}


// MAIN //

/**
* Assert every `base(...)` call passes exactly `base.length` arguments.
*
* @param {Object} mod - { dir, pkg, routine }
* @returns {Array<Object>} check results
*/
function check( mod ) {
	var results = [];
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var baseContent = readFile( basePath );
	var expected;
	var violations = [];
	var sources;
	var s;
	var content;
	var calls;
	var j;

	if ( !baseContent ) {
		results.push( util.skip( ID, 'base() call arity matches base.js', 'No base.js' ) );
		return results;
	}
	expected = jsParams( baseContent, mod.routine ).length;
	if ( expected === 0 ) {
		results.push( util.skip( ID, 'base() call arity matches base.js', 'Could not parse base.js signature' ) );
		return results;
	}

	sources = [
		{ 'file': 'ndarray.js', 'path': path.join( mod.dir, 'lib', 'ndarray.js' ) },
		{ 'file': mod.routine + '.js', 'path': path.join( mod.dir, 'lib', mod.routine + '.js' ) }
	];
	for ( s = 0; s < sources.length; s++ ) {
		content = readFile( sources[ s ].path );
		if ( !content ) {
			continue;
		}
		calls = baseCalls( content );
		for ( j = 0; j < calls.length; j++ ) {
			if ( calls[ j ].argc !== expected ) {
				violations.push(
					path.relative( util.ROOT, sources[ s ].path ) + ':' + calls[ j ].line +
					'  base() called with ' + calls[ j ].argc + ' args, base.js declares ' + expected
				);
			}
		}
	}

	if ( violations.length > 0 ) {
		results.push( util.fail(
			ID,
			'base() call arity matches base.js',
			violations.length,
			violations,
			'Every base(...) call in ndarray.js/<routine>.js must pass exactly base.length args. A surplus arg is a forwarded output param (return it in the result object instead) and shifts every following argument.'
		));
	} else {
		results.push( util.pass( ID, 'base() call arity matches base.js' ) );
	}
	return results;
}


// EXPORTS //

module.exports = check;
