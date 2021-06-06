//NOTA: usamos el driver versión 3.6.x  . Documentacion https://docs.mongodb.com/drivers/node/
const { MongoClient } = require("mongodb");

// la "URL" (uri) de la base de datos
//const uri = "mongodb+srv://<user>:<password>@<cluster-url>?retryWrites=true&writeConcern=majority";
var uri = "mongodb://localhost:27017?retryWrites=true&writeConcern=majority";

var databaseName = "tefege";
var playerCollection = "players";
var dataCollection = "data";

const DEBUGLOG = false;

function init(uri_ = "mongodb://localhost:27017?retryWrites=true&writeConcern=majority", database = "tefege", playerCol = "players", dataCol = "data")
{
  uri = uri_;

  databaseName = database;
  playerCollection = playerCol;
  dataCollection = dataCol;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FUNCIONES INDEPENDIENTES DEL JUEGO: estas funciones son 100% independientes del juego, se puede aplicar a otros juegos
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function lastT()
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(dataCollection);

        // busca el id exacto del jugador
        var options = {
            upsert: true
        };

        var player = await collection.findOne({}, {});

      } finally {
        await client.close();
      }

      return player.lastT;
}

async function getPlayerRankings(amount, offset = 0, worst = false)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var options = {
          sort: { rating : worst ? 1 : -1},// RD: worst ? 0 : 1 },
          skip: offset,
          limit: amount,
          projection: { _id: 0, password: 0, salt: 0, email: 0 }
        };

        var players = await collection.find({}, options);

        players = await players.toArray();

      } finally {
        await client.close();
      }

      return players;
}

async function logUpdate(currentT)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(dataCollection);

        // busca el id exacto del jugador
        var options = {
            upsert: true
        };

        var player = await collection.updateOne({}, { $push: { dateLog: (new Date()).toString() }, $inc: { lastT: 1 }}, options);

      } finally {
        await client.close();
      }
}

async function logLogin(playerID)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var query = { id: playerID };

        var result = await collection.updateOne(query, { $set: { lastLogin: (new Date()).toString()} }, {});

      } finally {
        await client.close();
      }
}

//devuelve el documento del jugador con ID especificado
async function findPlayer(playerID)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var query = { id: playerID };
        var options = {
          // sort matched documents in descending order by rating
          //sort: { rating: -1 },

          // Include only the `title` and `imdb` fields in the returned document
          //projection: { _id: 0, title: 1, imdb: 1 },
        };

        var player = await collection.findOne(query, options);

      } finally {
        await client.close();
      }

      return player;
}

//devuelve el documento del jugador con ID especificado
async function findPlayerSafe(query)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var options = {
          projection: { _id: 0, password: 0, salt: 0, email: 0 }
        };

        var player = await collection.findOne(query, options);

      } finally {
        await client.close();
      }

      return player;
}

//devuelve el documento del jugador con nick/email especificados
async function findPlayerByLogin(query)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var options = {
          // sort matched documents in descending order by rating
          //sort: { rating: -1 },

          // Include only the `title` and `imdb` fields in the returned document
          //projection: { _id: 0, title: 1, imdb: 1 },
        };

        var player = await collection.findOne(query, options);

      } finally {
        await client.close();
      }

      return player;
}

//elimina el documento del jugador con id especificado
async function deletePlayerByID(playerID)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        var query = { id: playerID };

        // busca el id exacto del jugador
        var options = {
          // sort matched documents in descending order by rating
          //sort: { rating: -1 },

          // Include only the `title` and `imdb` fields in the returned document
          //projection: { _id: 0, title: 1, imdb: 1 },
        };

        await collection.deleteOne(query);

      } finally {
        await client.close();
      }
}

//elimina el documento del jugador con credenciales especificados
async function deletePlayer(query)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var options = {
          // sort matched documents in descending order by rating
          //sort: { rating: -1 },

          // Include only the `title` and `imdb` fields in the returned document
          //projection: { _id: 0, title: 1, imdb: 1 },
        };

        await collection.deleteOne(query);

      } finally {
        await client.close();
      }
}

//le pasas el mínimo y máximo del rango (normalmente, puntuación - x y puntuación + x), AMBOS INCLUSIVOS
//devuelve los documentos de todos los jugadores en ese rango
async function findPlayersInRange(min, max)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca todos los que tengan (rating >= min && rating <= max)
        var query = { rating: { $lte : max, $gte : min } };
        var options = {
          // sort matched documents in descending order by rating
          //sort: { rating: -1 },

          // Include only the `title` and `imdb` fields in the returned document
          //projection: { _id: 0, title: 1, imdb: 1 },
        };

        var players = collection.find(query, options);

        if (DEBUGLOG && (await players.count()) === 0) {
            console.log("No documents found!");
        }

        players = await players.toArray();
        
      } finally {
        await client.close();
      }

      return players;
}

//actualiza la puntuación del jugador con ID especificado, usando los campos definidos en newRatingJSON (de forma que pueda ampliarse sin tener que cambiar la función)
async function updatePlayerRating(playerID, newRatingJSON)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var filter = { id: playerID };

        var options = {
          // this option instructs the method to create a document if no documents match the filter
          //upsert: true
        };

        var update = { $set: newRatingJSON };

        var result = await collection.updateOne(filter, update, options);

        if(DEBUGLOG)
            console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);

    } finally {
    await client.close();
    }
}

//limpia el array pending del jugador con id playerID y mueve los contenidos a history, además de devolver el documento previo al cambio
async function wipePlayerPending(playerID)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var filter = { id: playerID };
        
        var options = {
          // this option instructs the method to create a document if no documents match the filter
          // upsert: true
        };

        //concatenamos los contenidos del array pending al array history, y después limpiamos el array pending
        //esto es una agregación, y nos sirve para hacer que más de una operación se haga de forma atómica (de forma que, por ejemplo, no se añadan cosas a pending entre que concatenamos y borramos)
        var update = [ { $set: {
                          history: { $cond: [ { $not: ["$history"] }, [], "$history" ] },
                        }},
                        { $set: { history: { $concatArrays: [ "$history", "$pending" ] } } },
                        { $set: { pending: [] } } ]

        var result = await collection.findOneAndUpdate(filter, update, options);

        if(DEBUGLOG)
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
            );

      } finally {
        await client.close();
      }

      return result.value;
}

//limpia el array pending de todos los jugadores y mueve los contenidos a history, PERO NO DEVUELVE EL ANTERIOR
/*
async function wipeAllPending()
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var filter = { pending: { $exists: true, $not: { $size: 0 } } };
        
        var options = {
          // this option instructs the method to create a document if no documents match the filter
          // upsert: true
        };

        //concatenamos los contenidos del array pending al array history, y después limpiamos el array pending
        //esto es una agregación, y nos sirve para hacer que más de una operación se haga de forma atómica (de forma que, por ejemplo, no se añadan cosas a pending entre que concatenamos y borramos)
        var update = [ { $set: { history: { $concatArrays: [ "$history", "$pending" ] } } }, { $set: { pending: [] } } ]

        var result = await collection.findOneAndUpdate(filter, update, options);

        if(DEBUGLOG)
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
            );

      } finally {
        await client.close();
      }
}
*/

//añade un nuevo jugador de id playerID, con los parámetros por defecto de defaultParametersJSON, y con la información que se le pase en playerInfoJSON (nick, password, salt, email, etc)
async function addPlayer(playerID, defaultParametersJSON, playerInfoJSON)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        //creamos el documento
        var doc = playerInfoJSON;

        Object.keys(defaultParametersJSON).forEach(key => doc[key] = defaultParametersJSON[key]);

        doc.id = playerID;

        var result = await collection.insertOne(doc);

        if(DEBUGLOG)
            console.log(
                `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,        
            );
            

        var database = client.db(databaseName);
        var collection = database.collection(dataCollection);

        var options = {
            upsert: true
        };

        await collection.updateOne({}, { $inc: { playerCount: 1 } }, options);

      } finally {
        await client.close();
      }
}

//verifica si un nick determinado ya está cogido
async function isNickAvailable(playerNick)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var query = { nick: playerNick };
        var options = {
          // sort matched documents in descending order by rating
          //sort: { rating: -1 },

          // Include only the `title` and `imdb` fields in the returned document
          //projection: { _id: 0, title: 1, imdb: 1 },
        };

        var player = await collection.findOne(query, options);

      } finally {
        await client.close();
      }

      return (player === null);
}

//verifica si un email determinado ya está cogido
async function isEmailAvailable(playerEmail)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        // busca el id exacto del jugador
        var query = { email: playerEmail };
        var options = {
          // sort matched documents in descending order by rating
          //sort: { rating: -1 },

          // Include only the `title` and `imdb` fields in the returned document
          //projection: { _id: 0, title: 1, imdb: 1 },
        };

        var player = await collection.findOne(query, options);

      } finally {
        await client.close();
      }

      return (player === null);
}

//devuelve un array con todos los jugadores, útil para actualizar el sistema de matchmaking
async function getAllPlayers()
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        var players = await collection.find({}, {});

        players = await players.toArray();

      } finally {
        await client.close();
      }

      return players;
}

//devuelve un array con todos los jugadores que tengan elementos en pending
async function getPlayersWithPending()
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        var query = { pending: { $exists: true, $not: { $size: 0 } } };

        var players = await collection.find(query, {});

        players = await players.toArray();

      } finally {
        await client.close();
      }

      return players;
}

//devuelve un array con todos los jugadores que tengan elementos en history, útil por si queremos cambiar el método de matchmaking y actualizar las puntuaciones
async function getPlayersWithHistory()
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        var query = { history: { $exists: true, $not: { $size: 0 } } };

        var players = await collection.find(query, {});

        players = await players.toArray();

      } finally {
        await client.close();
      }

      return players;
}

//devuelve un array con los ids los jugadores
async function getAllPlayerIDs()
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        var players = await collection.find({}, { projection: { _id: false, id: true } });

        var ret = [];
        players.forEach(doc => { ret.push(doc.id); } );

      } finally {
        await client.close();
      }

      return ret;
}

//devuelve un array con los ids de todos los jugadores que tengan elementos en pending, útil para actualizar los ratings sin iterar por todos
async function getPlayerIDsWithPending()
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        var query = { pending: { $exists: true, $not: { $size: 0 } } };

        var players = await collection.find(query, { projection: { _id: 0, id: 1 } });
        
        var ret = [];
        players.forEach(doc => { ret.push(doc.id); } );

      } finally {
        await client.close();
      }

      return ret;
}

//devuelve un array con todos los ids de los jugadores que tengan elementos en history
async function getPlayerIDsWithHistory()
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);
        var collection = database.collection(playerCollection);

        var query = { history: { $exists: true, $not: { $size: 0 } } };

        var players = await collection.find(query, { projection: { _id: 0, id: 1 } });
        
        var ret = [];
        players.forEach(doc => { ret.push(doc.id); } );

      } finally {
        await client.close();
      }

      return ret;
}

async function getUserCount()
{
    let client = new MongoClient(uri);

    try {
      await client.connect();

      var database = client.db(databaseName);
      var collection = database.collection(dataCollection);

      var count = await collection.findOne({}, {});

      if(count === null) count = 0;
      else count = count.playerCount;

      } finally {
        await client.close();
      }

      return count;
}

async function getData()
{
    let client = new MongoClient(uri);

    try {
      await client.connect();

      var database = client.db(databaseName);
      var collection = database.collection(dataCollection);

      var count = await collection.findOne({}, {});

      } finally {
        await client.close();
      }

      return count;
}

//añade el array gameResults al array pending del jugador con id playerID, esta función depende del 
async function updatePlayerResults(playerID, gameResult)
{
    let client = new MongoClient(uri);

    try {
        await client.connect();

        var database = client.db(databaseName);

        var result = exports.playerDataProcessing(playerID, gameResult, database.collection(playerCollection), database.collection(dataCollection))

      } finally {
        await client.close();
      }
}

async function playerDataProcessing (playerID, gameResult, playerCol, dataCol)
{
  // busca el id exacto del jugador
  var filter = { id: playerID };
  var options = { };
  var update = {
    $push: { pending: gameResult },
    $set: { lastGame: (new Date()).toString() }
  };

  var result = await playerCol.updateOne(filter, update, options);

  return result;
}

module.exports = { init,
  lastT, logUpdate, logLogin, findPlayer, findPlayerSafe, findPlayerByLogin, findPlayersInRange, wipePlayerPending, deletePlayerByID, deletePlayer,
  updatePlayerRating, updatePlayerResults, isNickAvailable, isEmailAvailable, addPlayer, getAllPlayerIDs,
  getAllPlayers, getPlayerIDsWithHistory, getPlayerIDsWithPending, getPlayersWithHistory,
  getPlayersWithPending, getUserCount, getPlayerRankings, getData, playerDataProcessing
};