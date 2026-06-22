// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlargv from './dlargv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlargv, 'ndarray', ndarray );


// EXPORTS //

export default dlargv;
