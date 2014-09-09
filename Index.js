/**
 * New node file
 */
var http=require('http');

var pool=require("./connectionpool");
var url=require('url');
var application_root = __dirname,
express = require("express"),
path = require("path"),
ejs = require("ejs");
var app = express();
var request = require("request");
var db=require('./dblayer');
app.configure(function () {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(application_root, "public")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.get('/index', function (req, res) {
	var str="";
	ejs.renderFile('index.ejs',
			{str:str},
			function(err, result) {
		// render on success
		if (!err) {
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
});

app.get('/adminLogIn',function(req,res){
	ejs.renderFile('adminlogin.ejs',{},function(err,result){
		if(!err){
			res.end(result)
		}
		else
			{
			console.log("error");
			}
	})
})

app.post('/admin',function(req,res){
	var username=req.param('username')
	var password=req.param('password')
	if(username=='meghapthakkar@gmail.com' && password=="jm")
		{
		console.log("checked admin credentials true")
	ejs.renderFile('insertproducts.ejs',{},function(err,result){
		if(!err)
			{
			res.end(result);
			}
	})
		}
	else {
		res.writeHead(404,"content-type:text/plain");
		res.write("Incorrect id password");
		res.end();
		
	}
})

app.post('/success',function(req,res){
	
	var productName=req.param('productName');
	var description=req.param('description');
	var qty=req.param('quantity');
	var price=req.param('price');
	var category=req.param("category");
	callback=function(req,res){
		ejs.renderFile('insertproducts.ejs',{},function(err,result){
			if(!err){
				res.end(result);
			}
		})
	}
	db.insertProduct(productName,description,qty,price,category,req,res,callback);
	
})

app.get('/signup',function(req,res){
	str="";
	ejs.renderFile('signup.ejs',{str:str},function(err,result)
	{
		if(!err){
			res.end(result);
		}
		else{
			res.end('An error occured');
			console.log(err);
		}
	})
	
	
	//console.log(req.param('name'));
})

app.get('/products',function(req,res){
	var query=url.parse(req.url).search;
	
	var ur=query.slice(1);
	var catname=ur.split("&");
	
	console.log(catname[0]+catname[1]);
	var callback=function(names,productId){ejs.renderFile('products.ejs',{names:names,productId:productId,username:catname[2],EmailId:catname[1]},function(err,result)
			{
				if(!err){
					res.end(result);
				}
				else{
					res.end('An error occured');
					console.log(err);
				}
			}
			)}
	db.renderProducts(catname[0],callback);
	
})

app.post('/AddToCart',function(req,res){
	//prodname,EmailId,Quantity,productId,price
	var prodname=req.param('ProductName');
	var EmailId=req.param('EmailId');
	var Quantity=req.param('Quantity');
	var productId=req.param('ProductId');
	var price=req.param("Price");
	console.log(prodname+EmailId+Quantity+productId+price)
	callback=function(){
		categories(req,res,EmailId,null);
	}
	db.addToCart(prodname,EmailId,Quantity,productId,price,callback)
	
	
})

	
function showcart(EmailId,req,res){
	console.log("inside method showcart")
		callback=function(EmailId,productName,QuantityBought,amount)
		{
		ejs.renderFile('cart.ejs',{EmailId:EmailId,productName:productName,quantityBought:QuantityBought,amount:amount}
		,function(err,result){
			if(!err){
				res.end(result);
			}
			else{
				res.end('An error occured');
			}
		});
		
}
	callback2=function(EmailId){
		categories(req,res,EmailId,null);
		
	}
	db.displaycart(EmailId,callback,callback2);

}

app.get('/showcart',function(req,res){
var query=url.parse(req.url).search;
	console.log("inside showcart");
	var EmailId=query.slice(1);
	showcart(EmailId,req,res);
})

function categories(req,res,EmailId,last_logged){
	var callback=function(names,username,EmailId){ejs.renderFile('product-catalog.ejs',{names:names,username:username,EmailId:EmailId,last_logged:last_logged},function(err,result)
			{
			console.log(last_logged+" in categories")
				if(!err){
					res.end(result);
				}
				else{
					res.end('An error occured');
					console.log(err);
				}
			}
			)}
	db.renderCategories(callback,EmailId);
};
/*
app.get('/categories',function(req,res){
	var callback=function(names){ejs.renderFile('product-catalog.ejs',{names:names},function(err,result)
			{
				if(!err){
					res.end(result);
				}
				else{
					res.end('An error occured');
					console.log(err);
				}
			}
			)}
	db.renderCategories(callback);
	
	

})*/

app.post('/logdetails',function(req,res){
	/*ejs.renderFile('loginfo.ejs',{},function(err,result)
			{
				if(!err){
					res.end(result);
				}
				else{
					res.end('An error occured');
					console.log(err);
				}
			}
			)*/
				var name=req.param('name');
	var lastname=req.param('lastname');
	var password=req.param('password');
	var pass2=req.param('password1')
	var email=req.param('email');
	console.log(name+lastname+password+email)
	if(name=="" || lastname==="" || password==="" || email===""){
		var str="Please enter all values";
		ejs.renderFile('signup.ejs',{str:str},function(err,result)
				{
					if(!err){
						res.end(result);
					}
					else{
						res.end('An error occured');
						console.log(err);
					}
				})
				
	}
	else if(email.indexOf("@")<=-1){
		str="Please enter a valid emailId"
		ejs.renderFile('signup.ejs',{str:str},function(err,result)
				{
					if(!err){
						res.end(result);
					}
					else{
						res.end('An error occured');
						console.log(err);
					}
				})
	
	}
	else if(password!=pass2){
		str="Password Mismatch"
			ejs.renderFile('signup.ejs',{str:str},function(err,result)
					{
						if(!err){
							res.end(result);
						}
						else{
							res.end('An error occured');
							console.log(err);
						}
					})
		
	}
	else {
	db.insert(name,lastname,email,password);
	res.writeHead(200,"content-type:text/plain");
	res.write('Thankyou '+name);
	res.end();
	}
		})

		
	app.get('/buy',function(req,res){
		var query=url.parse(req.url).search;
		var ur=query.slice(1);
		var proname=ur.split("&");
		
		
		var callback=function(prod,description,price,qty){ejs.renderFile('product-details.ejs',{ProductId:proname[3],EmailId:proname[2],names:prod,username:proname[1],description:description,price:price,qty:qty},function(err,result)
				{
			if(!err){
				res.end(result);
			}
			else{
				res.end('An error occured');
				console.log(err);
			}
		}
		)}
		 db.getProductDetails(proname[0],callback);
			
	})
		
app.post('/validate',function(req,res){
	var EmailId=req.param('username');
	var password=req.param('password');
	console.log("to validate: "+EmailId);
	if(EmailId.indexOf("@")>-1){
		console.log("contains @")
	db.select(function(err,rows,EmailId){
		//var numrows=rows.length;
		if(rows.length>0)
			{
			console.log("valid!!!")
			db.log(function(last_logged){
				console.log(last_logged);
				categories(req,res,EmailId,last_logged);
				
			},EmailId)

			console.log(EmailId);
			}
		else
			{
			var str="Please enter valid username and password";
			ejs.renderFile("index.ejs",{str:str},function(err,results){
				if(err){
					console.log(err);
				}
				else{
					res.end(results);
				}
			})
			console.log("Validation failure");
			
			}
		}
	,EmailId,password);
	}
	else 
		{
		console.log("rendering")
		var str="Please enter a valid email address in username";
		ejs.renderFile("index.ejs",{str:str},function(err,results){
			if(err){
				console.log(err);
			}
			else{
				res.end(results);
			}
		})
		}
		
	
})

app.post('/login',function(req,res){
	ejs.renderFile('login.ejs',{},function(err,result)
	{
		if(!err){
			res.end(result);
		}
		else{
			res.end('An error occured');
			console.log(err);
		}
	}
	)
//	console.log(req.param('name'));
})

app.post('/validateCard',function(req,res){
	
	var EmailId=req.param('EmailId');
	console.log(EmailId);
	var creditcardnumber=req.param('creditcard');
	
		if(creditcardnumber.length==16){
			db.clearcart(EmailId);
			console.log("before rendering validation "+EmailId);

			ejs.renderFile("validation.ejs",{EmailId:EmailId},function(err,results){
				
				if(!err){
					
					res.end(results);
				}
				else{
					res.end('An error occured');
					console.log(err);
				}
			});
		}
		else
			{
			str="Please enter a valid card!"
			ejs.renderFile("checkout.ejs",{EmailId:EmailId,str:str},function(err,results){
				if(!err){
					res.end(results);
				}
				else{
					res.end('An error occured');
					console.log(err);
				}
			});
	}
	
})

app.get('/checkout',function(req,res){
	var query=url.parse(req.url).search;
	var EmailId=query.slice(1);
	str="";
	ejs.renderFile("checkout.ejs",{EmailId:EmailId,str:str},function(err,results){
		if(!err){
			res.end(results);
		}
		else{
			res.end('An error occured');
			console.log(err);
		}
	})
})

app.get('/continueshopping',function(req,res){
	var query=url.parse(req.url).search;
	var EmailId=query.slice(1);
	categories(req,res,EmailId,null);

	
})

app.get('/remove',function(req,res){
	var query=url.parse(req.url).search;
	var urlval=query.slice(1);
	var atts=urlval.split("&");
	var EmailId=atts[0];
	var ProductName=atts[1];
	db.removeProduct(EmailId,ProductName,function(){

		showcart(EmailId,req,res);
	});
})
var server = app.listen(8000, function() {
    console.log('Listening on port %d', server.address().port);

    pool.pool();
    });

app.get('/ViewPurchasedItems',function(req,res){
	console.log("viewPurchased Clicked!")
	var query=url.parse(req.url).search;
	var EmailId=query.slice(1);
	callback=function(products){
		console.log("inside items callback")
		ejs.renderFile("ItemsBought.ejs",{products:products,EmailId:EmailId},function(err,results){
			if(!err){
				res.end(results);
			}
			else{
				res.end('An error occured');
				console.log(err);
			}
		})
}
	
	db.getPurchasedList(EmailId,callback);
})







