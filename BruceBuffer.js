console.log("START - Listening on http://127.0.0.1:8888");
//___OPENING SERVER STUFF__________________________________________________________

// requires node's http module
var http = require('http');

// creates a new httpServer instance
http.createServer(function (req, res) {
  // this is the callback, or request handler for the httpServer

  // respond to the browser, write some headers so the 
  // browser knows what type of content we are sending
  res.writeHead(200, {'Content-Type': 'text/html'});

   //QA - Checkpoint A
   res.write('<h1>Things seem to be working for Bruce.</h1>');

//__CLOSING SERVER STUFF___________________________________________________________ */
  // close the response
  res.end();
}).listen(process.env.PORT || 8888); // the server will listen on "process.env.PORT" if it exists (Heroku!), or port 8888 as a default fallback


//___START BOT STUFF__________________________________________________________
var Bot    = require('./index');
console.log('Things are working at checkpoint B.');
var AUTH   = 'vzYqJzImNcvheHERMcsJuJCS'; // Bruce Buffer
var USERID = '502196a3eb35c174e3000023'; // Bruce Buffer
var ROOMID = '4f9ac260eb35c15fcc0001e1'; // Grotto

//BOTS
  // Bruce Buffer
      // AUTH = vzYqJzImNcvheHERMcsJuJCS
      // USERID = 502196a3eb35c174e3000023

//ROOM IDs
// Easy Grotto: 4f9ac260eb35c15fcc0001e1
// Goodle Days: 5019e9cdaaa5cd4000000082
// The Drunk Room: 4f55f37a0c4cc8054f710976;

var bot = new Bot(AUTH, USERID, ROOMID);

   console.log('Things are working at checkpoint C.');


/***************************************************************************
* STAY AWAKE ON HEROKU!! 
* This section pings itself every 10 minutes to keep Bruce alive
* The reason for this is because on Heroku's free tier, the app goes to sleep after 1hr of no activity on the site
*
*/

var minutes = 20, the_interval = minutes * 60 * 1000;

setInterval(function() {
  console.log("I am doing my check");

  var options = {
      host: 'bruce-buffer.herokuapp.com'
  };

  http.get(options, function (http_res) {
      console.log("Sent http request to bruce-buffer.herokuapp.com to stay awake.");
  });

}, the_interval);


/***************************************************************************
* SPEAK 
* This section listens for when people say things, and responds accordingly
*
*/

bot.on('speak', function (data) {
   // Get the data
   var name = data.name;
   var userId = data.userid;
   var text = data.text;

   // Respond to various incarnations of "hello bruce" command
   if (text.toLowerCase().match(/^(hello|hi|hey|yo|sup|what\'?s up|howdy) bruce/)) {
      //This array is loaded with responses to greetings from people in the room.
      //Teh function selects a random saying from the above array and say it to the room
      var greetingArray = ['yo dude - ready to rage?','Hey! What\'s the good word @'+name+'?', 'Howdy @'+name, 'wuzzzzzzuuuppppppp', 'Don\'t beat around the bush '+name+'... you gonna pass that shit?','whalecum to the party','Quit bogarting that joint!','You realize you are talking to nothing more than a text file, right? ugh...','less talk more tunes '+name+'!','Hey '+name+'. Wanna get high?','hey '+name+' I\'m glad your here. Sit down, take a load off.','It wasn\'t me I swear! Blame @stillwaterlive!!','sup brah?','Hello '+name+', we\'ve been expecting you.','hey I just got a fresh batch of nitrous brownies. Want one?'];
      bot.speak(greetingArray[getRandomIndex(greetingArray)]);
   }

   // Log Playlist - for QA purposes
   if (text.toLowerCase().match(/^logpl/)) {
        logPlaylist();
        bot.speak('logged');
   }

   // Respond to 'UFC' with Bruce Buffer's signature scream
   if (text.toLowerCase().match(/^ufc$/)) {
        bot.speak('LET\'S GET READY TO RUMMMMBBBBBLLLLEEEEE!');
   }

   // Say Playlist Length
   if (text.toLowerCase().match(/^\/playlistlength/)) {
        speakPlaylistLength();
   }

   // Respond to various incarnations of "hello bruce" command
   if (text.toLowerCase().match(/^(thanks|thank you) bruce/)) {
      var thanksArray = ['You\'re very welcome, '+name,'no problemo','sure thing','you owe me one!'];
      bot.speak(thanksArray[getRandomIndex(thanksArray)]);
   }

   // Make the bot DJ with the "/botParty" command
   if (text.toLowerCase().match(/^\/botparty/)) {
      isRoomMod(userId, function(isMod) {
        if(isMod){
          //If this person is a mod, the bot will DJ
          bot.addDj();
        } else {
          //Otherwise if they aren't a mod and don't have permission, tell them
          bot.speak('You can\'t tell me what to do, @'+name+'!');
        }
      });
   }

   // Remove the bot from the DJ booth with the "/stepDown" command
   if (text.toLowerCase().match(/^\/stepdown/)) {
      isRoomMod(userId, function(isMod) {
        if(isMod){
          //If this person is a mod, the bot will DJ
          bot.remDj();
        } else {
          //Otherwise if they aren't a mod and don't have permission, tell them
          bot.speak('You can\'t tell me what to do, @'+name+'!');
        }
      });
   }

   // Tell the bot to add a song to its playlist with the "/addSong" command
   if (text.toLowerCase().match(/^\/addsong/)) {
      isRoomMod(userId, function(isMod) {
        if(isMod){
            //This will make the bot snag any songs that make him dance
            getCurrentSongId(function(currSongId){
                console.log("This song is: "+currSongId); //QA

                addCurrentSongToPlaylist(currSongId, function(added){
                  console.log("The song was added: "+added); //QA

                  //This makes the bot tell the room if he snagged it or not
                  if(added == true){
                    bot.speak('Ah great choice, '+name+'. Consider it added.');
                  }else{
                    bot.speak('got it already, nice try.');
                  }

                });//addCurrentSongtoPlaylist
            }); //getCurrentSongId
        } else {
          //Otherwise if they aren't a mod and don't have permission, tell them
          bot.speak('You can\'t tell me what to do, @'+name+'!');
        }
      });
   }

/*   // Shuffle up the Bot's playlist with the "/shuffle" command
   if (text.toLowerCase().match(/^\/shuffle/)) {
      isRoomMod(userId, function(isMod) {
        if(isMod){
          //If this person is a mod, the playlist will get shuffled up
          shuffleBotPlaylist();
          bot.speak('Thanks for the shake @'+name+' - I got some fresh tunes for y\'all now!');
        } else {
          //Otherwise if they aren't a mod and don't have permission, tell them
          bot.speak('You can\'t tell me what to do, @'+name+'!');
        }
      });
   }
*/
/*   // Remove the current song from the bot's playlist with the "/trashsong" command
   if (text.toLowerCase().match(/^\/trashsong/)) {
      isRoomMod(userId, function(isMod) {
        //If this person is a mod...
        if(isMod){
          //and if the bot is the active DJ...
          getActiveDjId(function(isActive){
            if (USERID == isActive){
              //remove song from bot's playlist
              bot.playlistRemove();
              bot.speak('Frankly, I didn\'t like that song either');
            } else{
              bot.speak('Let\'s wait to hear what I have queued up before you pull the trigger @'+name);
            }
          });//getActiveDjId
        } else {
          //Otherwise if they aren't a mod and don't have permission, tell them
          bot.speak('You can\'t tell me what to do, @'+name+'!');
        }
      });
   }*/

   // If the bot is DJing, tell him to skip his song with the "/skipSong" command
   if (text.toLowerCase().match(/^\/skipsong/)) {
      isRoomMod(userId, function(isMod) {
        if(isMod){
          //If this person is a mod, the bot will DJ
          bot.skip();
        } else {
          //Otherwise if they aren't a mod and don't have permission, tell them
          bot.speak('You can\'t tell me what to do, @'+name+'!');
        }
      });
   }

   // Respond to "/commands" command
   if (text.toLowerCase().match(/^\/commands$/)) {
      bot.speak('My Standard Commands: q+, q-, q?, q.shift, q.clear, UFC, /commands ...I also appreciate when people say hi!');
      bot.speak('My DJ Commands: /botParty, /botDown, /skipSong, /playlistLength /addsong .... these are for mods only at the moment.');
   }
});

   console.log('Things are working at checkpoint D.');
/***************************************************************************
* BONUS POINT - "YEEHAW" TEXT BASED
*This section gives the DJ a bonus point if 50% of people say any phrase that includes "yeehaw"
*
*/
/* << REMOVE THIS TO ACTIVE THIS SECTION (and the other one at the bottom)
bonusBopCount = new Array();

bot.on('speak', function (data) {
   var text = data.text;
   var name = data.name;
   var userId = data.userid;

   // Any command with "yeehaw" will increase the bop count by 1
   //The bop count length is indicated by the length of the array 'bonusBopCount' which stores each user's name that yeehaws to prevents a single user from using multiple yeehaws
   if (text.toLowerCase().match(/yeehaw/)) {
      console.log('yeehaw'); //QA

      //Index is the position in the queue that this person's name is found.
      //If its not found, -1 is returned.
      var index = bonusBopCount.indexOf(name);

      //If the persons name is not already in the array, increase the bop count and add them
      if(index == -1){
        bonusBopCount.push(name);
        console.log('bonusBotCount = '+bonusBopCount.length); //QA
      } else{
        console.log('Repeat! bonusBotCount ='+bonusBopCount.length); //QA
      }
   }

  getHeadCount(function(count) {

    //Threshold is 50% of the user count
    var threshold = .5*count;

    //If more than 50% of users give their bonus vote, the bot will bop!
    if(bonusBopCount.length >= threshold){
      bot.vote('up');
    }
  });

}); //Close bot.on('speak')

// Reset bonusBopCount per new song
bot.on('newsong', function (data) {
   bonusBopCount = [];
});

REMOVE THIS TO ACTIVE THIS SECTION >> */

/***************************************************************************
* BONUS POINT - AWESOME BASED
*This section gives the DJ a bonus point if 2+ people say any phrase that includes "yeehaw"
*
*/

bot.on('update_votes', function (data) {
    getHeadCount(function(headCount) {
      
      //Get current number of upvotes
      var upVotes = data.room.metadata.upvotes;

      //Threshold is 50% of the user count
      var threshold = .5*headCount;

      console.log('the threshold is: '+threshold);//QA
      console.log('the bop count is: '+upVotes);//QA

      //If more than 50% of users give their bonus vote, the bot will bop!
      if(upVotes - threshold < 1 && upVotes - threshold >= 0 && headCount > 2){
        //If the bot is the active DJ, then just show some love
        getActiveDjId(function(isActive){
            if (USERID == isActive){
              bot.speak("Thanks for the love y\'all");
            }else{
            //If the bot is not the active DJ, then Bop and add to playlist if its a new song
                bot.vote('up');
                console.log('bonus! ');//QA

                //This array is loaded with responses to greetings from people in the room.
                var danceArray = ['I just wanna dance!','Jonesin\' on this track!','sick beat',':ok_hand: a-okay!','Shake ya boot-ay!!','thats the one!','yup.','this song is making my virtual head shake','I\'m only crying cause this song speaks to me :blush:',':+1:'];
                //Select a random saying from the above array and say it to the room
                bot.speak(danceArray[getRandomIndex(danceArray)]);

            }//If USERID == activeDj
        });//getActiveDJ
      }//If votes > 50%
    }); //getHeadCount
});//bot.on('update_votes')

   console.log('Things are working at checkpoint E.');


/***************************************************************************
* END OF SONG STATS
* When a song is over, Bruce will tell the room how many awesomes
*
* https://github.com/alaingilbert/Turntable-API/blob/master/turntable_data/endsong.js
*
*/
bot.on('endsong', function (data) {
    var ups = data.room.metadata.upvotes;
    var downs = data.room.metadata.downvotes;
    var listeners = data.room.metadata.listeners;
    var album = data.room.metadata.current_song.metadata.album;
    var artist = data.room.metadata.current_song.metadata.artist;
    var song = data.room.metadata.current_song.metadata.song;

    bot.speak('That was '+artist+' playing '+song+' (album: '+album+'). It got '+ups+' awesomes and '+downs+' lames with '+listeners+' people listening.');

});

/***************************************************************************
* BOT MODERATOR MESSAGE
* When someone is a moderator in the array AND types in "/mod", the bot displays a message.
*
*/

// Define global variable "modList" as an array of USERIDs
var modList = ['4dfb617b4fe7d061df013786', 'xxxxxxxxxxxxxxxxxxxxxxxx']; //Scruggs

// When someone is a bot moderator in the array AND types in "/botmod", the bot displays a message.
bot.on('speak', function (data) {
   var name = data.name;
   var text = data.text;
   var userid = data.userid;

   for (var i=0; i<modList.length; i++) {
      if (userid == modList[i]) {


         // Respond to "/botmod" command
         if (text.match(/^\/botmod/)) {
            bot.speak('Yo @'+data.name+', it looks like you are a bot moderator!');
         }
 
         // If a botmod PMs the bot and starts with "/msg", the bot will
         if (text.match(/^\/msg /)) {
            bot.speak(text.substring(3));
         }         
         break;
      }
   }

});

// When someone is a bot moderator in the array AND pm's the bot a note that starts with "/msg ", the bot says the message to the room.
bot.on('pmmed', function (data) {
   var text = data.text;
   var senderid = data.senderid;

   for (var i=0; i<modList.length; i++) {
      if (senderid == modList[i]) {
 
         // If a botmod PMs the bot and starts with "/msg ", the bot will say it to the room!
         if (text.match(/^\/msg /)) {
            bot.speak(text.substring(5));
         }         
         break;
      }
   }

});

   console.log('Things are working at checkpoint F.');

/***************************************************************************
* BLACKLIST
* This portion of code blocks ttstats bots and anyone in the array
* 
*/

// When someone enters the room, the bot checks whether or not that user is a ttstats bot
bot.on('registered', function (data) {
  var user = data.user[0];
  var name = user.name;
  var userId = user.userid;
  var bootArray = ['BAM!','Smell ya later!','HOO RAH!','you smell awful', 'i don\'t give reasons','i laugh in the face of danger', 'spy!','Take that!','AND STAY OUT!','Sing by the window, I\'ll help you out','git r dun!','and don\'t call me either!','good luck getting home - I slashed your tires'];

  if (name.toLowerCase().match(/ttstats/)) {
    bot.bootUser(user.userid, bootArray[getRandomIndex(bootArray)]);
  }

  
  //Example: bot.speak(bootArray[getRandomIndex(bootArray)]);

});

/***************************************************************************
* QUEUE
* This is the q.
* Regular Commands: q+  q-  q?
* Mod Commands: q.shift   q.clear
*
* Other Functions:
*      1. When first in queue steps up
*      2. When not first in q steps up
*      3. When someone in q leaves room
       4. When a seat opens up
*/

// Define global variable "queue" as an array of users
var queue = new Array();

// When someone speaks, listen to see if it is one of the q commands
bot.on('speak', function (data) {
   var name = data.name;
   var text = data.text;
   var userId = data.userid;

   // q+ :: Add to Queue
  if (text.toLowerCase().match(/^q\+$/)) {

      //First we look to see if they are already a DJ.
      //Index is the position in the queue that this person's name is found.
      //If its not found, -1 is returned.
      var index = queue.indexOf(name);

      isCurrentDJ(userId, function(isDJ) {
        //If the user is already in the queue
        if(isDJ){
          //Tell them they are already in there
          bot.speak('You are already a DJ, '+name);
        } else if(index > -1){
          //Otherwise if they are already a DJ tell them that
          bot.speak('You are already on the list, '+name);
        }else{
          //Otherise if they are not in the queue add user to end of queue
          queue.push(name);
          //Tell them about it and the updated q
          bot.speak(name+' has been added to queue.');
        }
      });
  }

  // q- :: Remove from Queue
  if (text.toLowerCase().match(/^q\-$/)) {

      //Index is the position in the array that this person's name is found.
      //If its not found, -1 is returned.
      var index = queue.indexOf(name);

      //If the user is in the queue
      if(index > -1){
        //REMOVE THEM
        queue.splice(index,1)
        //Tell them that they've been removed
        bot.speak(name+' has been removed from the queue.');
      } else{
        //Otherise tell them they are not on the queue
        bot.speak(name+' is not in the queue.');
      }

  }

  // q? :: Display q
  if (text.toLowerCase().match(/^q\?$/)) {
    //If the queue is not empty
      if(queue.length > 0){

        //Define displayQ variable
        var displayQ = "";
        //Logic to show queue
        var i;
        for(i=0; i < queue.length; i++){
          var placeInQ = i + 1;
          displayQ += ' ['+placeInQ+'] '+ queue[i];
        }
        //Reply with the queue list
        bot.speak('Queue: '+ displayQ);
      }else{
        //Otherwise say there is no queue.
        bot.speak('The queue is empty. Type q+ to add youself.');
        console.log('User typed "q?"');
      }
  }

  // q.shift :: Remove the first person from the queue, but only if triggered by a room mod
  if (text.toLowerCase().match(/^q\.shift$/)) {

      isRoomMod(userId, function(isMod) {
        //If the user is already in the queue
        if(isMod){
          //If this person is a mod, shift the queue (aka remove the first person off the queue.)
          queue.shift();
        } else {
          //Otherwise if they aren't a mod and don't have permission, tell them
          bot.speak('You can\'t tell me what to do, @'+name+'!');
        }
      });
  }

  // q.clear :: Clear the queue entirely
  if (text.toLowerCase().match(/^q\.clear$/)) {

      isRoomMod(userId, function(isMod) {
        //If the user is already in the queue
        if(isMod){
          //If this person is a mod, shift the queue (aka remove the first person off the queue.)
          queue = [];
        } else {
          //Otherwise if they aren't a mod and don't have permission, tell them
          bot.speak('You can\'t tell me what to do, @'+name+'!');
        }
      });
  }


}); //Closes the speak listener for the Queue script

//When a user leaves the room, if they are on the q you have to remove them
// on('deregistered', function ([data](https://github.com/alaingilbert/Turntable-API/blob/master/turntable_data/deregistered.js)) { })
bot.on('deregistered', function (data) {
  var user = data.user[0];
  var name = user.name;
  var userId = user.userid;

  //Index is the position in the array that this person's name is found.
  //If its not found, -1 is returned.
  var index = queue.indexOf(name);

  //If the user is in the queue
  if(index > -1){
    //REMOVE THEM
    queue.splice(index,1)
    //Tell the room that the person left and has been removed
    bot.speak(name+' is too good to q- before (s)he left the room. What a dick! Good thing I\'m here :)');
  }

});

//When a user steps up to become a DJ, if they are first in line allow it, otherwise remove them from the table and tell them why.
// on('add_dj', function ([data](https://github.com/alaingilbert/Turntable-API/blob/master/turntable_data/add_dj.js)) { })
bot.on('add_dj', function (data) {
  var user = data.user[0];
  var name = user.name;
  var userId = user.userid;
  var firstInLine = queue[0];

  console.log('This user is first in line: '+firstInLine); //QA
  console.log('This user just stepped up to DJ: '+name); //QA

  if(queue.length > 0){
    if(name == firstInLine){
      queue.shift();
      console.log('This is the right DJ'); //QA
    } else{
      bot.remDj(userId);
      bot.speak('Nice try @'+name+', but it is actually @'+firstInLine+'\'s turn! If you aren\' already in the queue, type \'q+\' to get on there.');
      console.log('This is the wrong DJ'); //QA
    }
  }

});

//When a DJ steps down, alert the next person in line to get up there
// on('rem_dj', function ([data](https://github.com/alaingilbert/Turntable-API/blob/master/turntable_data/rem_dj.js)) { })
bot.on('rem_dj', function (data) {
  var name = data.name;
  var userId = data.userid;
  var firstInLine = queue[0];

  if(queue.length > 0){
    bot.speak('Hey @'+firstInLine+' I hope you\'re ready cause it\'s your turn to lay down something nasty!');
  }

});

/***************************************************************************
* STANDALONE FUNCTIONS
* The following functions are used for the Queue Script, and I'm sure will also be reused elsewhere.
*/
  // FUNCTION :: isRoomMod(user_id, callback) ::
  //Function to determine if the user is currently a DJ
    function isRoomMod(user_id, callback){
      bot.roomInfo(false, function (data) {
        var roomModList = data.room.metadata.moderator_id;
        for (i = 0; i < roomModList.length; i++){
          if (roomModList[i] == user_id){
            console.log('recognized as a room moderator');
            return callback(true);
          }
        }
        callback(false);
      });
    }

    // FUNCTION :: isCurrentDJ(user_id, callback) ::
    //Function to determine if the user is currently a DJ
      function isCurrentDJ(user_id, callback){
        bot.roomInfo(false, function (data) {
          var djList = data.room.metadata.djs;
          for (i = 0; i < djList.length; i++){
            if (djList[i] == user_id){
              return callback(true);
            }
          }
          callback(false);
        });
      }

    // FUNCTION :: getHeadCount(callback) ::
    //Function to determine how many users are in the room
      function getHeadCount(callback){
        bot.roomInfo(false, function (data) {
          var userList = data.users;
          return callback(userList.length);
        });
      }

    // FUNCTION :: getCurrentSongId(callback) ::
    //Function to fetch the current songId
      function getCurrentSongId(callback){
        bot.roomInfo(true, function (data) {
          var songId = data.room.metadata.current_song._id;
          return callback(songId);
        });
      }

    // FUNCTION :: getActiveDj(callback) ::
    //Function to fetch the DJ that is currently spinning
      function getActiveDjId(callback){
        bot.roomInfo(true, function (data) {
          var activeDj = data.room.metadata.current_dj;

          console.log("Active DJ:"+activeDj);

          return callback(activeDj);
        });
      }

    // FUNCTION :: addCurrentSongToPlaylist(callback) ::
    //This function will add the the given song ID to the bot's playlist, if it doesn't already exist
    //CALLBACK VAR -- TRUE if the song was added -- FALSE if the song already existed
      function addCurrentSongToPlaylist(songId, callback){
          bot.playlistAll(function (data) {
              //Grab the bot's playlist
              var playList = data.list;
              //Variabe to determine if the bot already has this song
              var exist = 0;
          
              //Loop through the bot's playlist. If the current song is already there, set exist=1
              for (var i=0; i<playList.length; i++) {
                  if(songId == playList[i]._id){
                    exist = 1;
                  }
              }

              console.log("Exist: "+exist); //QA

              //If the bot does not already have the song, add it to the end of the playlist
              if(exist == 0){
                bot.playlistAdd(songId, playList.length);
                bot.snag();
                console.log("Song is not already in playlist, ADD! Total Tracks: "+playList.length); //QA
                return callback(true);
              }else{
                //Otherwise if the bot already has the song, tell the room
                console.log("Song already in playlist, NOT added Total Tracks: "+playList.length);
                return callback(false);
              }
          });
      }

    // FUNCTION :: getAwesomeCount(callback) ::
    //Function to determine how many awesomes a song has
      function getAwesomeCount(callback){
        bot.roomInfo(false, function (data) {
          var upvotes = data.room.metadata.upvotes;
          return callback(upvotes);
        });
      }

    // FUNCTION :: getRandomArbitaryNumber(min, max) ::
    //Returns a random number between the min and the max
    function getRandomArbitaryNumber (min, max) {
        return Math.random() * (max - min) + min;
    }

    // FUNCTION :: shuffleBotPlaylist() ::
    //Takes a random 20% of songs in the bot's playlist and moves them to the top of the playlist
    //WARNING - THIS FUNCTION DELETES SONGS!! DO NOT USE!!
    function shuffleBotPlaylist () {
        bot.playlistAll(function (data) {
            //Grab the bot's playlist
            var playList = data.list;
            //Get 20% of the list length
            var percentageOfPlaylist = Math.round(playList.length * .2);

            console.log("% of playlist: "+playList.length+" /2 = "+percentageOfPlaylist); //QA

            //Take a random 50 songs and bring them to the top of the playlist
            for (var i=0; i<percentageOfPlaylist; i++) {
              //get a random song index
              var s = Math.round(getRandomArbitaryNumber(1,playList.length-1));
              console.log("rando: "+s); //QA
              //Bring that song to the top
              bot.playlistReorder(s, 0);
            }
        console.log(data); //QA
        });
    }

    // FUNCTION :: getRandomIndex(theArray) ::
    //Pass in an array and this function will return a random index for the array
    function getRandomIndex (theArray) {
        return Math.round(getRandomArbitaryNumber(0,theArray.length-1));
    }



    // FUNCTION :: speakPlaylistLength() ::
    //Tells the room how many songs the bot has queued up
    function speakPlaylistLength () {
        bot.playlistAll(function (data) {
            //Grab the bot's playlist
            var playList = data.list;
            //Return length
            bot.speak("I currently have "+playList.length+" songs in my playlist sucka!");
        });
    }

    // FUNCTION :: logPlaylist() ::
    //This is really just for QA purposes - it logs the bots entire playlist
    function logPlaylist() {
        bot.playlistAll(function (data) {
          console.log(data); //QA
        });
    }

   console.log('Things are working at checkpoint G.');

console.log("END - Listening on http://127.0.0.1:8888");