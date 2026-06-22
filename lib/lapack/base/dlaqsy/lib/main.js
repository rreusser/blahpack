// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqsy from './dlaqsy.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqsy, 'ndarray', ndarray );


// EXPORTS //

export default dlaqsy;
