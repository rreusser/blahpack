
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import drotmg from './drotmg.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( drotmg, 'ndarray', ndarray );


// EXPORTS //

export default drotmg;
