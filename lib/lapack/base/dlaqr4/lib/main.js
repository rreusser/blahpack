// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqr4 from './dlaqr4.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqr4, 'ndarray', ndarray );


// EXPORTS //

export default dlaqr4;
