// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgtcon from './zgtcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgtcon, 'ndarray', ndarray );


// EXPORTS //

export default zgtcon;
