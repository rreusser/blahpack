
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlangb from './dlangb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlangb, 'ndarray', ndarray );


// EXPORTS //

export default dlangb;
