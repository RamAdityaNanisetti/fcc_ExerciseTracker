const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = mongoose.Schema({
  username: String
});
let User = mongoose.model('User', userSchema);

const exerciseSchema = mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
});
let Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})



app.post('/api/users', async function(req, res){
  let username = req.body.username;
  let user1 = new User({username: username});
  user1.save();
  return res.json(user1);
})

app.get('/api/users', async function(req, res){
  return res.json(await User.find({}).exec());
})

app.post('/api/users/:_id/exercises', async function(req, res){
  let id = req.params._id;
  let description= req.body.description;
  let date = req.body.date;
  let duration = Number(req.body.duration);
  if(date) date = new Date(date);
  else date = new Date();

  let result = await User.find({_id: id}).exec();
  let username = result[0].username;
  let exercise1 = new Exercise({username: username, date: date, duration: duration, description: description,});
  exercise1.save();
  res.json({_id: id, username: username, date: date.toDateString(), duration: duration, description: description});
});

app.get('/api/users/:_id/log', async function(req, res){
  let id = req.params._id;
  let result = await User.find({_id: id}).exec();
  let username = result[0].username;

  result = await Exercise.find({username: username}).select({_id: 0, username: 0}).exec();
  let updatedResult = [];
  let i=0;
  result.forEach(obj=>{
    updatedResult[i] = {}
    datestring = obj.date.toDateString();
    updatedResult[i].date = datestring;
    updatedResult[i].duration = obj.duration;
    updatedResult[i].description = obj.description;
    i++;
  })
  return res.json({_id: id, username: username, count: result.length, log: updatedResult});
});


app.get('/api/users/:_id/logs', async function(req, res){
  let id = req.params._id;
  let result = await User.find({_id: id}).exec();
  let username = result[0].username;

  //get the from date from the url
  let from = req.query.from;
  if(from) from = new Date(from);
  else from = new Date(-8640000000000000);

  //get the to date from the url
  let to = req.query.to;
  to = to? new Date(to): new Date();

  //get the limit from the url
  result = await Exercise.find({username: username}).select({_id: 0, username: 0}).exec();
  let limit = req.query.limit;
  limit = limit? Number(limit): result.length;

  
  



  result = await Exercise.find({username: username, date: { $gt: from, $lt: to }  }).select({_id: 0, username: 0}).limit(limit).exec();
  let updatedResult = [];
  let i=0;
  result.forEach(obj=>{
    updatedResult[i] = {}
    datestring = obj.date.toDateString();
    updatedResult[i].date = datestring;
    updatedResult[i].duration = obj.duration;
    updatedResult[i].description = obj.description;
    i++;
  })
  return res.json({_id: id, username: username, count: result.length, log: updatedResult});
});