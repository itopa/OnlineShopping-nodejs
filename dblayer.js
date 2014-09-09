/**
 * New node file
 */

var pool=require("./connectionpool");
	var fs=require("fs");
var objectstream = require('objectstream');
var json=require('json-serialize')		




function insert(name,lastname,email,password){
	var connection=pool.getconnection();
	var sql="insert into user_details (Fname,EmailId,Lname,Password) values ('"+name+"','"+email+"','"+lastname+"','"+password+"')";
	var getuid="select Uid from user_details where EmailId='"+email+"'";
	connection.query(sql, function(err, results) {
		if (err) {
            console.log("ERROR: " + err.message);
        }
		console.log(results);
	});
	var uid=10;
	connection.query(getuid,function(err,rows){
		if(rows.length!=0)
		{
			uid=rows[0].Uid;
			console.log(uid);
			var logcart="insert into cart (UID) value ("+uid+")";
			connection.query(logcart,function(err,results){
				if(err){
						console.log("Error: "+err.message);
				}
				console.log(results);
			});

		}
	})
	pool.returnToPool(connection);
	}

var CategoryBackup;
function renderCategories(callback,EmailId)
{
	var connection=pool.getconnection();

	var query="select CategoryName from catalog";
	var query2="select Fname from user_details where EmailId='"+EmailId+"'";
	var user;
	
	connection.query(query2,function(err,rows){
		if(!err){
		if(rows.length!=0){
			user=rows[0].Fname;
			var name=[];
			if(CategoryBackup!=null){
				console.log("inside exist")
			//	var dstream = fs.createReadStream("categories.txt");
				//var dobjstream = objectstream.createDeserializeStream(dstream);
				//dobjstream.on('data', function (data) {
					
				//	console.dir(data); 
					//var rows=json.deserialize(data);
					for(i=0;i<CategoryBackup.length;i++)
					{
						name[i]=CategoryBackup[i].CategoryName;
					}
				callback(name,user,EmailId);
			

				//})
				
			}
			else
			{
				connection.query(query,function(err,rows){
					if(rows.length!=0)
						{
						//var str = JSON.stringify(rows);
						//var stream = fs.createWriteStream("categories.txt");
						//var objstream = objectstream.createSerializeStream(stream);
						//objstream.write(str);
						//objstream.end();
						CategoryBackup=rows;
							for(i=0;i<rows.length;i++)
								{
									name[i]=rows[i].CategoryName;
								}
							callback(name,user,EmailId);
						}
				})

			}

			
		}}
		else{
			console.log("error")
		}
	});	

	
	
//	fs.exists("categories.txt",function(exists){
			//})
	
		pool.returnToPool(connection);
}

function addToCart(prodname,EmailId,Quantity,productId,price,callback){
	var connection=pool.getconnection();

	var getuserid="select Uid from user_details where EmailId='"+EmailId+"'";
	connection.query(getuserid,function(err,rows){
		if(rows.length!=0)
			{
			var uid=rows[0].Uid;
			console.log(uid+" "+rows[0].Uid);
			var getcartid="select CartID from cart,user_details where cart.UID=user_details.Uid AND cart.Uid="+uid;
			connection.query(getcartid,function(err,rows){
				if(rows.length!=0){
					var cartid=rows[0].CartID;
					console.log(cartid)
					var amount=price*Quantity;
					//var q2="insert into cart_Product (cartID,ProductId,QuantityBought,amount) values ("+cartid+","++","+1+","+50+")"
					var q2="insert into cart_Product (cartID,ProductId,QuantityBought,amount) values ("+cartid+","+productId+","+Quantity+","+amount+")";
				
				connection.query(q2,function(err,results){
					if(err){
						console.log("Error inserting cart details");
					}
					else{
						var addTotalAmount="update cart SET TotalAmount=TotalAmount+"+amount+" where cartID="+cartid;
						connection.query(addTotalAmount,function(err,rows){
							if(err){
								console.log("Cart amount not updated")
							}
							else
								{
								console.log("Cart amount updated")
								}
						});
						callback();
					}
				})
				}
				else
					{
						console.log("No such cartId")
					}
			})
			

			}
		else
			{
			console.log("Dint fetch row")
			}
	})
	pool.returnToPool(connection);
	}

function getProductDetails(proname,callback){
	var connection=pool.getconnection();
	var name;
	var Description;
	var Price;
	var Quantity;
	var query="select * from product where ProductName='"+proname+"'";
	connection.query(query,function(err,rows){
		if(rows.length!=0)
			{
			
			name=rows[0].ProductName;
			Description=rows[0].Description;
			Price=rows[0].Price;
			Quantity=rows[0].Quantity;
			}
		callback(name,Description,Price,Quantity);
	})
	pool.returnToPool(connection);
}

var ProductCache=[];
function renderProducts(catname,callback){
	var connection=pool.getconnection();

	var query="select * from catalog,product,pro_cat where catalog.CategoryName='"+catname+"' AND catalog.idCatalog=pro_cat.catId AND product.idProduct=pro_cat.prodId"
	var name=[];
	var ProductId=[];

//fs.exists(catname+".txt",function(exists){
	if(ProductCache[catname]!=null){
		console.log("inside exist")
		//var dstream = fs.createReadStream(catname+".txt");
		//var dobjstream = objectstream.createDeserializeStream(dstream);
		//dobjstream.on('data', function (data) {
		console.log("cached!!");	
		//	var rows=json.deserialize(data);
			for(i=0;i<ProductCache[catname].length;i++)
			{
				name[i]=ProductCache[catname][i].ProductName;
				ProductId[i]=ProductCache[catname][i].idProduct;
			}
			callback(name,ProductId);
	//	})
		
	}
	else
	{
		connection.query(query,function(err,rows){
			if(rows.length!=0)
				{
				ProductCache[catname]=rows;
			//	var str = JSON.stringify(rows);
			//	var stream = fs.createWriteStream(catname+".txt");
			//	var objstream = objectstream.createSerializeStream(stream);
			//	objstream.write(str);
			//	objstream.end();
				
					for(i=0;i<rows.length;i++)
						{
						name[i]=rows[i].ProductName;
						ProductId[i]=rows[i].idProduct;
						}
					callback(name,ProductId);
				}
		})

	}
//})

	pool.returnToPool(connection);
}

function select(validation,uname,password){
	var connection=pool.getconnection();
	console.log("db called");

	var sql="select * from user_details where EmailId='"+uname+"' AND Password='"+password+"'";	
	connection.query(sql, function(err, rows, fields){
		if(!err){
		console.log("connection used in select");
			validation(err,rows,uname);
		}
		
	})
	pool.returnToPool(connection);

}

exports.log=function(callback,EmailId){
	var connection=pool.getconnection();
	
	var query1="select * from user_history where UID=(select Uid from user_details where EmailId='"+EmailId+"')";
	connection.query(query1,function(err,rows){
		if(!err){
		if(rows.length!=0)
			{
			console.log(rows[0].LastLoginDate);
			
			callback(rows[0].LastLoginDate);
			var sql="update user_history set LastLoginDate=Now()where UID=(select Uid from user_details where EmailId='"+EmailId+"')";
			connection.query(sql,function(err,rows){
				if(err){
					console.log("error updating log");
				}
			})
			}
		else
			{
			var sql1="insert into user_history (UID) values ((select Uid from user_details where EmailId='"+EmailId+"'))";
			connection.query(sql1,function(err,rows){
				if(!err){
					console.log("successfully added new entry");
				}
			})
			
			}
	}})
	
	pool.returnToPool(connection);
} 

function displaycart(EmailId,callback,callback2){
	var connection=pool.getconnection();
	console.log("dblayerdislpaycart")
	var query="select ProductName,QuantityBought,amount from product,cart_product,user_details where user_details.EmailId='"+EmailId+"' AND product.idProduct=cart_product.ProductId";
	var ProductName=[];
	var QuantityBought=[];
	var amount=[];
	connection.query(query,function(err,rows){
		if(rows.length!=0){
			for(var i=0;i<rows.length;i++){
				ProductName[i]=rows[i].ProductName;
				QuantityBought[i]=rows[i].QuantityBought;
				amount[i]=rows[i].amount;
			}
			callback(EmailId,ProductName,QuantityBought,amount);
		}
		else
			{
			callback2(EmailId);
			}
		
	})
	pool.returnToPool(connection);
}

function clearcart(EmailId){
	var connection=pool.getconnection();
	console.log("inside clear cart")
	var mysql      = require('mysql');
	var getcartid="select CartID from cart,user_details where user_details.Uid=cart.UID AND user_details.EmailId='"+EmailId+"'";
	connection.query(getcartid,function(err,rows){

		if(rows.length!=0){
			console.log("got cart id: "+rows[0].CartID);
			var cartid=rows[0].CartID;
			var query1="update cart SET TotalAmount=0 where cartID="+cartid;
			var query2="delete from cart_product where CartID="+cartid;
			connection.query(query1,function(err,rows){
				if(err){
					console.log("not deleted");
				}
			})
			var query="select ProductId,QuantityBought from cart_product where cartID="+cartid;
			connection.query(query,function(err,rows){
				if(err){
					console.log("error in query");
				}
				if(!err){
					console.log("getting product ids to update quantity"+rows);
					for(var i=0;i<rows.length;i++){
						var decQty="update product Set Quantity=Quantity-"+rows[i].QuantityBought+" where idProduct="+rows[i].ProductId;
						connection.query(decQty,function(err,rows){
							if(err){
								console.log("quantity not updated");
							}
							else{
								console.log("quantity updated")
							}
						})
						
						var producthistory="insert into user_history (UID,productBought) values ((select  Uid from user_details where EmailId='"+EmailId+"'),(select product.ProductName from product where idProduct="+rows[i].ProductId+"))"
						connection.query(producthistory,function(err,rows){
							if(err){
								console.log("product history not entered")
							}
							else{
								console.log("product history updated");
							}
						})
						
					}

					connection.query(query2,function(err,rows){
						if(err){
						console.log("not deleted");
						}
					})
				
				}
			})
			
		}
	})
	pool.returnToPool(connection);
}

function insertProduct(productName,description,qty,price,category,request,response,callback){
	var connection=pool.getconnection();
	var sql="insert into product (ProductName,Description,Price,Quantity) values ('"+productName+"','"+description+"',"+price+","+qty+")";
	
	connection.query(sql,function(err,results){
		if(err){
			console.log("err")
		}
		else
			{
			console.log("success");
			var query1="select * from catalog where CategoryName='"+category+"'";
			connection.query(query1,function(err,rows){
				if(err){
					console.log("error getting category name")
				}
				else
					{
				if(rows.length==0)
					{
					console.log("got category name")
					var query2="insert into catalog (CategoryName) values ('"+category+"')";
					connection.query(query2,function(err,results){
						if(err){
							console.log("error while inserting new category name");
						}
						else{
						var query3="insert into pro_cat (prodId,catId) values ((select idProduct from product where ProductName='"+productName+"'),(select idCatalog from catalog where CategoryName='"+category+"'))";
						connection.query(query3,function(err,results){
							if(err){
								console.log("error inserting new category values in procat")
							}
							else
								{
									console.log("new vl inserted")
									var cache="select CategoryName from catalog"
									connection.query(cache,function(err,rows){
										if(!err){
											CategoryBackup=rows;
												//	var str = JSON.stringify(rows);
												//	var stream = fs.createWriteStream(category+".txt");
												//	var objstream = objectstream.createSerializeStream(stream);
												//	objstream.write(str);
												//	objstream.end();
	
										}
									})
									var qu="select ProductName from product,catalog,pro_cat where catalog.CategoryName="+category+" and product.idProduct=pro_cat.prodId and catalog.idCatalog=pro_cat.catId "
									connection.query(qu,function(err,rows){
										if(!err){
											ProductCache[category]=rows;
										}
									})
								}
						})
					}
					})					
					}
					else
					{
						var query3="insert into pro_cat (prodId,catId) values ((select idProduct from product where ProductName='"+productName+"' LIMIT 1),(select idCatalog from catalog where CategoryName='"+category+"' LIMIT 1))";
					connection.query(query3,function(err,rows){
						if(err){
						console.log("error inserting in pro-cat");
					}
						else{
							var cache="select * from catalog,product,pro_cat where catalog.CategoryName='"+category+"' AND catalog.idCatalog=pro_cat.catId AND product.idProduct=pro_cat.prodId"
							connection.query(cache,function(err,rows){
								if(!err){
									CategoryBackup=rows;
										//	var str = JSON.stringify(rows);
											//var stream = fs.createWriteStream(category+".txt");
											//var objstream = objectstream.createSerializeStream(stream);
											//objstream.write(str);
											//objstream.end();

								}
							})
						}
					})
					}
				
				callback(request,response);
					}

					
			})
			}
	})
	pool.returnToPool(connection);
}

function removeProduct(EmailId,ProductName,callback){
	var connection=pool.getconnection();
	console.log("inside remove product")
	var query="delete from cart_product where cartID=(select CartID from cart where UID=(select Uid from user_details where EmailId='"+EmailId+"' limit 1) limit 1) and ProductId=(select idProduct from product where ProductName='"+ProductName+"' limit 1)";
	connection.query(query,function(err,rows){
		if(err){
			console.log("error removing product");
		}
		else {
			callback();
		}
	})
	
	pool.returnToPool(connection);
}

function getPurchasedList(EmailId,callback){
	var connection=pool.getconnection();
	console.log("inside getting purchased");
	var query="select productBought from user_history where UID=(select Uid from user_details where EmailId='"+EmailId+"')"
	connection.query(query,function(err,rows){
		var product=[];
		for(i=0;i<rows.length;i++){
			product[i]=rows[i].productBought
		}
		callback(product);
	})
	pool.release(connection);
}

exports.getPurchasedList=getPurchasedList;
exports.insert=insert;
exports.select=select;
exports.renderCategories=renderCategories;
exports.renderProducts=renderProducts;
exports.getProductDetails=getProductDetails;
exports.addToCart=addToCart;
exports.displaycart=displaycart;
exports.clearcart=clearcart;
exports.insertProduct=insertProduct;
exports.removeProduct=removeProduct;