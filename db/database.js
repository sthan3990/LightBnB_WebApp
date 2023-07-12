const properties = require("./json/properties.json");
const users = require("./json/users.json");
const dotenv = require('dotenv');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'steve',
  password:  '123',
  host: 'localhost',
  database: 'lightbnb'

  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // host: process.env.DB_HOST,
  // database: process.env.DB_DATABASE,
});

/// Users
/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
  .query(`SELECT * FROM users 
          WHERE email = $1`, [email])
  .then((result) => {
    console.log(result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {result.rows} The SQL output
 */
const getUserWithId = function (id) {
  return pool
  .query(`SELECT * FROM users 
          WHERE id EQUALS $1`, [id])
  .then((result) => {
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
  .query(`INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING *;`, [user.name, user.email, user.password])
  .then((result) => {
    console.log(result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });

  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);
};

/// Reservations
const getAllReservations = function (guest_id, limit = 10) {
  return pool
  .query(`SELECT reservations.id, properties.title, properties.cost_per_night, 
          reservations.start_date, avg(rating) as average_rating
          FROM reservations
          JOIN properties ON reservations.property_id = properties.id
          JOIN property_reviews ON properties.id = property_reviews.property_id
          WHERE reservations.guest_id = $1
          GROUP BY properties.id, reservations.id
          ORDER BY reservations.start_date
          LIMIT $2`, [guest_id,limit])
  .then((result) => {
    console.log(result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });

  // return getAllProperties(null, 2);
};

/// Properties

/**
 * Get all properties from lightbnb database
 */
const getAllProperties = (options, limit = 10) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {
    console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
