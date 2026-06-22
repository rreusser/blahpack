
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpstf2 from './dpstf2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpstf2, 'ndarray', ndarray );


// EXPORTS //

export default dpstf2;
