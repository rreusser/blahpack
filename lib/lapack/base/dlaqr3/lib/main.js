// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqr3 from './dlaqr3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqr3, 'ndarray', ndarray );


// EXPORTS //

export default dlaqr3;
