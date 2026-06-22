
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqsb from './dlaqsb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqsb, 'ndarray', ndarray );


// EXPORTS //

export default dlaqsb;
