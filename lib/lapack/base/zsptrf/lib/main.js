
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsptrf from './zsptrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsptrf, 'ndarray', ndarray );


// EXPORTS //

export default zsptrf;
