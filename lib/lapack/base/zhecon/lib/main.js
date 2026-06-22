// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhecon from './zhecon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhecon, 'ndarray', ndarray );


// EXPORTS //

export default zhecon;
