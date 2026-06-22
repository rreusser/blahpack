// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqge from './dlaqge.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqge, 'ndarray', ndarray );


// EXPORTS //

export default dlaqge;
