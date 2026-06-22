
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgetf2 from './dgetf2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgetf2, 'ndarray', ndarray );


// EXPORTS //

export default dgetf2;
