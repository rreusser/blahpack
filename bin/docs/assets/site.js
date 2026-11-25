/* blahpack reference: client behavior (theme, search, copy, filter, TOC highlight). No dependencies. */
( function () {
	'use strict';
	var root = document.body.getAttribute( 'data-root' ) || '';

	// Theme toggle
	var themeBtn = document.getElementById( 'theme' );
	if ( themeBtn ) {
		themeBtn.addEventListener( 'click', function () {
			var cur = document.documentElement.dataset.theme || ( matchMedia( '(prefers-color-scheme: dark)' ).matches ? 'dark' : 'light' );
			var next = cur === 'dark' ? 'light' : 'dark';
			document.documentElement.dataset.theme = next;
			try { localStorage.setItem( 'theme', next ); } catch ( e ) {}
		});
	}

	// Copy buttons
	document.addEventListener( 'click', function ( e ) {
		var btn = e.target.closest && e.target.closest( '.copy' );
		if ( !btn ) { return; }
		var code = btn.parentNode.querySelector( 'code' );
		navigator.clipboard.writeText( code.innerText ).then( function () {
			btn.textContent = 'Copied';
			setTimeout( function () { btn.textContent = 'Copy'; }, 1200 );
		});
	});

	// Search
	var input = document.getElementById( 'search' );
	var list = document.getElementById( 'search-results' );
	var index = null;
	var active = -1;
	function load() {
		if ( index ) { return Promise.resolve( index ); }
		return fetch( root + 'search-index.json' ).then( function ( r ) { return r.json(); }).then( function ( d ) { index = d; return d; });
	}
	function score( row, q ) {
		var name = row[ 0 ];
		if ( name === q ) { return 1000; }
		if ( name.indexOf( q ) === 0 ) { return 500 - name.length; }
		// Precision-agnostic: "gesv" matches dgesv and zgesv
		if ( name.slice( 1 ).indexOf( q ) === 0 ) { return 400 - name.length; }
		if ( name.indexOf( q ) > 0 ) { return 300 - name.length; }
		var s = row[ 3 ].toLowerCase();
		var words = q.split( /\s+/ );
		var hit = 0;
		for ( var i = 0; i < words.length; i++ ) {
			if ( s.indexOf( words[ i ] ) >= 0 || row[ 2 ].toLowerCase().indexOf( words[ i ] ) >= 0 ) { hit++; }
		}
		return hit === words.length ? 100 + hit - s.length / 1000 : 0;
	}
	function render( q ) {
		q = q.trim().toLowerCase();
		if ( !q ) { list.hidden = true; return; }
		load().then( function ( d ) {
			var res = d.map( function ( r ) { return [ score( r, q ), r ]; }).filter( function ( x ) { return x[ 0 ] > 0; });
			res.sort( function ( a, b ) { return b[ 0 ] - a[ 0 ]; });
			res = res.slice( 0, 30 );
			active = res.length ? 0 : -1;
			list.innerHTML = res.length ? res.map( function ( x, i ) {
				var r = x[ 1 ];
				return '<li' + ( i === 0 ? ' class="active"' : '' ) + '><a href="' + root + 'reference/' + r[ 1 ] + '/' + r[ 0 ] + '.html"><span class="sr-name">' + r[ 0 ] + '</span><span class="sr-sum">' + r[ 3 ].replace( /</g, '&lt;' ) + '</span><span class="sr-grp">' + r[ 1 ].toUpperCase() + ' · ' + r[ 2 ] + '</span></a></li>';
			}).join( '' ) : '<li class="sr-empty">No routines match “' + q.replace( /</g, '&lt;' ) + '”</li>';
			list.hidden = false;
		});
	}
	function move( d ) {
		var items = list.querySelectorAll( 'li:not(.sr-empty)' );
		if ( !items.length ) { return; }
		if ( active >= 0 ) { items[ active ].classList.remove( 'active' ); }
		active = ( active + d + items.length ) % items.length;
		items[ active ].classList.add( 'active' );
		items[ active ].scrollIntoView({ block: 'nearest' });
	}
	if ( input ) {
		input.addEventListener( 'input', function () { render( input.value ); });
		input.addEventListener( 'focus', function () { load(); if ( input.value ) { render( input.value ); } });
		input.addEventListener( 'keydown', function ( e ) {
			if ( e.key === 'ArrowDown' ) { move( 1 ); e.preventDefault(); }
			else if ( e.key === 'ArrowUp' ) { move( -1 ); e.preventDefault(); }
			else if ( e.key === 'Enter' ) {
				var a = list.querySelector( 'li.active a' );
				if ( a ) { location.href = a.href; }
			} else if ( e.key === 'Escape' ) { list.hidden = true; input.blur(); }
		});
		document.addEventListener( 'keydown', function ( e ) {
			if ( e.key === '/' && document.activeElement.tagName !== 'INPUT' ) { e.preventDefault(); input.focus(); input.select(); }
		});
		document.addEventListener( 'click', function ( e ) {
			if ( !e.target.closest( '.search' ) ) { list.hidden = true; }
		});
	}

	// Filter on package pages
	var filter = document.getElementById( 'filter' );
	if ( filter ) {
		filter.addEventListener( 'input', function () {
			var q = filter.value.trim().toLowerCase();
			document.querySelectorAll( 'section.group' ).forEach( function ( sec ) {
				var shown = 0;
				sec.querySelectorAll( 'tbody tr' ).forEach( function ( tr ) {
					var ok = !q || tr.textContent.toLowerCase().indexOf( q ) >= 0;
					tr.hidden = !ok;
					if ( ok ) { shown++; }
				});
				sec.hidden = shown === 0;
			});
		});
	}

	// TOC: highlight the section in view
	var tocLinks = document.querySelectorAll( '.toc a' );
	if ( tocLinks.length && 'IntersectionObserver' in window ) {
		var map = {};
		tocLinks.forEach( function ( a ) { map[ a.getAttribute( 'href' ).slice( 1 ) ] = a; });
		var obs = new IntersectionObserver( function ( entries ) {
			entries.forEach( function ( en ) {
				if ( en.isIntersecting ) {
					tocLinks.forEach( function ( a ) { a.classList.remove( 'active' ); });
					if ( map[ en.target.id ] ) { map[ en.target.id ].classList.add( 'active' ); }
				}
			});
		}, { rootMargin: '-60px 0px -70% 0px' });
		Object.keys( map ).forEach( function ( id ) { var el = document.getElementById( id ); if ( el ) { obs.observe( el ); } });
	}

	// Keep the current routine visible in the sidebar
	var cur = document.querySelector( '.sb-routines a[aria-current]' );
	var sb = document.querySelector( '.sidebar' );
	if ( cur && sb ) { sb.scrollTop = cur.offsetTop - sb.clientHeight / 2; }
})();
