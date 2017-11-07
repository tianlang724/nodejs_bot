var builder=require('botbuilder');
var restify=require('restify');
var request=require('request');
var rp = require('request-promise');
var fs=require('fs');
var connector=new builder.ChatConnector();
var bot=new builder.UniversalBot(connector);

var weatherKey='5779ee16101f48d7af94b4f8202e08b5';
var movieKey='YHuOxuOWH2OCqUhikt7FtGWmy7ebGwuo	';
var https_options = {
    key: fs.readFileSync('/etc/ssl/self-signed/server.key'),
    certificate: fs.readFileSync('/etc/ssl/self-signed/server.crt')

};
var server=restify.createServer(https_options);
//var server=restify.createServer();
server.listen(process.env.port||process.env.PORT||3978,function(){
    console.log('%s listing to %s',server.name,server.url);
});
server.post('/api/messages',connector.listen());
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/1b46ba2d-52a7-4427-954d-268446dc31c2?subscription-key=afa8ed36918e4a8c93caab069b0472ec&timezoneOffset=0&verbose=true&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/',dialog);
dialog.matches('未来天气',[
    function(session,args,next){
        session.beginDialog('/checklocation',args);
    },
    function(session,args,next){
        var location=session.userData.location;
        var url='https://free-api.heweather.com/v5/search?city='+encodeURIComponent(location)+'&&key='+weatherKey;
        rp(url).then(function(body){
            var text=JSON.parse(body);
              var id=text.HeWeather5[0].basic.id;
              session.userData.id=id;         
        }).then(function(){
            var id=session.userData.id
            var url2='https://free-api.heweather.com/v5/forecast?city='+id+'&key='+weatherKey;
            rp(url2).then(function(body){
              var text=JSON.parse(body);
              var data=text.HeWeather5[0].daily_forecast[0];
              var ret=session.userData.location+'天气：白天天气：'+data.cond.txt_d+'，晚上天气：'+data.cond.txt_n+'，最高温度:'+data.tmp.max+'，最低温度:'+data.tmp.min+'，风向：'+data.wind.dir+'，风力：'+data.wind.sc+'级';
              session.endDialog(ret);
            });
        }).catch(function(err){
            session.endDialog("出错了");
        });
    }
]);
dialog.matches('天气详情',[
    function(session,args){
       session.beginDialog('/checklocation',args);
   },
   function(session,result){
        var location=session.userData.location;
        var url='https://free-api.heweather.com/v5/search?city='+encodeURIComponent(location)+'&&key='+weatherKey;
        rp(url).then(function(body){
            var text=JSON.parse(body);
              var id=text.HeWeather5[0].basic.id;
              session.userData.id=id;         
        }).then(function(){
            var id=session.userData.id
            var url2='https://free-api.heweather.com/v5/hourly?city='+id+'&key='+weatherKey;
            rp(url2).then(function(body){
              var text=JSON.parse(body);
              var ret=session.userData.location+'详细信息如下：'+'\n';
              var data=text.HeWeather5[0].hourly_forecast;
              for(var i=0;i<data.length;i++){
                  ret+=data[i].date+':天气状况：'+data[i].cond.txt+',降水概率：'+data[i].pop+'%,温度：'+data[i].tmp+'摄氏度。';
              }
              session.endDialog(ret);
            });
        }).catch(function(err){
            session.endDialog("出错了");
        });
   }
]);
dialog.matches('实时天气',[
    function(session,args){
        session.beginDialog('/checklocation',args);
    },
    function(session,result){       
        var location=session.userData.location;
        var url='https://free-api.heweather.com/v5/search?city='+encodeURIComponent(location)+'&&key='+weatherKey;
        rp(url).then(function(body){
            var text=JSON.parse(body);
              var id=text.HeWeather5[0].basic.id;
              session.userData.id=id;         
        }).then(function(){
            var id=session.userData.id
            var url2='https://free-api.heweather.com/v5/now?city='+id+'&key='+weatherKey;
            rp(url2).then(function(body){
              var text=JSON.parse(body);
              var data=text.HeWeather5[0].now
              var ret=session.userData.location+'当前天气：'+data.cond.txt+'，体感温度：'+data.fl+'，温度：'+data.tmp+',风向：'+data.wind.dir+',风力：'+data.wind.sc+'级';
              session.endDialog(ret);
            });
        }).catch(function(err){
            session.endDialog("出错了");
        });
    }
]);
dialog.matches('出行',[
    function(session,args){
       session.beginDialog('/checklocation',args);
   },
   function(session,result){
        var location=session.userData.location;
        var url='https://free-api.heweather.com/v5/search?city='+encodeURIComponent(location)+'&&key='+weatherKey;
        rp(url).then(function(body){
            var text=JSON.parse(body);
              var id=text.HeWeather5[0].basic.id;
              session.userData.id=id;         
        }).then(function(){
            var id=session.userData.id
            var url2='https://free-api.heweather.com/v5/suggestion?city='+id+'&key='+weatherKey;
            rp(url2).then(function(body){
              var text=JSON.parse(body);
              var data=text.HeWeather5[0].suggestion.trav;
              var ret=session.userData.location+'总体情况：'+data.brf+',出行建议:'+data.txt;
              session.endDialog(ret);
            });
        }).catch(function(err){
            session.endDialog("出错了");
        });
   }
]);
dialog.matches('紫外线',[
    function(session,args){
       session.beginDialog('/checklocation',args);
   },
   function(session,result){
        var location=session.userData.location;
        var url='https://free-api.heweather.com/v5/search?city='+encodeURIComponent(location)+'&&key='+weatherKey;
        rp(url).then(function(body){
            var text=JSON.parse(body);
              var id=text.HeWeather5[0].basic.id;
              session.userData.id=id;         
        }).then(function(){
            var id=session.userData.id
            var url2='https://free-api.heweather.com/v5/suggestion?city='+id+'&key='+weatherKey;
            rp(url2).then(function(body){
              var text=JSON.parse(body);
              var data=text.HeWeather5[0].suggestion.uv;
              var ret=session.userData.location+'紫外线强度：'+data.txt;
              session.endDialog(ret);
            });
        }).catch(function(err){
            session.endDialog("出错了");
        });
   }
]);
dialog.matches('穿衣',[
    function(session,args){
       session.beginDialog('/checklocation',args);
   },
   function(session,result){
        var location=session.userData.location;
        var url='https://free-api.heweather.com/v5/search?city='+encodeURIComponent(location)+'&&key='+weatherKey;
        rp(url).then(function(body){
            var text=JSON.parse(body);
              var id=text.HeWeather5[0].basic.id;
              session.userData.id=id;         
        }).then(function(){
            var id=session.userData.id
            var url2='https://free-api.heweather.com/v5/suggestion?city='+id+'&key='+weatherKey;
            rp(url2).then(function(body){
              var text=JSON.parse(body);
              var data=text.HeWeather5[0].suggestion.drsg;
              var ret=session.userData.location+'概况：'+data.brf+',穿衣建议:'+data.txt;
              session.endDialog(ret);
            });
        }).catch(function(err){
            session.endDialog("出错了");
        });
   }
]);
dialog.matches('运动',[
    function(session,args){
       session.beginDialog('/checklocation',args);
   },
   function(session,result){
        var location=session.userData.location;
        var url='https://free-api.heweather.com/v5/search?city='+encodeURIComponent(location)+'&&key='+weatherKey;
        rp(url).then(function(body){
            var text=JSON.parse(body);
              var id=text.HeWeather5[0].basic.id;
              session.userData.id=id;         
        }).then(function(){
            var id=session.userData.id
            var url2='https://free-api.heweather.com/v5/suggestion?city='+id+'&key='+weatherKey;
            rp(url2).then(function(body){
              var text=JSON.parse(body);
              var data=text.HeWeather5[0].suggestion.sport;
              var ret=session.userData.location+'总体情况：'+data.brf+',运动建议:'+data.txt;
              session.endDialog(ret);
            });
        }).catch(function(err){
            session.endDialog("出错了");
        });
   }
]);
dialog.matches('感冒',[
    function(session,args){
       session.beginDialog('/checklocation',args);
   },
   function(session,result){
        var location=session.userData.location;
        var url='https://free-api.heweather.com/v5/search?city='+encodeURIComponent(location)+'&&key='+weatherKey;
        rp(url).then(function(body){
            var text=JSON.parse(body);
              var id=text.HeWeather5[0].basic.id;
              session.userData.id=id;         
        }).then(function(){
            var id=session.userData.id
            var url2='https://free-api.heweather.com/v5/suggestion?city='+id+'&key='+weatherKey;
            rp(url2).then(function(body){
              var text=JSON.parse(body);
              var data=text.HeWeather5[0].suggestion.flu;
              var ret=session.userData.location+'总体情况：'+data.brf+',详情:'+data.txt;
              session.endDialog(ret);
            });
        }).catch(function(err){
            session.endDialog("出错了");
        });
   }
]);
// dialog.matches('热门电影',[
//     function(session,args,next){
//         session.beginDialog('/checklocation',args);
//     },
//     function(session,result){
//         var location=session.userData.location;
//         var url='http://api.map.baidu.com/telematics/v3/movie?qt=hot_movie&location='+encodeURIComponent(location)+'&output=json&&ak='+movieKey;
//         rp(url).then(function(body){
//             var text=JSON.parse(body);
//             var data=text.result.movie;
//             var ret='热门电影如下：';
//             for(var i=0;i<data.length;i++){
//                 ret+=i+'、'+data[i].movie_name+',上映国家：'+data[i].movie_nation+'，影片时间：'+data[i].movie_length+'，导演：'+data[i].movie_director+',类型：'+data[i].movie_tags+',介绍：'+data[i].movie_message;
//             }
//             session.send(ret);
//         }).catch(function(err){
//             session.endDialog("查询热门电影失败了");
//         });
//     }    
// ])
dialog.onDefault(builder.DialogAction.send("呜呜呜，听不懂你在说什么，人家只会查天气啦"));
bot.dialog('/checklocation',[function(session,args,next){
        var location = builder.EntityRecognizer.findEntity(args.entities, '地点');
        var nowlocation=location?location.entity:null;
        if((!nowlocation)&&(!session.userData.location)){
            builder.Prompts.text(session,"请问你要查寻什么地方？");
        }else{
            if(nowlocation){
                 session.userData.location=nowlocation;
            }
            next();
        }
    },
    function(session,results){
        if(results.response){
            session.userData.location=results.response;
        }
        session.endDialog({ response: 'ok'});
        // var location=session.userData.location;
        // var url='https://free-api.heweather.com/v5/search?city='+encodeURIComponent(location)+'&&key='+weatherKey;
        // request(url,function(error,response,body){
        //     if (!error && response.statusCode == 200) {
        //         var text=JSON.parse(body);
        //         var id=text.HeWeather5[0].basic.id;
        //         session.userData.id=id; 
        //     }else {
        //         session.endDialogWithResult('出错了',{ response: false});
        //     }
        // });
        // session.endDialogWithResult({ response: session.userData.id});
    }    
]);
