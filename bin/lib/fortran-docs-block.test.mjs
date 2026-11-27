/**
* Tests for bin/lib/fortran-docs-block.cjs (the README reference-documentation block).
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const B = createRequire( import.meta.url )( './fortran-docs-block.cjs' );

const README = [
	'# dfoo',
	'',
	'<section class="examples">',
	'',
	'## Examples',
	'',
	'</section>',
	'',
	'<!-- /.examples -->',
	'',
	'<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->',
	'',
	'<section class="related">',
	'',
	'</section>',
	''
].join( '\n' );

const MD = '## Reference documentation\n\n$$\nH \\begin{pmatrix} \\alpha \\\\ x \\end{pmatrix} = $& $1\n$$\n\nWhere $\\tau$ is a scalar.';

test( 'upsert inserts the block before the related section', () => {
	const out = B.upsert( README, B.wrap( MD, 'data/x.f' ) );
	assert.ok( out.indexOf( '<!-- fortran-docs:start' ) > out.indexOf( '<!-- /.examples -->' ) );
	assert.ok( out.indexOf( '<!-- fortran-docs:end -->' ) < out.indexOf( '<!-- Section for related' ) );
});

test( 'dollar signs survive insert and refresh (no String.replace `$$` collapse)', () => {
	const b = B.wrap( MD, 'data/x.f' );
	let out = B.upsert( README, b );
	for ( let i = 0; i < 3; i++ ) {
		out = B.upsert( out, b );
	}
	assert.equal( B.extract( out ), MD );
});

test( 'refresh is idempotent, and a fresh insert equals a refresh', () => {
	const b = B.wrap( MD, 'data/x.f' );
	const once = B.upsert( README, b );
	assert.equal( B.upsert( once, b ), once );
	assert.equal( B.upsert( B.upsert( once, null ), b ), once );
});

test( 'source() reads the generator source path; null when there is no block', () => {
	assert.equal( B.source( B.upsert( README, B.wrap( MD, 'data/lapack-3.12.0/SRC/x.f' ) ) ), 'data/lapack-3.12.0/SRC/x.f' );
	assert.equal( B.extract( README ), null );
	assert.equal( B.source( README ), null );
});
