// Blahpack dev dashboard client. Vanilla JS, no build step.

const $ = ( sel, el = document ) => el.querySelector( sel );
const $$ = ( sel, el = document ) => [ ...el.querySelectorAll( sel ) ];

const state = {
	tab: 'overview',
	gates: [],
	lint: [],
	tickets: [],
	conventions: [],
	git: null,
	results: {},
	outputs: {},          // id → full output text (only for opened panels)
	open: new Set(),      // ids whose output panel is open
	readme: new Set(),    // lint rules whose README is expanded
	ticketFilter: { status: 'open', area: '', q: '' },
	ticketSel: null,
	convQ: ''
};

// ---------------------------------------------------------------------------
// API

async function get( p ) {
	const r = await fetch( p );
	return r.json();
}

async function post( p, body ) {
	const r = await fetch( p, { method: 'POST', headers: { 'content-type': 'application/json', 'x-dashboard': '1' }, body: JSON.stringify( body ) } );
	return r.json();
}

async function load( what ) {
	const jobs = [];
	if ( !what || what === 'overview' ) {
		jobs.push( get( '/api/overview' ).then( ( d ) => {
			state.git = d.git;
			state.results = d.results;
		}) );
	}
	if ( !what || what === 'gates' ) {
		jobs.push( get( '/api/gates' ).then( ( d ) => { state.gates = d; }) );
	}
	if ( !what || what === 'lint' ) {
		jobs.push( get( '/api/lint' ).then( ( d ) => { state.lint = d; }) );
	}
	if ( !what || what === 'tickets' ) {
		jobs.push( get( '/api/tickets' ).then( ( d ) => { state.tickets = d; }) );
	}
	if ( !what || what === 'conventions' ) {
		jobs.push( get( '/api/conventions' ).then( ( d ) => { state.conventions = d; }) );
	}
	await Promise.all( jobs );
}

function run( ids ) {
	ids = [].concat( ids );
	return post( '/api/run', { ids } );
}

function stop( id ) {
	return post( '/api/stop', id ? { id } : { all: true } );
}

// ---------------------------------------------------------------------------
// Helpers

function esc( s ) {
	return String( s ?? '' ).replace( /[&<>"']/g, ( c ) => ( { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ c ] ) );
}

function inline( s ) {
	// escape, then code spans, bold, italics, links, ticket refs
	const parts = String( s ).split( /(`[^`]*`)/ );
	return parts.map( ( p ) => {
		if ( p.startsWith( '`' ) && p.endsWith( '`' ) && p.length > 1 ) {
			return '<code>' + esc( p.slice( 1, -1 ) ) + '</code>';
		}
		let h = esc( p );
		h = h.replace( /\*\*(.+?)\*\*/g, '<b>$1</b>' );
		h = h.replace( /(^|[\s(])\*(?!\s)(.+?)\*(?=[\s).,;:]|$)/g, '$1<i>$2</i>' );
		h = h.replace( /\[([^\]]+)\]\(([^)]+)\)/g, ( m, t, u ) => /^https?:/.test( u ) ? `<a href="${ u }" target="_blank" rel="noopener">${ t }</a>` : `<span class="mono">${ t }</span>` );
		h = linkTickets( h );
		return h;
	}).join( '' );
}

function linkTickets( h ) {
	return h.replace( /\b(tickets?)\s+((?:\d{4}(?:\s*(?:,|\/|and|&amp;)\s*)?)+)/gi, ( m, word, ids ) =>
		word + ' ' + ids.replace( /\d{4}/g, ( id ) => `<a href="#ticket/${ id }">${ id }</a>` ) );
}

// A small markdown renderer: headings, fences, lists, tables, paragraphs.
function md( src ) {
	const lines = String( src ).split( '\n' );
	const out = [];
	let i = 0;
	while ( i < lines.length ) {
		const line = lines[ i ];
		let m;
		if ( ( m = line.match( /^```(\w*)/ ) ) ) {
			const body = [];
			i += 1;
			while ( i < lines.length && !/^```/.test( lines[ i ] ) ) {
				body.push( lines[ i ] );
				i += 1;
			}
			i += 1;
			out.push( '<pre><code>' + esc( body.join( '\n' ) ) + '</code></pre>' );
			continue;
		}
		if ( ( m = line.match( /^(#{1,4})\s+(.*)/ ) ) ) {
			out.push( `<h${ m[ 1 ].length + 1 }>${ inline( m[ 2 ] ) }</h${ m[ 1 ].length + 1 }>` );
			i += 1;
			continue;
		}
		if ( /^\|/.test( line ) ) {
			const rows = [];
			while ( i < lines.length && /^\|/.test( lines[ i ] ) ) {
				if ( !/^\|[\s\-:|]+\|\s*$/.test( lines[ i ] ) ) {
					rows.push( lines[ i ].replace( /^\||\|\s*$/g, '' ).split( /\|(?=(?:[^`]*`[^`]*`)*[^`]*$)/ ) );
				}
				i += 1;
			}
			out.push( '<table>' + rows.map( ( r, k ) => '<tr>' + r.map( ( c ) => `<${ k ? 'td' : 'th' }>${ inline( c.trim() ) }</${ k ? 'td' : 'th' }>` ).join( '' ) + '</tr>' ).join( '' ) + '</table>' );
			continue;
		}
		if ( /^\s*([-*]|\d+\.)\s+/.test( line ) ) {
			const ordered = /^\s*\d+\./.test( line );
			const items = [];
			while ( i < lines.length && ( /^\s*([-*]|\d+\.)\s+/.test( lines[ i ] ) || ( /^\s{2,}\S/.test( lines[ i ] ) && items.length ) ) ) {
				if ( /^\s*([-*]|\d+\.)\s+/.test( lines[ i ] ) ) {
					items.push( lines[ i ].replace( /^\s*([-*]|\d+\.)\s+/, '' ) );
				} else {
					items[ items.length - 1 ] += ' ' + lines[ i ].trim();
				}
				i += 1;
			}
			const tag = ordered ? 'ol' : 'ul';
			out.push( `<${ tag }>` + items.map( ( it ) => '<li>' + inline( it ) + '</li>' ).join( '' ) + `</${ tag }>` );
			continue;
		}
		if ( !line.trim() ) {
			i += 1;
			continue;
		}
		const para = [];
		while ( i < lines.length && lines[ i ].trim() && !/^(```|#{1,4}\s|\||\s*([-*]|\d+\.)\s)/.test( lines[ i ] ) ) {
			para.push( lines[ i ] );
			i += 1;
		}
		out.push( '<p>' + inline( para.join( ' ' ) ) + '</p>' );
	}
	return out.join( '\n' );
}

function ago( t ) {
	if ( !t ) {
		return '';
	}
	const s = ( Date.now() - t ) / 1000;
	if ( s < 60 ) {
		return 'just now';
	}
	if ( s < 3600 ) {
		return Math.floor( s / 60 ) + 'm ago';
	}
	if ( s < 86400 ) {
		return Math.floor( s / 3600 ) + 'h ago';
	}
	return Math.floor( s / 86400 ) + 'd ago';
}

function dur( ms ) {
	if ( ms == null ) {
		return '';
	}
	if ( ms < 1000 ) {
		return ms + 'ms';
	}
	const s = ms / 1000;
	return s < 60 ? s.toFixed( 1 ) + 's' : Math.floor( s / 60 ) + 'm' + String( Math.round( s % 60 ) ).padStart( 2, '0' ) + 's';
}

function status( id ) {
	const r = state.results[ id ];
	return r ? r.status : 'idle';
}

function allGates() {
	return state.gates.flatMap( ( g ) => g.gates );
}

function ciGates() {
	return state.gates.filter( ( g ) => g.id.startsWith( 'ci:' ) ).flatMap( ( g ) => g.gates );
}

function active( s ) {
	return s === 'running' || s === 'queued';
}

// ---------------------------------------------------------------------------
// Shared run widgets. Every element tied to a run carries data-run=<id> and
// is repainted in place by paint(id), so live output panels keep scroll.

function runMeta( id ) {
	const r = state.results[ id ];
	if ( !r ) {
		return '<span class="muted">not run</span>';
	}
	if ( r.status === 'queued' ) {
		return 'queued';
	}
	if ( r.status === 'running' ) {
		return 'running… <span class="elapsed" data-started="' + r.startedAt + '">' + dur( Date.now() - r.startedAt ) + '</span>';
	}
	return `<span class="sum">${ esc( r.summary || r.status ) }</span><br>${ dur( r.durationMs ) } · ${ ago( r.endedAt ) }`;
}

function runButton( id, runnable, why ) {
	if ( !runnable ) {
		return `<button class="btn sm" disabled title="${ esc( why || 'not runnable here' ) }">Run</button>`;
	}
	const s = status( id );
	return active( s ) ?
		`<button class="btn sm stop" data-act="stop" data-id="${ esc( id ) }">Stop</button>` :
		`<button class="btn sm" data-act="run" data-id="${ esc( id ) }">Run</button>`;
}

function gateRow( g ) {
	const s = status( g.id );
	const open = state.open.has( g.id );
	return `<div class="row" data-row="${ esc( g.id ) }">
		<div class="row-main">
			<span class="dot ${ g.runnable ? s : '' }" data-run="${ esc( g.id ) }" data-part="dot"></span>
			<div style="min-width:0">
				<div class="title">${ esc( g.title ) } ${ ( g.tickets || [] ).map( ticketPill ).join( ' ' ) }</div>
				<div class="cmd" title="${ esc( g.cmd ) }">$ ${ esc( g.cmd.split( '\n' )[ 0 ] ) }${ g.cmd.includes( '\n' ) ? ' …' : '' }</div>
				${ g.runnable ? '' : `<div class="why">CI-only: ${ esc( g.why ) }</div>` }
			</div>
			<div class="meta" data-run="${ esc( g.id ) }" data-part="meta">${ runMeta( g.id ) }</div>
			<div class="btns">
				<span data-run="${ esc( g.id ) }" data-part="btn" data-runnable="${ g.runnable ? 1 : 0 }" data-why="${ esc( g.why || '' ) }">${ runButton( g.id, g.runnable, g.why ) }</span>
				<button class="btn sm" data-act="out" data-id="${ esc( g.id ) }" ${ state.results[ g.id ] ? '' : 'disabled' } data-run="${ esc( g.id ) }" data-part="outbtn">${ open ? 'Hide' : 'Output' }</button>
			</div>
		</div>
		${ open ? termHTML( g.id ) : '' }
	</div>`;
}

function termHTML( id ) {
	return `<pre class="term" data-out="${ esc( id ) }">${ colorize( state.outputs[ id ] ?? '' ) }</pre>`;
}

function colorize( text ) {
	return esc( text ).split( '\n' ).map( ( l ) => {
		if ( /^\s*(not ok|✖|FAIL|Error|error|✗)|\bfail \d*[1-9]/.test( l ) ) {
			return '<span class="e">' + l + '</span>';
		}
		if ( /^\s*(ok |✔|PASS)/.test( l ) ) {
			return '<span class="ok">' + l + '</span>';
		}
		return l;
	}).join( '\n' );
}

function ticketPill( id ) {
	const t = state.tickets.find( ( x ) => x.id === id );
	const cls = t && t.status === 'resolved' ? '' : 'fail';
	return `<a class="pill link ${ cls }" href="#ticket/${ id }" title="${ esc( t ? t.title : '' ) }">#${ id }</a>`;
}

function paint( id ) {
	for ( const el of $$( `[data-run="${ CSS.escape( id ) }"]` ) ) {
		const s = status( id );
		switch ( el.dataset.part ) {
		case 'dot':
			el.className = 'dot ' + s;
			break;
		case 'tile':
			el.className = 'tile ' + s;
			el.title = tileTitle( id );
			break;
		case 'meta':
			el.innerHTML = runMeta( id );
			break;
		case 'btn':
			el.innerHTML = runButton( id, el.dataset.runnable === '1', el.dataset.why );
			break;
		case 'outbtn':
			el.disabled = !state.results[ id ];
			break;
		case 'line':
			el.innerHTML = lintRunLine( id, el.dataset.title );
			break;
		}
	}
}

function tileTitle( id ) {
	const g = allGates().find( ( x ) => x.id === id );
	const r = state.results[ id ];
	return ( g ? g.title : id ) + ( r ? ' — ' + ( r.summary || r.status ) : ' — not run' );
}

// ---------------------------------------------------------------------------
// Views

const views = {};

views.overview = () => {
	const ci = ciGates();
	const runnable = ci.filter( ( g ) => g.runnable );
	const counts = { pass: 0, fail: 0, active: 0, idle: 0 };
	for ( const g of runnable ) {
		const s = status( g.id );
		if ( s === 'pass' ) {
			counts.pass += 1;
		} else if ( s === 'fail' || s === 'stopped' ) {
			counts.fail += 1;
		} else if ( active( s ) ) {
			counts.active += 1;
		} else {
			counts.idle += 1;
		}
	}
	const open = state.tickets.filter( ( t ) => t.status === 'open' );
	const resolved = state.tickets.length - open.length;
	const byArea = {};
	for ( const t of open ) {
		for ( const a of t.area.split( '|' ).map( ( x ) => x.trim() ).filter( Boolean ).slice( 0, 1 ) ) {
			byArea[ a ] = ( byArea[ a ] || 0 ) + 1;
		}
	}
	const areas = Object.entries( byArea ).sort( ( a, b ) => b[ 1 ] - a[ 1 ] );
	const maxA = areas.length ? areas[ 0 ][ 1 ] : 1;
	const lintRuns = state.lint.flatMap( ( r ) => r.runs.map( ( x ) => status( x.id ) ) );
	const lintFail = lintRuns.filter( ( s ) => s === 'fail' ).length;
	const lintPass = lintRuns.filter( ( s ) => s === 'pass' ).length;
	const unbuilt = state.conventions.filter( ( c ) => /\(unbuilt\)/.test( c.enforcer ) ).length;
	const warn = state.conventions.filter( ( c ) => /\((warn|judgment)\)/i.test( c.enforcer ) ).length;
	const recent = Object.values( state.results ).filter( ( r ) => r.endedAt || active( r.status ) )
		.sort( ( a, b ) => ( b.endedAt || Infinity ) - ( a.endedAt || Infinity ) ).slice( 0, 8 );

	return `
	<div class="cards">
		<div class="card stat"><div class="k">CI gates</div>
			<div class="v">${ counts.pass }<span class="muted" style="font-size:16px"> / ${ runnable.length }</span></div>
			<div class="d"><b class="c-pass">${ counts.pass } pass</b> · <b class="c-fail">${ counts.fail } fail</b> · <b class="c-run">${ counts.active } running</b> · ${ counts.idle } not run${ ci.length > runnable.length ? ` · ${ ci.length - runnable.length } CI-only` : '' }</div></div>
		<div class="card stat"><div class="k">Open tickets</div>
			<div class="v">${ open.length }</div>
			<div class="d">${ resolved } resolved · ${ areas.length } areas</div></div>
		<div class="card stat"><div class="k">Lint rules</div>
			<div class="v">${ state.lint.length }</div>
			<div class="d">${ lintPass } runs pass · <b class="c-fail">${ lintFail } fail</b> · enforce ${ new Set( state.lint.flatMap( ( r ) => r.enforces ) ).size } conventions</div></div>
		<div class="card stat"><div class="k">Conventions</div>
			<div class="v">${ state.conventions.length }</div>
			<div class="d"><b class="c-fail">${ unbuilt } unbuilt</b> enforcers · ${ warn } warn/judgment</div></div>
	</div>

	<h2>Gate board <span class="muted small">— one tile per CI step; click to run</span></h2>
	<div class="card" style="padding:12px 14px">
		<div class="board">
		${ state.gates.map( ( grp ) => `
			<div class="board-row">
				<div class="name"><a href="#gates/${ esc( grp.id ) }">${ esc( grp.title ) }</a></div>
				<div class="tiles">${ grp.gates.map( ( g ) => g.runnable ?
		`<div class="tile ${ status( g.id ) }" data-run="${ esc( g.id ) }" data-part="tile" data-act="tile" data-id="${ esc( g.id ) }" title="${ esc( tileTitle( g.id ) ) }"></div>` :
		`<div class="tile disabled" title="${ esc( g.title + ' — CI-only: ' + g.why ) }"></div>` ).join( '' ) }</div>
			</div>` ).join( '' ) }
		</div>
	</div>

	<div class="split" style="margin-top:4px">
		<div>
			<h2>Recent runs</h2>
			<div class="card">${ recent.length ? recent.map( ( r ) => `
				<div class="row"><div class="row-main" style="grid-template-columns:14px minmax(0,1fr) auto">
					<span class="dot ${ r.status }"></span>
					<div style="min-width:0"><div class="title">${ esc( labelFor( r.id ) ) }</div><div class="cmd">${ esc( r.summary || r.status ) }</div></div>
					<div class="meta">${ dur( r.durationMs ) }<br>${ ago( r.endedAt ) }</div>
				</div></div>` ).join( '' ) : '<div class="empty">Nothing run yet. Click a tile or “Run all gates”.</div>' }</div>
		</div>
		<div>
			<h2>Open tickets by area</h2>
			<div class="card" style="padding:12px 14px"><div class="bars">
			${ areas.map( ( [ a, n ] ) => `<div class="bar" data-act="area" data-area="${ esc( a ) }"><span>${ esc( a ) }</span><div class="track"><div class="fill" style="width:${ ( 100 * n / maxA ).toFixed( 1 ) }%"></div></div><span class="muted">${ n }</span></div>` ).join( '' ) }
			</div></div>
		</div>
	</div>`;
};

function labelFor( id ) {
	const g = allGates().find( ( x ) => x.id === id );
	if ( g ) {
		return g.title;
	}
	const m = id.match( /^lint:(.+):(fixtures|corpus)$/ );
	return m ? `${ m[ 1 ] } (${ m[ 2 ] })` : id;
}

views.gates = ( sub ) => state.gates.map( ( grp ) => {
	const runnable = grp.gates.filter( ( g ) => g.runnable ).map( ( g ) => g.id );
	return `<div class="card group" id="grp-${ esc( grp.id ) }">
		<div class="group-h">
			<div class="grow">
				<div class="t">${ esc( grp.title ) } <span class="tag">${ esc( grp.source ) }</span> ${ grp.tickets.map( ticketPill ).join( ' ' ) }</div>
				${ grp.description ? `<div class="desc">${ inline( grp.description ) }</div>` : '' }
			</div>
			${ runnable.length > 1 ? `<button class="btn sm" data-act="run-many" data-ids="${ esc( runnable.join( ' ' ) ) }">Run all ${ runnable.length }</button>` : '' }
		</div>
		${ grp.gates.map( gateRow ).join( '' ) || '<div class="empty">No steps.</div>' }
	</div>`;
}).join( '' );

function lintRunLine( id, title ) {
	const r = state.results[ id ];
	const s = status( id );
	return `<span class="dot ${ s }"></span><span>${ esc( title ) }</span>
		<span class="sum" title="${ esc( r ? r.summary : '' ) }">${ r ? esc( active( s ) ? s + '…' : r.summary || s ) : '' }</span>
		${ runButton( id, true ) }
		<button class="btn sm" data-act="out" data-id="${ esc( id ) }" ${ r ? '' : 'disabled' }>${ state.open.has( id ) ? 'Hide' : 'Log' }</button>`;
}

views.lint = () => {
	const all = state.lint.flatMap( ( r ) => r.runs.map( ( x ) => x.id ) );
	return `
	<div class="filters">
		<span class="muted small">Rules in <code>lint/rules/</code>; each has fixture tests and a whole-corpus run (<code>lint/verify-corpus.cjs --rule</code>).</span>
		<span style="flex:1"></span>
		<button class="btn sm" data-act="run-many" data-ids="${ esc( state.lint.map( ( r ) => r.runs[ 0 ].id ).join( ' ' ) ) }">Run all fixtures</button>
		<button class="btn sm" data-act="run-many" data-ids="${ esc( state.lint.map( ( r ) => r.runs[ 1 ].id ).join( ' ' ) ) }">Run all corpus</button>
	</div>
	<div class="card">
	${ state.lint.map( ( r ) => `
		<div class="row rule">
			<div class="row-main">
				<div style="min-width:0">
					<div class="rule-name" data-act="readme" data-name="${ esc( r.name ) }">${ state.readme.has( r.name ) ? '▾' : '▸' } ${ esc( r.name ) }</div>
					<div class="rule-sum">${ inline( r.summary.replace( /^\*\*|\*\*$/g, '' ) ) }</div>
					<div class="chips">
						${ r.enforces.map( ( c ) => `<a class="pill link" href="#conventions/${ c }">${ c }</a>` ).join( '' ) }
						<span class="pill" title="fixture files">fixtures ${ r.fixtures.pass }✓ ${ r.fixtures.fail }✗</span>
						${ r.autofix ? '<span class="pill">autofix</span>' : '' }
						${ r.tickets.map( ticketPill ).join( '' ) }
					</div>
				</div>
				<div class="runbox">
					${ r.runs.map( ( x ) => `<div class="runline" data-run="${ esc( x.id ) }" data-part="line" data-title="${ esc( x.title ) }">${ lintRunLine( x.id, x.title ) }</div>` ).join( '' ) }
				</div>
			</div>
			${ r.runs.filter( ( x ) => state.open.has( x.id ) ).map( ( x ) => termHTML( x.id ) ).join( '' ) }
			${ state.readme.has( r.name ) ? `<div class="md">${ md( r.readme.replace( /^#.*\n/, '' ) ) }</div>` : '' }
		</div>` ).join( '' ) }
	</div>`;
};

views.tickets = ( sub ) => {
	if ( sub ) {
		state.ticketSel = sub;
		const t0 = state.tickets.find( ( t ) => t.id === sub );
		if ( t0 && state.ticketFilter.status !== 'all' && t0.status !== state.ticketFilter.status ) {
			state.ticketFilter.status = 'all';
		}
	}
	const f = state.ticketFilter;
	const areas = [ ...new Set( state.tickets.flatMap( ( t ) => t.area.split( '|' ).map( ( x ) => x.trim() ) ).filter( ( a ) => a && a !== '...' ) ) ].sort();
	const q = f.q.toLowerCase();
	const list = state.tickets.filter( ( t ) =>
		( f.status === 'all' || t.status === f.status ) &&
		( !f.area || t.area.split( '|' ).map( ( x ) => x.trim() ).includes( f.area ) ) &&
		( !q || ( t.id + ' ' + t.title + ' ' + t.body ).toLowerCase().includes( q ) )
	).sort( ( a, b ) => b.id.localeCompare( a.id ) );
	const sel = state.tickets.find( ( t ) => t.id === state.ticketSel ) || list[ 0 ];
	const n = ( s ) => state.tickets.filter( ( t ) => s === 'all' || t.status === s ).length;
	return `
	<div class="filters">
		<div class="seg">${ [ 'open', 'resolved', 'all' ].map( ( s ) => `<button class="${ f.status === s ? 'on' : '' }" data-act="tstatus" data-v="${ s }">${ s } ${ n( s ) }</button>` ).join( '' ) }</div>
		<select data-act="tarea"><option value="">all areas</option>${ areas.map( ( a ) => `<option ${ a === f.area ? 'selected' : '' }>${ esc( a ) }</option>` ).join( '' ) }</select>
		<input type="search" placeholder="Search tickets…" value="${ esc( f.q ) }" data-act="tq">
		<span class="muted small">${ list.length } shown</span>
	</div>
	<div class="split">
		<div class="card tlist" id="tlist">${ list.map( ( t ) => `
			<div class="titem ${ t.status } ${ sel && sel.id === t.id ? 'sel' : '' }" data-act="tsel" data-id="${ t.id }">
				<div class="id">${ t.id }</div>
				<div><div class="tt">${ inline( t.title ) }</div>
				<div class="sub"><span class="pill">${ esc( t.area ) }</span><span class="muted small">${ esc( t.status === 'resolved' ? 'resolved ' + t.resolved : 'opened ' + t.opened ) }</span></div></div>
			</div>` ).join( '' ) || '<div class="empty">No tickets match.</div>' }</div>
		<div class="card tdetail">${ sel ? `
			<div class="hd">
				<h3><span class="muted mono">${ sel.id }</span> ${ inline( sel.title ) }</h3>
				<div class="chips">
					<span class="pill ${ sel.status === 'open' ? 'fail' : 'pass' }">${ sel.status }</span>
					<span class="pill">${ esc( sel.area ) }</span>
					<span class="muted small">opened ${ esc( sel.opened ) }${ sel.resolved ? ' · resolved ' + esc( sel.resolved ) : '' } · <code>${ esc( sel.file ) }</code></span>
				</div>
				${ referencedBy( sel.id ) }
			</div>
			<div class="md">${ md( sel.body ) }</div>` : '<div class="empty">Select a ticket.</div>' }</div>
	</div>`;
};

function referencedBy( id ) {
	const gates = state.gates.filter( ( g ) => g.tickets.includes( id ) ).map( ( g ) => `<a href="#gates/${ esc( g.id ) }">${ esc( g.title ) }</a>` );
	const tix = state.tickets.filter( ( t ) => t.refs.includes( id ) ).map( ( t ) => `<a href="#ticket/${ t.id }">${ t.id }</a>` );
	const rules = state.lint.filter( ( r ) => r.tickets.includes( id ) ).map( ( r ) => `<a href="#lint">${ esc( r.name ) }</a>` );
	const all = [ ...gates, ...rules, ...tix ];
	return all.length ? `<div class="small muted" style="margin-top:6px">Referenced by: ${ all.join( ', ' ) }</div>` : '';
}

views.conventions = ( sub ) => {
	const q = state.convQ.toLowerCase();
	const rows = state.conventions.filter( ( c ) => !q || ( c.id + ' ' + c.rule + ' ' + c.enforcer ).toLowerCase().includes( q ) );
	let sec = null;
	const html = [];
	for ( const c of rows ) {
		if ( c.section !== sec ) {
			sec = c.section;
			html.push( `<tr class="sec"><td colspan="3">${ esc( sec ) }</td></tr>` );
		}
		html.push( `<tr id="conv-${ c.id }"${ sub === c.id ? ' style="outline:2px solid var(--accent)"' : '' }>
			<td class="id">${ c.id }</td>
			<td>${ inline( c.rule ) }${ c.why ? `<div class="muted small" style="margin-top:3px">${ inline( c.why ) }</div>` : '' }</td>
			<td class="enf">${ enforcer( c.enforcer ) }</td></tr>` );
	}
	return `
	<div class="filters">
		<input type="search" placeholder="Filter conventions (ID, text, enforcer)…" value="${ esc( state.convQ ) }" data-act="cq">
		<span class="muted small">${ rows.length } of ${ state.conventions.length } · from <code>CONVENTIONS.md</code></span>
	</div>
	<div class="card"><table class="conv">${ html.join( '' ) }</table></div>`;
};

function enforcer( s ) {
	let h = inline( s );
	h = h.replace( /<code>lint:([\w-]+)<\/code>/g, ( m, r ) => state.lint.some( ( x ) => x.name === r ) ? `<a href="#lint"><code>lint:${ r }</code></a>` : m );
	h = h.replace( /\((unbuilt|warn|dup)\)/g, '<span class="flag $1">$1</span>' );
	return h;
}

// ---------------------------------------------------------------------------
// Rendering & routing

function route() {
	const h = location.hash.replace( /^#/, '' ) || 'overview';
	let [ tab, ...rest ] = h.split( '/' );
	let sub = rest.join( '/' );
	if ( tab === 'ticket' ) {
		tab = 'tickets';
	}
	if ( !views[ tab ] ) {
		tab = 'overview';
	}
	state.tab = tab;
	render( sub );
	if ( sub ) {
		const el = document.getElementById( ( tab === 'gates' ? 'grp-' : tab === 'conventions' ? 'conv-' : '' ) + sub );
		if ( el ) {
			el.scrollIntoView( { block: 'start' } );
			window.scrollBy( 0, -100 );
		}
		const s = $( '.titem.sel' );
		if ( s ) {
			s.scrollIntoView( { block: 'nearest' } );
		}
	}
}

function render( sub ) {
	for ( const a of $$( '#tabs a' ) ) {
		a.classList.toggle( 'active', a.dataset.tab === state.tab );
	}
	const main = $( '#main' );
	const focus = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.act : null;
	const caret = focus && document.activeElement.selectionStart;
	const scrolls = $$( 'pre.term', main ).map( ( p ) => [ p.dataset.out, p.scrollTop, p.scrollTop + p.clientHeight >= p.scrollHeight - 4 ] );
	const tl = $( '#tlist' );
	const tlScroll = tl ? tl.scrollTop : 0;
	main.innerHTML = views[ state.tab ]( sub );
	for ( const [ id, top, bottom ] of scrolls ) {
		const p = $( `pre.term[data-out="${ CSS.escape( id ) }"]` );
		if ( p ) {
			p.scrollTop = bottom ? p.scrollHeight : top;
		}
	}
	const tl2 = $( '#tlist' );
	if ( tl2 ) {
		tl2.scrollTop = tlScroll;
	}
	if ( focus ) {
		const el = $( `[data-act="${ focus }"]`, main );
		if ( el && el.tagName === 'INPUT' ) {
			el.focus();
			el.setSelectionRange( caret, caret );
		}
	}
	renderHeader();
}

function renderHeader() {
	const g = state.git;
	if ( g ) {
		const ab = ( g.aheadBehind || '' ).split( /\s+/ );
		$( '#git' ).innerHTML = `on <b>${ esc( g.branch ) }</b> · ${ esc( g.head ) } · <b>${ g.dirty }</b> changed file${ g.dirty === 1 ? '' : 's' }${ ab.length === 2 ? ` · ${ ab[ 1 ] } ahead / ${ ab[ 0 ] } behind origin/main` : '' }`;
	}
	$( '#n-gates' ).textContent = ciGates().length || '';
	$( '#n-lint' ).textContent = state.lint.length || '';
	$( '#n-tickets' ).textContent = state.tickets.filter( ( t ) => t.status === 'open' ).length || '';
	$( '#n-conv' ).textContent = state.conventions.length || '';
	const running = Object.values( state.results ).filter( ( r ) => active( r.status ) );
	$( '#activity' ).textContent = running.length ? running.length + ' running' : '';
	$( '#stop-all' ).hidden = !running.length;
}

async function toggleOutput( id ) {
	if ( state.open.has( id ) ) {
		state.open.delete( id );
		render();
		return;
	}
	state.open.add( id );
	render();
	if ( state.outputs[ id ] != null ) {
		// Tracked from the start of this run (live chunks already appended).
		return;
	}
	const d = await get( '/api/output?id=' + encodeURIComponent( id ) );
	state.outputs[ id ] = d.output;
	const p = $( `pre.term[data-out="${ CSS.escape( id ) }"]` );
	if ( p ) {
		p.innerHTML = colorize( d.output || ( active( status( id ) ) ? '' : '(no output)' ) );
		p.scrollTop = p.scrollHeight;
	}
}

// ---------------------------------------------------------------------------
// Events

document.addEventListener( 'click', async ( e ) => {
	const el = e.target.closest( '[data-act]' );
	if ( !el ) {
		return;
	}
	const act = el.dataset.act;
	const id = el.dataset.id;
	if ( act === 'run' ) {
		state.outputs[ id ] = '';
		await run( id );
		if ( !state.open.has( id ) ) {
			toggleOutput( id );
		}
	} else if ( act === 'stop' ) {
		stop( id );
	} else if ( act === 'run-many' ) {
		for ( const x of el.dataset.ids.split( ' ' ) ) {
			state.outputs[ x ] = '';
		}
		run( el.dataset.ids.split( ' ' ) );
	} else if ( act === 'tile' ) {
		if ( !active( status( id ) ) ) {
			state.outputs[ id ] = '';
			run( id );
		}
	} else if ( act === 'out' ) {
		toggleOutput( id );
	} else if ( act === 'readme' ) {
		const n = el.dataset.name;
		state.readme.has( n ) ? state.readme.delete( n ) : state.readme.add( n );
		render();
	} else if ( act === 'tstatus' ) {
		state.ticketFilter.status = el.dataset.v;
		render();
	} else if ( act === 'tsel' ) {
		state.ticketSel = id;
		history.replaceState( null, '', '#ticket/' + id );
		render();
	} else if ( act === 'area' ) {
		state.ticketFilter = { status: 'open', area: el.dataset.area, q: '' };
		location.hash = '#tickets';
	}
});

document.addEventListener( 'input', ( e ) => {
	const act = e.target.dataset.act;
	if ( act === 'tq' ) {
		state.ticketFilter.q = e.target.value;
		render();
	} else if ( act === 'cq' ) {
		state.convQ = e.target.value;
		render();
	} else if ( act === 'tarea' ) {
		state.ticketFilter.area = e.target.value;
		render();
	}
});

$( '#run-all' ).addEventListener( 'click', () => {
	const ids = ciGates().filter( ( g ) => g.runnable ).map( ( g ) => g.id );
	for ( const x of ids ) {
		state.outputs[ x ] = '';
	}
	run( ids );
});
$( '#stop-all' ).addEventListener( 'click', () => stop() );

window.addEventListener( 'hashchange', route );

// Tick running timers once a second without a re-render.
setInterval( () => {
	for ( const el of $$( '.elapsed' ) ) {
		el.textContent = dur( Date.now() - Number( el.dataset.started ) );
	}
}, 1000 );

function connect() {
	const es = new EventSource( '/api/events' );
	es.onopen = () => {
		$( '#live' ).classList.add( 'on' );
		load( 'overview' ).then( () => render() );
	};
	es.onerror = () => $( '#live' ).classList.remove( 'on' );
	es.addEventListener( 'run', ( e ) => {
		const r = JSON.parse( e.data );
		if ( r.status === 'idle' ) {
			delete state.results[ r.id ];
		} else {
			state.results[ r.id ] = r;
		}
		if ( state.tab === 'overview' ) {
			render();
		} else {
			paint( r.id );
			renderHeader();
		}
	});
	es.addEventListener( 'out', ( e ) => {
		const { id, chunk } = JSON.parse( e.data );
		if ( state.outputs[ id ] != null ) {
			state.outputs[ id ] += chunk;
		}
		const p = $( `pre.term[data-out="${ CSS.escape( id ) }"]` );
		if ( p ) {
			const atBottom = p.scrollTop + p.clientHeight >= p.scrollHeight - 4;
			p.insertAdjacentHTML( 'beforeend', colorize( chunk ) );
			if ( atBottom ) {
				p.scrollTop = p.scrollHeight;
			}
		}
	});
	es.addEventListener( 'changed', async ( e ) => {
		const { what } = JSON.parse( e.data );
		await load( what );
		if ( what === 'conventions' ) {
			await load( 'lint' );
		}
		render();
	});
}

await load();
route();
connect();
setInterval( () => load( 'overview' ).then( renderHeader ), 30000 );
