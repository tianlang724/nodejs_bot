var builder=require('botbuilder');
var restify=require('restify');
var connector=new builder.ChatConnector();
var bot=new builder.UniversalBot(connector);

var server=restify.createServer();
server.listen(process.env.port||process.env.PORT||3978,function(){
    console.log('%s listing to %s',server.name,server.url);
});
server.post('/api/messages',connector.listen());

bot.dialog('/',[
	function(session){
        session.beginDialog('/ensureProfile',session.userData.profile);
    },
    function(session,result){
        session.userData.profile=result.response;
        session.send("hello %(name)s! I love %(company)s!",session.userData.profile);
        //builder.Prompts.text(session,"hello"+session.userData.profile.name+",I love"+session.userData.profile.company);
    }
	]);
bot.dialog('/ensureProfile',[
    function(session,args,next){
        session.dialogData.profile=args||{};
        if(!session.dialogData.profile.name){
            builder.Prompts.text(session,"What is your name?");
        }else{
            next();
        }
    },
    function(session,result,next){
        if(result.response){
            session.dialogData.profile.name=result.response;
        }
        if(!session.dialogData.profile.company){
            builder.Prompts.text(session,"What company do you work for?");
        }else{
            next();
        }
    },
    function(session,result){
        if(result.response){
            session.dialogData.profile.company=result.response;
        }
        session.endDialogWithResult({ response:session.dialogData.profile });
    }
    ]);

