const express = require("express");
const cors = require("cors");
const path = require('path');
const bodyParser = require("body-parser");
const http = require('http');

const PORT = process.env.PORT || 8080;

const app = express();

// var corsOptions = {
//   origin: "http://localhost:8081"
// };

// app.use(cors(corsOptions));

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Configurations for "Static-files"

app.use(express.static(`${__dirname}/public`));

// app.use(
//   cookieSession({
//     name: "bezkoder-session",
//     secret: "COOKIE_SECRET", // should use as secret environment variable
//     httpOnly: true
//   })
// );

const db = require("./app/models");
const Role = db.role;
const Result = db.result;

db.mongoose
  // .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
  .connect(`mongodb://localhost:27017/limbo`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

function initial() {
    Role.countDocuments()
        .then(count => {
            if (count === 0) {
                new Role({
                    name: "personal"
                }).save()
                    .then(() => console.log("added 'personal' to roles collection"))
                    .catch(err => console.error("error", err));
                    
                new Role({
                    name: "business"
                }).save()
                    .then(() => console.log("added 'business' to roles collection"))
                    .catch(err => console.error("error", err));
                
                new Role({
                    name: "moderator"
                }).save()
                    .then(() => console.log("added 'moderator' to roles collection"))
                    .catch(err => console.error("error", err));
                
                new Role({
                    name: "admin"
                }).save()
                .then(() => console.log("added 'admin' to roles collection"))
                .catch(err => console.error("error", err));
            }
        })
        .catch(err => console.error("error", err));
}

const WebSocket = require('ws');

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

wss.on('connection', function connection(ws) {
    console.log('A client connected');
  
    ws.on('message', async function incoming(message) {

      const json_message = JSON.parse(message);

      // const total_plays = await Result.countDocuments({ seed: json_message.seed });
      // const wins = await Result.countDocuments({ seed: json_message.seed, is_profit_lost : true });

      const is_profit_lost = parseFloat( json_message.payout ) < parseFloat( json_message.result ) ? true : false;

      const now = new Date();

      Result.findOne({ seed: json_message.seed }, {}, { sort: { '_id' : -1 }})
        .then((doc) => {
          if ( doc === null ){
            const result = new Result({
              seed: json_message.seed,
              total_plays: 1,
              wins: is_profit_lost ? 1 : 0,
              dead_counts: is_profit_lost ? 0 : 1,
              bet_amount: parseFloat( json_message.amount ),
              bet_payout: parseFloat( json_message.payout ),
              bet_result: parseFloat( json_message.result ),
              is_profit_lost: is_profit_lost,
              created_at: now.toLocaleString(),
            });
            
            result.save()
              .then((doc) => {
                // console.log(`=====================================
                // Amount : ${ json_message.amount },
                // Payout : ${ json_message.payout },
                // Result : ${ json_message.result },
                // State  : ${ parseFloat( json_message.payout ) < parseFloat( json_message.result ) ? 'Profit' : 'Lose'}
                // `)

                console.log( doc );

              })
              .catch((err) => {
                console.error('Error saving document:', err);
              });
          }
          else {
            const result = new Result({
              seed: json_message.seed,
              total_plays: doc.total_plays + 1,
              wins: is_profit_lost ? doc.wins + 1 : doc.wins,
              dead_counts: is_profit_lost ? 0 :  doc.dead_counts + 1 ,
              bet_amount: parseFloat( json_message.amount ),
              bet_payout: parseFloat( json_message.payout ),
              bet_result: parseFloat( json_message.result ),
              is_profit_lost: is_profit_lost,
              created_at: now.toLocaleString(),
            });

            result.save()
              .then((doc) => {
                // console.log(`=====================================
                // Amount : ${ json_message.amount },
                // Payout : ${ json_message.payout },
                // Result : ${ json_message.result },
                // State  : ${ parseFloat( json_message.payout ) < parseFloat( json_message.result ) ? 'Profit' : 'Lose'}
                // `)

                console.log( doc );

              })
              .catch((err) => {
                console.error('Error saving document:', err);
              });

          }
        })
        .catch((err) => {
          console.log('HHHH');
        })

      // const result = new Result({
      //   seed: json_message.seed,
      //   total_plays: total_plays + 1,
      //   wins: is_profit_lost ? wins + 1 : wins,
      //   dead_counts: is_profit_lost ? 0 :  lastDocument.dead_counts + 1 ,
      //   bet_amount: parseFloat( json_message.amount ),
      //   bet_payout: parseFloat( json_message.payout ),
      //   bet_result: parseFloat( json_message.result ),
      //   is_profit_lost: is_profit_lost,
      //   created_at: now.toLocaleString(),
      // });
      
      ws.send('Hello from server!');
    });
  
    ws.on('close', function close() {
      console.log('A client disconnected');
    });
    
});

//start our server
server.listen(process.env.PORT || 8080, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});