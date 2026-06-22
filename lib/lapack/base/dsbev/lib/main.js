
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsbev from './dsbev.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsbev, 'ndarray', ndarray );


// EXPORTS //

export default dsbev;
