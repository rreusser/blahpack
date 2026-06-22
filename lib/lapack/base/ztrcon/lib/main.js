// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrcon from './ztrcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrcon, 'ndarray', ndarray );


// EXPORTS //

export default ztrcon;
