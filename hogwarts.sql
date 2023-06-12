CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK(length(name) > 0),
  house TEXT NOT NULL CHECK(house IN ('Gryffindor', 'Slytherin', 'Hufflepuff', 'Ravenclaw')),
  image TEXT,
  UNIQUE(name, house)
);

INSERT INTO students (name, house, image) VALUES ('Harry Potter', 'Gryffindor', 'harry.jpeg');
INSERT INTO students (name, house, image) VALUES ('Ron Weasley', 'Gryffindor', 'ron.jpg');
INSERT INTO students (name, house, image) VALUES ('Hermione Granger', 'Gryffindor', 'hermione.jpeg');
INSERT INTO students (name, house, image) VALUES ('Draco Malfoy', 'Slytherin', 'draco.jpeg');
INSERT INTO students (name, house, image) VALUES ('Cedric Diggory', 'Hufflepuff', 'cedric.jpeg');
INSERT INTO students (name, house, image) VALUES ('Luna Lovegood', 'Ravenclaw', 'luna.jpeg');

INSERT INTO students (name, house, image) VALUES ('Fred Weasley', 'Gryffindor', 'fred_weasley.jpg');
INSERT INTO students (name, house, image) VALUES ('George Weasley', 'Gryffindor', 'george_weasley.jpg');
INSERT INTO students (name, house, image) VALUES ('Ginny Weasley', 'Gryffindor', 'ginny_weasley.jpg');
INSERT INTO students (name, house, image) VALUES ('Dean Thomas', 'Gryffindor', 'dean_thomas.jpg');
INSERT INTO students (name, house, image) VALUES ('Seamus Finnigan', 'Gryffindor', 'seamus_finnigan.jpg');
INSERT INTO students (name, house, image) VALUES ('Oliver Wood', 'Gryffindor', 'oliver_wood.jpg');
INSERT INTO students (name, house, image) VALUES ('Angelina Johnson', 'Gryffindor', 'angelina_johnson.jpg');
INSERT INTO students (name, house, image) VALUES ('Neville Longbottom', 'Gryffindor', 'neville_longbottom.jpg');
INSERT INTO students (name, house, image) VALUES ('Parvati Patil', 'Gryffindor', 'parvati_patil.jpg');
INSERT INTO students (name, house, image) VALUES ('Lavender Brown', 'Gryffindor', 'lavender_brown.jpg');
INSERT INTO students (name, house, image) VALUES ('Colin Creevey', 'Gryffindor', 'colin_creevey.jpg');

INSERT INTO students (name, house, image) VALUES ('Cho Chang', 'Ravenclaw', 'cho_chang.jpg');
INSERT INTO students (name, house, image) VALUES ('Padma Patil', 'Ravenclaw', 'padma_patil.jpg');
INSERT INTO students (name, house, image) VALUES ('Terry Boot', 'Ravenclaw', 'terry_boot.jpg');
INSERT INTO students (name, house, image) VALUES ('Michael Corner', 'Ravenclaw', 'michael_corner.jpg');
INSERT INTO students (name, house, image) VALUES ('Anthony Goldstein', 'Ravenclaw', 'anthony_goldstein.jpg');
INSERT INTO students (name, house, image) VALUES ('Marietta Edgecombe', 'Ravenclaw', 'marietta_edgecombe.jpg');
INSERT INTO students (name, house, image) VALUES ('Roger Davies', 'Ravenclaw', 'roger_davies.jpg');

INSERT INTO students (name, house, image) VALUES ('Pansy Parkinson', 'Slytherin', 'pansy_parkinson.jpg');
INSERT INTO students (name, house, image) VALUES ('Vincent Crabbe', 'Slytherin', 'vincent_crabbe.jpg');
INSERT INTO students (name, house, image) VALUES ('Gregory Goyle', 'Slytherin', 'gregory_goyle.jpg');
INSERT INTO students (name, house, image) VALUES ('Marcus Flint', 'Slytherin', 'marcus_flint.jpg');
INSERT INTO students (name, house, image) VALUES ('Millicent Bulstrode', 'Slytherin', 'millicent_bulstrode.jpg');
INSERT INTO students (name, house, image) VALUES ('Tracey Davis', 'Slytherin', 'tracey_davis.jpg');
INSERT INTO students (name, house, image) VALUES ('Blaise Zabini', 'Slytherin', 'blaise_zabini.jpg');
INSERT INTO students (name, house, image) VALUES ('Theodore Nott', 'Slytherin', 'theodore_nott.jpg');

INSERT INTO students (name, house, image) VALUES ('Justin Finch-Fletchley', 'Hufflepuff', 'justin_finch_fletchley.jpg');
INSERT INTO students (name, house, image) VALUES ('Ernie Macmillan', 'Hufflepuff', 'ernie_macmillan.jpg');
INSERT INTO students (name, house, image) VALUES ('Hannah Abbott', 'Hufflepuff', 'hannah_abbott.jpg');
INSERT INTO students (name, house, image) VALUES ('Zacharias Smith', 'Hufflepuff', 'zacharias_smith.jpg');
INSERT INTO students (name, house, image) VALUES ('Susan Bones', 'Hufflepuff', 'susan_bones.jpg');
