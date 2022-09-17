const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env["api"];
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function addpotd(date, source,  points, image, answer){
  const query = { date: date};
  const update = { $set: { date: date, source: source, points: points, image: image, answer: answer }};
  const options = { upsert: true };
  const database = client.db('db1');
  const collection = database.collection('potd');
  collection.updateOne(query, update, options);
}
async function rpotd(date){
  const query = {date: date};
  const database = client.db('db1');
  const collection = database.collection('potd');
  return await collection.findOne(query);
}
async function addpoints(user, points){
  const query = {user: user};
  const database = client.db('db1');
  const collection = database.collection('users');
  collection.updateOne(query, {$inc: {points: points}}, {upsert: true});
  return await collection.findOne({user: user});
}
async function getpoints(user){
  const query = {user: user};
  const database = client.db('db1');
  const collection = database.collection('users');
  return await collection.findOne(query);
}
async function returnlb(){
  const database = client.db('db1');
  const collection = database.collection('users');
  return collection.find().toArray();
}
async function correct(id){
  const database = client.db('db1');
  const collection = database.collection('attempts');
  return collection.updateOne({user: id}, {$inc: {attempts: 5, success: 1}}, {upsert: true}).then(() => {return collection.updateOne({user: id, attempts: {$gt: 5}}, {$set: {success: 1}, $inc: {attempts: -5}}).then(() => {return collection.findOne({user: id});})});
}
async function tries(id){
  const database = client.db('db1');
  const collection = database.collection('attempts');
  return await collection.findOne({user: id});
}
async function preload(id){
  const database = client.db('db1');
  const collection = database.collection('attempts');
  return collection.updateOne({user: id}, {$inc: {attempts: -1, success: 0}}, {upsert: true}).then(response =>
  collection.updateOne({user: id, attempts: -1}, {$set: {attempts: 4}}).then( response =>
  collection.updateOne({user: id, attempts: 0}, {$set: {success: 1}})))
}
async function clear(){
  const database = client.db('db1');
  const collection = database.collection('attempts');
  collection.deleteMany();
}
async function sreset(){
  const database = client.db('db1');
  const collection = database.collection('users');
  collection.deleteMany();
}
async function getrank(id){
  const database = client.db('db1');
  const collection = database.collection('users');
  return collection.find().sort({points: -1}).toArray().then(responses => {for(response in responses){if(responses[response].user == id){return response + 1;}}})
}
function getdate(){
  var date_ob = new Date();
  let hours = date_ob.getHours();
  if(hours >= 19){
    date_ob.setDate(date_ob.getDate() + 1)
  }
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = (date_ob.getFullYear());
  year = year.toString().slice(2,4);
  return parseInt(month + date + year);
}

module.exports = {correct, addpotd, rpotd, addpoints, getpoints, returnlb, getdate, tries, preload, clear, sreset, getrank}
