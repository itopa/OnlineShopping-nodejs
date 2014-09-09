/**
 * New node file
 */

	var connectionPool=[];
	var sizeofpool=10;
	var timerjob=require("timer-jobs")
function createConnection()
{
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'jerrymouse',
	  port: '3306',
	  database: 'amazon'
	});
	//connection.connect();
	
	return connection;
}

exports.pool=function()
{
	for(i=0;i<10;i++)
		{
		var connection=createConnection();
		connectionPool.push(connection);

		//console.log(connectionPool[i]);

		}
}


exports.getconnection=function(){
	
	var con=connectionPool.pop();
	
	console.log("getting"+connectionPool.length);
	return con;

}
var Timer = new timerjob({interval: 1}, function(done) {
	//console.log(connectionPool.length)
	if(connectionPool.length <=3 ){    	
    	increasePoolLength();    	
    }
	

	if(connectionPool.length >(0.8*sizeofpool)){
		decreasePool();
	}
	
    done();
});

Timer.start();

exports.returnToPool=function(connection){
	connectionPool.push(connection);
	console.log("connection returned: new length"+connectionPool.length);
}

function increasePoolLength(){
	
	
	for(i=0;i<sizeofpool;i++)
	{
	var connection=createConnection();
	connectionPool.push(connection);

	//console.log(connectionPool[i]);

	}
	if(sizeofpool<75){
	sizeofpool*=2;
	}

}

function decreasePool(){
	for(i=0;i<sizeofpool/2;i++)
	{
	
	var con = connectionPool.pop();
	con = null;
//	connection.end();
	//console.log(connectionPool[i]);

	}
	
}