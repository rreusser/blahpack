// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrcon from './dtrcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrcon, 'ndarray', ndarray );


// EXPORTS //

export default dtrcon;
