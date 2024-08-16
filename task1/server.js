const express = require('express');
const app = express();
const axios = require('axios');
const mysql = require('mysql2');
require('dotenv').config();
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect((err) => {
    if (err) throw err;
    else
        console.log("Connected to Mysql");
});

app.use(express.json());

app.post('/createContact', async (req, res) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const mobile_number = req.body.mobile_number;
    const data_store = req.body.data_store;
    if (data_store == "DATABASE") {
        connection.query(`Insert Into contact(first_name, last_name, email, mobile_number) Values(?,?,?,?)`, [first_name, last_name, email, mobile_number], (err, result) => {
            if (err) {
                console.log(`Getting error in Inserting is ${err}`);
                res.status(500).send("Error in creating contact");
            } else {
                const insertId = result.insertId; // Get the inserted contact ID
                console.log(`Given data inserted with id : ${insertId}`);
                res.status(200).send({
                    message: "Contact created",
                    contact_id: insertId
                });

            }
        })
    } else if (data_store == "CRM") {
        try {
            const response = await axios.post('https://domain.myfreshworks.com/crm/sales/api/contacts', {
                "contact": {
                    "first_name": `${first_name}`,
                    "last_name": `${last_name}`,
                    "email": `${email}`,
                    "mobile_number": `${mobile_number}`
                }
            }, {
                headers: {
                    Authorization: `Token token=${process.env.CRM}`,
                    'Content-Type': 'application/json'
                }
            });
            res.send({
                message: "contact added to crm",
                id: response.data.id
            });
        } catch (err) {
            console.log(`Facing error : ${err}`);
            res.status(500).send({
                error: err.message
            });
        }
    }
});

app.post('/updateContact/:id', async (req, res) => {
    const id = req.params.id;
    const new_email = req.body.email;
    const new_mobile_number = req.body.mobile_number;
    const data_store = req.body.data_store;

    if (data_store == "DATABASE") {
        connection.query(`Update contact 
            set email = ? , mobile_number = ?
        where contact_id = ? `, [new_email, new_mobile_number, id], (err) => {
            if (err) {
                console.log(`Facing error in Updating detail with ${err}`);
                res.status(500).send("Error in updating");
            } else {
                console.log(" Contact Updated");
                res.status(200).send("Contact updated");
            }
        });
    } else if (data_store == "CRM") {
        try {
            const response = await axios.put(`https://domain.myfreshworks.com/crm/sales/api/contacts/${id}`, {
                "contact": {
                    "mobile_number": `${new_mobile_number}`,
                    "email": `${new_email}`
                }
            }, {
                headers: {
                    Authorization: `Token token=${process.env.CRM}`,
                    'Content-Type': 'application/json'
                }
            });
            res.send({
                message: "contact updated to crm",
                id: response.data.id
            });
        } catch (err) {
            console.log(`Facing error : ${err}`);
            res.status(500).send({
                error: err.message
            });
        }
    }
});

app.post('/getContact/:id', async (req, res) => {
    const id = req.params.id;
    const data_store = req.body.data_store;

    if (data_store == "DATABASE") {
        connection.query(`Select * from contact where contact_id = ?`, [id], (err, result) => {
            if (err) {
                console.log(`Error is ${err}`);
                res.status(500).send(`You facing error ${err}`);
            } else {
                res.status(200).json(result); // Send the fetched data back to the client
            }
        })
    } else if (data_store == "CRM") {
        try {
            const response = await axios.get(`https://domain.myfreshworks.com/crm/sales/api/contacts/${id}`, {
                headers: {
                    Authorization: `Token token=${process.env.CRM}`,
                    'Content-Type': 'application/json'
                }
            });
            res.send({
                message: "contact added to crm",
                id: response.data.id
            });
        } catch (err) {
            console.log(`Facing error : ${err}`);
            res.status(500).send({
                error: err.message
            });
        }
    }
});

app.post('/deleteContact/:id', async (req, res) => {
    const id = req.params.id;
    const data_store = req.body.data_store;

    if (data_store == "DATABASE") {
        connection.query(`Delete from contact where contact_id = ?`, [id], (err, result) => {
            if (err) {
                console.log("Error in deleting");
                res.status(500).send("Error deleting contact");
            } else {
                console.log("Contact deleted");
                res.status(200).send(`Contact deleted`);
            }
        });
    } else if (data_store == "CRM") {
        try {
            const response = await axios.delete(`https://domain.myfreshworks.com/crm/sales/api/contacts/${id}`, {
                headers: {

                    Authorization: `Token token=${process.env.CRM}`,
                    'Content-Type': 'application/json'
                }
            });
            res.send({
                message: "contact deleted from crm", 
                id: response.data.id
            });
        } catch (err) {
            console.log(`Facing error : ${err}`);
            res.status(500).send({
                error: err.message
            });
        }
    }
})

app.listen(3000, () => {
    console.log("Server is listening at port 3000");
})