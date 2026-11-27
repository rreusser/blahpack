#!/usr/bin/env python
"""
Find Fortran `GO TO`s that leave a DO loop and skip code a plain `break` would run.

A forward `GO TO L` out of a loop translates to `break` only when nothing
executes between the loop's end and label `L`. When something does, `break`
silently runs it (tickets/0045; the *latrs/*latps/*latbs growth-bound bug ran
`GROW = XBND` this way). This tool lists every such site in the reference
sources, so each one can be checked against its translation and pinned by a
test that actually takes the jump.

Kinds:
  past-code    exits one loop; statements between the loop end and L are skipped
  multi-level  exits more than one loop (needs a labeled break or a flag)
  cycle-outer  L ends an enclosing loop and statements in between are skipped
               (a `continue` of the outer loop, not a `break`)

Usage:
  python bin/goto-exits.py [routine ...]          human-readable list
  python bin/goto-exits.py --json [routine ...]   machine-readable
  python bin/goto-exits.py --translated           only routines present in lib/
"""

import glob
import json
import os
import re
import sys

ROOT = os.path.join( os.path.dirname( os.path.abspath( __file__ ) ), '..' )
SOURCES = [
	( 'lapack', os.path.join( ROOT, 'data', 'lapack-3.12.0', 'SRC' ) ),
	( 'blas', os.path.join( ROOT, 'data', 'BLAS-3.12.0' ) ),
	( 'arpack', os.path.join( ROOT, 'data', 'arpack-ng-3.9.1', 'SRC' ) ),
]

RE_DO_LABEL = re.compile( r'^DO\s*(\d+)\s*,?\s*[A-Z]' )
RE_DO_BLOCK = re.compile( r'^(?:[A-Z][A-Z0-9_]*\s*:\s*)?DO(?:\s+WHILE\b|\s+[A-Z]|\s*$)' )
RE_ENDDO = re.compile( r'^END\s*DO\b' )
RE_GOTO = re.compile( r'GO\s*TO\s*(\d+)' )
RE_CGOTO = re.compile( r'GO\s*TO\s*\(([\d,\s]+)\)' )
RE_IF_THEN = re.compile( r'^(?:ELSE\s*)?IF\s*\(.*\)\s*THEN$' )
RE_ELSE = re.compile( r'^ELSE(\s*IF\b.*THEN)?$' )
RE_ENDIF = re.compile( r'^END\s*IF$' )
RE_JUMP = re.compile( r'^(GO\s*TO\s*\d+|RETURN)$' )
RE_TRIVIAL = re.compile( r'^(CONTINUE|END\s*DO|END\s*IF)$' )


def statements( path ):
	"""Yield (lineno, label, text) for fixed-form Fortran, joining continuations."""
	out = []
	with open( path, encoding='latin-1' ) as f:
		for n, raw in enumerate( f, 1 ):
			line = raw.rstrip( '\n' )
			if not line.strip() or line[ 0 ] in 'Cc*!':
				continue
			body = line[ 6: ].split( '!' )[ 0 ] if len( line ) > 6 else ''
			if len( line ) > 5 and line[ 5 ] not in ' 0' and out:
				out[ -1 ][ 2 ] += ' ' + body.strip()
				continue
			label = line[ :5 ].strip()
			out.append( [ n, int( label ) if label.isdigit() else None, body.strip() ] )
	return [ ( n, lab, re.sub( r'\s+', ' ', t.upper() ).strip() ) for n, lab, t in out ]


def loops( stmts ):
	"""Return [(start_idx, end_idx)] for every DO loop (end = terminating stmt)."""
	res = []
	stack = []  # (start_idx, label or None)
	for i, ( _, lab, t ) in enumerate( stmts ):
		m = RE_DO_LABEL.match( t )
		if m:
			stack.append( ( i, int( m.group( 1 ) ) ) )
		elif RE_DO_BLOCK.match( t ) and not t.startswith( 'DOUBLE' ):
			stack.append( ( i, None ) )
		elif RE_ENDDO.match( t ) and stack and stack[ -1 ][ 1 ] is None:
			res.append( ( stack.pop()[ 0 ], i ) )
		if lab is not None:
			# A label can terminate several nested labeled DOs.
			while stack and stack[ -1 ][ 1 ] == lab:
				res.append( ( stack.pop()[ 0 ], i ) )
	return res


def skipped( stmts, frm, to ):
	"""
	Executable statements on the fall-through path from stmts[frm] (exclusive)
	to stmts[to] (exclusive). An ELSE/ELSE IF that closes a block the path
	started inside jumps to that block's END IF.
	"""
	got = []
	depth = 0
	i = frm + 1
	while i < to:
		t = stmts[ i ][ 2 ]
		if RE_IF_THEN.match( t ) and not t.startswith( 'ELSE' ):
			depth += 1
		elif RE_ENDIF.match( t ):
			depth -= 1
		elif RE_ELSE.match( t ) and depth == 0:
			# Leave the branch we were in: skip to the matching END IF.
			d = 0
			i += 1
			while i < to:
				u = stmts[ i ][ 2 ]
				if RE_IF_THEN.match( u ) and not u.startswith( 'ELSE' ):
					d += 1
				elif RE_ENDIF.match( u ):
					if d == 0:
						depth -= 1
						break
					d -= 1
				i += 1
			i += 1
			continue
		if not RE_TRIVIAL.match( t ) and not ( RE_ELSE.match( t ) ):
			got.append( stmts[ i ] )
			# Nothing after an unconditional transfer is on the fall-through path.
			if depth == 0 and RE_JUMP.match( t ):
				break
		i += 1
	return got


def scan( path ):
	stmts = statements( path )
	lps = loops( stmts )
	where = { lab: i for i, ( _, lab, _ ) in enumerate( stmts ) if lab is not None }
	sites = []
	for gi, ( gline, _, t ) in enumerate( stmts ):
		targets = [ int( RE_GOTO.search( t ).group( 1 ) ) ] if RE_GOTO.search( t ) else []
		m = RE_CGOTO.search( t )
		if m:
			targets = [ int( x ) for x in m.group( 1 ).split( ',' ) if x.strip() ]
		for L in targets:
			ti = where.get( L )
			if ti is None or ti <= gi:
				continue
			enclosing = sorted( [ ( s, e ) for s, e in lps if s < gi <= e ], key=lambda r: r[ 0 ], reverse=True )
			exited = [ ( s, e ) for s, e in enclosing if ti > e ]
			if not exited:
				continue
			inner = exited[ 0 ]
			remaining = [ ( s, e ) for s, e in enclosing if ti <= e ]
			if len( exited ) > 1:
				kind = 'multi-level'
				skip = skipped( stmts, inner[ 1 ], exited[ 1 ][ 1 ] )
			elif remaining and remaining[ 0 ][ 1 ] == ti:
				kind = 'cycle-outer'
				skip = skipped( stmts, inner[ 1 ], ti )
			else:
				kind = 'past-code'
				skip = skipped( stmts, inner[ 1 ], ti )
			if kind != 'multi-level' and not skip:
				continue  # a plain break/continue is exact
			sites.append({
				'line': gline,
				'label': L,
				'kind': kind,
				'loopLine': stmts[ inner[ 0 ] ][ 0 ],
				'loopEndLine': stmts[ inner[ 1 ] ][ 0 ],
				'skipped': [ '%d: %s' % ( s[ 0 ], s[ 2 ] ) for s in skip[ :4 ] ] + ( [ '... (%d more)' % ( len( skip ) - 4 ) ] if len( skip ) > 4 else [] ),
			})
	return sites


def translated():
	have = {}
	for pkg in ( 'blas', 'lapack', 'arpack' ):
		for d in glob.glob( os.path.join( ROOT, 'lib', pkg, '*' ) ):
			have[ os.path.basename( d ) ] = os.path.relpath( d, ROOT )
	return have


def main( argv ):
	as_json = '--json' in argv
	only_tr = '--translated' in argv
	names = [ a.lower() for a in argv if not a.startswith( '--' ) ]
	have = translated()
	result = {}
	for _, src in SOURCES:
		for path in sorted( glob.glob( os.path.join( src, '*.f' ) ) ):
			r = os.path.basename( path )[ :-2 ].lower()
			if names and r not in names:
				continue
			if only_tr and r not in have:
				continue
			sites = scan( path )
			if sites:
				result[ r ] = { 'source': os.path.relpath( path, ROOT ), 'module': have.get( r ), 'sites': sites }
	if as_json:
		print( json.dumps( result, indent=1 ) )
		return
	n = 0
	for r, info in result.items():
		print( '%s  (%s)%s' % ( r, info[ 'source' ], '' if info[ 'module' ] else '  [not translated]' ) )
		for s in info[ 'sites' ]:
			n += 1
			print( '  line %d: GO TO %d  %s  (loop %d-%d)' % ( s[ 'line' ], s[ 'label' ], s[ 'kind' ], s[ 'loopLine' ], s[ 'loopEndLine' ] ) )
			for k in s[ 'skipped' ]:
				print( '      skips  ' + k )
	print( '%d sites in %d routines' % ( n, len( result ) ) )


if __name__ == '__main__':
	main( sys.argv[ 1: ] )
