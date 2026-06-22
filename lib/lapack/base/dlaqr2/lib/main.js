// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqr2 from './dlaqr2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqr2, 'ndarray', ndarray );


// EXPORTS //

export default dlaqr2;
