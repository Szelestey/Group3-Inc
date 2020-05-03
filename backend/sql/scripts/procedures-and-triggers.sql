
DELIMITER $$

-- Adds a row in the availability table for each room type
DROP PROCEDURE IF EXISTS day_avail_fill $$
CREATE PROCEDURE day_avail_fill(d DATE)
BEGIN
    DECLARE done BOOLEAN DEFAULT FALSE;
    DECLARE type VARCHAR(2);
    DECLARE roomtype_cursor CURSOR FOR SELECT type_id FROM ROOMTYPE;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN roomtype_cursor;
    row_loop: LOOP
        FETCH roomtype_cursor INTO type;
        IF done THEN
            LEAVE row_loop;
        END IF;

        INSERT INTO AVAILABILITY VALUES(d, type, 0, true);
    END LOOP;
END $$


-- Pre-populates the availability table
DROP PROCEDURE IF EXISTS avail_table_fill $$
CREATE PROCEDURE avail_table_fill()
BEGIN
    DECLARE d DATE;
    DECLARE n INT;
    SET d = CURRENT_DATE();
    SET n = 0;

    WHILE n < 365 DO
            CALL day_avail_fill(d);
            SET d = DATE_ADD(d, INTERVAL 1 DAY);
            SET n = n + 1;
        END WHILE;
END $$


-- Updates isAvailable based on current total number of rooms for given type
DROP PROCEDURE IF EXISTS check_isAvail_after_upd $$
CREATE PROCEDURE check_isAvail_after_upd(type VARCHAR(2), num_reserved INT, d DATE)
BEGIN
    DECLARE num_rooms INT;
    SET num_rooms = (SELECT COUNT(room_id) FROM ROOM WHERE roomtype=type AND room_in_service=true);
    IF (num_rooms > num_reserved) THEN
        UPDATE AVAILABILITY
        SET isAvailable = true
        WHERE date=d AND roomtype=type;
    ELSE
        UPDATE AVAILABILITY
        SET isAvailable = false
        WHERE date=d AND roomtype=type;
    END IF ;
END $$


DELIMITER ;


CALL avail_table_fill();


DELIMITER $$


-- Create invoice after new reservation
CREATE TRIGGER ins_invoice_after_reservation AFTER INSERT ON RESERVATION
    FOR EACH ROW
BEGIN
    INSERT INTO INVOICE VALUES (new.reservation_id, 0, 0);
END $$


-- Updates num_reserved on availability table when a reservation is created
CREATE TRIGGER upd_avail_after_ins AFTER INSERT ON RESERVATION
    FOR EACH ROW
BEGIN
    DECLARE x INT;
    DECLARE num_days INT;
    DECLARE num_res INT;
    DECLARE curr_date DATE;
    SET x = 0;
    SET num_days = DATEDIFF(new.check_out_date, new.check_in_date);
    WHILE x < num_days DO
            SET curr_date = DATE_ADD(new.check_in_date, INTERVAL x DAY);
            UPDATE AVAILABILITY
            SET num_reserved = (num_reserved + 1)
            WHERE ((date = curr_date) AND
                   (roomtype = new.roomtype_id));
            SET x = x + 1;

            SELECT num_reserved INTO num_res FROM AVAILABILITY WHERE date=curr_date AND roomtype=new.roomtype_id;
            CALL check_isAvail_after_upd(new.roomtype_id, num_res, curr_date);

        END WHILE;
END $$

-- Updates num_reserved on availability table when a reservation is cancelled
CREATE TRIGGER upd_avail_after_cancel AFTER UPDATE ON RESERVATION
    FOR EACH ROW
BEGIN
    DECLARE x INT;
    DECLARE num_days INT;
    DECLARE num_res INT;
    DECLARE curr_date DATE;
    SET x = 0;
    SET num_days = DATEDIFF(old.check_out_date, old.check_in_date);

    IF (new.status LIKE 'cancelled' AND old.status NOT LIKE 'cancelled') THEN

        WHILE x < num_days DO
                SET curr_date = DATE_ADD(old.check_in_date, INTERVAL x DAY);
                UPDATE AVAILABILITY
                SET num_reserved = (num_reserved - 1)
                WHERE ((date = curr_date) AND
                       (roomtype = old.roomtype_id));
                SET x = x + 1;

                SELECT num_reserved INTO num_res FROM AVAILABILITY WHERE date=curr_date AND roomtype=old.roomtype_id;
                CALL check_isAvail_after_upd(old.roomtype_id, num_res, curr_date);

            END WHILE;

    END IF ;
END $$


-- Updates num_reserved on availability table when a reservation's dates are updated
CREATE TRIGGER upd_avail_after_update AFTER UPDATE ON RESERVATION
    FOR EACH ROW
BEGIN
    DECLARE x INT;
    DECLARE num_days INT;
    DECLARE num_res INT;
    DECLARE curr_date DATE;
    SET x = 0;
    SET num_days = DATEDIFF(old.check_out_date, old.check_in_date);

    IF ((new.check_in_date != old.check_in_date) OR (new.check_out_date != old.check_out_date)) THEN
        -- remove old reservation
        WHILE x < num_days DO
                UPDATE AVAILABILITY
                SET num_reserved = (num_reserved - 1)
                WHERE ((date = DATE_ADD(old.check_in_date, INTERVAL x DAY)) AND
                       (roomtype = old.roomtype_id));
                SET x = x + 1;
            END WHILE;

        -- add new reservation
        WHILE x < num_days DO
                SET curr_date = DATE_ADD(old.check_in_date, INTERVAL x DAY);
                UPDATE AVAILABILITY
                SET num_reserved = (num_reserved + 1)
                WHERE ((date = curr_date) AND
                       (roomtype = new.roomtype_id));
                SET x = x + 1;

                SELECT num_reserved INTO num_res FROM AVAILABILITY WHERE date=curr_date AND roomtype=new.roomtype_id;
                CALL check_isAvail_after_upd(new.roomtype_id, num_res, curr_date);

            END WHILE;
    END IF;
END $$


-- Updates amount paid on invoice when a payment is inserted
CREATE TRIGGER upd_invoice_after_payment AFTER INSERT ON PAYMENT
    FOR EACH ROW
BEGIN
    UPDATE INVOICE
    SET amount_paid = amount_paid + new.payment_amount
    WHERE invoice_id = new.invoice_id;
END $$


-- Updates invoice total when a new invoice charge is inserted
CREATE TRIGGER upd_invoice_after_charge AFTER INSERT ON INVOICECHARGE
    FOR EACH ROW
BEGIN
    UPDATE INVOICE
    SET total_amount = total_amount + new.charge_amount
    WHERE invoice_id = new.invoice_id;
END $$


DELIMITER ;
