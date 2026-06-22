// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dptts2 from './dptts2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dptts2, 'ndarray', ndarray );


// EXPORTS //

export default dptts2;
