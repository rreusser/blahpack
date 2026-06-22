
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpstrf from './dpstrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpstrf, 'ndarray', ndarray );


// EXPORTS //

export default dpstrf;
