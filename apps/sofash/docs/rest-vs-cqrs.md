# REST vs CQRS

While "reads" of the app can be considered REST by the look of route paths, in practice the app mostly utilizes CQRS. The reason for this is to restrict and control as much as possible what can be done via API thus increasing stability of the app.

Example of such is promotion of user to being an admin: there is a dedicated route for this operation instead of just generic user update route. This allows to ensure that no user is promoted to root as it is an illegal operation. The REST alternative with the same functionality would be route with custom role validation to ensure role is legal. That would lead even to more boilerplate: instead of just writing what should be implemented, there would be code that allows more than needed and code that restricts it back to original target.

"The app mostly utilizes CORS" means commands do return the whole resource, so the client don't need to re-query it separately. This is done purely for development convenience to see actual result of operation immediately in operation response without additional requests.

Additional benefit of CORS is that real-world scenarios don't usually fit nicely into strict and limited categories of REST CRUD operations. Example of such is cancelling a booking, where with REST internal implementation (whether to delete the record or to set it's status to "cancelled") affects API interface (whether it is a DELETE method or an UPDATE). While with CORS whatever the internal implementation may be it will always be the same unaffected "cancel booking" command. The same goes for authentication related stuff, where you need to fit login and refresh token operation in way to restrictive four categories of CRUD.
