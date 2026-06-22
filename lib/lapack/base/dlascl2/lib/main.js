// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlascl2 from './dlascl2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlascl2, 'ndarray', ndarray );


// EXPORTS //

export default dlascl2;
