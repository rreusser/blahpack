// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgbcon from './dgbcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgbcon, 'ndarray', ndarray );


// EXPORTS //

export default dgbcon;
