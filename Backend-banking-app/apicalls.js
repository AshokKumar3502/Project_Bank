const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql");

const {
  createNewAccount,
  withdraw,
  deposit,
  transfer,
  checkBalance,
  usersList,
} = require("./server");

app.use(cors());
app.use(express.json());

const kafka = require("kafka-node");
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" });
const producer = new Producer(client);

// MySQL database connection
const connection = mysql.createConnection({
  host: "localhost", // Replace with your MySQL host
  user: "root", // Replace with your MySQL username
  password: "password", // Replace with your MySQL password
  database: "bankdb", // Replace with your MySQL database name
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

producer.on("ready", () => {
  console.log("Kafka Producer is ready");
});

const port = 3100;

// Endpoint to create a new account
app.post("/create", (req, res) => {
  const msg = { action: "create-account", data: req.body };
  producer.send(
    [{ topic: "new-account", messages: JSON.stringify(msg) }],
    (err, data) => {
      if (err) {
        console.error("Error sending message:", err);
        res
          .status(500)
          .json({ status: "Error", message: "Internal Server Error" });
      } else {
        res
          .status(200)
          .json({
            status: "Success",
            message: "Account creation request sent.",
          });
      }
    }
  );
});


// Endpoint to deposit funds
app.put("/deposit", (req, res) => {
  const msg = { action: "deposit", data: req.body };
  producer.send(
    [{ topic: "deposit", messages: JSON.stringify(msg) }],
    (err, data) => {
      if (err) {
        console.error("Error sending message:", err);
        res
          .status(500)
          .json({ status: "Error", message: "Internal Server Error" });
      } else {
        res
          .status(200)
          .json({ status: "Success", message: "Deposit request sent." });
      }
    }
  );
});

// Endpoint to withdraw funds
app.put("/withdraw", (req, res) => {
  const msg = { action: "withdraw", data: req.body };
  producer.send(
    [{ topic: "withdraw", messages: JSON.stringify(msg) }],
    (err, data) => {
      if (err) {
        console.error("Error sending message:", err);
        res
          .status(500)
          .json({ status: "Error", message: "Internal Server Error" });
      } else {
        res
          .status(200)
          .json({ status: "Success", message: "Withdrawal request sent." });
      }
    }
  );
});

// Endpoint to transfer funds
app.put("/transfer", (req, res) => {
  const msg = { action: "transfer", data: req.body };
  producer.send(
    [{ topic: "transfer", messages: JSON.stringify(msg) }],
    (err, data) => {
      if (err) {
        console.error("Error sending message:", err);
        res
          .status(500)
          .json({ status: "Error", message: "Internal Server Error" });
      } else {
        res
          .status(200)
          .json({ status: "Success", message: "Transfer request sent." });
      }
    }
  );
});

// Endpoint to check balance
app.get("/balance/:acId", (req, res) => {
  const acId = req.params.acId;
  const msg = { action: "check-balance", data: { acId } };
  producer.send(
    [{ topic: "check-balance", messages: JSON.stringify(msg) }],
    (err, data) => {
      if (err) {
        console.error("Error sending message:", err);
        res
          .status(500)
          .json({ status: "Error", message: "Internal Server Error" });
      } else {
        res
          .status(200)
          .json({ status: "Success", message: "Balance check request sent." });
      }
    }
  );
});

// Endpoint to get user details
app.get("/users", (req, res) => {
  const query = "SELECT * FROM Kafkadatbase";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving user data:", err);
      res
        .status(500)
        .json({ status: "Error", message: "Internal Server Error" });
    } else {
      res.status(200).json({ status: "Success", users: results });
    }
  });
});

app.listen(port, () => {
  console.log(`Banking App listening on port: ${port}`);
});
