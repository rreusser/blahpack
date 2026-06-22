// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgecon from './zgecon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgecon, 'ndarray', ndarray );


// EXPORTS //

export default zgecon;
