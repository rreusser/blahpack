// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarnv from './dlarnv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarnv, 'ndarray', ndarray );


// EXPORTS //

export default dlarnv;
