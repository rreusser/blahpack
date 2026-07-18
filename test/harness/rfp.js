/**
* Rectangular Full Packed (RFP) helpers for property-based validation of the RFP
* routine family (tftri, tfsm, sfrk/hfrk, and their d/z variants).
*
* RFP packs one triangle of an N-by-N matrix (N*(N+1)/2 stored elements) into an
* opaque rectangular buffer. The RFP routines address that buffer with a SINGLE
* stride `sa` and a base offset: every internal reference is `offset + sa*(i +
* j*lda)` where the (i,j) rectangle is exactly filled, so the flattened linear
* index k = i + j*lda ranges contiguously over 0..npk-1. That makes a strided RFP
* buffer a PURE-ADDRESSING scaling of the tight buffer (offset + k*stride) — no
* arithmetic is reordered by changing stride/offset, so a correct routine is
* BIT-EXACT across every RFP layout at once (a single arithmetic-order family).
*
* Unused slots (leading/trailing pad) are NaN-poisoned by the scalar trait, so any
* out-of-bounds or unwritten read trips `assertFinite`.
*/

// MAIN //

/**
* Allocate a poisoned, opaque RFP buffer of `npk = n*(n+1)/2` slots with a
* fuzzable stride/offset. Slots are written/read by the RFP routine and the
* converters; read back linearly by index k.
*
* @param {Object} sc - scalar trait (S.real | S.complex)
* @param {number} n - matrix order
* @param {Object} [layout] - { stride, lead, tail }; stride may be negative
* @returns {Object} { data, stride, offset, npk, read(k) }
*/
function rfpAlloc( sc, n, layout ) {
	var L = layout || {};
	var stride = ( L.stride === void 0 ) ? 1 : L.stride;
	var lead = ( L.lead === void 0 ) ? 0 : L.lead;
	var tail = ( L.tail === void 0 ) ? 0 : L.tail;
	var npk = ( n * ( n + 1 ) ) / 2;
	var span = ( npk > 0 ) ? ( npk - 1 ) * Math.abs( stride ) : 0;
	var offset = ( stride < 0 ) ? ( lead + span ) : lead;
	var len = lead + span + tail + 1;
	var data = sc.alloc( len );
	return {
		'data': data,
		'stride': stride,
		'offset': offset,
		'npk': npk,
		'read': function read( k ) {
			return sc.read( data, offset + ( k * stride ) );
		}
	};
}

/**
* Curated 1-D layouts for the opaque RFP buffer (stride sign/magnitude, base
* offset, leading/trailing poison pad).
*
* @returns {Array<Object>}
*/
function rfpLayouts() {
	return [
		{ 'stride': 1, 'lead': 0, 'tail': 0 },
		{ 'stride': 1, 'lead': 3, 'tail': 2 },
		{ 'stride': 2, 'lead': 0, 'tail': 1 },
		{ 'stride': 3, 'lead': 2, 'tail': 0 },
		{ 'stride': -1, 'lead': 4, 'tail': 1 },
		{ 'stride': -2, 'lead': 1, 'tail': 2 }
	];
}


// EXPORTS //

export { rfpAlloc, rfpLayouts };
