// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dstein from './dstein.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dstein, 'ndarray', ndarray );


// EXPORTS //

export default dstein;
