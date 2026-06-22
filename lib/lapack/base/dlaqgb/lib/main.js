
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqgb from './dlaqgb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqgb, 'ndarray', ndarray );


// EXPORTS //

export default dlaqgb;
