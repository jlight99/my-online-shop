// NOTE: this API is running on http://35.203.114.68:3010/graphiql

const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const express = require('express');
const express_graphql = require('express-graphql');
const { makeExecutableSchema } = require('graphql-tools');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const bodyParser = require('body-parser');
const depthLimit = require('graphql-depth-limit')

const app = express();
const MONGO_URL = 'mongodb://shopify_guest:sh0pt1lludrop!@ds261342.mlab.com:61342/my-first-shop'

// transforms ObjectId to String
transformId = (obj) => {
	obj._id = obj._id.toString();
	return obj;
}

// replace confusing error message which is thrown when the object corresponding to the id parameter can't be found
updateErrorMessage = (e, object, _id) => {
	if (e.message === 'Cannot read property \'_id\' of null') {
		e.message = 'There is no ' + object + ' with the _id ' + _id;
	}
	return e;
}

// if array is null, initialize it to empty
initializeArray = (arr) => {
	if (arr == null) {
		return [];
	}
	return arr;
}

const start = async () => {
	try {
		MongoClient.connect(MONGO_URL, {useNewUrlParser: true}, (err, client) => {

			const db = client.db('my-first-shop');

			const Shops = db.collection('shops');
			const Orders = db.collection('orders');
			const Products = db.collection('products');
			const LineItems = db.collection('lineitems');
	
			const typeDefs = [`
				type Shop {
					_id: String

					# The name of the store
					name: String

					# The products of the store
					products: [Product]

					# The orders of the store
					orders: [Order]
				}
	
				type Order {
					_id: String

					# The products added to the order along with their quantity and price
					lineitems: [LineItem]

					# The total cost the order comes to
					total: Float
				}
	
				type Product {
					_id: String

					# The name of a product
					name: String

					# The line items that are mapped to this product
					lineitems: [LineItem] 

					# The price of this product
					price: Float 
				}
	
				type LineItem {
					_id: String

					# The product that this line item represents
					product: Product

					# The number of items of the product
					quantity: Int 

					# The total cost for this line item, calculated by multiplying the quantity to the product price
					value: Float 
				}
	
				type Query {
					# Retrieve a single shop identified by the _id parameter
					shop(_id: String!): Shop

					# Retrieve all shops
					shops: [Shop]

					# Retrieve a single order identified by the _id parameter
					order(_id: String!): Order

					# Retrieve all orders
					orders: [Order]

					# Retrieve a single product identified by the _id parameter
					product(_id: String!): Product

					# Retrieve all products
					products: [Product]

					# Retrieve a single line item identified by the _id parameter
					lineitem(_id: String!): LineItem

					# Retrieve all line items
					lineitems: [LineItem]
				}
	
				type Mutation {
					# Create a new shop, takes the name of the new shop as parameter
					createShop(name: String!): Shop

					# Add products to a shop, takes the _id of the shop (_id) and 
					# an array of the _id of all the products to be added (products) as parameters
					updateShopAddProducts(_id: String!, products: [String]): Shop

					# Delete products from a shop, takes the _id of the shop (_id) and 
					# an array of the _id of all the products to be deleted (products) as parameters
					updateShopDeleteProducts(_id: String!, products: [String]): Shop

					# Add orders to a shop, takes the _id of the shop (_id) and 
					# an array of the _id of all the orders to be added (orders) as parameters
					updateShopAddOrders(_id: String!, orders: [String]): Shop

					# Delete orders from a shop, takes the _id of the shop (_id) and 
					# an array of the _id of all the orders to be deleted (orders) as parameters
					updateShopDeleteOrders(_id: String!, orders: [String]): Shop

					# Delete the shop, takes the _id of the shop to be deleted (_id) as parameter
					deleteShop(_id: String!): Shop

					# Create a new order
					createOrder: Order

					# Add line items to an order, takes the _id of the order (_id) and
					# an array of the _id of all the line items to be added (lineitems) as parameters
					updateOrderAddLineItems(_id: String!, lineitems: [String]): Order

					# Delete line items from an order, takes the _id of the order (_id) and
					# an array of the _id of all the line items to be deleted (lineitems) as parameters
					updateOrderDeleteLineItems(_id: String!, lineitems: [String]): Order

					# Delete an order, takes the _id of the order (_id) as parameter
					deleteOrder(_id: String!): Order

					# Create a new product, takes the name of the new product (name) and
					# the price of the new product (price) as parameters
					createProduct(name: String!, price: Float): Product

					# Change the name of the product, takes the _id of the product (_id) and
					# the new name of the product (name) as parameters
					updateProductName(_id: String!, name: String!): Product

					# Change the product price, takes the _id of the product (_id) and
					# the new price of the product (price) as parameters
					updateProductPrice(_id: String!, price: Float): Product

					# Delete a product, takes the _id of the product to be deleted (_id) as parameter
					deleteProduct(_id: String!): Product

					# Create a new line item, takes the product id of the product represented by the line item (productId) and
					# the number of items of the product the line item represents (quantity) as parameters
					createLineItem(productId: String, quantity: Int = 1): LineItem

					# Change the line item quantity, takes the _id of the line item (_id) and
					# the new quantity of the line item (quantity) as parameters
					updateLineItemQuantity(_id: String!, quantity: Int): LineItem

					# Delete a line item, takes the _id of the line item to be deleted (_id) as parameter
					deleteLineItem(_id: String!): LineItem
				}
	
				schema {
					query: Query
					mutation: Mutation
				}
			`];
	
			const resolvers = {
				Query: {
					shop: async (root, {_id}) => {
						try {
							return transformId(await Shops.findOne(ObjectId(_id)));
						} catch (e) {
							return updateErrorMessage(e, 'Shop', _id);
						}
					},
					shops: async () => {
						return (await Shops.find({}).toArray()).map(transformId);
					},
					order: async (root, {_id}) => {
						try {
							return transformId(await Orders.findOne(ObjectId(_id)));
						} catch (e) {
							return updateErrorMessage(e, 'Order', _id);
						}
					},
					orders: async () => {
						return (await Orders.find({}).toArray()).map(transformId);
					},
					product: async (root, {_id}) => {
						try {
							return transformId(await Products.findOne(ObjectId(_id)));
						} catch (e) {
							return updateErrorMessage(e, 'Product', _id);
						}
					},
					products: async () => {
						return (await Products.find({}).toArray()).map(transformId);
					},
					lineitem: async (root, {_id}) => {
						try {
							return transformId(await LineItems.findOne(ObjectId(_id)));
						} catch (e) {
							return updateErrorMessage(e, 'Line Item', _id);
						}
					},
					lineitems: async () => {
						return (await LineItems.find({}).toArray()).map(transformId);
					}
				},
				Mutation: {
					createShop: async (root, args, context, info) => {
						const res = await Shops.insertOne(args);
						return transformId(await Shops.findOne(ObjectId(res.insertedId)));
					},
					updateShopAddProducts: async (root, args, context, info) => {
						var obj = 'Shop';
						var id = args._id;
						try {
							const productIds = args.products;

							// set new product array equal to original products of shop
							const newProducts = initializeArray(transformId(await Shops.findOne(ObjectId(id))).products);
							obj = 'Product';

							// get all products from the product id array parameter, add these products to the array newProducts
							for (var i = 0; i < productIds.length; i++) {
								id = productIds[i];
								newProducts.push(transformId(await Products.findOne(ObjectId(id))));
							}

							// set the shop products field to the new products array
							const res = await Shops.updateOne(
								{ '_id': ObjectId(args._id) }, 
								{ $addToSet: { 'products': { $each: newProducts } } }
							);

							return transformId(await Shops.findOne(ObjectId(args._id)));
						} catch (e) {
							return updateErrorMessage(e, obj, id);
						}
					},
					updateShopDeleteProducts: async (root, args, context, info) => {
						try {
							await Shops.updateOne(
								{ '_id': ObjectId(args._id) }, 
								{ $pull: 
									{ 'products': 
										{ '_id': 
											{ $in: args.products } //delete all products whose ids match the parameter of array of product ids 
										} 
									} 
								} 
							); 
							return transformId(await Shops.findOne(ObjectId(args._id)));
						} catch (e) {
							return updateErrorMessage(e, 'Shop', args._id);
						}
					},
					updateShopAddOrders: async (root, args, context, info) => {
						const orderIds = args.orders;
						var obj = 'Shop';
						var id = args._id;
						try {
							// set newOrders equal to the original orders of the shop
							const newOrders = initializeArray(transformId(await Shops.findOne(ObjectId(id))).orders);
							obj = 'Order';

							// get all orders by the order ids array parameter, add these orders to the newOrders array
							for (var i = 0; i < orderIds.length; i++) {
								id = orderIds[i];
								newOrders.push(transformId(await Orders.findOne(ObjectId(id))));
							}

							// set the shop orders field to newOrders
							const res = await Shops.updateOne(
								{ '_id': ObjectId(args._id) },
								{ $addToSet: { 'orders': { $each: newOrders } } }
							);

							return transformId(await Shops.findOne(ObjectId(args._id)));
						} catch (e) {
							return updateErrorMessage(e, obj, id);
						}
					},
					updateShopDeleteOrders: async (root, args, context, info) => {
						try {
							await Shops.updateOne(
								{ '_id': ObjectId(args._id) },
								{ $pull:
									{ 'orders':
										{ '_id':
											{ $in: args.orders } // delete all orders where the order id matches an id in the orders parameter
										}
									}
								}
							);
							return transformId(await Shops.findOne(ObjectId(args._id)));
						} catch (e) {
							return updateErrorMessage(e, 'Shop', args._id);
						}
					},
					deleteShop: async (root, {_id}) => {
						try {
							const deletedShop = transformId(await Shops.findOne(ObjectId(_id)));
							const res = await Shops.deleteOne({'_id': ObjectId(_id)});
							return deletedShop;
						} catch (e) {
							return updateErrorMessage(e, 'Shop', _id);
						}
					},
					createOrder: async (root, args, context, info) => {
						const res = await Orders.insertOne(args);
						return transformId(await Orders.findOne(ObjectId(res.insertedId)));
					},
					updateOrderAddLineItems: async (root, args, context, info) => {
						const lineitemIds = args.lineitems;
						var obj = 'Order';
						var id = args._id;
						try {
							// get the original order
							const order = transformId(await Orders.findOne(ObjectId(id)));

							// set newLineItems equal to the original line items of the order, or to an empty array if no original line items
							const newLineItems = initializeArray(order.lineitems);

							// set totalValue equal to the original order total, or to 0 if no original order total
							var totalValue = order.total;
							if (isNaN(totalValue)) {
								totalValue = 0;
							}

							// get the line item objects by their ids, add these new line item objects to the newLineItem array
							obj = 'Line Item';
							for (var i = 0; i < lineitemIds.length; i++) {
									id = lineitemIds[i];
									const newItem = transformId(await LineItems.findOne(ObjectId(id)));
									newLineItems.push(newItem);
									totalValue += newItem.value;//increment the total value of the order as more line items are added
							}

							// set the line items of the order to newLineItems, set the total of the order to totalValue
							const res = await Orders.updateOne(
								{ '_id': ObjectId(args._id) },
								{ 
									$addToSet: { 'lineitems': { $each: newLineItems } },
									$set: { 'total': totalValue } 
								}
							);
							return transformId(await Orders.findOne(ObjectId(args._id)));
						} catch (e) {
							return updateErrorMessage(e, obj, id);
						}
					},
					updateOrderDeleteLineItems: async (root, args, context, info) => {
						try {
							await Orders.updateOne(
								{ '_id': ObjectId(args._id) },
								{ $pull:
									{ 'lineitems':
										{ '_id':
											{ $in: args.lineitems } //delete all line items from order where line item id is in the lineitems parameter
										}
									}
								}
							);
							return transformId(await Orders.findOne(ObjectId(args._id)));
						} catch (e) {
							return updateErrorMessage(e, 'Order', args._id);
						}

					},
					deleteOrder: async (root, {_id}) => {
						try {
							const deletedOrder = transformId(await Orders.findOne(ObjectId(_id)));
							const res = await Orders.deleteOne({'_id': ObjectId(_id)});
							return deletedOrder;
						} catch (e) {
							return updateErrorMessage(e, 'Order', _id);
						}
					},
					createProduct: async (root, args, context, info) => {
						const res = await Products.insertOne(args);
						return transformId(await Products.findOne(ObjectId(res.insertedId)));
					},
					updateProductName: async (root, args, context, info) => {
						try {
							const res = await Products.updateOne({'_id':ObjectId(args._id)}, {$set:{'name':args.name}});
							return transformId(await Products.findOne({'_id':ObjectId(args._id)}));
						} catch (e) {
							return updateErrorMessage(e, 'Product', args._id);
						}
					},
					updateProductPrice: async (root, args, context, info) => {
						try {
							const res = await Products.updateOne({'_id':ObjectId(args._id)}, {$set:{'price':args.price}});
							return transformId(await Products.findOne(ObjectId(args._id)));
						} catch (e) {
							return updateErrorMessage(e, 'Product', args._id);
						}
					},
					deleteProduct: async (root, {_id}) => {
						try {
							const deletedProduct = transformId(await Products.findOne(ObjectId(_id)));
							const res = await Products.deleteOne({'_id': ObjectId(_id)});
							return deletedProduct;
						} catch (e) {
							return updateErrorMessage(e, 'Product', args._id);
						}
					},
					createLineItem: async (root, args, context, info) => {
						const res = await LineItems.insertOne(args);
						try {
							// get the product the line item represents
							const itemProduct = transformId(await Products.findOne(ObjectId(args.productId)));

							// get the value of the line item by multiply number of items with product price
							const value = args.quantity * itemProduct.price;

							await LineItems.updateOne({'_id':ObjectId(res.insertedId)}, {$set: { 'product': itemProduct, 'value': value } });
							const newLineItem = transformId(await LineItems.findOne(ObjectId(res.insertedId)));

							// add new line item to the product it represents
							const productLineItems = initializeArray(itemProduct.lineitems);
							productLineItems.push(newLineItem);
							await Products.updateOne({'_id':ObjectId(args.productId)}, {$set: { 'lineitems': productLineItems } });

							return newLineItem;
						} catch (e) {
							return updateErrorMessage(e, 'Product', args.productId);
						}
					},
					updateLineItemQuantity: async (root, args, context, info) => {
						try {
							const updatedItem = transformId(await LineItems.findOne(ObjectId(args._id)));
							const value = args.quantity * updatedItem.product.price;
							const res = await LineItems.updateOne({'_id':ObjectId(args._id)}, {$set:{'quantity':args.quantity, 'value':value}});
							return transformId(await LineItems.findOne(ObjectId(args._id)));
						} catch (e) {
							return updateErrorMessage(e, 'Line Item', args._id);
						}
					},
					deleteLineItem: async (root, {_id}) => {
						try {
							const deletedLineItem = transformId(await LineItems.findOne(ObjectId(_id)));
	
							// remove deleted line item from the product it represents
							await Products.updateOne(
								{ '_id': ObjectId(deletedLineItem.product._id) },
								{ $pull:
									{ 'lineitems':
										{ '_id': _id }
									}
								}
							);

							const res = await LineItems.deleteOne({'_id': ObjectId(_id)});
							return deletedLineItem;
						} catch (e) {
							return updateErrorMessage(e, 'Line Item', _id);
						}
					}
				}
			};
	
			const schema = makeExecutableSchema({
				typeDefs,
				resolvers
			});
	
			app.use('/graphql', bodyParser.json(), graphqlExpress({
				schema,
				validationRules: [ depthLimit(10) ] //prevent malicious cyclical queries by limiting query depth to 10 under
			}));
			app.use('/graphiql', graphiqlExpress({endpointURL:'/graphql'}));
			app.listen(3010, () => {
				console.log('Shopify Challenge now running on localhost:3010/graphiql');
			});
		});
	} catch (e) {
		console.log(e);
	}
}

start();
