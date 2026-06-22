// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zspcon from './zspcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zspcon, 'ndarray', ndarray );


// EXPORTS //

export default zspcon;
