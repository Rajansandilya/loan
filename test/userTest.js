// Set node evnironment as test.
process.env.NODE_ENV = 'test';

// Require models
const User = require('../models/user');
const Loan = require('../models/loan');
const jwt=require('jsonwebtoken');
// const bcrypt=require('bcryptjs');
// require all the dependencies for testing 
const mongoose = require("mongoose");
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

const should = chai.should();
chai.use(chaiHttp);


describe('User', () => {
    afterEach((done) => {
        User.deleteOne({}, (err) => {
            done();
        });
    });

    describe('/POST /user/signup', () => {
        const userIncorrect = { emailsds: "DummyUser",phone:"123123",userType:"customer", password: "dummyUser", confirmPassword: "dummyUser",name:"user" }

        const userWrongConfirmPass = { name: "Dummy",phone:"123",userType:"customer", username: "DummyUser", password: "dummyPass", confirmPassword: "dummyPass123" };

        const userCorrect = { name: "Dummy",phone:"123", email: "DummyUser",userType:"customer", password: "dummyPass", confirmPassword: "dummyPass" };

        // registration of user with missing field Should throw error of missing field
        it('it should say incorrect internal server error because missing field -> signup user', (done) => {
            chai.request(server)
                .post('/user/signup')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(userIncorrect)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(500);
                    res.body.should.have.property("message");
                    res.body.message.should.be.eql("Internal Server Error");
                    // res.body.status.should.be.eql(500);
                    done();
                });
        });

        // registration of user with incorrect confirm password Should throw error.
        it('it should say password and confirm password not equal -> signup user', (done) => {
            chai.request(server)
                .post('/user/signup')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(userWrongConfirmPass)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(422);
                    // res.body.should.have.property("status");
                    res.body.should.have.property("message");
                    res.body.message.should.be.eql("Password and confirm-password not equal");
                    // res.body.status.should.be.eql(422);
                    done();
                });
        });

        // registration of user with correct credentials Should not throw error.
        it('it should say user signed up -> signup user', (done) => {
            chai.request(server)
                .post('/user/signup')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(userCorrect)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(201);
                    // res.body.should.have.property("status");
                    res.body.should.have.property("message");
                    res.body.message.should.be.eql("Registration successful");
                    // res.body.status.should.be.eql(200);
                    done();
                });
        });

    });


    // All tests for login route
    describe('/POST /user/login', () => {

        // unable to login because of wrong email
        it('it should say authorization failed because wrong user email -> login user', (done) => {
            User.create({name:"TestUser",phone:"123456", email: "TestUser", password: "TestPass",userType:"customer" },(err,user)=>{
                chai.request(server)
                .post('/user/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email:"TestUser2",password:"TestPass"})
                .end((err, res) => {
                    console.log(res.body);
                    res.should.have.status(401);
                    // res.body.should.have.property("status");
                    res.body.should.have.property("message");
                    res.body.message.should.be.eql("Invalid Email or Password");
                    // res.body.status.should.be.eql(401);
                    done();
                });
            })
            
        });


        // unable to login because of wrong password
        it('it should say authorization failed because wrong user password -> login user', (done) => {
            User.create({name:"TestUser",phone:"123456", email: "TestUser", password: "TestPass",userType:"customer"},(err,user)=>{
                chai.request(server)
                .post('/user/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({username:"TestUser",password:"TestPass2"})
                .end((err, res) => {
                    console.log(res.body);
                    res.should.have.status(401);
                    // res.body.should.have.property("status");
                    res.body.should.have.property("message");
                    res.body.message.should.be.eql("Invalid Email or Password");
                    // res.body.status.should.be.eql(401);
                    done();
                });
            })
            
        });


        


    });

});






// Test for listting users






// Test for all the admin related functionalities.
describe('Admin', () => {
    let authToken = "";
    let user = "";
   
    // Empty all the collections and add a dummy user to generate jwt
    afterEach((done) => {
        
        Loan.deleteOne({}, (err) => {
        });
    
        User.deleteOne({}, (err) => {
             user = new User({ name: "admin", email: "admin", password: "admin",phone:"0987",userType:"admin",isApproved:"true" });
            user.save((err, user) => {
                authToken = jwt.sign(user.toJSON(), "codeial", { expiresIn: 100000 })
                done();
            })
        });
    });



    // Test get list of user route
    describe('/POST user/listUsers/:id', () => {
        

        // Authorization failed due to not passing jwt token in header
        it('it should return a message not Authorized -> USER LIST', (done) => {
            chai.request(server)
                .get('/user/listUsers/'+user._id)
                .set('content-type', 'application/x-www-form-urlencoded')
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    // res.body.should.have.property('status');
                    // res.body.should.have.property('message');
                    // res.body.status.should.be.eql(401);
                    
                    done();
                });
        });

        
       

        // List Users Successfully
        it('It should list all the users successfully -> LIST USERS', (done) => {
            chai.request(server)
                .get('/user/listUsers/'+user._id)
                .set('content-type', 'application/x-www-form-urlencoded')
                .set({ "Authorization": `Bearer ${authToken}` })
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('Here are all the users');
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('customers');
                    res.body.data.should.have.property('agents');
                    done();
                });
        });
        
        // Listing users without sending id in params
        it('It should send 404 -> LIST USERS', (done) => {
            chai.request(server)
                .get('/user/listUsers')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set({ "Authorization": `Bearer ${authToken}` })
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(404);
                    
                    
                    done();
                });
        });

        


    });




  


    //  Test for listing all the agent approval requests
    describe('/GET user/agentRequestList/:id', () => {
        

        // Authorization failed due to not passing jwt token in header
        it('it should return a message not Authorized ->AGENT APPROVAL LIST', (done) => {
            chai.request(server)
                .get('/user/agentRequestList/'+user._id)
                .set('content-type', 'application/x-www-form-urlencoded')
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    
                    
                    done();
                });
        });

        
        // Authorization failed due to not passing wrong jwt token in header
        it('it should return a message not Authorized ->AGENT APPROVAL LIST', (done) => {
            chai.request(server)
                .get('/user/agentRequestList/'+user._id)
                .set('content-type', 'application/x-www-form-urlencoded')
                .set({ "Authorization": `Bearer` })
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    
                    
                    done();
                });
        });
       

        // List Agent Approval Requests
        it('It should list all the Agent Approval Requests -> LIST APPROVAL REQUEST', (done) => {
            chai.request(server)
                .get('/user/agentRequestList/'+user._id)
                .set('content-type', 'application/x-www-form-urlencoded')
                .set({ "Authorization": `Bearer ${authToken}` })
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('here is the list of agent requests');
                    res.body.should.have.property('data');
                    
                    done();
                });
        });
    
    //  Not sending user id in params
        it('It should send 404 -> LIST APPROVAL REQUEST', (done) => {
            chai.request(server)
                .get('/user/agentRequestList')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set({ "Authorization": `Bearer ${authToken}` })
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(404);
                    
                    // res.body.should.have.property('message');
                    
                    
                    done();
                });
        });

    


      
    
    
       

    });



   

    

});
