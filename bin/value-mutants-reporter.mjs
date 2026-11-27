/**
* Test reporter for bin/value-mutants.mjs: prints one line per failing test,
* as soon as it fails, and nothing else. The tool kills the run's process
* group on the first line, so a mutant costs only the tests up to the first
* one that catches it (node 22's runner has no bail option).
*/

export default async function* reporter( source ) {
	for await ( const ev of source ) {
		if ( ev.type === 'test:fail' && !ev.data.todo && !ev.data.skip ) {
			yield 'FAIL ' + String( ev.data.file || '' ) + '\n';
		}
	}
}
