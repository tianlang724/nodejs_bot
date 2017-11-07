var builder=require('botbuilder');
var restify=require('restify');
var connector=new builder.ChatConnector();
var bot=new builder.UniversalBot(connector);
// bot.dialog('/',function(session){
// 	session.send('Hello,bot');
// 	var userMessage=session.message.text;
// 	session.send('you said:'+userMessage);
// });
bot.dialog('/',[
	function(session){
		session.beginDialog('/createSubscription');
	}
	]);
bot.dialog('/createSubscription',function (session, args) {
    // Serialize users address to a string.
    var address = JSON.stringify(session.message.address);

    // Save subscription with address to storage.
    session.sendTyping();
    createSubscription(args.userId, address, function (err) {
        // Notify the user of success or failure and end the dialog.
        var reply = err ? 'unable to create subscription.' : 'subscription created';
        session.endDialog(reply);
    }); 
});
var server=restify.createServer();
server.listen(process.env.port||process.env.PORT||3978,function(){
    console.log('%s listing to %s',server.name,server.url);
});
server.post('/api/messages',connector.listen());
