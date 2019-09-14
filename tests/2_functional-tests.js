/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          const main = res.body.ops[0];
          assert.equal(res.status, 200);
          assert.equal(main.issue_title, 'Title');
          assert.equal(main.issue_text, 'text');
          assert.equal(main.created_by, 'Functional Test - Every field filled in');
          assert.equal(main.assigned_to, 'Chai and Mocha');
          assert.equal(main.status_text, 'In QA');
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields filled in'
        })
        .end((err, res) => {
          const main = res.body.ops[0];
          assert.equal(res.status, 200);
          assert.equal(main.issue_title, 'Title');
          assert.equal(main.issue_text, 'text');
          assert.equal(main.created_by, 'Functional Test - Required fields filled in');
          done();
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: '',
          issue_text: 'text',
          created_by: 'Functional Test - Missing required fields'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing required fields');
          done();
        })
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send()
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no updated field sent');
          done();
        })
      });
      
      test('One field to update', function(done) {
        // id 5d7a14a4c176952568d1d505
        chai.request(server)
        .put('/api/issues/test')
        .send({ _id: '5d7a14a4c176952568d1d505', open: false})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.success, "successfully updated");
          done();
        });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({ _id: '5d7a14a4c176952568d1d505', open: false, created_by: "NewUser"})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.success, "successfully updated");
          done();
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({open: true})
        .end((err, res) => {
          assert.equal(res.status, 200);
          res.body.forEach(item => {
            assert.equal(item.open, true);
          });
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({open: true, created_by: 'Functional Test - Every field filled in'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          res.body.forEach(item => {
            assert.equal(item.open, true);
            assert.equal(item.created_by, 'Functional Test - Every field filled in');
          });
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
         chai.request(server)
         .delete('/api/issues/test')
         .send()
         .end((err, res) => {
           assert.equal(res.status, 200);
           assert.equal(res.body.error, 'no id passed');
           done();
         });
      });
      
      test('Valid _id', function(done) {
        const idTest = '5d7a14a4c176952568d1d505';
        chai.request(server)
         .delete('/api/issues/test')
         .send({_id: idTest})
         .end((err, res) => {
           assert.equal(res.status, 200);
           assert.equal(res.body.success, `deleted ${idTest}`);
           done();
         });
      });
      
    });

});
