// const data = require("./data");
// const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: String,
    password: String,
    email: String,
    loginHistory:
        [{
            dateTime: Date,
            userAgent: String
        }]

});



// module.exports = {
//     User: mongoose.model("User", userSchema),
  
// }

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://hira:pJdF1P1Qm1XzV3Ev@senecaweb.doauzle.mongodb.net/test");

        // let db = mongoose.createConnection("connectionString");
        

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};



module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                // Hash the password with the salt
                bcrypt.hash(userData.password, salt, function (err, hash) {
                    // Store hash in your password DB.
                    if (err) {
                        reject("There was an error encrypting the password");
                    } else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => {
                            if (err) {
                                if (err.code == 11000) {
                                    reject("User Name already taken");
                                } else {
                                    reject("There was an error creating the user: " + err);
                                }
                            } else {
                                resolve();
                            }
                        })
                    }
                });
            });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User
            .find({ userName: userData.userName })
            .exec()
            .then((users) => {
                if (!users) {
                    reject("Unable to find user: " + userData.userName);
                } else {
                    bcrypt.compare(userData.password, users[0].password).then((res) => {
                        if (res === true) {
                            users[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                            User.update(
                                { userName: users[0].userName },
                                { $set: { loginHistory: users[0].loginHistory } },
                                { multi: false }
                            ).exec().then(() => {
                                resolve(users[0]);
                            }).catch((err) => {
                                reject("There was an error verifying the user: " + err);
                            })
                        } else {
                            reject("Incorrect Password for user: " + userData.userName);
                        }
                    })
                }
            }
            ).catch(() => {
                reject("Unable to find user: " + userData.userName);
            }
            );
    });
};






