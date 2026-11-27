/**
* Renders one routine's reference page (HTML) and its Markdown twin.
*
* @module bin/docs/render/routine
*/

import { esc, inline, markdown, markdownMath, codeBlock, signatureHTML, signatureText, groupParams, intentLabel, returnLabel, page } from './common.js';
import { PACKAGES } from '../taxonomy.js';

const SIG_TITLES = {
	'layout': 'Layout API',
	'ndarray': 'Strided (ndarray) API'
};
const SIG_BLURBS = {
	'layout': 'Takes a storage layout (`order`) and leading dimensions, like CBLAS/LAPACKE.',
	'ndarray': 'Takes explicit strides and offsets for every array. Use it for views, sub-matrices and non-unit strides.'
};
const RETURN_KINDS = {
	'info': 'An `info` status code: `0` on success. A positive value reports a numerical condition such as a singular pivot or a failure to converge (see the description).',
	'value': 'The computed value.',
	'array': 'The output array (also modified in place).',
	'none': 'Nothing; results are written to the output arguments.'
};

function link( root, r ) {
	return root + 'reference/' + r.package + '/' + r.name + '.html';
}

function routineLinks( names, byName, root ) {
	return names.map( ( n ) => {
		const r = byName.get( n );
		return r ? '<a class="chip-link" href="' + link( root, r ) + '" title="' + esc( r.summary ) + '"><code>' + esc( n ) + '</code></a>' : '<code>' + esc( n ) + '</code>';
	}).join( ' ' );
}

function paramRow( p, prefix ) {
	const sub = !!p.operand;
	const meta = [];
	const extras = [];
	if ( p.shape && p.shape.length <= 18 ) {
		meta.push( '<span class="p-shape" title="logical shape (from spec)">' + esc( p.shape ) + '</span>' );
	} else if ( p.shape ) {
		extras.push( '<div class="p-constraint"><span class="p-label">shape</span> <code>' + esc( p.shape ) + '</code></div>' );
	}
	if ( p.format ) {
		meta.push( '<span class="p-shape">' + esc( p.format ) + ' storage</span>' );
	}
	if ( p.values ) {
		extras.push( '<div class="p-values"><span class="p-label">One of</span> ' + p.values.map( ( v ) => '<code class="val">\'' + esc( v ) + '\'</code>' ).join( ' ' ) + '</div>' );
	}
	for ( const c of p.constraints ) {
		extras.push( '<div class="p-constraint"><span class="p-label">' + esc( c.label ) + '</span> <code>' + esc( c.text ) + '</code></div>' );
	}
	return '<tr id="' + prefix + esc( p.name ) + '" class="' + ( sub ? 'p-sub' : 'p-main' ) + '">' +
		'<td class="p-name"><a class="anchor" href="#' + prefix + esc( p.name ) + '"><code>' + esc( p.name ) + '</code></a>' + ( meta.length ? '<div class="p-meta">' + meta.join( '' ) + '</div>' : '' ) + '</td>' +
		'<td class="p-type"><code>' + esc( p.type || '—' ) + '</code></td>' +
		'<td class="p-intent">' + ( p.intent && !sub ? '<span class="intent intent-' + esc( p.intent ) + '">' + intentLabel( p.intent ) + '</span>' : '' ) + '</td>' +
		'<td class="p-desc">' + inline( p.description ) + extras.join( '' ) + '</td>' +
		'</tr>';
}

function norm( s ) {
	return ( s || '' ).replace( /\s+/g, ' ' ).trim();
}

function signatureSection( sig, routineDescription ) {
	const id = 'sig-' + sig.kind;
	const prefix = sig.kind === 'ndarray' ? 'nd-' : 'p-';
	const rows = groupParams( sig.params ).map( ( g ) => '<tbody class="p-group">' + g.map( ( p ) => paramRow( p, prefix ) ).join( '' ) + '</tbody>' ).join( '' );
	let html = '<section class="signature" id="' + id + '">';
	html += '<h2><a class="anchor" href="#' + id + '">' + SIG_TITLES[ sig.kind ] + '</a></h2>';
	html += '<p class="sig-blurb">' + inline( SIG_BLURBS[ sig.kind ] ) + '</p>';
	html += signatureHTML( sig, prefix );
	if ( sig.description && norm( sig.description ) !== norm( routineDescription ) ) {
		html += '<div class="sig-desc">' + markdown( sig.description ) + '</div>';
	}
	html += '<h3>Parameters</h3>';
	html += '<div class="table-wrap"><table class="params"><thead><tr><th>Name</th><th>Type</th><th>Intent</th><th>Description</th></tr></thead>' + rows + '</table></div>';
	html += '<h3>Returns</h3>';
	html += sig.returns ? '<dl class="returns"><dt><code>' + esc( returnLabel( sig ) ) + '</code></dt><dd>' + inline( sig.returns.description ) + '</dd></dl>' : '<p class="muted">Nothing documented.</p>';
	if ( sig.throws.length ) {
		html += '<h3>Throws</h3><ul class="throws">' + sig.throws.map( ( t ) => '<li><code class="exc">' + esc( t.type ) + '</code> ' + inline( t.description ) + '</li>' ).join( '' ) + '</ul>';
	}
	html += '<p class="source-link"><a href="{{repo}}/blob/main/' + esc( sig.file ) + '">' + esc( sig.file ) + '</a></p>';
	html += '</section>';
	return html;
}

/**
* Renders the routine page.
*
* @param {Object} r - routine IR
* @param {Object} ctx - `{ site, byName, sidebar }`
* @returns {string} HTML
*/
export function routineHTML( r, ctx ) {
	const root = '../../';
	const pkg = PACKAGES[ r.package ];
	const groupHref = root + 'reference/' + r.package + '/index.html#' + r.group.key;
	const toc = [];
	let body = '';
	body += '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="' + root + 'index.html">Reference</a><span>›</span><a href="' + root + 'reference/' + r.package + '/index.html">' + pkg.title + '</a><span>›</span><a href="' + groupHref + '">' + esc( r.group.label ) + '</a></nav>';
	body += '<header class="routine-head"><h1><code>' + esc( r.name ) + '</code></h1>';
	body += '<div class="badges"><span class="badge badge-pkg">' + pkg.title + '</span><span class="badge badge-prec-' + esc( r.precision ) + '">' + esc( r.precision ) + '</span><span class="badge">' + esc( r.group.label ) + '</span></div></header>';
	body += '<div class="lead">' + markdown( r.description ) + '</div>';

	toc.push([ 'import', 'Import' ]);
	body += '<section id="import"><h2 class="visually-hidden">Import</h2>';
	body += r.importPath ? codeBlock( 'import ' + r.name + ' from \'' + r.importPath + '\';' ) : '<p class="muted">Not exposed in the package <code>exports</code> map. Source: <code>' + esc( r.path ) + '/lib/index.js</code>.</p>';
	body += '<div class="alt-formats"><a href="' + r.name + '.md">Markdown</a><a href="' + r.name + '.json">JSON</a><a href="{{repo}}/tree/main/' + esc( r.path ) + '">Source</a></div>';
	body += '</section>';

	r.signatures.forEach( ( s ) => {
		toc.push([ 'sig-' + s.kind, SIG_TITLES[ s.kind ] ]);
		body += signatureSection( s, r.description );
	});

	if ( r.returns && RETURN_KINDS[ r.returns.kind ] && r.returns.kind === 'info' ) {
		toc.push([ 'status', 'Status codes' ]);
		body += '<section id="status"><h2><a class="anchor" href="#status">Status codes</a></h2><p>' + inline( RETURN_KINDS.info ) + ' Invalid arguments throw instead of returning a negative <code>info</code>.</p>';
		if ( r.quickReturn.length ) {
			body += '<p>Returns immediately when ' + r.quickReturn.map( ( q ) => '<code>' + esc( q ) + '</code>' ).join( ' or ' ) + '.</p>';
		}
		body += '</section>';
	}

	if ( r.examples.length ) {
		toc.push([ 'examples', 'Examples' ]);
		body += '<section id="examples"><h2><a class="anchor" href="#examples">Examples</a></h2>' + r.examples.map( ( e ) => codeBlock( e ) ).join( '' ) + '</section>';
	}

	toc.push([ 'reference', 'Reference implementation' ]);
	body += '<section id="reference"><h2><a class="anchor" href="#reference">Reference implementation</a></h2>';
	body += r.fortran ? '<p>Translated from ' + esc( pkg.source ) + ':</p>' + codeBlock( r.fortran.signature, 'fortran' ) : '<p class="muted">No spec available.</p>';
	body += '</section>';

	if ( r.reference ) {
		toc.push([ 'reference-docs', 'Reference notes' ]);
		body += '<section id="reference-docs" class="reference-docs"><h2><a class="anchor" href="#reference-docs">Reference notes</a></h2>';
		body += markdownMath( r.reference.markdown );
		if ( r.reference.source ) {
			body += '<p class="muted">Generated by <code>bin/fortran-docs.mjs</code> from <code>' + esc( r.reference.source.replace( /^data\//, '' ) ) + '</code>.</p>';
		}
		body += '</section>';
	}

	if ( r.siblings.length || r.uses.length || r.usedBy.length ) {
		toc.push([ 'related', 'Related' ]);
		body += '<section id="related"><h2><a class="anchor" href="#related">Related</a></h2><dl class="related">';
		if ( r.siblings.length ) {
			body += '<dt>Other precisions</dt><dd>' + routineLinks( r.siblings, ctx.byName, root ) + '</dd>';
		}
		if ( r.uses.length ) {
			body += '<dt>Calls</dt><dd>' + routineLinks( r.uses, ctx.byName, root ) + '</dd>';
		}
		if ( r.usedBy.length ) {
			body += '<dt>Called by</dt><dd>' + routineLinks( r.usedBy, ctx.byName, root ) + '</dd>';
		}
		body += '</dl></section>';
	}

	const html = page({
		root,
		'title': r.name + ': ' + r.summary.replace( /`/g, '' ) + ' · ' + ctx.site.shortName,
		'description': r.summary.replace( /`/g, '' ),
		body,
		'sidebar': ctx.sidebar( r ),
		'toc': '<ul>' + toc.map( ( [ id, t ] ) => '<li><a href="#' + id + '">' + esc( t ) + '</a></li>' ).join( '' ) + '</ul>',
		'alternates': [ { 'type': 'text/markdown', 'href': r.name + '.md' }, { 'type': 'application/json', 'href': r.name + '.json' } ],
		'site': ctx.site,
		'section': r.package,
		'math': !!r.reference
	});
	return html.replace( /\{\{repo\}\}/g, ctx.site.repo );
}

function mdCell( s ) {
	return String( s == null ? '' : s ).replace( /\s*\n\s*/g, ' ' ).replace( /\|/g, '\\|' );
}

/**
* Renders the routine as compact Markdown for agents.
*
* @param {Object} r - routine IR
* @param {Object} ctx - `{ site }`
* @returns {string} Markdown
*/
export function routineMarkdown( r, ctx ) {
	const out = [];
	out.push( '# ' + r.name );
	out.push( '' );
	out.push( '> ' + r.summary.replace( /\n/g, ' ' ) );
	out.push( '' );
	out.push( '- package: ' + PACKAGES[ r.package ].title + ' · group: ' + r.group.label + ' · precision: ' + r.precision );
	if ( r.importPath ) {
		out.push( '- import: `import ' + r.name + ' from \'' + r.importPath + '\';`' );
	}
	if ( r.fortran ) {
		out.push( '- reference: `' + r.fortran.signature + '`' );
	}
	out.push( '- source: ' + ctx.site.repo + '/tree/main/' + r.path );
	out.push( '' );
	if ( r.description && r.description.trim() !== r.summary.trim() ) {
		out.push( r.description.trim() );
		out.push( '' );
	}
	for ( const s of r.signatures ) {
		out.push( '## ' + SIG_TITLES[ s.kind ] );
		out.push( '' );
		out.push( '```js' );
		out.push( signatureText( s ) );
		out.push( '```' );
		out.push( '' );
		if ( s.description && norm( s.description ) !== norm( r.description ) ) {
			out.push( s.description.trim() );
			out.push( '' );
		}
		out.push( '| param | type | intent | shape | constraints | description |' );
		out.push( '|---|---|---|---|---|---|' );
		for ( const p of s.params ) {
			const cons = ( p.values ? [ 'one of ' + p.values.map( ( v ) => '`\'' + v + '\'`' ).join( ', ' ) ] : [] ).concat( p.constraints.map( ( c ) => c.label + ' `' + c.text + '`' ) );
			out.push( '| ' + [ ( p.operand ? '↳ ' : '' ) + '`' + p.name + '`', p.type ? '`' + p.type + '`' : '', intentLabel( p.intent ), p.shape ? '`' + p.shape + '`' : '', cons.join( '; ' ), p.description ].map( mdCell ).join( ' | ' ) + ' |' );
		}
		out.push( '' );
		out.push( '**Returns** `' + returnLabel( s ) + '`' + ( s.returns && s.returns.description ? ': ' + mdCell( s.returns.description ) : '' ) );
		out.push( '' );
		if ( s.throws.length ) {
			out.push( '**Throws**' );
			out.push( '' );
			for ( const t of s.throws ) {
				out.push( '- `' + t.type + '` ' + mdCell( t.description ) );
			}
			out.push( '' );
		}
	}
	if ( r.returns && r.returns.kind === 'info' ) {
		out.push( '## Status codes' );
		out.push( '' );
		out.push( RETURN_KINDS.info + ' Invalid arguments throw instead of returning a negative `info`.' + ( r.quickReturn.length ? ' Returns immediately when ' + r.quickReturn.map( ( q ) => '`' + q + '`' ).join( ' or ' ) + '.' : '' ) );
		out.push( '' );
	}
	if ( r.examples.length ) {
		out.push( '## Examples' );
		out.push( '' );
		for ( const e of r.examples ) {
			out.push( '```js' );
			out.push( e );
			out.push( '```' );
			out.push( '' );
		}
	}
	if ( r.reference ) {
		out.push( '## Reference notes' );
		out.push( '' );
		out.push( r.reference.markdown );
		out.push( '' );
	}
	const rel = [];
	if ( r.siblings.length ) {
		rel.push( '- other precisions: ' + r.siblings.join( ', ' ) );
	}
	if ( r.uses.length ) {
		rel.push( '- calls: ' + r.uses.join( ', ' ) );
	}
	if ( r.usedBy.length ) {
		rel.push( '- called by: ' + r.usedBy.join( ', ' ) );
	}
	if ( rel.length ) {
		out.push( '## Related' );
		out.push( '' );
		out.push( ...rel );
		out.push( '' );
	}
	return out.join( '\n' );
}
