
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
// // Redis client

// const redis = require("redis"); // Import the redis module

// const redisClient = redis.createClient({
//   host: "localhost", // Update with your Redis host
//   port: 6379, // Update with your Redis port (default)
// }); // Create the Redis client

// redisClient
//   .connect()
//   .then(() => {
//     console.log("Connected to Redis server!");
//     // Use redisClient for your operations here
//   })
//   .catch((error) => {
//     console.error("Redis connection failed:", error);
//   });
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
//   const uniqueID = crypto.randomBytes(16).toString("hex");

//   // Concatenate timestamp, random string, and unique identifier to create UTR code
//   const utrCode = timestamp + randomString + uniqueID;

//   return utrCode;
// }

// // Example usage
// const utr = generateUTR();

// // Endpoint to create a new account
// app.post("/create", async (req, res) => {
//   const utr = generateUTR();
//   const msg = {
//     action: "create-account",
//     data: {
//       ...req.body,
//       utr,
//       status: "success",
//       message: "Account creation request sent.",
//     },
//   };

//   try {
//     producer.send({
//       topic: "new-account",
//       messages: JSON.stringify(msg),
//     });

//     // Store UTR in Redis with appropriate expiration (e.g., 1 hour)
//     await redisClient.set(utr, JSON.stringify(msg), "EX", 3600);

//     res
//       .status(200)
//       .json({
//         status: "Success",
//         message: "Account creation request sent.",
//         utr,
//       });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
// });

// // Endpoint to deposit funds
// app.put("/deposit", async (req, res) => {
//   try {
//     const utr = generateUTR();
//     const { acId, amount } = req.body;

//     if (!acId || !amount) {
//       return res
//         .status(400)
//         .json({
//           status: "Error",
//           message: "Missing required fields: acId and amount",
//         });
//     }

//     const msg = {
//       action: "deposit",
//       data: {
//         acId,
//         amount,
//         utr,
//         status: "success",
//         message: "Deposit request sent.",
//       },
//     };

//     // Store UTR and message data in Redis with appropriate expiration (e.g., 1 hour)
//     await redisClient.set(utr, JSON.stringify(msg), "EX", 3600);

//     producer.send({
//       topic: "deposit", // Update with the correct deposit topic name
//       messages: JSON.stringify(msg),
//     });

//     res
//       .status(200)
//       .json({
//         status: "Success",
//         message: "Deposit request sent.",
//         utr,
//         amount,
//         acId,
//       });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
// });

// // Endpoint to withdraw funds
// app.put("/withdraw", async (req, res) => {
//   try {
//     const utr = generateUTR();
//     const { acId, amount } = req.body;

//     if (!acId || !amount) {
//       return res
//         .status(400)
//         .json({
//           status: "Error",
//           message: "Missing required fields: acId and amount",
//         });
//     }

//     const msg = {
//       action: "withdraw",
//       data: {
//         acId,
//         amount,
//         utr,
//         status: "success",
//         message: "Withdrawal request sent.",
//       },
//     };

//     // Store UTR and message data in Redis with appropriate expiration (e.g., 1 hour)
//     await redisClient.set(utr, JSON.stringify(msg), "EX", 3600);

//     producer.send({
//       topic: "withdraw", // Update with the correct withdrawal topic name
//       messages: JSON.stringify(msg),
//     });

//     res
//       .status(200)
//       .json({
//         status: "Success",
//         message: "Withdrawal request sent.",
//         utr,
//         amount,
//         acId,
//       });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
// });

// // Endpoint to transfer funds
// app.put("/transfer", async (req, res) => {
//   try {
//     const utr = generateUTR();
//     const { srcId, destId, amount } = req.body;

//     if (!srcId || !destId || !amount) {
//       return res
//         .status(400)
//         .json({
//           status: "Error",
//           message: "Missing required fields: srcId, destId, and amount",
//         });
//     }

//     const msg = {
//       action: "transfer",
//       data: {
//         srcId,
//         destId,
//         amount,
//         utr,
//         status: "success",
//         message: "Transfer request sent.",
//       },
//     };
//     // Store UTR and message data in Redis with appropriate expiration (e.g., 1 hour)
//     await redisClient.set(utr, JSON.stringify(msg), "EX", 3600);

//     producer.send({
//       topic: "transfer", // Update with the correct transfer topic name
//       messages: JSON.stringify(msg),
//     });

//     res
//       .status(200)
//       .json({
//         status: "Success",
//         message: "Transfer request sent.",
//         utr,
//         amount,
//         destId,
//         srcId,
//       });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
// });
// // Endpoint to check balance
// // Endpoint to check balance
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
//       message: "Balance check request sent.",
//     },
//   };
//   producer.send([
//     { topic: "new-account", messages: JSON.stringify(msg) }
//   ], (err, data) => {
//     if (err) {
//       console.error("Error sending message:", err);
//       res
//         .status(500)
//         .json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       res
//         .status(200)
//         .json({
//           status: "Success",
//           message: "Balance check request sent.",
//           utr,
//           acId,
//         });
//     }
//   });
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














// const express = require("express");
// const app = express();
// const cors = require("cors");
// const mysql = require("mysql");
// const kafka = require("kafka-node");
// const redis = require("redis");
// const crypto = require("crypto");

// // Create Kafka producer
// const Producer = kafka.Producer;
// const client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" });
// const producer = new Producer(client);

// // Create MySQL database connection
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "password",
//   database: "bankdb",
// });




//   // Store UTR and message data in Redis with expiration
//   redisClient.set(utr, JSON.stringify(msg), 'EX', 3600, (error, reply) => {
//     if (error) {
//       console.error("Error setting value in Redis:", error);
//       res.status(500).json({ status: "Error", message: "Internal Server Error" });
//     } else {
//       console.log("Value stored in Redis:", reply);

      



// const redisClient = redis.createClient({
//   host: "localhost", // Update with your Redis host
//   port: 6379, // Update with your Redis port (default)
// }); // Create the Redis client

// redisClient
//   .connect()
//   .then(() => {
//     console.log("Connected to Redis server!");
//   })
//   .catch((error) => {
//     console.error("Redis connection failed:", error);
//   });

// // Utility function to generate UTR code
// function generateUTR() {
//   const timestamp = Date.now().toString();
//   const randomString = crypto.randomBytes(16).toString("hex").substr(0, 5);
//   return timestamp + randomString;
// }

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Connect to MySQL database
// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to MySQL database:", err);
//   } else {
//     console.log("Connected to MySQL database");
//   }
// });

// // Connect to Redis server
// redisClient.on("connect", () => {
//   console.log("Connected to Redis server");
// });

// // Kafka producer ready event
// producer.on("ready", () => {
//   console.log("Kafka Producer is ready");
// });

// // Endpoint to deposit funds
// app.put("/deposit", async (req, res) => {
//   try {
//     const { acId, amount } = req.body;

//     if (!acId || !amount) {
//       return res.status(400).json({
//         status: "Error",
//         message: "Missing required fields: acId and amount",
//       });
//     }

//     const utr = generateUTR();
//     const msg = {
//       action: "deposit",
//       data: {
//         acId,
//         amount,
//         utr,
//         status: "success",
//         message: "Deposit request sent.",
//       },
//     };

//     // Store UTR and message data in Redis with expiration
//     redisClient.set(utr, JSON.stringify(msg), 'EX', 3600, (error, reply) => {
//       if (error) {
//         console.error("Error setting value in Redis:", error);
//       } else {
//         console.log("Value stored in Redis:", reply);
//       }
//     });
//     // Send message to Kafka
//     producer.send([{ topic: "deposit", messages: JSON.stringify(msg) }]);

//     res.status(200).json({
//       status: "Success",
//       message: "Deposit request sent.",
//       utr,
//       amount,
//       acId,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
// });

// // Endpoint to withdraw funds
// app.put("/withdraw", async (req, res) => {
//   try {
//     const { acId, amount } = req.body;

//     if (!acId || !amount) {
//       return res.status(400).json({
//         status: "Error",
//         message: "Missing required fields: acId and amount",
//       });
//     }

//     const utr = generateUTR();
//     const msg = {
//       action: "withdraw",
//       data: {
//         acId,
//         amount,
//         utr,
//         status: "success",
//         message: "Withdrawal request sent.",
//       },
//     };

//     // Store UTR and message data in Redis with expiration
//     redisClient.set(utr, JSON.stringify(msg), 'EX', 3600, (error, reply) => {
//       if (error) {
//         console.error("Error setting value in Redis:", error);
//       } else {
//         console.log("Value stored in Redis:", reply);
//       }
//     });

//     // Send message to Kafka
//     producer.send([{ topic: "withdraw", messages: JSON.stringify(msg) }]);

//     res.status(200).json({
//       status: "Success",
//       message: "Withdrawal request sent.",
//       utr,
//       amount,
//       acId,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
// });

// // Endpoint to transfer funds
// app.put("/transfer", async (req, res) => {
//   try {
//     const { srcId, destId, amount } = req.body;

//     if (!srcId || !destId || !amount) {
//       return res.status(400).json({
//         status: "Error",
//         message: "Missing required fields: srcId, destId, and amount",
//       });
//     }

//     const utr = generateUTR();
//     const msg = {
//       action: "transfer",
//       data: {
//         srcId,
//         destId,
//         amount,
//         utr,
//         status: "success",
//         message: "Transfer request sent.",
//       },
//     };

//     // Store UTR and message data in Redis with expiration
//     redisClient.set(utr, JSON.stringify(msg), 'EX', 3600, (error, reply) => {
//       if (error) {
//         console.error("Error setting value in Redis:", error);
//       } else {
//         console.log("Value stored in Redis:", reply);
//       }
//     });
//     // Send message to Kafka
//     producer.send([{ topic: "transfer", messages: JSON.stringify(msg) }]);

//     res.status(200).json({
//       status: "Success",
//       message: "Transfer request sent.",
//       utr,
//       amount,
//       destId,
//       srcId,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "Error", message: "Internal Server Error" });
//   }
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
//       message: "Balance check request sent.",
//     },
//   };

//   // Send message to Kafka
//   producer.send([{ topic: "balance-check", messages: JSON.stringify(msg) }]);

//   res.status(200).json({
//     status: "Success",
//     message: "Balance check request sent.",
//     utr,
//     acId,
//   });
// });

// // Endpoint to get user list
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

// // Start server
// const port = 3100;
// app.listen(port, () => {
//   console.log(`Banking App listening on port: ${port}`);
// });






























// //old code of producers database error:


// ///    ORIGINAL CODE

// // const express = require("express");
// // const app = express();
// // const cors = require("cors");
// // const mysql = require("mysql");
// // const kafka = require("kafka-node");
// // const redis = require("redis");
// // const crypto = require("crypto");

// // const {
// //   createNewAccount,
// //   withdraw,
// //   deposit,
// //   transfer,
// //   checkBalance,
// //   usersList,
// // } = require("./consumer");

// // // Create Kafka producer
// // const Producer = kafka.Producer;
// // const client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" });
// // const producer = new Producer(client);

// // // Create MySQL database connection
// // const connection = mysql.createConnection({
// //   host: "localhost",
// //   user: "root",
// //   password: "password",
// //   database: "bankdb",
// // });



// // const redisClient = redis.createClient();

// // redisClient.on('error', err => console.log('Redis Client Error', err));

// // async function connectRedis() {
// //   try {
// //     await redisClient.connect();
// //     console.log('Connected to Redis server!');
// //   } catch (error) {
// //     console.error('Redis connection failed:', error);
// //   }
// // }

// // connectRedis();


  
// // // Utility function to generate UTR code
// // function generateUTR() {
// //   const timestamp = Date.now().toString();
// //   const randomString = crypto.randomBytes(16).toString("hex").substr(0, 5);
// //   return timestamp + randomString;
// // }

// // // Middleware
// // app.use(cors());
// // app.use(express.json());

// // // Connect to MySQL database
// // connection.connect((err) => {
// //   if (err) {
// //     console.error("Error connecting to MySQL database:", err);
// //   } else {
// //     console.log("Connected to MySQL database");
// //   }
// // });



// // // Kafka producer ready event
// // producer.on("ready", () => {
// //   console.log("Kafka Producer is ready");
// // });



// // // Endpoint to create a new account
// // app.post("/create", (req, res) => {
// //   const utr = generateUTR();
// //   const msg = {
// //     action: "create-account",
// //     data: {
// //       ...req.body,
// //       utr,
// //       status: "success",
// //       message: "Account creation request sent."
// //     }
// //   };
  
// //   // Store the account data in Redis
// //   redisClient.set(`account:${utr}`, msg.data, (err, reply) => {
// //     if (err) {
// //       console.error("Error storing account data in Redis:", err);
// //       res
// //         .status(500)
// //         .json({ status: "Error", message: "Internal Server Error" });
// //     } else {
// //       console.log("Account data stored in Redis:", reply);
// //       // Publish the message to Kafka
// //       producer.send(
// //         [{ topic: "new-account", messages: JSON.stringify(msg) }],
// //         (err, data) => {
// //           if (err) {
// //             console.error("Error sending message:", err);
// //             res
// //               .status(500)
// //               .json({ status: "Error", message: "Internal Server Error" });
// //           } else {
// //             res
// //               .status(200)
// //               .json({ status: "Success", message: "Account creation request sent.", utr });
// //           }
// //         }
// //       );
// //     }
// //   });
// // });

// // // Endpoint to deposit funds
// // app.put("/deposit", async (req, res) => {
// //   try {
// //     const { acId, amount } = req.body;

// //     if (!acId || !amount) {
// //       return res.status(400).json({
// //         status: "Error",
// //         message: "Missing required fields: acId and amount",
// //       });
// //     }

// //     const utr = generateUTR();
// //     const msg = {
// //       action: "deposit",
// //       data: {
// //         acId,
// //         amount,
// //         utr,
// //         status: "success",
// //         message: "Deposit request sent.",
// //       },
// //     };

// //     // Store UTR and message data in Redis with expiration
// //     redisClient.set(utr, JSON.stringify(msg), "EX", 3600, (error, reply) => {
// //       if (error) {
// //         console.error("Error setting value in Redis:", error);
// //       } else {
// //         console.log("Value stored in Redis:", reply);
// //       }
// //     });
// //     // Send message to Kafka
// //     producer.send([{ topic: "deposit", messages: JSON.stringify(msg) }]);

// //     res.status(200).json({
// //       status: "Success",
// //       message: "Deposit request sent.",
// //       utr,
// //       amount,
// //       acId,
// //     });
// //   } catch (error) {
// //     console.error("Error:", error);
// //     res.status(500).json({ status: "Error", message: "Internal Server Error" });
// //   }
// // });

// // // Endpoint to withdraw funds
// // app.put("/withdraw", async (req, res) => {
// //   try {
// //     const { acId, amount } = req.body;

// //     if (!acId || !amount) {
// //       return res.status(400).json({
// //         status: "Error",
// //         message: "Missing required fields: acId and amount",
// //       });
// //     }

// //     const utr = generateUTR();
// //     const msg = {
// //       action: "withdraw",
// //       data: {
// //         acId,
// //         amount,
// //         utr,
// //         status: "success",
// //         message: "Withdrawal request sent.",
// //       },
// //     };

// //     // Store UTR and message data in Redis with expiration
// //     redisClient.set(utr, JSON.stringify(msg), "EX", 3600, (error, reply) => {
// //       if (error) {
// //         console.error("Error setting value in Redis:", error);
// //       } else {
// //         console.log("Value stored in Redis:", reply);
// //       }
// //     });

// //     // Send message to Kafka
// //     producer.send([{ topic: "withdraw", messages: JSON.stringify(msg) }]);

// //     res.status(200).json({
// //       status: "Success",
// //       message: "Withdrawal request sent.",
// //       utr,
// //       amount,
// //       acId,
// //     });
// //   } catch (error) {
// //     console.error("Error:", error);
// //     res.status(500).json({ status: "Error", message: "Internal Server Error" });
// //   }
// // });

// // // Endpoint to transfer funds
// // app.put("/transfer", async (req, res) => {
// //   try {
// //     const { srcId, destId, amount } = req.body;

// //     if (!srcId || !destId || !amount) {
// //       return res.status(400).json({
// //         status: "Error",
// //         message: "Missing required fields: srcId, destId, and amount",
// //       });
// //     }

// //     const utr = generateUTR();
// //     const msg = {
// //       action: "transfer",
// //       data: {
// //         srcId,
// //         destId,
// //         amount,
// //         utr,
// //         status: "success",
// //         message: "Transfer request sent.",
// //       },
// //     };

// //     // Store UTR and message data in Redis with expiration
// //     redisClient.set(utr, JSON.stringify(msg), "EX", 3600, (error, reply) => {
// //       if (error) {
// //         console.error("Error setting value in Redis:", error);
// //       } else {
// //         console.log("Value stored in Redis:", reply);
// //       }
// //     });
// //     // Send message to Kafka
// //     producer.send([{ topic: "transfer", messages: JSON.stringify(msg) }]);

// //     res.status(200).json({
// //       status: "Success",
// //       message: "Transfer request sent.",
// //       utr,
// //       amount,
// //       destId,
// //       srcId,
// //     });
// //   } catch (error) {
// //     console.error("Error:", error);
// //     res.status(500).json({ status: "Error", message: "Internal Server Error" });
// //   }
// // });

// // // Endpoint to check balance
// // app.get("/balance/:acId", (req, res) => {
// //   const acId = req.params.acId;
// //   const utr = generateUTR();
// //   const msg = {
// //     action: "check-balance",
// //     data: {
// //       acId,
// //       utr,
// //       status: "success",
// //       message: "Balance check request sent.",
// //     },
// //   };

// //   // Send message to Kafka
// //   producer.send([{ topic: "balance-check", messages: JSON.stringify(msg) }]);

// //   res.status(200).json({
// //     status: "Success",
// //     message: "Balance check request sent.",
// //     utr,
// //     acId,
// //   });
// // });

// // // Endpoint to get user list
// // app.get("/users", (req, res) => {
// //   const query = "SELECT * FROM Kafkadatbase";
// //   connection.query(query, (err, results) => {
// //     if (err) {
// //       console.error("Error retrieving user data:", err);
// //       res
// //         .status(500)
// //         .json({ status: "Error", message: "Internal Server Error" });
// //     } else {
// //       res.status(200).json({ status: "Success", users: results });
// //     }
// //   });
// // });

// // // Start server
// // const port = 3100;
// // app.listen(port, () => {
// //   console.log(`Banking App listening on port: ${port}`);
// // });






