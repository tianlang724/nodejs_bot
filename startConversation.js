var builder=require('botbuilder');
var restify=require('restify');
var connector=new builder.ChatConnector();
var bot=new builder.UniversalBot(connector);
var server=restify.createServer();
server.listen(process.env.port||process.env.PORT||3978,function(){
    console.log('%s listing to %s',server.name,server.url);
});
server.post('/api/messages',connector.listen());



server.post('/api/standup', function (req, res) {
    // Get list of team members to run a standup with.
    var members = req.body.members;
    var reportId = req.body.reportId;
    for (var i = 0; i < members.length; i++) {
        // Start standup for the specified team member
        var user = members[i];
        var address = JSON.parse(user.address);
        bot.beginDialog(address, '/standup', { userId: user.id, reportId: reportId });
    }
    res.status(200);
    res.end();
});

bot.dialog('/standup', [
    function (session, args) {
        // Remember the ID of the user and status report
        session.dialogData.userId = args.userId;
        session.dialogData.reportId = args.reportId;

        // Ask user their status
        builder.Prompts.text(session, "What is your status for today?");
    },
    function (session, results) {
        var status = results.response;
        var userId = session.dialogData.userId;
        var reportId = session.dialogData.reportId;

        // Save their repsonse to the daily status report.
        session.sendTyping();
        saveTeamMemberStatus(userId, reportId, status, function (err) {
            if (!err) {
                session.endDialog('Got it... Thanks!');
            } else {
                session.error(err);
            }
        });
    }
]);
bot.dialog('/',[
	function(session){
		builder.Prompts.text(session,'Please enter your name');
	},
	function(session,result){
		session.send('hello,'+result.response);
        session.beginDialog('/standup');
	}
	]);