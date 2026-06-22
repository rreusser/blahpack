// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqps from './dlaqps.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqps, 'ndarray', ndarray );


// EXPORTS //

export default dlaqps;
