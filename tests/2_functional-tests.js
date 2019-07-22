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

var id1, id2, r_id1, r_id2;

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function(done) {
      
      test('create 2 new threads', function(done) {
        chai.request(server)
          .post('/api/threads/general')
          .send({
            text: 'Text 1 - functional post test thread filled in',
            delete_password: 'test'
          })
        .end(function(err, res){
          assert.equal(res.status, 200);
        });
        chai.request(server)
          .post('/api/threads/general')
          .send({
            text: 'Text 2 - functional post test thread filled in',
            delete_password: 'test'
          })
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      // get id1 and id2
      test('get threads', function(done) {
        chai.request(server)
          .get('/api/threads/general')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          // console.log(res.body);
          id1 = res.body[0]._id;
          id2 = res.body[1]._id;
          // console.log(id1, id2);
          done();
        });
        
      });
      
    });
    
    suite('DELETE', function() {
    
      test('delete thread', function(done){ 
        chai.request(server)
        .delete('/api/threads/general')
        .send({thread_id: id1, delete_password: 'test'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
     });
     // could test for 'incorrect password'
      
    });
    
    suite('PUT', function() {
    
      test('report thread', function(done){ 
          chai.request(server)
          .put('/api/threads/general')
          .send({report_id: id2})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
       });
      
    });
    
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test('create 2 new replies', function(done) {
        chai.request(server)
          .post('/api/replies/general')
          .send({
            text: 'Text 1 - functional post test reply filled in',
            delete_password: 'test',
            thread_id: id2
          })
        .end(function(err, res){
          assert.equal(res.status, 200);
        });
        chai.request(server)
          .post('/api/replies/general')
          .send({
            text: 'Text 2 - functional post test reply filled in',
            delete_password: 'test',
            thread_id: id2
          })
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      // get id2
      test('get thread + replies', function(done) {
        chai.request(server)
          .get('/api/replies/general')
          .query({thread_id: id2})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          // console.log(res.body);
          r_id1 = res.body.replies[0]._id;
          r_id2 = res.body.replies[1]._id;
          // console.log(r_id1, r_id2);
          done();
        });
        
      });
      
    });
    
    suite('PUT', function() {
      
      test('report reply', function(done){ 
          chai.request(server)
          .put('/api/replies/general')
          .send({thread_id: id2, reply_id: r_id1})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
       });
      
    });
    
    suite('DELETE', function() {
      
      test('delete reply', function(done){ 
        chai.request(server)
        .delete('/api/replies/general')
        .send({thread_id: id2, reply_id: r_id2, delete_password: 'test'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      // could test for 'incorrect password'
      
    });
    
  });

});
