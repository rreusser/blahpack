// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgttrf from './dgttrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgttrf, 'ndarray', ndarray );


// EXPORTS //

export default dgttrf;
