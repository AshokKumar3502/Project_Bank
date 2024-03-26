///    ORIGINAL CODE
const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const kafka = require("kafka-node");
const redis = require("redis");
const crypto = require("crypto");

const {
  createNewAccount,
  withdraw,
  deposit,
  transfer,
  checkBalance,
  usersList,
} = require("./consumer");

// Create Kafka producer
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" });
const producer = new Producer(client);

// Create MySQL database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "bankdb",
});



const redisClient = redis.createClient();

redisClient.on('error', err => console.log('Redis Client Error', err));

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis server!');
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
}

connectRedis();


  
// Utility function to generate UTR code
function generateUTR() {
  const timestamp = Date.now().toString();
  const randomString = crypto.randomBytes(16).toString("hex").substr(0, 5);
  return timestamp + randomString;
}

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});



// Kafka producer ready event
producer.on("ready", () => {
  console.log("Kafka Producer is ready");
});



// Endpoint to create a new account
app.post("/create", (req, res) => {
  const utr = generateUTR();
  const msg = {
    action: "create-account",
    data: {
      ...req.body,
      utr,
      status: "success",
      message: "Account creation request sent."
    }
  };
  
  // Store the account data in Redis
  redisClient.set(`account:${utr}`, msg.data, (err, reply) => {
    if (err) {
      console.error("Error storing account data in Redis:", err);
      res
        .status(500)
        .json({ status: "Error", message: "Internal Server Error" });
    } else {
      console.log("Account data stored in Redis:", reply);
      // Publish the message to Kafka
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
              .json({ status: "Success", message: "Account creation request sent.", utr });
          }
        }
      );
    }
  });
});

// Endpoint to deposit funds
app.put("/deposit", async (req, res) => {
  try {
    const { acId, amount } = req.body;

    if (!acId || !amount) {
      return res.status(400).json({
        status: "Error",
        message: "Missing required fields: acId and amount",
      });
    }

    const utr = generateUTR();
    const msg = {
      action: "deposit",
      data: {
        acId,
        amount,
        utr,
        status: "success",
        message: "Deposit request sent.",
      },
    };

    // Store UTR and message data in Redis with expiration
    redisClient.set(utr, JSON.stringify(msg), "EX", 3600, (error, reply) => {
      if (error) {
        console.error("Error setting value in Redis:", error);
      } else {
        console.log("Value stored in Redis:", reply);
      }
    });
    // Send message to Kafka
    producer.send([{ topic: "deposit", messages: JSON.stringify(msg) }]);

    res.status(200).json({
      status: "Success",
      message: "Deposit request sent.",
      utr,
      amount,
      acId,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
});

// Endpoint to withdraw funds
app.put("/withdraw", async (req, res) => {
  try {
    const { acId, amount } = req.body;

    if (!acId || !amount) {
      return res.status(400).json({
        status: "Error",
        message: "Missing required fields: acId and amount",
      });
    }

    const utr = generateUTR();
    const msg = {
      action: "withdraw",
      data: {
        acId,
        amount,
        utr,
        status: "success",
        message: "Withdrawal request sent.",
      },
    };

    // Store UTR and message data in Redis with expiration
    redisClient.set(utr, JSON.stringify(msg), "EX", 3600, (error, reply) => {
      if (error) {
        console.error("Error setting value in Redis:", error);
      } else {
        console.log("Value stored in Redis:", reply);
      }
    });

    // Send message to Kafka
    producer.send([{ topic: "withdraw", messages: JSON.stringify(msg) }]);

    res.status(200).json({
      status: "Success",
      message: "Withdrawal request sent.",
      utr,
      amount,
      acId,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
});

// Endpoint to transfer funds
app.put("/transfer", async (req, res) => {
  try {
    const { srcId, destId, amount } = req.body;

    if (!srcId || !destId || !amount) {
      return res.status(400).json({
        status: "Error",
        message: "Missing required fields: srcId, destId, and amount",
      });
    }

    const utr = generateUTR();
    const msg = {
      action: "transfer",
      data: {
        srcId,
        destId,
        amount,
        utr,
        status: "success",
        message: "Transfer request sent.",
      },
    };

    // Store UTR and message data in Redis with expiration
    redisClient.set(utr, JSON.stringify(msg), "EX", 3600, (error, reply) => {
      if (error) {
        console.error("Error setting value in Redis:", error);
      } else {
        console.log("Value stored in Redis:", reply);
      }
    });
    // Send message to Kafka
    producer.send([{ topic: "transfer", messages: JSON.stringify(msg) }]);

    res.status(200).json({
      status: "Success",
      message: "Transfer request sent.",
      utr,
      amount,
      destId,
      srcId,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
});

// Endpoint to check balance
app.get("/balance/:acId", (req, res) => {
  const acId = req.params.acId;
  const utr = generateUTR();
  const msg = {
    action: "check-balance",
    data: {
      acId,
      utr,
      status: "success",
      message: "Balance check request sent.",
    },
  };

  // Send message to Kafka
  producer.send([{ topic: "balance-check", messages: JSON.stringify(msg) }]);

  res.status(200).json({
    status: "Success",
    message: "Balance check request sent.",
    utr,
    acId,
  });
});

// Endpoint to get user list
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

// Start server
const port = 3100;
app.listen(port, () => {
  console.log(`Banking App listening on port: ${port}`);
});



































































//*****

//WITHOUT KAFKA CONNECTION

//*****

// const express = require("express");
// const app = express();
// const cors = require("cors");
// const mysql = require("mysql");

// const {
//   createNewAccount,
//   withdraw,
//   deposit,
//   transfer,
//   checkBalance,
//   usersList,
// } = require("./consumer");

// app.use(cors());
// app.use(express.json());

// // MySQL database connection
// const connection = mysql.createConnection({
//   host: "localhost", // Replace with your MySQL host
//   user: "root", // Replace with your MySQL username
//   password: "password", // Replace with your MySQL password
//   database: "bankdb", // Replace with your MySQL database name
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to MySQL database:", err);
//   } else {
//     console.log("Connected to MySQL database");
//   }
// });

// const port = 3100;

// // Importing necessary modules
// const crypto = require('crypto');

// // Function to generate UTR number

// // Function to generate a random numeric string
// function generateRandomNumericString(length) {
//   const characters = '0123456789';
//   let result = '';
//   for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// }

// // Function to generate a UTR code containing only numbers
// function generateUTR() {
//   // Generate a timestamp (Unix timestamp in milliseconds)
//   const timestamp = Date.now().toString();

//   // Generate a random numeric string
//   const randomString = generateRandomNumericString(5);

//   // Generate a unique identifier (e.g., UUID)
//   const uniqueID = crypto.randomBytes(16).toString('hex');

//   // Concatenate timestamp, random string, and unique identifier to create UTR code
//   const utrCode = timestamp + randomString + uniqueID;

//   return utrCode;
// }

// // Endpoint to create a new account
// app.post("/create", (req, res) => {
//   const utr = generateUTR();
//   const { acNm, balance } = req.body;
//   const query = `INSERT INTO Kafkadatbase (ac_nm, balance, UTR_number) VALUES ('${acNm}', ${balance}, '${utr}')`;
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error creating new account:", err);
//       res.status(500).json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       res.status(200).json({ status: "Success", message: "Account created successfully", utr });
//     }
//   });
// });

// // Endpoint to deposit funds
// app.put("/deposit", (req, res) => {
//   const utr = generateUTR();
//   const { acId, amount } = req.body;
//   const query = `UPDATE Kafkadatbase SET balance = balance + ${amount}, UTR_number = '${utr}' WHERE id = ${acId}`;
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error depositing funds:", err);
//       res.status(500).json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       res.status(200).json({ status: "Success", message: "Deposit successful", utr });
//     }
//   });
// });

// // Endpoint to withdraw funds
// app.put("/withdraw", (req, res) => {
//   const utr = generateUTR();
//   const { acId, amount } = req.body;
//   const query = `UPDATE Kafkadatbase SET balance = balance - ${amount}, UTR_number = '${utr}' WHERE id = ${acId}`;
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error withdrawing funds:", err);
//       res.status(500).json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       res.status(200).json({ status: "Success", message: "Withdrawal successful", utr });
//     }
//   });
// });

// // Endpoint to transfer funds
// app.put("/transfer", (req, res) => {
//   const utr = generateUTR();
//   const { srcId, destId, amount } = req.body;
//   const transferQuery = `UPDATE Kafkadatbase
//                          SET balance = CASE
//                            WHEN id = ${srcId} THEN balance - ${amount}
//                            WHEN id = ${destId} THEN balance + ${amount}
//                          END,
//                          UTR_number = '${utr}'
//                          WHERE id IN (${srcId}, ${destId})`;
//   connection.query(transferQuery, (err, results) => {
//     if (err) {
//       console.error("Error transferring funds:", err);
//       res.status(500).json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       res.status(200).json({ status: "Success", message: "Transfer successful", utr });
//     }
//   });
// });

// // Endpoint to check balance
// app.get("/balance/:acId", (req, res) => {
//   const acId = req.params.acId;
//   const utr = generateUTR();
//   const query = `SELECT balance FROM Kafkadatbase WHERE id = ${acId}`;
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error checking balance:", err);
//       res.status(500).json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       if (results.length === 0) {
//         res.status(404).json({ status: "Error", message: "Account not found" });
//       } else {
//         res.status(200).json({ status: "Success", balance: results[0].balance, utr });
//       }
//     }
//   });
// });

// // Endpoint to get user details
// app.get("/users", (req, res) => {
//   const query = "SELECT * FROM Kafkadatbase";
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error retrieving user data:", err);
//       res.status(500).json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       res.status(200).json({ status: "Success", users: results });
//     }
//   });
// });

// app.listen(port, () => {
//   console.log(`Banking App listening on port: ${port}`);
// });

///REDIS CODE

// const express = require("express");
// const app = express();
// const cors = require("cors");
// const mysql = require("mysql");
// const redis = require("redis");

// const {
//   createNewAccount,
//   withdraw,
//   deposit,
//   transfer,
//   checkBalance,
//   usersList,
// } = require("./consumer");

// app.use(cors());
// app.use(express.json());

// // MySQL database connection
// const connection = mysql.createConnection({
//   host: "localhost", // Replace with your MySQL host
//   user: "root", // Replace with your MySQL username
//   password: "password", // Replace with your MySQL password
//   database: "bankdb", // Replace with your MySQL database name
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to MySQL database:", err);
//   } else {
//     console.log("Connected to MySQL database");
//   }
// });

// const port = 3100;

// // Redis client
// const redisClient = redis.createClient({
//   host: "localhost", // Replace with your Redis server's hostname or IP address
//   port: 6379, // Default Redis port
// });

// redisClient.on("error", (error) => {
//   console.error("Redis client error:", error);
// });

// // Importing necessary modules
// const crypto = require("crypto");

// // Function to generate UTR number

// // Function to generate a random numeric string
// function generateRandomNumericString(length) {
//   const characters = "0123456789";
//   let result = "";
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// }

// // Function to generate a UTR code containing only numbers
// function generateUTR() {
//   // Generate a timestamp (Unix timestamp in milliseconds)
//   const timestamp = Date.now().toString();

//   // Generate a random numeric string
//   const randomString = generateRandomNumericString(5);

//   // Generate a unique identifier (e.g., UUID)
//   const uniqueID = crypto.randomBytes(16).toString('hex');

//   // Concatenate timestamp, random string, and unique identifier to create UTR code
//   const utrCode = timestamp + randomString + uniqueID;

//   return utrCode;
// }

// // Endpoint to create a new account with transaction data in Redis
// app.post("/create", async (req, res) => {
//   try {
//     const utr = generateUTR();
//     const { acNm, balance } = req.body;

//     const account = await createNewAccount({ acNm, balance }); // Call consumer function

//     const transactionData = {
//       ac_nm: acNm,
//       transaction_type: "create_account",
//       previous_balance: 0,
//       new_balance: balance,
//       timestamp: Date.now(),
//     };
//     await redisClient.rpush("transactions", JSON.stringify(transactionData));

//     res.status(200).json({ status: "Success", message: "Account created successfully", utr, account });
//   } catch (error) {
//     console.error("Error creating new account:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
// });

// // Similar endpoints for deposit, withdraw, and transfer with transaction data storage in Redis (using rpush):

// // ... modify deposit, withdraw, and transfer endpoints ...

// // Endpoint to deposit funds
// app.put("/deposit", async (req, res) => {
//   try {
//     const utr = generateUTR();
//     const { acId, amount } = req.body;

//     // Call consumer function and store transaction data in Redis
//     // ... similar structure as create endpoint ...

//     res.status(200).json({ status: "Success", message: "Deposit successful", utr });
//   } catch (error) {
//     console.error("Error depositing funds:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
// });

// // Endpoint to withdraw funds
// app.put("/withdraw", async (req, res) => {
//   try {
//     const utr = generateUTR();
//     const { acId, amount } = req.body;

//     // Call consumer function and store transaction data in Redis
//     // ... similar structure as create endpoint ...

//     res.status(200).json({ status: "Success", message: "Withdrawal successful", utr });
//   } catch (error) {
//     console.error("Error withdrawing funds:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
// });

// // Endpoint to transfer funds
// // Endpoint to transfer funds
// app.put("/transfer", async (req, res) => {
//   try {
//     const utr = generateUTR();
//     const { srcId, destId, amount } = req.body;

//     // Call consumer function and store transaction data in Redis
//     await transfer({ srcId, destId, amount }); // Call consumer function

//     const transactionData = {
//       src_id: srcId,
//       dest_id: destId,
//       transaction_type: "transfer",
//       amount,
//       // ... include previous and new balances for both accounts ...
//     };
//     await redisClient.rpush("transactions", JSON.stringify(transactionData));

//     res.status(200).json({ status: "Success", message: "Transfer successful", utr });
//   } catch (error) {
//     console.error("Error transferring funds:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
// });

// // Endpoint to check balance (no changes)
// app.get("/balance/:acId", (req, res) => {
//   const acId = req.params.acId;
//   const utr = generateUTR();
//   const query = `SELECT balance FROM Kafkadatbase WHERE id = ${acId}`;
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error checking balance:", err);
//       res.status(500).json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       if (results.length === 0) {
//         res.status(404).json({ status: "Error", message: "Account not found" });
//       } else {
//         res.status(200).json({ status: "Success", balance: results[0].balance, utr });
//       }
//     }
//   });
// });

// // Endpoint to get user details (no changes)
// app.get("/users", (req, res) => {
//   const query = "SELECT * FROM Kafkadatbase";
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error retrieving user data:", err);
//       res.status(500).json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       res.status(200).json({ status: "Success", users: results });
//     }
//   });
// });

// app.listen(port, () => {
//   console.log(`Banking App listening on port: ${port}`);
// });












































// const express = require("express");
// const app = express();
// const cors = require("cors");
// const mysql = require("mysql");

// const {
//   createNewAccount,
//   withdraw,
//   deposit,
//   transfer,
//   checkBalance,
//   usersList,
// } = require("./consumer");

// app.use(cors());
// app.use(express.json());

// const kafka = require("kafka-node");
// const Producer = kafka.Producer;
// const client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" });
// const producer = new Producer(client);

// // MySQL database connection
// const connection = mysql.createConnection({
//   host: "localhost", // Replace with your MySQL host
//   user: "root", // Replace with your MySQL username
//   password: "password", // Replace with your MySQL password
//   database: "bankdb", // Replace with your MySQL database name
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to MySQL database:", err);
//   } else {
//     console.log("Connected to MySQL database");
//   }
// });

// producer.on("ready", () => {
//   console.log("Kafka Producer is ready");
// });

// const port = 3100;

// // Importing necessary modules
// const crypto = require('crypto');

// // Function to generate UTR number

// // Function to generate a random numeric string
// function generateRandomNumericString(length) {
//   const characters = '0123456789';
//   let result = '';
//   for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// }

// // Function to generate a UTR code containing only numbers
// function generateUTR() {
//   // Generate a timestamp (Unix timestamp in milliseconds)
//   const timestamp = Date.now().toString();

//   // Generate a random numeric string
//   const randomString = generateRandomNumericString(5);

//   // Generate a unique identifier (e.g., UUID)
//   const uniqueID = crypto.randomBytes(16).toString('hex');

//   // Concatenate timestamp, random string, and unique identifier to create UTR code
//   const utrCode = timestamp + randomString + uniqueID;
  
//   return utrCode;
// }

// // Example usage
// const utr = generateUTR();




// // Endpoint to create a new account
// app.post("/create", (req, res) => {
//   const utr = generateUTR();
//   const msg = { 
//     action: "create-account", 
//     data: { 
//       ...req.body, 
//       utr, 
//       status: "success", 
//       message: "Account creation request sent." 
//     } 
//   };
//   producer.send(
//     [{ topic: "new-account", messages: JSON.stringify(msg) }],
//     (err, data) => {
//       if (err) {
//         console.error("Error sending message:", err);
//         res
//           .status(500)
//           .json({ status: "Error", message: "Internal Server Error" });
//       } else {
//         res
//           .status(200)
//           .json({ status: "Success", message: "Account creation request sent.", utr });
//       }
//     }
//   );
// });

// // Endpoint to deposit funds
// app.put("/deposit", (req, res) => {
//   const utr = generateUTR();
//   const { acId, amount } = req.body;
//   const msg = {
//     action: "deposit",
//     data: { 
//       acId, 
//       amount, 
//       utr, 
//       status: "success ", 
//       message: "Deposit request sent." 
//     }
//   };
//   producer.send(
//     [{ topic: "new-account", messages: JSON.stringify(msg) }],
//     (err, data) => {
//       if (err) {
//         console.error("Error sending message:", err);
//         res
//           .status(500)
//           .json({ status: "Error", message: "Internal Server Error" });
//       } else {
//         res
//           .status(200)
//           .json({ status: "Success", message: "Deposit request sent.", utr, amount ,acId});
//       }
//     }
//   );
// });

// // Endpoint to withdraw funds
// app.put("/withdraw", (req, res) => {
//   const utr = generateUTR();
//   const { acId, amount } = req.body;
//   const msg = {
//     action: "withdraw",
//     data: { 
//       acId, 
//       amount, 
//       utr, 
//       status: "success", 
//       message: "Withdrawal request sent." 
//     }
//   };
//   producer.send(
//     [{ topic: "new-account", messages: JSON.stringify(msg) }],
//     (err, data) => {
//       if (err) {
//         console.error("Error sending message:", err);
//         res
//           .status(500)
//           .json({ status: "Error", message: "Internal Server Error" });
//       } else {
//         res
//           .status(200)
//           .json({ status: "Success", message: "Withdrawal request sent.", utr, amount,acId });
//       }
//     }
//   );
// });

// // Endpoint to transfer funds
// app.put("/transfer", (req, res) => {
//   const utr = generateUTR();
//   const { srcId, destId, amount } = req.body;
//   const msg = {
//     action: "transfer",
//     data: { 
//       srcId, 
//       destId, 
//       amount, 
//       utr, 
//       status: "success", 
//       message: "Transfer request sent." 
//     }
//   };
//   producer.send(
//     [{ topic: "new-account", messages: JSON.stringify(msg) }],
//     (err, data) => {
//       if (err) {
//         console.error("Error sending message:", err);
//         res
//           .status(500)
//           .json({ status: "Error", message: "Internal Server Error" });
//       } else {
//         res
//           .status(200)
//           .json({ status: "Success", message: "Transfer request sent.", utr, amount,destId,srcId });
//       }
//     }
//   );
// });

// // Endpoint to check balance
// app.get("/balance/:acId", (req, res) => {
//   const acId = req.params.acId;
//   const utr = generateUTR();
//   const msg = { 
//     action: "check-balance", 
//     data: { 
//       acId, 
//       utr, 
//       status: "success", 
//       message: "Balance check request sent." 
//     } 
//   };
//   producer.send(
//     [{ topic: "new-account", messages: JSON.stringify(msg) }],
//     (err, data) => {
//       if (err) {
//         console.error("Error sending message:", err);
//         res
//           .status(500)
//           .json({ status: "Error", message: "Internal Server Error" });
//       } else {
//         res
//           .status(200)
//           .json({ status: "Success", message: "Balance check request sent.", utr ,acId});
//       }
//     }
//   );
// });

// // Endpoint to get user details
// app.get("/users", (req, res) => {
//   const query = "SELECT * FROM Kafkadatbase";
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error retrieving user data:", err);
//       res
//         .status(500)
//         .json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       res.status(200).json({ status: "Success", users: results });
//     }
//   });
// });

// app.listen(port, () => {
//   console.log(`Banking App listening on port: ${port}`);
// });


















