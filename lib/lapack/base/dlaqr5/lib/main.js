// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqr5 from './dlaqr5.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqr5, 'ndarray', ndarray );


// EXPORTS //

export default dlaqr5;
