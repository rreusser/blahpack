
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarzt from './dlarzt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarzt, 'ndarray', ndarray );


// EXPORTS //

export default dlarzt;
