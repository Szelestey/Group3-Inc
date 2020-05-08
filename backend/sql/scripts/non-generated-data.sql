USE HMS_DB;

-- USER DATA
INSERT INTO USER VALUES ('admin', '$2b$10$hf2WwnBkhwjXNwturHMPTuasjCipC3R3GbB9ERtkSCmMRDy.OcpZe','bill','nye','admin');
INSERT INTO USER VALUES ('user', '$2b$10$hf2WwnBkhwjXNwturHMPTuasjCipC3R3GbB9ERtkSCmMRDy.OcpZe','john','doe','user');
INSERT INTO USER VALUES ('lhershberger', '$2b$10$hf2WwnBkhwjXNwturHMPTuasjCipC3R3GbB9ERtkSCmMRDy.OcpZe','logan','hershberger','admin');
INSERT INTO USER VALUES ('nbaqibillah', '$2b$10$hf2WwnBkhwjXNwturHMPTuasjCipC3R3GbB9ERtkSCmMRDy.OcpZe','nusaiba','baqibillah','admin');
INSERT INTO USER VALUES ('aszelestey', '$2b$10$hf2WwnBkhwjXNwturHMPTuasjCipC3R3GbB9ERtkSCmMRDy.OcpZe','alex','szelestey','admin');
INSERT INTO USER VALUES ('zmarvin', '$2b$10$hf2WwnBkhwjXNwturHMPTuasjCipC3R3GbB9ERtkSCmMRDy.OcpZe','zac','marvin','admin');
INSERT INTO USER VALUES ('kelinkowski', '$2b$10$hf2WwnBkhwjXNwturHMPTuasjCipC3R3GbB9ERtkSCmMRDy.OcpZe','keith','elinkowski','admin');
INSERT INTO USER VALUES ('emusk', '$2b$10$hf2WwnBkhwjXNwturHMPTuasjCipC3R3GbB9ERtkSCmMRDy.OcpZe','elon','musk','user');

-- ROOMTYPE DATA
INSERT INTO ROOMTYPE VALUES ('KI', 'Standard King','Non-smoking room with king-size bed', 79.99, 1, 3, '/photos/kingRoom.jpg');
INSERT INTO ROOMTYPE VALUES ('QD', 'Standard Double Queen', 'Non-smoking room with two queen-size beds', 89.99, 2, 5, '/photos/queen-bed.jpg');
INSERT INTO ROOMTYPE VALUES ('KS', 'King Suite', 'Non-smoking suite with king-size bed and pull-out couch', 99.99, 2, 5, '/photos/king.jpg');
INSERT INTO ROOMTYPE VALUES ('QS', 'Double Queen Suite', 'Non-smoking room with two queen-size beds and a pull-out couch', 109.99, 3, 7, '/photos/queen-suite.jpg');
INSERT INTO ROOMTYPE VALUES ('KJ', 'King Jacuzzi Suite', 'Non-smoking room with a king-size bed and a jacuzzi tub', 129.99, 1, 3, '/photos/jacuzzi.jpg');
