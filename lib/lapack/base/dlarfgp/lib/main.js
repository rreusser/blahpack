
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarfgp from './dlarfgp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarfgp, 'ndarray', ndarray );


// EXPORTS //

export default dlarfgp;
