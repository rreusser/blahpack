
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhptrf from './zhptrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhptrf, 'ndarray', ndarray );


// EXPORTS //

export default zhptrf;
