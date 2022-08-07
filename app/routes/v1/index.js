
'use strict';


/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
    ...require('./userRoutes'),
     ...require('./franchiseRoutes'),
    ...require('./courseRoutes'),
     ...require('./paymentRoutes')
    
]


module.exports = v1Routes;
