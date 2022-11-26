
'use strict';


/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
    ...require('./authRoutes'),
    ...require('./userRoutes'),
    ...require('./franchaiseRoutes'),
    ...require('./courseRoutes'),
     ...require('./paymentRoutes'),
     ...require('./certificationRoutes')
    
]


module.exports = v1Routes;
