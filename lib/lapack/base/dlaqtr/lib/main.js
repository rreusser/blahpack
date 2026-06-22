
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqtr from './dlaqtr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqtr, 'ndarray', ndarray );


// EXPORTS //

export default dlaqtr;
