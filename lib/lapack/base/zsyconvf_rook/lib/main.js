/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyconvf_rook from './zsyconvf_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsyconvf_rook, 'ndarray', ndarray );


// EXPORTS //

export default zsyconvf_rook;
