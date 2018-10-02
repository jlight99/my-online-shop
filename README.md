# my-online-shop
A server-side API that models an online shopping platform

## Interact with API
A running instance of the API can be found at: http://35.203.114.68:3010/graphiql. The following is a screenshot of the GraphiQL interface you should see when you visit that address. Two things to notice on the basic GraphiQL interface is the execute request button (circled in blue) and the Docs menu (boxed in orange). 

<img src='/screenshots/landingpagelabelled.png'>

GraphiQL is an interactive in-browser IDE, which means you, the user, can perform operations on the database directly within the browser. You can interact with the API by typing your desired query or mutation into the text area on the left side of the page, pressing the execute button, and seeing the results right away in the right side of the page. 

This API supports full CRUD (**C**reate, **R**ead, **U**pdate, **D**elete) operations. 

### Query
In GraphQL, in order to read or fetch data from the database, we need to *query* the GraphQL server. A query is essentially asking for specific fields on an object. For example, in the following instance:

<img src='/screenshots/queryshopsbasic.png'>

The `query` keyword specifies that we wish to fetch data. The `shops` field specifies of the name of the query we are calling. A list of the available queries can be found in Docs > Query. The `shops` query returns an array of Shop objects, and the `_id` and `name` fields specify that we want to know the id and name of each returned Shop. 

Another example of a more complex query can be found below:

<img src='/screenshots/queryshopscomplex.png'>

In this instance, we are calling the same query, `shops`, but we are asking for more fields of the returned Shop objects (`name`, `products`, `orders`). Notice that `products` and `orders` are both nested while `name` is not. This is because the `name` field is of type String, while the `products` and `orders` fields are both arrays of Objects. Any time a field is of type Object, or an array of Objects, you must specify a subselection of the fields of the Object you wish to see returned. In this instance, we are asking for the `name` and `price` of each Product of the Shop, as well as the `lineitems` (which itself is an Object, and therefore also is nested) and `total` of each Order of the Shop.

The above examples requested an array of Shop objects to be returned. In order to query or to mutate (see section below) individual objects, we need to provide the id of the object we wish to query/mutate as a parameter. For instance:

<img src='/screenshots/querysingleproduct.png'>

In the example above, we provide the id of the Product we wish to query as the parameter. Note that if you don't know the id of the object you wish to query or mutate, you can always use the query multiple objects query to get an array of the ids of all the objects, as in the first two example with Shop arrays, in order to obtain the id you need.


### Mutation
Just as queries are used to read data from the database, *mutations* are used to modify (create, update, delete) server-side data. For example, in the following instance:

<img src='/screenshots/mutationshopsimple.png'>

The `mutation` keyword specifies that we wish to modify data. The `createShop` field specifies the name of the mutation we are calling. A list of the available mutations can be found in Docs > Mutation. The `createShop` mutation takes a single parameter, `name`, which takes a String to be the name of the created shop. The `createShop` mutation returns a Shop object, and the `_id` and `name` specify that we want to see the id and name of the created Shop.

An example of updating a Product is found below:

<img src='/screenshots/updateproduct.png'>

As with the case of reading, updating, and deleting any individual object, this is a case where we have to provide the `_id` of the object as a parameter. As a reminder, if ever you don't know the id of the object you wish to query/mutate, you can always query an array of the objects and request the object id to be returned (this query does not require any parameters) in order to obtain the id you need. Examples of this can be found in the first two examples in this README. Also note that in this instance, the `name` of the object is also provided, as the `updateProductName` mutation requires the new name of the Product to be a parameter.


### Documentation
All the available queries and mutations, their expected parameters and return objects, and all the custom Objects (Shop, Product, Order, LineItem) of the data can be found in the documentation.

To access the documentation, click into the Docs button (top left corner of the page, boxed in orange in the first screenshot). Here is a brief overview of how to use the documentation. In the screenshot below are the documentation of two queries, shop and shops.

<img src='/screenshots/shopqueries.png'>

The name of the query (shop and shops) is in blue. The parameters that the query takes are in brackets. The parameter field name is in purple (id) and the parameter type is in yellow (String!). The exclamation mark indicates that this parameter is not optional and must be specified. After the colon, the return object of the query is specified in yellow (Shop and [Shop]). You can click into the custom objects (Shop, Order, Product, LineItem) to see exactly what fields are defined for the object. 
