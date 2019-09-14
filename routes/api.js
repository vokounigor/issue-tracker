/*
*
*
*       Complete the API routing below
*
*
*/

// Documentation for mongodb here
// http://mongodb.github.io/node-mongodb-native/3.2/api/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
    if (err) console.log("Database error: " + err);
    const db = client.db('issues');
    
    app.route('/api/issues/:project')

      .get(function (req, res){
        var project = req.params.project;
        const query = req.query;
        // If the query object is empty, it has no keys and is of type object
        // proceed normally without using query parameters
        if (Object.keys(query).length === 0 && query.constructor === Object) {
          db.collection(project).find().toArray((err, documents) => {
            if (err) throw err;
            if (documents == null || documents.length == 0) {
              res.send([]);
            } else {
              res.send(documents);
            }
          });
        } else {
          // Since in query open will be set to a string, we have to
          // convert it to Boolean but only if it exists!
          if (query.hasOwnProperty('open')){
            query.open = query.open == 'false' ? false : true;
          }
          db.collection(project).find(query).toArray((err, documents) => {
            res.send(documents);
          });
        }
      })

      .post(function (req, res){
        var project = req.params.project;
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
        const obj = {
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        };
        if (obj.issue_title == '' || obj.issue_title == null ||
            obj.issue_text == '' || obj.issue_text == null ||
            obj.created_by == '' || obj.created_by == null) {
              res.send({error: 'missing required fields'});
        } else {
          db.collection(project).insertOne(obj, (err, response) => {
            if (err) throw err;
            res.send(response);
          });
        }
      })

      .put(function (req, res){
        var project = req.params.project;
        const { _id, open } = req.body;
        if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
          return res.send({error: "no updated field sent"});
        }
        const obj = req.body;
        delete obj._id;
        obj.updated_on = new Date();
        if (obj.hasOwnProperty('open')){
          obj.open = !obj.open;
        }
        db.collection(project).findOneAndUpdate(
        {_id: ObjectId(_id)},
        {
          $set: obj
        }, (err, result) => {
          if (err) {
            res.send(`could not update ${_id}`);
          } else {
            res.send({success: "successfully updated"});
          }
        });
      })

      .delete(function (req, res){
        var project = req.params.project;
        const { _id } = req.body;
        if (_id == null || _id == '') {
          return res.send({error: "no id passed"});
        }
        db.collection(project).deleteOne({_id: ObjectId(_id)}, (err, result) => {
          if (err) {
            res.send(`could not delete ${_id}`);
          } else {
            res.send({success: `deleted ${_id}`});
          }      
        })
      }); 
      
      // 404 not found middleware
      app.use(function(req, res, next) {
        res.status(404)
        .type('text')
        .send('Not Found');
      });
  });
    
};
