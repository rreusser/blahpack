// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqr1 from './dlaqr1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqr1, 'ndarray', ndarray );


// EXPORTS //

export default dlaqr1;
