var builder=require('botbuilder');
var restify=require('restify');
var connector=new builder.ChatConnector();
var bot=new builder.UniversalBot(connector);
var server=restify.createServer();
server.listen(process.env.port||process.env.PORT||3978,function(){
    console.log('%s listing to %s',server.name,server.url);
});
server.post('/api/messages',connector.listen());
bot.dialog('/', [
    function (session) {
        session.beginDialog('/phonePrompt');
    },
    function (session, results) {
        session.send('Got it... Setting number to %s', results.response);
    }
]);
bot.dialog('/phonePrompt', [
    function (session, args) {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Enter the number using a format of either: '(555) 123-4567' or '555-123-4567' or '5551234567'")
        } else {
            builder.Prompts.text(session, "What's your phone number?");
        }
    },
    function (session, results) {
        var matched = results.response.match(/\d+/g);
        var number = matched ? matched.join('') : '';
        if (number.length == 10 || number.length == 11) {
            session.endDialogWithResult({ response: number });
        } else {
            session.replaceDialog('/phonePrompt', { reprompt: true });
        }
    }
]);