/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectId;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
var options = { useNewUrlParser: true }; 

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  
  // 4 -  I can POST a thread to a specific message board by passing form data text and delete_password to
  // /api/threads/{board}.(Recomend res.redirect to board page /b/{board}) Saved will be _id, text, 
  // created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), 
  // delete_password, & replies(array).
  .post(function(req, res) {
    var board = req.params.board;
    var text = req.body.text;
    var del_pw = req.body.delete_password;
    // console.log(board);
    // console.log(req.body);
    MongoClient.connect(CONNECTION_STRING, options, function(err, client) {
      if (err) console.log(err);
      var db = client.db('message_board');
      // if (db) console.log('Connected to database'); 
      var thread = {
        text: text,
        created_on: new Date().toString(),
        bumped_on: new Date().toString(),
        reported: false,
        delete_password: del_pw,
        replies: []
      };
      db.collection(board).insertOne(thread, (err, data) => {
        if (err) return res.json({error: err});
        if (data) {
          // console.log(data);
          return res.redirect('/b/' + board + '/');
        }
      });
    });
    // res.send("In post threads");
  })
  
  // 6 - I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 
  // replies from /api/threads/{board}. The reported and delete_passwords fields will not be sent.
  .get(function(req, res) {
    var board = req.params.board;
    // console.log(board);
    // console.log(req.params);
    MongoClient.connect(CONNECTION_STRING, options, function(err, client) {
      if (err) console.log(err);
      var db = client.db('message_board');
      // if (db) console.log('Connected to database'); 
      var projection = {'delete_password': 0, 'reported': 0, 'replies.delete_password': 0, 'replies.reported': 0};
      db.collection(board).find({}).project(projection).sort({'bumped_on': 1}).limit(10).toArray((err, data) => {
        if (err) return res.json({error: err});
        if (data) {
          // console.log(data);
          data.forEach((thread) => {
            // console.log(thread)
            thread.replycount = thread.replies.length;
            if (thread.replycount > 3) 
              thread.replies = thread.replies.slice(-3);
          });
          return res.json(data);
        }
       // no threads exist
      });
    });
    // res.send("In get threads");
  })
  
  // 8 - I can delete a thread completely if I send a DELETE request to /api/threads/{board} and pass along 
  // the thread_id & delete_password. (Text response will be 'incorrect password' or 'success')
  .delete(function(req,res) {
    var board = req.params.board; 
    var thread_id = req.body.thread_id;
    var del_pw = req.body.delete_password;
    // console.log(board);
    // console.log(req.body);
    if (!thread_id || thread_id.length > 24 || thread_id.length < 24) res.send('invalid thread id');
    MongoClient.connect(CONNECTION_STRING, options, function(err, client) {
      if (err) console.log(err);
      var db = client.db('message_board');
      // if (db) console.log('Connected to database'); 
      db.collection(board).deleteOne({_id: ObjectId(thread_id), delete_password: del_pw}, (err, data) => {
        if (err) return res.json({error: err});
        if (data) {
          // console.log(data);
          return res.send('success');
        }
        else
          return res.send('incorrect password')
      });
    });
  })
  
  // 10 - I can report a thread and change it's reported value to true by sending a PUT request to
  // /api/threads/{board} and pass along the thread_id. (Text response will be 'success')
  .put(function(req, res) {
    var board = req.params.board; 
    var report_id = req.body.report_id;
    // console.log(board);
    // console.log(req.body);
    if (!report_id || report_id.length > 24 || report_id.length < 24) res.send('invalid thread id');
    MongoClient.connect(CONNECTION_STRING, options, function(err, client) {
      if (err) console.log(err);
      var db = client.db('message_board');
      // if (db) console.log('Connected to database'); 
      db.collection(board).updateOne({_id: ObjectId(report_id)}, { '$set': { reported: true } }, (err, data) => {
        if (err) return res.json({error: err});
        if (data) {
          // console.log(data);
          return res.send('success');
        }
      }); 
    });
    
  });
    
  app.route('/api/replies/:board')
  
  // 5 - I can POST a reply to a thead on a specific board by passing form data text, delete_password, 
  // & thread_id to /api/replies/{board} and it will also update the bumped_on date to the comments date.
  // (Recomend res.redirect to thread page /b/{board}/{thread_id}) In the thread's 'replies' array will be 
  // saved _id, text, created_on, delete_password, & reported.
  .post(function(req, res) {
    var board = req.params.board;
    var id = req.body.thread_id;
    var text = req.body.text;
    var del_pw = req.body.delete_password;
    // console.log(req.body);
    // console.log(board);
    if (!id || id.length < 24 || id.length > 24) return res.send('invalid thread id');
    MongoClient.connect(CONNECTION_STRING, options, function(err, client) {
      if (err) console.log(err);
      var db = client.db('message_board');
      // if (db) console.log('Connected to database'); 
      var reply = {
        _id: new ObjectId(),
        text: text,
        created_on: new Date().toString(),
        reported: false,
        delete_password: del_pw
      };
      var bumped = new Date().toString();
      db.collection(board).updateOne({_id: ObjectId(id)}, { '$set': { bumped_on: bumped }, '$push': { replies: reply } }, 
                                     (err, data) => {
        if (err) return res.json({error: err});
        if (data) {
          // console.log(data);
          return res.redirect('/b/' + board + '/' + id);
        }
      });
    });
    // res.send("In post threads");
  })
  
  // 7 - I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. 
  // Also hiding the same fields.
  .get(function(req, res) {
    var id = req.query.thread_id;
    var board = req.params.board;
    // console.log(id);
    // console.log(board);
    if (!id || id.length < 24 || id.length > 24) return res.send('invalid thread id');
    MongoClient.connect(CONNECTION_STRING, options, function(err, client) {
      if (err) console.log(err);
      var db = client.db('message_board');
      // if (db) console.log('Connected to database'); 
      var projection = {'delete_password': 0, 'reported': 0, 'replies.delete_password': 0, 'replies.reported': 0};
      db.collection(board).find({_id: ObjectId(id)}).project(projection).toArray((err, data) => {
        if (err) return res.json({error: err});
        if (data) {
          // console.log(data[0])
          return res.json(data[0]);
        }
        // no threads exist
      });
    });
    // res.send("In replies");
  })
  
  // 9 - I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} 
  // and pass along the thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success')
  .delete(function(req,res) {
    var board = req.params.board; 
    var thread_id = req.body.thread_id;
    var reply_id = req.body.reply_id;
    var del_pw = req.body.delete_password;
    // console.log(board);
    // console.log(req.body);
    if (!thread_id || !reply_id || thread_id.length > 24 || thread_id.length < 24 || reply_id.length > 24 || 
        reply_id.length < 24) res.send('invalid thread or reply id');
    MongoClient.connect(CONNECTION_STRING, options, function(err, client) {
      if (err) console.log(err);
      var db = client.db('message_board');
      // if (db) console.log('Connected to database');
      db.collection(board).updateOne({ _id: ObjectId(thread_id), 'replies._id': ObjectId(reply_id), 
                                      'replies.delete_password': del_pw }, 
                                     { $set: {'replies.$.text': '[deleted]'}}, (err, data) => {
        if (err) return res.json({error: err});
        if (data) {
          // console.log(data);
          return res.send('success');
        }
        else
          return res.send('incorrect password');      
      });
    });
  })
  
  // 11 - I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board} 
  // and pass along the thread_id & reply_id. (Text response will be 'success')
  .put(function(req, res) {
    var board = req.params.board; 
    var thread_id = req.body.thread_id;
    var reply_id = req.body.reply_id;
    // console.log(board);
    // console.log(req.body);
    if (!thread_id || thread_id.length > 24 || thread_id.length < 24) res.send('invalid thread id');
    if (!reply_id  || reply_id.length > 24  || reply_id.length < 24)  res.send('invalid reply id');
    MongoClient.connect(CONNECTION_STRING, options, function(err, client) {
      if (err) console.log(err);
      var db = client.db('message_board');
      // if (db) console.log('Connected to database'); 
      db.collection(board).updateOne({_id: ObjectId(thread_id), 'replies._id': ObjectId(reply_id)}, 
                                     { '$set': { 'replies.$.reported': true } }, (err, data) => {
        if (err) return res.json({error: err});
        if (data) {
          // console.log(data);
          return res.send('success');
        }
      }); 
    });
  });

};
