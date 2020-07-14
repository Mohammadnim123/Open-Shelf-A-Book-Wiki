DROP TABLE IF EXISTS books;
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  description text,
  bookshelf VARCHAR(255)
);

INSERT INTO books (author, title, isbn, image_url ,description, bookshelf) 
VALUES('Nimrawi','mansaf','12345','https://e3arabi.com/wp-content/uploads/2019/08/shutterstock_407706595-1024x683.jpg','how to make mansaf','eat');