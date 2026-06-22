/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// VARIABLES //

var SELECT = 20;


// MAIN //

/**
* Sort an array of doubles in increasing or decreasing order using quicksort.
* with insertion sort for small partitions.
*
* @private
* @param {string} id - sort direction: 'increasing' or 'decreasing'
* @param {NonNegativeInteger} N - number of elements to sort
* @param {Float64Array} d - array to sort in-place
* @param {integer} stride - stride length for `d`
* @param {NonNegativeInteger} offset - starting index for `d`
* @returns {integer} status code (0 = success)
*/
function dlasrt( id, N, d, stride, offset ) {
	var stkpnt;
	var stack;
	var start;
	var dmnmx;
	var endd;
	var dir;
	var tmp;
	var d1;
	var d2;
	var d3;
	var i;
	var j;

	// Determine sort direction...
	dir = -1;
	if ( id === 'decreasing' ) {
		dir = 0;
	} else if ( id === 'increasing' ) {
		dir = 1;
	}

	// Validate inputs...
	if ( dir === -1 ) {
		return -1;
	}
	if ( N < 0 ) {
		return -2;
	}

	// Quick return...
	if ( N <= 1 ) {
		return 0;
	}

	// Initialize the stack with the full range (using 0-based indices)...
	stkpnt = 1;
	stack = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]; // stack[2*k] = start, stack[(2 * k) +1] = end
	stack[ 0 ] = 0;
	stack[ 1 ] = N - 1;

	while ( stkpnt > 0 ) {
		// Pop from stack...
		stkpnt -= 1;
		start = stack[ 2 * stkpnt ];
		endd = stack[ (2 * stkpnt) + 1 ];

		if ( endd - start <= SELECT && endd - start > 0 ) {
			// Insertion sort for small partitions...
			if ( dir === 0 ) {
				// Sort in decreasing order...
				for ( i = start + 1; i <= endd; i++ ) {
					for ( j = i; j >= start + 1; j-- ) {
						if ( d[ offset + (j * stride) ] > d[ offset + (( j - 1 ) * stride) ] ) {
							dmnmx = d[ offset + (j * stride) ];
							d[ offset + (j * stride) ] = d[ offset + (( j - 1 ) * stride) ];
							d[ offset + (( j - 1 ) * stride) ] = dmnmx;
						} else {
							break;
						}
					}
				}
			} else {
				// Sort in increasing order...
				for ( i = start + 1; i <= endd; i++ ) {
					for ( j = i; j >= start + 1; j-- ) {
						if ( d[ offset + (j * stride) ] < d[ offset + (( j - 1 ) * stride) ] ) {
							dmnmx = d[ offset + (j * stride) ];
							d[ offset + (j * stride) ] = d[ offset + (( j - 1 ) * stride) ];
							d[ offset + (( j - 1 ) * stride) ] = dmnmx;
						} else {
							break;
						}
					}
				}
			}
		} else if ( endd - start > SELECT ) {
			// Quicksort partition using median-of-three pivot...
			d1 = d[ offset + (start * stride) ];
			d2 = d[ offset + (endd * stride) ];
			i = ( ( start + endd ) / 2 ) | 0;
			d3 = d[ offset + (i * stride) ];

			// Find median of d1, d2, d3...
			if ( d1 < d2 ) {
				if ( d3 < d1 ) {
					dmnmx = d1;
				} else if ( d3 < d2 ) {
					dmnmx = d3;
				} else {
					dmnmx = d2;
				}
			} else if ( d3 < d2 ) {
				dmnmx = d2;
			} else if ( d3 < d1 ) {
				dmnmx = d3;
			} else {
				dmnmx = d1;
			}

			if ( dir === 0 ) {
				// Partition for decreasing order...
				i = start - 1;
				j = endd + 1;
				while ( true ) {
					do {
						j -= 1;
					} while ( d[ offset + (j * stride) ] < dmnmx );
					do {
						i += 1;
					} while ( d[ offset + (i * stride) ] > dmnmx );
					if ( i < j ) {
						tmp = d[ offset + (i * stride) ];
						d[ offset + (i * stride) ] = d[ offset + (j * stride) ];
						d[ offset + (j * stride) ] = tmp;
					} else {
						break;
					}
				}
			} else {
				// Partition for increasing order...
				i = start - 1;
				j = endd + 1;
				while ( true ) {
					do {
						j -= 1;
					} while ( d[ offset + (j * stride) ] > dmnmx );
					do {
						i += 1;
					} while ( d[ offset + (i * stride) ] < dmnmx );
					if ( i < j ) {
						tmp = d[ offset + (i * stride) ];
						d[ offset + (i * stride) ] = d[ offset + (j * stride) ];
						d[ offset + (j * stride) ] = tmp;
					} else {
						break;
					}
				}
			}

			// Push sub-partitions onto stack (larger first for bounded stack depth)...
			if ( j - start > endd - j - 1 ) {
				stack[ 2 * stkpnt ] = start;
				stack[ (2 * stkpnt) + 1 ] = j;
				stkpnt += 1;
				stack[ 2 * stkpnt ] = j + 1;
				stack[ (2 * stkpnt) + 1 ] = endd;
				stkpnt += 1;
			} else {
				stack[ 2 * stkpnt ] = j + 1;
				stack[ (2 * stkpnt) + 1 ] = endd;
				stkpnt += 1;
				stack[ 2 * stkpnt ] = start;
				stack[ (2 * stkpnt) + 1 ] = j;
				stkpnt += 1;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dlasrt;
