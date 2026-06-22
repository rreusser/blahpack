// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dggqrf from './dggqrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dggqrf, 'ndarray', ndarray );


// EXPORTS //

export default dggqrf;
