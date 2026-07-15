/**
* Layout-invariance driver.
*
* A routine's numerical output is defined by the mathematics, not by how its
* operands are physically stored. Re-running it under different storage layouts
* (column- vs row-major, padded leading dimensions, base offsets, non-unit and
* negative strides, packed strides) changes only addressing, never arithmetic
* order — so a correct routine must reproduce its output BIT-FOR-BIT. Any
* difference is an indexing bug.
*
* This driver is deliberately thin: a storage scheme supplies the set of free
* layouts (`scheme.layouts()`), and the test author supplies a `run` closure
* that — using a FIXED seed so operand values are identical every time —
* realizes the operands at a given layout, invokes the routine, reads the output
* back into a LogicalMatrix, and returns its flattened components. The driver
* runs every layout and asserts the outputs are all identical.
*/

import { assertAllExactEqual } from './checks.js';

/**
* @param {Array} variants - layout descriptors (e.g. scheme.layouts())
* @param {Function} run - `run( variant, index ) -> Array<number>` (flattened
*   output components; use `check.flattenLogical`)
* @param {Object} [opts] - { label }
*/
function layoutInvariant( variants, run, opts ) {
	var o = opts || {};
	var outs = [];
	var i;
	for ( i = 0; i < variants.length; i++ ) {
		outs.push( run( variants[ i ], i ) );
	}
	assertAllExactEqual( outs, o.label || 'layout invariance' );
}

export { layoutInvariant };
