// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlansb from './dlansb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlansb, 'ndarray', ndarray );


// EXPORTS //

export default dlansb;
