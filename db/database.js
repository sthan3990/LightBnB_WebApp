const properties = require("./json/properties.json");
const users = require("./json/users.json");
const dotenv = require('dotenv');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'steve',
  password: '123',
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
      return result.rows[0];
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
          WHERE id = $1`, [id])
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
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Reservations
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(`
          SELECT reservations.*, properties.*, AVG(property_reviews.rating)
          FROM reservations
          JOIN properties ON reservations.property_id = properties.id
          JOIN property_reviews ON properties.id = property_reviews.property_id
          WHERE reservations.guest_id = $1
          GROUP BY properties.id, reservations.id
          ORDER BY reservations.start_date
          LIMIT $2;
          `, [guest_id, limit])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Properties

/**
 * Get all properties from lightbnb database
 */
const getAllProperties = (options, limit = 10) => {
   
  const queryParams = [];
   
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryString += `AND `;
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length}`;
  }
  else if(options.owner_id) {
    queryString += `AND `;
    queryParams.push(`%${options.owner_id}%`);
    queryString += `WHERE owner_id LIKE $${queryParams.length}`;
  }

  else if (options.minimum_price_per_night) {
    queryString += `AND `;
    queryParams.push(`%${options.minimum_price_per_night }%`);
    queryString += `WHERE (cost_per_night/100) <  $${queryParams.length}`;
  }

  else if (options.maximum_price_per_night) {
    queryString += `AND `;
    queryParams.push(`%${options.maximum_price_per_night }%`);
    queryString += `WHERE (cost_per_night/100) >  $${queryParams.length}`;
  }

  queryString += `GROUP BY properties.id`;

  if (options.minimum_rating) {
    queryString += `AND `;
    queryParams.push(`%${options.minimum_rating}%`);
    queryString += `HAVING average_rating >= $${queryParams.length}`;
  }

  // 4
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  return pool
  .query(`INSERT INTO properties 
          (owner_id,
          title,
          description,
          thumbnail_photo_url,
          cover_photo_url,
          cost_per_night,
          street,
          city,
          province,
          post_code,
          country,
          parking_spaces,
          number_of_bathrooms,
          number_of_bedrooms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *;`, [property.owner_id, property.title, property.description, 
                      property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city,
                      property.province, property.post_code, property.country,
                      property.parking_spaces, property.number_of_bathrooms,
                      property.number_of_bedrooms])
  .then((result) => {
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
