/**
* Shared rendering helpers: escaping, Markdown, syntax highlighting, signature
* layout, and the page shell.
*
* @module bin/docs/render/common
*/

import MarkdownIt from 'markdown-it';
import { PACKAGES } from '../taxonomy.js';

const md = new MarkdownIt({ 'html': false, 'linkify': false, 'typographer': false });

export const ARRAY_ROLES = new Set([ 'matrix', 'banded', 'packed', 'vector', 'workspace', 'index', 'result', 'state' ]);

export function esc( s ) {
	return String( s == null ? '' : s ).replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /"/g, '&quot;' );
}

/**
* Renders JSDoc description text as Markdown (block).
*
* @param {string} s - text
* @returns {string} HTML
*/
export function markdown( s ) {
	return md.render( s || '' );
}

/**
* Renders JSDoc description text as inline Markdown.
*
* @param {string} s - text
* @returns {string} HTML
*/
export function inline( s ) {
	return md.renderInline( ( s || '' ).replace( /\s*\n\s*/g, ' ' ) );
}

const KEYWORDS = new Set( 'import from export default const let var new return function if else for while of in true false null undefined typeof instanceof throw'.split( ' ' ) );

/**
* Minimal build-time JavaScript highlighter (no runtime dependency).
*
* @param {string} code - source
* @returns {string} HTML
*/
export function highlight( code ) {
	const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|([A-Za-z_$][\w$]*)|([\s\S])/g;
	let out = '';
	let m;
	while ( ( m = re.exec( code ) ) !== null ) {
		if ( m[ 1 ] ) {
			out += '<span class="tk-c">' + esc( m[ 1 ] ) + '</span>';
		} else if ( m[ 2 ] ) {
			out += '<span class="tk-s">' + esc( m[ 2 ] ) + '</span>';
		} else if ( m[ 3 ] ) {
			out += '<span class="tk-n">' + esc( m[ 3 ] ) + '</span>';
		} else if ( m[ 4 ] ) {
			out += KEYWORDS.has( m[ 4 ] ) ? '<span class="tk-k">' + m[ 4 ] + '</span>' : ( /^[A-Z][a-z]\w*Array$|^Complex128$/.test( m[ 4 ] ) ? '<span class="tk-t">' + m[ 4 ] + '</span>' : m[ 4 ] );
		} else {
			out += esc( m[ 5 ] );
		}
	}
	return out;
}

export function codeBlock( code, lang = 'js' ) {
	const body = ( lang === 'js' ) ? highlight( code ) : esc( code );
	return '<div class="code"><button class="copy" type="button" aria-label="Copy code">Copy</button><pre><code class="lang-' + lang + '">' + body + '</code></pre></div>';
}

/**
* Groups a signature's parameters for display. Each array operand absorbs its
* leading dimension, strides and offset; consecutive scalars with the same role
* share a group.
*
* @param {Array<Object>} params - signature params
* @returns {Array<Array<Object>>} groups
*/
export function groupParams( params ) {
	const groups = [];
	let cur = null;
	for ( const p of params ) {
		if ( p.operand && cur && cur[ 0 ].name === p.operand ) {
			cur.push( p );
			continue;
		}
		const isArray = ARRAY_ROLES.has( p.role ) || /Array/.test( p.type || '' );
		if ( !isArray && cur && !cur.isArray && cur[ 0 ].role === p.role && !p.operand && p.role !== 'layout' ) {
			cur.push( p );
			continue;
		}
		cur = [ p ];
		cur.isArray = isArray;
		groups.push( cur );
	}
	return groups;
}

export function returnLabel( sig ) {
	if ( !sig.returns ) {
		return 'void';
	}
	return ( sig.returns.name ? sig.returns.name + ': ' : '' ) + ( sig.returns.type || 'unknown' );
}

/**
* Renders a call signature. Short signatures stay on one line; long ones put
* one operand group per line.
*
* @param {Object} sig - signature IR
* @param {string} anchorPrefix - prefix for parameter anchors
* @returns {string} HTML
*/
export function signatureHTML( sig, anchorPrefix ) {
	const groups = groupParams( sig.params );
	const flat = sig.call + '( ' + sig.params.map( ( p ) => p.name ).join( ', ' ) + ' )';
	const tok = ( p ) => '<a class="sig-p role-' + esc( p.aux || p.role || 'other' ) + '" href="#' + anchorPrefix + esc( p.name ) + '" title="' + esc( ( p.type || '' ) + ( p.intent ? ' · ' + p.intent : '' ) ) + '">' + esc( p.name ) + '</a>';
	const ret = '<span class="sig-ret"> → ' + esc( returnLabel( sig ) ) + '</span>';
	const name = '<span class="sig-name">' + esc( sig.call ) + '</span>';
	if ( flat.length <= 76 ) {
		return '<pre class="sig">' + name + '( ' + sig.params.map( tok ).join( ', ' ) + ' )' + ret + '</pre>';
	}
	const lines = groups.map( ( g, i ) => '    ' + g.map( tok ).join( ', ' ) + ( i < groups.length - 1 ? ',' : '' ) );
	return '<pre class="sig">' + name + '(\n' + lines.join( '\n' ) + '\n)' + ret + '</pre>';
}

/**
* Plain-text signature (for Markdown/agents), grouped the same way.
*
* @param {Object} sig - signature IR
* @returns {string} text
*/
export function signatureText( sig ) {
	const groups = groupParams( sig.params );
	const flat = sig.call + '( ' + sig.params.map( ( p ) => p.name ).join( ', ' ) + ' )';
	if ( flat.length <= 76 ) {
		return flat + ' → ' + returnLabel( sig );
	}
	return sig.call + '(\n' + groups.map( ( g, i ) => '    ' + g.map( ( p ) => p.name ).join( ', ' ) + ( i < groups.length - 1 ? ',' : '' ) ).join( '\n' ) + '\n) → ' + returnLabel( sig );
}

export function intentLabel( intent ) {
	return { 'in': 'in', 'out': 'out', 'inout': 'in/out' }[ intent ] || '';
}

/**
* Renders the full HTML page shell.
*
* @param {Object} o - options
* @param {string} o.root - relative path to the site root ('' or '../../')
* @param {string} o.title - page title
* @param {string} o.description - meta description
* @param {string} o.body - main content HTML
* @param {string} [o.sidebar] - left sidebar HTML
* @param {string} [o.toc] - right "on this page" HTML
* @param {Array<Object>} [o.alternates] - `{ type, href }` alternate representations
* @param {Object} o.site - site metadata
* @param {string} [o.section] - active top-nav key
* @returns {string} HTML document
*/
export function page( o ) {
	const r = o.root;
	const nav = Object.keys( PACKAGES ).map( ( k ) => '<a class="topnav-link' + ( o.section === k ? ' active' : '' ) + '" href="' + r + 'reference/' + k + '/index.html">' + PACKAGES[ k ].title + '</a>' ).join( '' );
	const alts = ( o.alternates || [] ).map( ( a ) => '<link rel="alternate" type="' + a.type + '" href="' + esc( a.href ) + '">' ).join( '\n' );
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ esc( o.title ) }</title>
<meta name="description" content="${ esc( o.description ) }">
<meta name="generator" content="bin/docs (generated from JSDoc and spec/*.json; do not edit)">
${ alts }
<link rel="stylesheet" href="${ r }assets/site.css">
<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
</head>
<body data-root="${ r }">
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
	<div class="topbar-inner">
		<a class="brand" href="${ r }index.html"><span class="brand-mark" aria-hidden="true">λ</span>${ esc( o.site.shortName ) }</a>
		<nav class="topnav" aria-label="Packages">${ nav }</nav>
		<div class="search" role="search">
			<input id="search" type="search" placeholder="Search routines…" autocomplete="off" spellcheck="false" aria-label="Search routines">
			<kbd class="search-kbd">/</kbd>
			<ul id="search-results" class="search-results" role="listbox" hidden></ul>
		</div>
		<a class="topnav-icon" href="${ esc( o.site.repo ) }" aria-label="Source on GitHub" title="Source on GitHub"><svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a>
		<button id="theme" class="topnav-icon" type="button" aria-label="Toggle dark mode" title="Toggle dark mode"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1"/></svg></button>
	</div>
</header>
<div class="layout${ o.sidebar ? '' : ' no-sidebar' }${ o.toc ? '' : ' no-toc' }">
	${ o.sidebar ? '<nav class="sidebar" aria-label="Section">' + o.sidebar + '</nav>' : '' }
	<main id="main" class="content">
${ o.body }
	</main>
	${ o.toc ? '<aside class="toc" aria-label="On this page"><div class="toc-title">On this page</div>' + o.toc + '</aside>' : '' }
</div>
<footer class="footer">
	<div>Generated from source by <code>bin/docs</code> · ${ esc( o.site.name ) } ${ esc( o.site.version ) } · ${ esc( o.site.license ) } license</div>
</footer>
<script src="${ r }assets/site.js" defer></script>
</body>
</html>
`;
}
