// // // const { Sequelize, DataTypes } = require("sequelize");
// // // const { Kafka, Partitioners } = require("kafkajs");
// // // const redis = require("redis");

// // // const sequelize = new Sequelize("bankdb", "root", "password", {
// // //   host: "localhost",
// // //   dialect: "mysql",
// // //   port: 3306,
// // // });

// // // const Account = sequelize.define(
// // //   "Account",
// // //   {
// // //     ac_nm: {
// // //       type: DataTypes.STRING,
// // //       allowNull: false,

// // //     },
// // //     balance: {
// // //       type: DataTypes.FLOAT,
// // //       allowNull: false,
// // //     },
// // //     UTR_number: {
// // //       type: DataTypes.STRING,
// // //       allowNull: false,
// // //     },
// // //   },
// // //   { tableName: "Accounts" } // Updated table name
// // // );

// // // const kafka = new Kafka({
// // //   clientId: "banking-app",
// // //   brokers: ["localhost:9092"],
// // // });

// // // const producer = kafka.producer({
// // //   createPartitioner: Partitioners.LegacyPartitioner,
// // // });

// // // const redisClient = redis.createClient({ host: "localhost", port: 6379 });

// // // const produceMessage = async (topic, message) => {
// // //   try {
// // //     await producer.connect();
// // //     await producer.send({
// // //       topic: topic,
// // //       messages: [{ value: JSON.stringify(message) }],
// // //     });
// // //   } catch (error) {
// // //     console.error(`Error producing message: ${error.message}`);
// // //   } finally {
// // //     await producer.disconnect();
// // //   }
// // // };

// // // const createNewAccount = async (
// // //   { acNm, balance, utr },
// // //   onCreate = undefined
// // // ) => {
// // //   const transaction = await sequelize.transaction();
// // //   try {
// // //     const account = await Account.create(
// // //       { ac_nm, balance, UTR_number: utr },
// // //       { transaction }
// // //     );

// // //     await produceMessage("new-account", {
// // //       accountId: account.id,
// // //       acNm,
// // //       balance,
// // //       utr,
// // //     });

// // //     await redisClient.HMSET(
// // //       `account:${utr}`,
// // //       { ac_nm, balance },
// // //       (err, reply) => {
// // //         if (err) {
// // //           console.error("Error storing account in Redis:", err);
// // //         }
// // //       }
// // //     );

// // //     await transaction.commit();
// // //     console.log("\n ✅ New Customer Created Successfully");
// // //     if (onCreate) {
// // //       onCreate(`\n ✅ Account created successfully `);
// // //     }
// // //   } catch (error) {
// // //     await transaction.rollback();
// // //     console.error(`\n ❌ Problem in Creating the customer: ${error.message}`);
// // //   }
// // // };

// // // const consumer = kafka.consumer({ groupId: "kafka-group" });

// // // // Connect to Kafka consumer
// // // consumer.connect().then(() => {
// // //   consumer.subscribe({ topic: "new-account", fromBeginning: true });

// // //   consumer.run({
// // //     eachMessage: async ({ topic, partition, message }) => {
// // //       const payload = JSON.parse(message.value.toString());

// // //       // Extract data from the Kafka message
// // //       const { action, data } = payload;

// // //       if (action === "create-account") {
// // //         // Check if account data exists in Redis before creating in MySQL
// // //         redisClient.HGETALL(`account:${data.utr}`, async (err, accountData) => {
// // //           if (err) {
// // //             console.error("Error retrieving account from Redis:", err);
// // //           } else {
// // //             if (accountData) {
// // //               console.log(
// // //                 "Account already exists in Redis, skipping creation."
// // //               );
// // //               return;
// // //             }
// // //           }

// // //           // If not found in Redis, create account in MySQL
// // //           try {
// // //             const { acNm, balance, utr } = data;
// // //             await Account.create({ ac_nm, balance, UTR_number: utr });
// // //             console.log("Data inserted into MySQL:", data);
// // //           } catch (error) {
// // //             console.error("Error inserting data into MySQL:", error.message);
// // //           }
// // //         });
// // //       } else if (action === "deposit") {
// // //         try {
// // //           const { acId, amount } = data;
// // //           const account = await Account.findByPk(acId);

// // //           if (!account) {
// // //             console.log("\n ❌ Account not found");
// // //             return;
// // //           }

// // //           // Update the balance in MySQL and Redis
// // //           const currentBalance = parseFloat(account.balance);
// // //           const newBalance = currentBalance + parseFloat(amount);

// // //           // Update the balance in MySQL and Redis
// // //           const updateTransaction = await sequelize.transaction();
// // //           try {
// // //             await account.update(
// // //               { balance: newBalance },
// // //               { transaction: updateTransaction }
// // //             );
// // //             await redisClient.HSET(
// // //               `account:${acId}`,
// // //               "balance",
// // //               newBalance,
// // //               (err, reply) => {
// // //                 if (err) {
// // //                   console.error("Error updating balance in Redis:", err);
// // //                 }
// // //               }
// // //             );
// // //             await updateTransaction.commit();
// // //             console.log(`\n ✅ Amount ${amount} Deposited successfully`);
// // //             console.log(`\n Your Existing Balance is ${newBalance}`);
// // //           } catch (error) {
// // //             await updateTransaction.rollback();
// // //             console.error(`\n ❌ Problem in Depositing: ${error.message}`);
// // //           }
// // //         } catch (error) {
// // //           console.error(`\n ❌ Error retrieving account: ${error.message}`);
// // //         }
// // //       } else if (action === "withdraw") {
// // //         try {
// // //           const { acId, amount } = data;
// // //           const account = await Account.findByPk(acId);

// // //           if (!account) {
// // //             console.log("\n ❌ Account not found");
// // //             return;
// // //           }

// // //           const currentBalance = parseFloat(account.balance);

// // //           if (currentBalance < parseFloat(amount)) {
// // //             console.log("\n ❌ Insufficient balance for withdrawal");
// // //             return;
// // //           }

// // //           const newBalance = currentBalance - parseFloat(amount);

// // //           // Update the balance in MySQL and Redis
// // //           const updateTransaction = await sequelize.transaction();
// // //           try {
// // //             await account.update(
// // //               { balance: newBalance },
// // //               { transaction: updateTransaction }
// // //             );
// // //             await redisClient.HSET(
// // //               `account:${acId}`,
// // //               "balance",
// // //               newBalance,
// // //               (err, reply) => {
// // //                 if (err) {
// // //                   console.error("Error updating balance in Redis:", err);
// // //                 }
// // //               }
// // //             );
// // //             await updateTransaction.commit();
// // //             console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
// // //             console.log(`\n Your Existing Balance is ${newBalance}`);
// // //           } catch (error) {
// // //             await updateTransaction.rollback();
// // //             console.error(`\n ❌ Problem in Withdrawing: ${error.message}`);
// // //           }
// // //         } catch (error) {
// // //           console.error(`\n ❌ Error retrieving account: ${error.message}`);
// // //         }
// // //       } else if (action === "transfer") {
// // //         try {
// // //           const { srcId, destId, amount } = data;
// // //           const [sourceAccount, destinationAccount] = await Promise.all([
// // //             Account.findByPk(srcId),
// // //             Account.findByPk(destId),
// // //           ]);

// // //           if (!sourceAccount || !destinationAccount) {
// // //             console.log("\n ❌ One or more accounts not found");
// // //             return;
// // //           }

// // //           const sourceBalance = parseFloat(sourceAccount.balance);

// // //           if (sourceBalance < parseFloat(amount)) {
// // //             console.log("\n ❌ Insufficient balance for transfer");
// // //             return;
// // //           }

// // //           const newSourceBalance = sourceBalance - parseFloat(amount);
// // //           const newDestinationBalance =
// // //             parseFloat(destinationAccount.balance) + parseFloat(amount);

// // //           // Update balances in MySQL and Redis
// // //           const updateTransaction = await sequelize.transaction();
// // //           try {
// // //             await Promise.all([
// // //               sourceAccount.update(
// // //                 { balance: newSourceBalance },
// // //                 { transaction: updateTransaction }
// // //               ),
// // //               destinationAccount.update(
// // //                 { balance: newDestinationBalance },
// // //                 { transaction: updateTransaction }
// // //               ),
// // //             ]);
// // //             await redisClient.HSET(
// // //               `account:${srcId}`,
// // //               "balance",
// // //               newSourceBalance,
// // //               (err, reply) => {
// // //                 if (err) {
// // //                   console.error("Error updating source balance in Redis:", err);
// // //                 }
// // //               }
// // //             );
// // //             await redisClient.HSET(
// // //               `account:${destId}`,
// // //               "balance",
// // //               newDestinationBalance,
// // //               (err, reply) => {
// // //                 if (err) {
// // //                   console.error(
// // //                     "Error updating destination balance in Redis:",
// // //                     err
// // //                   );
// // //                 }
// // //               }
// // //             );
// // //             await updateTransaction.commit();
// // //             console.log(`\n ✅ Amount ${amount} Transferred successfully`);

// // //             console.log(
// // //               `\n Source Balance: ${newSourceBalance}, Destination Balance: ${newDestinationBalance}`
// // //             );
// // //           } catch (error) {
// // //             await updateTransaction.rollback();
// // //             console.error(`\n ❌ Problem in Transferring: ${error.message}`);
// // //           }
// // //         } catch (error) {
// // //           console.error(`\n ❌ Error retrieving accounts: ${error.message}`);
// // //         }
// // //       } else if (action === "check-balance") {
// // //         try {
// // //           const { acId } = data;

// // //           // Check if balance exists in Redis first
// // //           redisClient.HGET(`account:${acId}`, "balance", (err, balance) => {
// // //             if (err) {
// // //               console.error("Error retrieving balance from Redis:", err);
// // //             } else {
// // //               if (balance) {
// // //                 console.log(`\n Your Existing Balance is ${balance}`);
// // //                 return;
// // //               }
// // //             }
// // //           });

// // //           // If not found in Redis, retrieve from MySQL
// // //           const account = await Account.findByPk(acId);
// // //           if (!account) {
// // //             console.log("\n ❌ Account not found");
// // //             return;
// // //           }
// // //           const balance = account.balance;
// // //           console.log(`\n Your Existing Balance is ${balance}`);
// // //           await redisClient.HSET(
// // //             `account:${acId}`,
// // //             "balance",
// // //             balance,
// // //             (err, reply) => {
// // //               if (err) {
// // //                 console.error("Error caching balance in Redis:", err);
// // //               }
// // //             }
// // //           );
// // //           await produceMessage("balance-check-topic", {
// // //             accountId: acId,
// // //             balance,
// // //           });
// // //         } catch (error) {
// // //           console.error(`\n ❌ Error retrieving account: ${error.message}`);
// // //         }
// // //       } else if (action === "get-users") {
// // //         try {
// // //           const users = await Account.findAll();
// // //           console.log(users);
// // //           await produceMessage("new-account", { users });
// // //         } catch (error) {
// // //           console.error(
// // //             `\n ❌ Problem in Fetching the users: ${error.message}`
// // //           );
// // //         }
// // //       }
// // //     },
// // //   });
// // // });

// // // //USERS-LIST (renamed to get-users for clarity)

// // // const usersList = async (onUsers = undefined) => {
// // //   try {
// // //     const users = await Account.findAll();
// // //     console.log(users);
// // //     await produceMessage("new-account", { users });
// // //     if (onUsers) onUsers(users);
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Fetching the users: ${error.message}`);
// // //   }
// // // };

// // // module.exports = {
// // //   createNewAccount,
 
// // //   usersList, // renamed to get-users
// // // };












// // //                  ORIGINAL CODE

// // const { Sequelize, DataTypes } = require("sequelize");
// // const { Kafka, Partitioners } = require("kafkajs");
// // const redis = require("redis");

// // const sequelize = new Sequelize("bankdb", "root", "password", {
// //   host: "localhost",
// //   dialect: "mysql",
// //   port: 3306,
// // });

// // const Account = sequelize.define(
// //   "Kafkadatbase",
// //   {
// //     ac_nm: {
// //       type: DataTypes.STRING,
// //       allowNull: false,
// //     },
// //     balance: {
// //       type: DataTypes.FLOAT,
// //       allowNull: false,
// //     },
// //     UTR_number:{
// //       type:DataTypes.STRING,
// //       allowNull:false
// //     }
// //   },
// //   { tableName: "Kafkadatbase" }
// // );

// // const kafka = new Kafka({
// //   clientId: "banking-app",
// //   brokers: ["localhost:9092"],
// // });

// // const producer = kafka.producer({
// //   createPartitioner: Partitioners.LegacyPartitioner,
// // });

// // const redisClient = redis.createClient();

// // redisClient.on('error', err => console.error('Redis Client Error', err));

// // const produceMessage = async (topic, message) => {
// //   try {
// //     await producer.connect();
// //     await producer.send({
// //       topic: topic,
// //       messages: [{ value: JSON.stringify(message) }],
// //     });
// //   } catch (error) {
// //     console.error(`Error producing message: ${error.message}`);
// //   } finally {
// //     await producer.disconnect();
// //   }
// // };

// // const createNewAccount = async ({ acNm, balance,utr }, onCreate = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const account = await Account.create(
// //       { ac_nm: acNm, balance: balance ,UTR_number:utr},
// //       { transaction }
// //     );

// //     await produceMessage("new-account", {
// //       accountId: account.id,
// //       acNm,
// //       balance,
// //       utr
// //     });

// //     // Store account balance in Redis
// //     redisClient.set(`account:${account.id}`, balance);

// //     await transaction.commit();
// //     console.log("\n ✅ New Customer Created Successfully");
// //     if (onCreate) {
// //       onCreate(`\n ✅ Account created successfully `);
// //     }
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in Creating the customer: ${error.message}`);
// //   }
// // };

// // const consumer = kafka.consumer({ groupId: "kafka-group" });

// // // Connect to Kafka consumer
// // consumer.connect().then(() => {
// //   consumer.subscribe({ topic: "new-account", fromBeginning: true });

// //   consumer.run({
// //     eachMessage: async ({ topic, partition, message }) => {
// //       const payload = JSON.parse(message.value.toString());

// //       // Extract data from the Kafka message
// //       const { action, data } = payload;

// //       if (action === "create-account") {
// //         // Insert the data into MySQL using Sequelize
// //         try {
// //           const { acNm, balance,utr } = data;
// //           const account = await Account.create({ ac_nm: acNm, balance: balance ,UTR_number: utr});

// //           // Store account balance in Redis
// //           redisClient.set(`account:${account.id}`, balance);

// //           console.log("Data inserted into MySQL:", data);
// //         } catch (error) {
// //           console.error("Error inserting data into MySQL:", error.message);
// //         }
// //       } else if (action === "deposit") {
// //         try {
// //           const { acId, amount } = data;
// //           const account = await Account.findByPk(acId);

// //           if (!account) {
// //             console.log("\n ❌ Account not found");
// //             return;
// //           }

// //           const currentBalance = parseFloat(account.balance);
// //           const newBalance = currentBalance + parseFloat(amount);

// //           // Update the balance in the database
// //           await account.update({ balance: newBalance });

// //           // Update balance in Redis
// //           redisClient.set(`account:${acId}`, newBalance);

// //           console.log(`\n ✅ Amount ${amount} Deposited successfully`);
// //           console.log(`\n Your Existing Balance is ${newBalance}`);
// //         } catch (error) {
// //           console.error(`\n ❌ Problem in Depositing: ${error.message}`);
// //         }
// //       } else if (action === "withdraw") {
// //         try {
// //           const { acId, amount } = data;
// //           const account = await Account.findByPk(acId);

// //           if (!account) {
// //             console.log("\n ❌ Account not found");
// //             return;
// //           }

// //           const currentBalance = parseFloat(account.balance);
// //           if (currentBalance < parseFloat(amount)) {
// //             console.log("\n ❌ Insufficient balance");
// //             return;
// //           }
// //           const newBalance = currentBalance - parseFloat(amount);
// //           account.balance = newBalance;
// //           await account.save();

// //           // Update balance in Redis
// //           redisClient.set(`account:${acId}`, newBalance);

// //           console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
// //           console.log(`\n Your Existing Balance is ${newBalance}`);
// //         } catch (error) {
// //           console.error(`\n ❌ Problem in Withdrawing: ${error.message}`);
// //         }
// //       } else if (action === "transfer") {
// //         try {
// //           const { srcId, destId, amount } = data;
// //           const sourceAccount = await Account.findByPk(srcId);
// //           const destinationAccount = await Account.findByPk(destId);

// //           if (!sourceAccount || !destinationAccount) {
// //             console.log("\n ❌ One or more accounts not found");
// //             return;
// //           }

// //           const sourceBalance = parseFloat(sourceAccount.balance);

// //           if (sourceBalance < parseFloat(amount)) {
// //             console.log("\n ❌ Insufficient balance for transfer");
// //             return;
// //           }

// //           const newSourceBalance = sourceBalance - parseFloat(amount);
// //           const newDestinationBalance =
// //             parseFloat(destinationAccount.balance) + parseFloat(amount);

// //           // Update balances in the database
// //           await sequelize.transaction(async (t) => {
// //             await sourceAccount.update({ balance: newSourceBalance }, { transaction: t });
// //             await destinationAccount.update({ balance: newDestinationBalance }, { transaction: t });
// //           });

// //           // Update balances in Redis
// //           redisClient.set(`account:${srcId}`, newSourceBalance);
// //           redisClient.set(`account:${destId}`, newDestinationBalance);

// //           console.log(`\n ✅ Amount ${amount} Transferred successfully`);
// //           console.log(`\n Source Balance: ${newSourceBalance}, Destination Balance: ${newDestinationBalance}`);
// //         } catch (error) {
// //           console.error(`\n ❌ Problem in Transferring: ${error.message}`);
// //         }
// //       }

// //      // Deposit
// // const deposit = async ({ acId, amount }, onDeposit = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const account = await Account.findByPk(acId, { transaction });

// //     if (!account) {
// //       console.log("\n ❌ Account not found");
// //       return;
// //     }

// //     const currentBalance = parseFloat(account.balance);
// //     const newBalance = currentBalance + parseFloat(amount);

// //     // Update the balance in the database
// //     await account.update({ balance: newBalance });

// //     // Update balance in Redis
// //     redisClient.set(`account:${acId}`, newBalance);

// //     console.log(`\n ✅ Amount ${amount} Deposited successfully`);
// //     console.log(`\n Your Existing Balance is ${newBalance}`);
    
// //     await transaction.commit();

// //     if (onDeposit) {
// //       onDeposit(`\n ✅ Amount ${amount} Deposited successfully`);
// //     }
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in Depositing: ${error.message}`);
// //   }
// // };

// // // Withdraw
// // const withdraw = async ({ acId, amount }, onWithdraw = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const account = await Account.findByPk(acId, { transaction });

// //     if (!account) {
// //       console.log("\n ❌ Account not found");
// //       return;
// //     }

// //     const currentBalance = parseFloat(account.balance);

// //     if (currentBalance < parseFloat(amount)) {
// //       console.log("\n ❌ Insufficient balance for withdrawal");
// //       return;
// //     }

// //     const newBalance = currentBalance - parseFloat(amount);

// //     // Update the balance in the database
// //     await account.update({ balance: newBalance });

// //     // Update balance in Redis
// //     redisClient.set(`account:${acId}`, newBalance);

// //     console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
// //     console.log(`\n Your Existing Balance is ${newBalance}`);
    
// //     await transaction.commit();

// //     if (onWithdraw) {
// //       onWithdraw(`\n ✅ Amount ${amount} Withdrawn successfully`);
// //     }
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in Withdrawing: ${error.message}`);
// //   }
// // };

// // // Transfer
// // const transfer = async ({ srcId, destId, amount }, onTransfer = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const sourceAccount = await Account.findByPk(srcId, { transaction });
// //     const destinationAccount = await Account.findByPk(destId, { transaction });

// //     if (!sourceAccount || !destinationAccount) {
// //       console.log("\n ❌ One or more accounts not found");
// //       return;
// //     }

// //     const sourceBalance = parseFloat(sourceAccount.balance);

// //     if (sourceBalance < parseFloat(amount)) {
// //       console.log("\n ❌ Insufficient balance for transfer");
// //       return;
// //     }

// //     const newSourceBalance = sourceBalance - parseFloat(amount);
// //     const newDestinationBalance =
// //       parseFloat(destinationAccount.balance) + parseFloat(amount);

// //     // Update balances in the database
// //     await sourceAccount.update({ balance: newSourceBalance }, { transaction });
// //     await destinationAccount.update({ balance: newDestinationBalance }, { transaction });

// //     // Update balances in Redis
// //     redisClient.set(`account:${srcId}`, newSourceBalance);
// //     redisClient.set(`account:${destId}`, newDestinationBalance);

// //     console.log(`\n ✅ Amount ${amount} Transferred successfully`);
// //     console.log(`\n Source Balance: ${newSourceBalance}, Destination Balance: ${newDestinationBalance}`);
    
// //     await transaction.commit();

// //     if (onTransfer) {
// //       onTransfer(`\n ✅ Amount ${amount} Transferred successfully`);
// //     }
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in Transferring: ${error.message}`);
// //   }
// // };

// // // Check Balance
// // const checkBalance = async (acId, onBalance = undefined) => {
// //   try {
// //     const account = await Account.findByPk(acId);

// //     if (!account) {
// //       console.log("\n ❌ Account not found");
// //       return;
// //     }

// //     const balance = account.balance;
// //     console.log(`\n Your Existing Balance is ${balance}`);
    
// //     if (onBalance) {
// //       onBalance(balance);
// //     }
// //   } catch (error) {
// //     console.error(`\n ❌ Problem in Fetching the balance: ${error.message}`);
// //   }
// // };


      
// //       // Other actions can be handled similarly
// //     },
// //   });
// // });





// // module.exports = {
// //   createNewAccount,
// //   withdraw,
// //   deposit,
// //   transfer,
// //   checkBalance,
// //   usersList,
// // };






// // // const { Sequelize, DataTypes } = require("sequelize");

// // // const sequelize = new Sequelize("bankdb", "root", "password", {
// // //   host: "localhost",
// // //   dialect: "mysql",
// // //   port: 3306,
// // // });

// // // const Account = sequelize.define(
// // //   "Kafkadatbase",
// // //   {
// // //     ac_nm: {
// // //       type: DataTypes.STRING,
// // //       allowNull: false,
// // //     },
// // //     balance: {
// // //       type: DataTypes.FLOAT,
// // //       allowNull: false,
// // //     },
// // //     UTR_number:{
// // //       type:DataTypes.STRING,
// // //       allowNull:false
// // //     }
// // //   },
// // //   { tableName: "Kafkadatbase" }
// // // );

// // // // Function to generate a UTR number
// // // function generateUTR() {
// // //   const timestamp = Date.now().toString();
// // //   const randomString = Math.random().toString(36).substr(2, 5);
// // //   return timestamp + randomString;
// // // }

// // // const createNewAccount = async ({ acNm, balance }) => {
// // //   try {
// // //     const utr = generateUTR();
// // //     const account = await Account.create({ ac_nm: acNm, balance, UTR_number: utr });
// // //     console.log("\n ✅ New Customer Created Successfully");
// // //     return { account, utr };
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Creating the customer: ${error.message}`);
// // //     throw error;
// // //   }
// // // };

// // // const deposit = async ({ acId, amount }) => {
// // //   try {
// // //     const account = await Account.findByPk(acId);
// // //     if (!account) {
// // //       console.log("\n ❌ Account not found");
// // //       return;
// // //     }
// // //     const currentBalance = parseFloat(account.balance);
// // //     const newBalance = currentBalance + parseFloat(amount);
// // //     await account.update({ balance: newBalance });
// // //     console.log(`\n ✅ Amount ${amount} Deposited successfully`);
// // //     console.log(`\n Your Existing Balance is ${newBalance}`);
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Depositing: ${error.message}`);
// // //     throw error;
// // //   }
// // // };

// // // const withdraw = async ({ acId, amount }) => {
// // //   try {
// // //     const account = await Account.findByPk(acId);
// // //     if (!account) {
// // //       console.log("\n ❌ Account not found");
// // //       return;
// // //     }
// // //     const currentBalance = parseFloat(account.balance);
// // //     if (currentBalance < parseFloat(amount)) {
// // //       console.log("\n ❌ Insufficient balance for withdrawal");
// // //       return;
// // //     }
// // //     const newBalance = currentBalance - parseFloat(amount);
// // //     await account.update({ balance: newBalance });
// // //     console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
// // //     console.log(`\n Your Existing Balance is ${newBalance}`);
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Withdrawing: ${error.message}`);
// // //     throw error;
// // //   }
// // // };

// // // const transfer = async ({ srcId, destId, amount }) => {
// // //   try {
// // //     const sourceAccount = await Account.findByPk(srcId);
// // //     const destinationAccount = await Account.findByPk(destId);
// // //     if (!sourceAccount || !destinationAccount) {
// // //       console.log("\n ❌ One or more accounts not found");
// // //       return;
// // //     }
// // //     const sourceBalance = parseFloat(sourceAccount.balance);
// // //     if (sourceBalance < parseFloat(amount)) {
// // //       console.log("\n ❌ Insufficient balance for transfer");
// // //       return;
// // //     }
// // //     const newSourceBalance = sourceBalance - parseFloat(amount);
// // //     const newDestinationBalance = parseFloat(destinationAccount.balance) + parseFloat(amount);
// // //     await Promise.all([
// // //       sourceAccount.update({ balance: newSourceBalance }),
// // //       destinationAccount.update({ balance: newDestinationBalance }),
// // //     ]);
// // //     console.log(`\n ✅ Amount ${amount} Transferred successfully`);
// // //     console.log(
// // //       `\n Source Balance: ${newSourceBalance}, Destination Balance: ${newDestinationBalance}`
// // //     );
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Transferring: ${error.message}`);
// // //     throw error;
// // //   }
// // // };

// // // const checkBalance = async (acId) => {
// // //   try {
// // //     const account = await Account.findByPk(acId);
// // //     if (!account) {
// // //       console.log("\n ❌ Account not found");
// // //       return;
// // //     }
// // //     console.log(`\n Your Existing Balance is ${account.balance}`);
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Fetching the balance: ${error.message}`);
// // //     throw error;
// // //   }
// // // };

// // // const usersList = async () => {
// // //   try {
// // //     const users = await Account.findAll();
// // //     console.log(users);
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Fetching the users: ${error.message}`);
// // //     throw error;
// // //   }
// // // };

// // // module.exports = {
// // //   createNewAccount,
// // //   withdraw,
// // //   deposit,
// // //   transfer,
// // //   checkBalance,
// // //   usersList,
// // // };















// // // REDIS CODE



// // // const { Sequelize, DataTypes } = require("sequelize");
// // // const redis = require("redis");

// // // // Sequelize connection
// // // const sequelize = new Sequelize("bankdb", "root", "password", {
// // //   host: "localhost",
// // //   dialect: "mysql",
// // //   port: 3306,
// // // });

// // // // Redis client
// // // const redisClient = redis.createClient({
// // //   host: "localhost", // Replace with your Redis server's hostname or IP address
// // //   port: 6379, // Default Redis port
// // // });

// // // redisClient.on("error", (error) => {
// // //   console.error("Redis client error:", error);
// // // });

// // // // Account model
// // // const Account = sequelize.define(
// // //   "Account",
// // //   {
// // //     ac_nm: {
// // //       type: DataTypes.STRING,
// // //       allowNull: false,
// // //     },
// // //     balance: {
// // //       type: DataTypes.FLOAT,
// // //       allowNull: false,
// // //     },
// // //     // Remove the UTR_number field from the model definition
// // //   },
// // //   { tableName: "accounts" }
// // // );


// // // // Function to generate a UTR number
// // // function generateUTR() {
// // //   const timestamp = Date.now().toString();
// // //   const randomString = Math.random().toString(36).substr(2, 5);
// // //   return timestamp + randomString;
// // // }

// // // // Create new account with transaction data in Redis
// // // const createNewAccount = async ({ acNm, balance }) => {
// // //   try {
// // //     const utr = generateUTR();
// // //     const account = await Account.create({ ac_nm: acNm, balance, UTR_number: utr });
// // //     console.log("\n ✅ New Customer Created Successfully");

// // //     const transactionData = {
// // //       ac_nm: acNm,
// // //       transaction_type: "create_account",
// // //       previous_balance: 0,
// // //       new_balance: balance,
// // //       timestamp: Date.now(),
// // //     };
// // //     await redisClient.rpush(`transactions:${acNm}`, JSON.stringify(transactionData));
// // //     await redisClient.hmset(`account:${acNm}`, "balance", balance);

// // //     return { account, utr };
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Creating the customer: ${error.message}`);
// // //     throw error;
// // //   }
// // // };

// // // // Deposit with transaction data in Redis
// // // const deposit = async ({ acId, amount }) => {
// // //   try {
// // //     const account = await Account.findByPk(acId);
// // //     if (!account) {
// // //       console.log("\n ❌ Account not found");
// // //       return;
// // //     }
// // //     const currentBalance = parseFloat(account.balance);
// // //     const newBalance = currentBalance + parseFloat(amount);
// // //     await account.update({ balance: newBalance });
// // //     console.log(`\n ✅ Amount ${amount} Deposited successfully`);
// // //     console.log(`\n Your Existing Balance is ${newBalance}`);

// // //     const transactionData = {
// // //       ac_id: acId,
// // //       transaction_type: "deposit",
// // //       previous_balance: currentBalance,
// // //       new_balance,
// // //       timestamp: Date.now(),
// // //     };
// // //     await redisClient.rpush(`transactions:${acId}`, JSON.stringify(transactionData));
// // //     await redisClient.hincrby(`account:${acId}`, "balance", amount);
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Depositing: ${error.message}`);
// // //     throw error;
// // //   }
// // // };

// // // // Withdraw with transaction data in Redis
// // // // Withdraw with transaction data in Redis
// // // const withdraw = async ({ acId, amount }) => {
// // //   try {
// // //     // Check if the Redis client is ready before proceeding
// // //     if (redisClient.status !== 'ready') {
// // //       console.log("\n ❌ Redis client is not ready");
// // //       return;
// // //     }

// // //     const account = await Account.findByPk(acId);
// // //     if (!account) {
// // //       console.log("\n ❌ Account not found");
// // //       return;
// // //     }
// // //     const currentBalance = parseFloat(account.balance);
// // //     if (currentBalance < parseFloat(amount)) {
// // //       console.log("\n ❌ Insufficient balance for withdrawal");
// // //       return;
// // //     }
// // //     const newBalance = currentBalance - parseFloat(amount);
// // //     await account.update({ balance: newBalance });
// // //     console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
// // //     console.log(`\n Your Existing Balance is ${newBalance}`);

// // //     const transactionData = {
// // //       ac_id: acId,
// // //       transaction_type: "withdraw",
// // //       previous_balance: currentBalance,
// // //       new_balance: newBalance,
// // //       amount,
// // //       timestamp: Date.now(),
// // //     };
// // //     await redisClient.rpush("transactions", JSON.stringify(transactionData));
// // //   } catch (error) {
// // //     console.error(`\n ❌ Error withdrawing funds: ${error.message}`);
// // //     throw error;
// // //   }
// // // };


// // // // Transfer with transaction data in Redis
// // // // Transfer with transaction data in Redis
// // // const transfer = async ({ srcId, destId, amount }) => {
// // //   try {
// // //     const sourceAccount = await Account.findByPk(srcId);
// // //     const destinationAccount = await Account.findByPk(destId);
// // //     if (!sourceAccount || !destinationAccount) {
// // //       console.log("\n ❌ One or more accounts not found");
// // //       return;
// // //     }
// // //     const sourceBalance = parseFloat(sourceAccount.balance);
// // //     if (sourceBalance < parseFloat(amount)) {
// // //       console.log("\n ❌ Insufficient balance for transfer");
// // //       return;
// // //     }
// // //     const newSourceBalance = sourceBalance - parseFloat(amount);
// // //     const newDestinationBalance = parseFloat(destinationAccount.balance) + parseFloat(amount);
// // //     await Promise.all([
// // //       sourceAccount.update({ balance: newSourceBalance }),
// // //       destinationAccount.update({ balance: newDestinationBalance }),
// // //     ]);
// // //     console.log(`\n ✅ Amount ${amount} Transferred successfully`);
// // //     console.log(
// // //       `\n Source Balance: ${newSourceBalance}, Destination Balance: ${newDestinationBalance}`
// // //     );

// // //     const transactionData = {
// // //       src_id: srcId,
// // //       dest_id: destId,
// // //       transaction_type: "transfer",
// // //       amount,
// // //       previous_source_balance: sourceBalance,
// // //       new_source_balance: newSourceBalance,
// // //       previous_dest_balance: parseFloat(destinationAccount.balance),
// // //       new_dest_balance: newDestinationBalance,
// // //       timestamp: Date.now(),
// // //     };
// // //     await redisClient.rPush("transactions", JSON.stringify(transactionData));
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Transferring: ${error.message}`);
// // //     throw error;
// // //   }
// // // };


// // // // Check account balance
// // // const checkBalance = async (acId) => {
// // //   try {
// // //     const account = await Account.findByPk(acId);
// // //     if (!account) {
// // //       console.log("\n ❌ Account not found");
// // //       return;
// // //     }
// // //     console.log(`\n Your Existing Balance is ${account.balance}`);
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Fetching the balance: ${error.message}`);
// // //     throw error;
// // //   }
// // // };

// // // // List all users (accounts)
// // // const usersList = async () => {
// // //   try {
// // //     const users = await Account.findAll();
// // //     console.log(users);
// // //   } catch (error) {
// // //     console.error(`\n ❌ Problem in Fetching the users: ${error.message}`);
// // //     throw error;
// // //   }
// // // };

// // // // Export functions
// // // module.exports = {
// // //   createNewAccount,
// // //   withdraw,
// // //   deposit,
// // //   transfer,
// // //   checkBalance,
// // //   usersList,
// // // };






































































// const { Sequelize, DataTypes } = require("sequelize");
// const { Kafka, Partitioners } = require("kafkajs");

// const sequelize = new Sequelize("bankdb", "root", "password", {
//   host: "localhost",
//   dialect: "mysql",
//   port: 3306,
// });

// const Account = sequelize.define(
//   "Kafkadatbase",
//   {
//     ac_nm: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     balance: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//     },
//     UTR_number:{
//       type:DataTypes.STRING,
//       allowNull:false
//     }
//   },
//   { tableName: "Kafkadatbase" }
// );











// // const kafka = new Kafka({
// //   clientId: "banking-app",
// //   brokers: ["localhost:9092"],
// // });

// // const producer = kafka.producer({
// //   createPartitioner: Partitioners.LegacyPartitioner,
// // });

// // const produceMessage = async (topic, message) => {
// //   try {
// //     await producer.connect();
// //     await producer.send({
// //       topic: topic,
// //       messages: [{ value: JSON.stringify(message) }],
// //     });
// //   } catch (error) {
// //     console.error(`Error producing message: ${error.message}`);
// //   } finally {
// //     await producer.disconnect();
// //   }
// // };

// // const createNewAccount = async ({ acNm, balance,utr }, onCreate = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const account = await Account.create(
// //       { ac_nm: acNm, balance: balance ,UTR_number:utr},
// //       { transaction }
// //     );

// //     await produceMessage("new-account", {
// //       accountId: account.id,
// //       acNm,
// //       balance,
// //       utr
// //     });
// //     await transaction.commit();
// //     console.log("\n ✅ New Customer Created Successfully");
// //     if (onCreate) {
// //       onCreate(`\n ✅ Account created successfully `);
// //     }
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in Creating the customer: ${error.message}`);
// //   }
// // };

// // const consumer = kafka.consumer({ groupId: "kafka-group" });

// // // Connect to Kafka consumer
// // consumer.connect().then(() => {
// //   consumer.subscribe({ topic: "new-account", fromBeginning: true });

// //   consumer.run({
// //     eachMessage: async ({ topic, partition, message }) => {
// //       const payload = JSON.parse(message.value.toString());

// //       // Extract data from the Kafka message
// //       const { action, data } = payload;

// //       if (action === "create-account") {
// //         // Insert the data into MySQL using Sequelize
// //         try {
// //           const { acNm, balance,utr } = data;
// //           await Account.create({ ac_nm: acNm, balance: balance ,UTR_number: utr});
// //           console.log("Data inserted into MySQL:", data);
// //         } catch (error) {
// //           console.error("Error inserting data into MySQL:", error.message);
// //         }
// //       } else if (action === "deposit") {
// //         try {
// //           const { acId, amount } = data;
// //           const account = await Account.findByPk(acId);

// //           if (!account) {
// //             console.log("\n ❌ Account not found");
// //             return;
// //           }

// //           const currentBalance = parseFloat(account.balance);
// //           const newBalance = currentBalance + parseFloat(amount);

// //           // Update the balance in the database
// //           await account.update({ balance: newBalance });

// //           console.log(`\n ✅ Amount ${amount} Deposited successfully`);
// //           console.log(`\n Your Existing Balance is ${newBalance}`);
// //         } catch (error) {
// //           console.error(`\n ❌ Problem in Depositing: ${error.message}`);
// //         }
// //       } else if (action === "withdraw") {
// //         try {
// //           const { acId, amount } = data;
// //           const account = await Account.findByPk(acId);

// //           if (!account) {
// //             console.log("\n ❌ Account not found");
// //             return;
// //           }

// //           const currentBalance = parseFloat(account.balance);

// //           if (currentBalance < parseFloat(amount)) {
// //             console.log("\n ❌ Insufficient balance for withdrawal");
// //             return;
// //           }

// //           const newBalance = currentBalance - parseFloat(amount);

// //           // Update the balance in the database
// //           await account.update({ balance: newBalance });

// //           console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
// //           console.log(`\n Your Existing Balance is ${newBalance}`);
// //         } catch (error) {
// //           console.error(`\n ❌ Problem in Withdrawing: ${error.message}`);
// //         }
// //       } else if (action === "transfer") {
// //         try {
// //           const { srcId, destId, amount } = data;
// //           const [sourceAccount, destinationAccount] = await Promise.all([
// //             Account.findByPk(srcId),
// //             Account.findByPk(destId),
// //           ]);

// //           if (!sourceAccount || !destinationAccount) {
// //             console.log("\n ❌ One or more accounts not found");
// //             return;
// //           }

// //           const sourceBalance = parseFloat(sourceAccount.balance);

// //           if (sourceBalance < parseFloat(amount)) {
// //             console.log("\n ❌ Insufficient balance for transfer");
// //             return;
// //           }

// //           const newSourceBalance = sourceBalance - parseFloat(amount);
// //           const newDestinationBalance =
// //             parseFloat(destinationAccount.balance) + parseFloat(amount);

// //           // Update balances in the database
// //           await Promise.all([
// //             sourceAccount.update({ balance: newSourceBalance }),
// //             destinationAccount.update({ balance: newDestinationBalance }),
// //           ]);

// //           console.log(`\n ✅ Amount ${amount} Transferred successfully`);
// //           console.log(
// //             `\n Source Balance: ${newSourceBalance}, Destination Balance: ${newDestinationBalance}`
// //           );
// //         } catch (error) {
// //           console.error(`\n ❌ Problem in Transferring: ${error.message}`);
// //         }
// //       }
// //     },
// //   });
// // });

// // //DEPOSIT

// // const deposit = async ({ acId, amount }, onDeposit = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const account = await Account.findByPk(acId, {
// //       transaction,
// //       lock: transaction.LOCK.UPDATE,
// //     });
// //     if (!account) {
// //       console.log("\n ❌ Account not found");
// //       await transaction.rollback();
// //       return;
// //     }
// //     const currentBalance = parseFloat(account.balance);
// //     const newBalance = currentBalance + parseFloat(amount);
// //     account.balance = newBalance;
// //     await account.save({ transaction });
// //     await produceMessage("new-account", { accountId: acId, amount });
// //     await transaction.commit();
// //     console.log(`\n ✅ Amount ${amount} Deposited successfully`);
// //     if (onDeposit) onDeposit(`\n ✅ Amount ${amount} Deposited successfully`);
// //     console.log(`\n Your Existing Balance is ${newBalance}`);
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in Depositing: ${error.message}`);
// //   }
// // };

// // //WITHDRAW

// // const withdraw = async ({ acId, amount }, onWithdraw = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const account = await Account.findByPk(acId, {
// //       transaction,
// //       lock: transaction.LOCK.UPDATE,
// //     });
// //     if (!account) {
// //       console.log("\n ❌ Account not found");
// //       await transaction.rollback();
// //       return;
// //     }
// //     const currentBalance = account.balance;
// //     if (currentBalance < amount) {
// //       console.log("\n ❌ Insufficient balance");
// //       await transaction.rollback();
// //       return;
// //     }
// //     const newBalance = currentBalance - amount;
// //     account.balance = newBalance;
// //     await account.save({ transaction });
// //     await produceMessage("new-account", { accountId: acId, amount });
// //     await transaction.commit();
// //     console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
// //     if (onWithdraw) {
// //       onWithdraw(`\n ✅ Amount ${amount} Withdrawn successfully`);
// //     }
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in withdrawing: ${error.message}`);
// //   }
// // };

// // //TRANSFER

// // const transfer = async ({ srcId, destId, amount }, onTransfer = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const [sourceAccount, destinationAccount] = await Promise.all([
// //       Account.findByPk(srcId, { transaction, lock: transaction.LOCK.UPDATE }),
// //       Account.findByPk(destId, { transaction, lock: transaction.LOCK.UPDATE }),
// //     ]);
// //     if (!sourceAccount || !destinationAccount) {
// //       console.log("\n ❌ Account not found");
// //       await transaction.rollback();
// //       return;
// //     }
// //     const sourceBalance = sourceAccount.balance;
// //     if (sourceBalance < amount) {
// //       console.log("\n ❌ Insufficient balance");
// //       await transaction.rollback();
// //       return;
// //     }
// //     const newSourceBalance = sourceBalance - amount;
// //     const newDestinationBalance = destinationAccount.balance + amount;
// //     await Promise.all([
// //       sourceAccount.update({ balance: newSourceBalance }, { transaction }),
// //       destinationAccount.update(
// //         { balance: newDestinationBalance },
// //         { transaction }
// //       ),
// //     ]);
// //     await produceMessage("new-account", [
// //       { accountId: srcId, amount },
// //       { accountId: destId, amount }
// //     ]);
    
// //     await transaction.commit();
// //     console.log(`\n ✅ Amount ${amount} Transfer Successfully`);
// //     if (onTransfer) {
// //       onTransfer(`\n ✅ Amount ${amount} Transfer Successfully`);
// //     }
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in transferring: ${error.message}`);
// //   }
// // };

// // //CHECK-BALANCE

// // const checkBalance = async (acId, onBalance = undefined) => {
// //   try {
// //     const account = await Account.findByPk(acId);
// //     if (!account) {
// //       console.log("\n ❌ Account not found");
// //       return;
// //     }
// //     const balance = account.balance;
// //     console.log(`\n Your Existing Balance is ${balance}`);
// //     await produceMessage("balance-check-topic", { accountId: acId, balance });
// //     if (onBalance) onBalance(balance);
// //   } catch (error) {
// //     console.error(`\n ❌ Problem in Fetching the balance: ${error.message}`);
// //   }
// // };

// // //USERS-LIST

// // const usersList = async (onUsers = undefined) => {
// //   try {
// //     const users = await Account.findAll();
// //     console.log(users);
// //     await produceMessage("new-account", { users });
// //     if (onUsers) onUsers(users);
// //   } catch (error) {
// //     console.error(`\n ❌ Problem in Fetching the users: ${error.message}`);
// //   }
// // };

// // module.exports = {
// //   createNewAccount,
// //   withdraw,
// //   deposit,
// //   transfer,
// //   checkBalance,
// //   usersList,
// // };













// // const { Sequelize, DataTypes } = require("sequelize");
// // const { Kafka, Partitioners } = require("kafkajs");
// // const Redis = require("redis");

// // const sequelize = new Sequelize("bankdb", "root", "password", {
// //   host: "localhost",
// //   dialect: "mysql",
// //   port: 3306,
// // });

// // const Account = sequelize.define(
// //   "Kafkadatbase",
// //   {
// //     ac_nm: {
// //       type: DataTypes.STRING,
// //       allowNull: false,
// //     },
// //     balance: {
// //       type: DataTypes.FLOAT,
// //       allowNull: false,
// //     },
// //     UTR_number:{
// //       type:DataTypes.STRING,
// //       allowNull:false
// //     }
// //   },
// //   { tableName: "Kafkadatbase" }
// // );

// // const kafka = new Kafka({
// //   clientId: "banking-app",
// //   brokers: ["localhost:9092"],
// // });

// // const producer = kafka.producer({
// //   createPartitioner: Partitioners.LegacyPartitioner,
// // });

// // const produceMessage = async (topic, message) => {
// //   try {
// //     await producer.connect();
// //     await producer.send({
// //       topic: topic,
// //       messages: [{ value: JSON.stringify(message) }],
// //     });
// //   } catch (error) {
// //     console.error(`Error producing message: ${error.message}`);
// //   } finally {
// //     await producer.disconnect();
// //   }
// // };

// // // Initialize Redis client
// // const redisClient = Redis.createClient();

// // const createNewAccount = async ({ acNm, balance,utr }, onCreate = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const account = await Account.create(
// //       { ac_nm: acNm, balance: balance ,UTR_number:utr},
// //       { transaction }
// //     );

// //     // Store account data in Redis with UTR number as key
// //     redisClient.hSet(`account:${utr}`, account.toJSON());

// //     await produceMessage("new-account", {
// //       accountId: account.id,
// //       acNm,
// //       balance,
// //       utr
// //     });
// //     await transaction.commit();
// //     console.log("\n ✅ New Customer Created Successfully");
// //     if (onCreate) {
// //       onCreate(`\n ✅ Account created successfully `);
// //     }
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in Creating the customer: ${error.message}`);
// //   }
// // };

// // const consumer = kafka.consumer({ groupId: "kafka-group" });

// // // Connect to Kafka consumer
// // consumer.connect().then(() => {
// //   consumer.subscribe({ topic: "new-account", fromBeginning: true });

// //   consumer.run({
// //     eachMessage: async ({ topic, partition, message }) => {
// //       const payload = JSON.parse(message.value.toString());

// //       // Extract data from the Kafka message
// //       const { action, data } = payload;

// //       if (action === "create-account") {
// //         // Insert the data into MySQL using Sequelize
// //         try {
// //           const { acNm, balance,utr } = data;
// //           await Account.create({ ac_nm: acNm, balance: balance ,UTR_number: utr});

// //           // Store account data in Redis with UTR number as key
// //           redisClient.hmset(`account:${utr}`, { ac_nm: acNm, balance: balance, UTR_number: utr });

// //           console.log("Data inserted into MySQL:", data);
// //         } catch (error) {
// //           console.error("Error inserting data into MySQL:", error.message);
// //         }
// //       } else if (action === "deposit") {
// //         try {
// //           const { acId, amount } = data;
// //           const account = await Account.findByPk(acId);
      
// //           if (!account) {
// //             console.log("\n ❌ Account not found");
// //             return;
// //           }
      
// //           const currentBalance = parseFloat(account.balance);
// //           const newBalance = currentBalance + parseFloat(amount);
      
// //           // Update the balance in the database
// //           await account.update({ balance: newBalance });
      
// //           // Update the balance in Redis
// //           redisClient.hSet(`account:${account.UTR_number}`, "balance", newBalance);
      
// //           console.log(`\n ✅ Amount ${amount} Deposited successfully`);
// //           console.log(`\n Your Existing Balance is ${newBalance}`);
// //         } catch (error) {
// //           console.error(`\n ❌ Problem in Depositing: ${error.message}`);
// //         }
// //       } else if (action === "withdraw") {
// //         try {
// //           const { acId, amount } = data;
// //           const account = await Account.findByPk(acId);
      
// //           if (!account) {
// //             console.log("\n ❌ Account not found");
// //             return;
// //           }
      
// //           const currentBalance = parseFloat(account.balance);
      
// //           if (currentBalance < parseFloat(amount)) {
// //             console.log("\n ❌ Insufficient balance for withdrawal");
// //             return;
// //           }
      
// //           const newBalance = currentBalance - parseFloat(amount);
      
// //           // Update the balance in the database
// //           await account.update({ balance: newBalance });
      
// //           // Update the balance in Redis
// //           redisClient.hSet(`account:${account.UTR_number}`, "balance", newBalance);
      
// //           console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
// //           console.log(`\n Your Existing Balance is ${newBalance}`);
// //         } catch (error) {
// //           console.error(`\n ❌ Problem in Withdrawing: ${error.message}`);
// //         }
// //       } else if (action === "transfer") {
// //         try {
// //           const { srcId, destId, amount } = data;
// //           const [sourceAccount, destinationAccount] = await Promise.all([
// //             Account.findByPk(srcId),
// //             Account.findByPk(destId),
// //           ]);
      
// //           if (!sourceAccount || !destinationAccount) {
// //             console.log("\n ❌ One or more accounts not found");
// //             return;
// //           }
      
// //           const sourceBalance = parseFloat(sourceAccount.balance);
      
// //           if (sourceBalance < parseFloat(amount)) {
// //             console.log("\n ❌ Insufficient balance for transfer");
// //             return;
// //           }
      
// //           const newSourceBalance = sourceBalance - parseFloat(amount);
// //           const newDestinationBalance =
// //             parseFloat(destinationAccount.balance) + parseFloat(amount);
      
// //           // Update balances in the database
// //           await Promise.all([
// //             sourceAccount.update({ balance: newSourceBalance }),
// //             destinationAccount.update({ balance: newDestinationBalance }),
// //           ]);
      
// //           // Update the balances in Redis
// //           redisClient.hSet(`account:${sourceAccount.UTR_number}`, "balance", newSourceBalance);
// //           redisClient.hSet(`account:${destinationAccount.UTR_number}`, "balance", newDestinationBalance);
      
// //           console.log(`\n ✅ Amount ${amount} Transferred successfully`);
// //           console.log(
// //             `\n Source Balance: ${newSourceBalance}, Destination Balance: ${newDestinationBalance}`
// //           );
// //         } catch (error) {
// //           console.error(`\n ❌ Problem in Transferring: ${error.message}`);
// //         }
// //       }
      

   
// // // DEPOSIT
// // const deposit = async ({ acId, amount }, onDeposit = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const account = await Account.findByPk(acId, {
// //       transaction,
// //       lock: transaction.LOCK.UPDATE,
// //     });
// //     if (!account) {
// //       console.log("\n ❌ Account not found");
// //       await transaction.rollback();
// //       return;
// //     }
// //     const currentBalance = parseFloat(account.balance);
// //     const newBalance = currentBalance + parseFloat(amount);
// //     account.balance = newBalance;
// //     await account.save({ transaction });
    
// //     // Update balance in Redis
// //     redisClient.hSet(`account:${account.UTR_number}`, "balance", newBalance);

// //     await produceMessage("new-account", { accountId: acId, amount });
// //     await transaction.commit();
// //     console.log(`\n ✅ Amount ${amount} Deposited successfully`);
// //     if (onDeposit) onDeposit(`\n ✅ Amount ${amount} Deposited successfully`);
// //     console.log(`\n Your Existing Balance is ${newBalance}`);
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in Depositing: ${error.message}`);
// //   }
// // };

// // // WITHDRAW
// // const withdraw = async ({ acId, amount }, onWithdraw = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const account = await Account.findByPk(acId, {
// //       transaction,
// //       lock: transaction.LOCK.UPDATE,
// //     });
// //     if (!account) {
// //       console.log("\n ❌ Account not found");
// //       await transaction.rollback();
// //       return;
// //     }
// //     const currentBalance = account.balance;
// //     if (currentBalance < amount) {
// //       console.log("\n ❌ Insufficient balance");
// //       await transaction.rollback();
// //       return;
// //     }
// //     const newBalance = currentBalance - amount;
// //     account.balance = newBalance;
// //     await account.save({ transaction });
    
// //     // Update balance in Redis
// //     redisClient.hset(`account:${account.UTR_number}`, "balance", newBalance);

// //     await produceMessage("new-account", { accountId: acId, amount });
// //     await transaction.commit();
// //     console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
// //     if (onWithdraw) {
// //       onWithdraw(`\n ✅ Amount ${amount} Withdrawn successfully`);
// //     }
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in withdrawing: ${error.message}`);
// //   }
// // };

// // // TRANSFER
// // const transfer = async ({ srcId, destId, amount }, onTransfer = undefined) => {
// //   const transaction = await sequelize.transaction();
// //   try {
// //     const [sourceAccount, destinationAccount] = await Promise.all([
// //       Account.findByPk(srcId, { transaction, lock: transaction.LOCK.UPDATE }),
// //       Account.findByPk(destId, { transaction, lock: transaction.LOCK.UPDATE }),
// //     ]);
// //     if (!sourceAccount || !destinationAccount) {
// //       console.log("\n ❌ Account not found");
// //       await transaction.rollback();
// //       return;
// //     }
// //     const sourceBalance = sourceAccount.balance;
// //     if (sourceBalance < amount) {
// //       console.log("\n ❌ Insufficient balance");
// //       await transaction.rollback();
// //       return;
// //     }
// //     const newSourceBalance = sourceBalance - amount;
// //     const newDestinationBalance = destinationAccount.balance + amount;
// //     await Promise.all([
// //       sourceAccount.update({ balance: newSourceBalance }, { transaction }),
// //       destinationAccount.update(
// //         { balance: newDestinationBalance },
// //         { transaction }
// //       ),
// //     ]);
// //     await produceMessage("new-account", { accountId: srcId, amount });
// //     await produceMessage("new-account", { accountId: destId, amount });

// //     // Update balances in Redis
// //     redisClient.hincrby(`account:${sourceAccount.UTR_number}`, "balance", -amount);
// //     redisClient.hincrby(`account:${destinationAccount.UTR_number}`, "balance", amount);

// //     await transaction.commit();
// //     console.log(`\n ✅ Amount ${amount} Transfer Successfully`);
// //     if (onTransfer) {
// //       onTransfer(`\n ✅ Amount ${amount} Transfer Successfully`);
// //     }
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error(`\n ❌ Problem in transferring: ${error.message}`);
// //   }
// // };

// // // CHECK-BALANCE
// // const checkBalance = async (acId, onBalance = undefined) => {
// //   try {
// //     const account = await Account.findByPk(acId);
// //     if (!account) {
// //       console.log("\n ❌ Account not found");
// //       return;
// //     }
// //     const balance = account.balance;
// //     console.log(`\n Your Existing Balance is ${balance}`);

// //     // Update balance in Redis
// //     redisClient.hset(`account:${account.UTR_number}`, "balance", balance);

// //     await produceMessage("balance-check-topic", { accountId: acId, balance });
// //     if (onBalance) onBalance(balance);
// //   } catch (error) {
// //     console.error(`\n ❌ Problem in Fetching the balance: ${error.message}`);
// //   }
// // };

// // // USERS-LIST
// // const usersList = async (onUsers = undefined) => {
// //   try {
// //     const users = await Account.findAll();
// //     console.log(users);

// //     // Update users list in Redis
// //     const userListString = JSON.stringify(users);
// //     redisClient.set("usersList", userListString);

// //     await produceMessage("new-account", { users });
// //     if (onUsers) onUsers(users);
// //   } catch (error) {
// //     console.error(`\n ❌ Problem in Fetching the users: ${error.message}`);
// //   }
// // };

// // module.exports = {
// //   createNewAccount,
// //   withdraw,
// //   deposit,
// //   transfer,
// //   checkBalance,
// //   usersList,
// // };


// //     },
// //   });
// // });
