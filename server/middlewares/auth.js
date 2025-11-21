const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 12, (err, hash) => {
            if (err) return reject(err);
            resolve(hash);
        });
    });
}

const comparePassword = async (password, hashedPassword) => {
    return  bcrypt.compare(password, hashedPassword);
}



module.exports = { hashPassword, comparePassword };