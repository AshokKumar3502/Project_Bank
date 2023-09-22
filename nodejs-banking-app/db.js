// const mysql = require("mysql2");
// const client = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "Mysql@786",
//   database: "bankdb",
//   port: 3306,
// });

// // const { Client } = require("mysql2");
// // const client = new Client({
// //   host: "localhost",
// //   user: "root",
// //   password: "Mysql@786",
// //   database: "bankdb",
// //   port: 3306,
// // });

// // const mysql = require('mysql2');

// // // Create a connection pool
// // const pool = mysql.createPool({
// //   host: 'localhost',
// //   user: 'root',
// //   password: 'Mysql@786',
// //   database: 'bankdb',
// //   port: 3306,
// // });
// client.connect((err) => {
//   if (err) {
//     console.log("\n ❌ Error in Connectivity " + err.toString());
//     return;
//   }
//   console.log("\n ✅Connected successfully");
// });

// //  ------------ TO CREATE ACCOUNT ----------------
// const createNewAccount = ({ acNm, balance }, onCreate = undefined) => {
//   client.query(
//     `INSERT INTO account(ac_nm , balance) VALUES ($1 , $2 )`,
//     [acNm, balance],
//     (err, res) => {
//       if (err) console.log(`\n ❌ Problem in Creating the customer`);
//       else {
//         console.log("\n ✅ New Customer Created Succesfully");

//         if (onCreate) {
//           onCreate(`\n ✅ Account created successfully `);
//         }
//       }
//     }
//   );
// };

// // ----------- TO WITHDRAW MONEY------------------
// const withdraw = ({ acId, amount }, onWithdraw = undefined) => {
//   client.query(
//     `select balance from account where ac_id = $1 `,
//     [acId],
//     (err, res) => {
//       if (err) {
//         console.log("\n ❌ Problem in withdrawing");
//       } else {
//         const balance = parseFloat(res.rows[0].balance);

//         const newBalance = balance - parseFloat(amount);
//         if (newBalance >= 0) {
//           client.query(
//             `update account set balance = $1 where ac_id = $2`,
//             [newBalance, acId],
//             (err, res) => {
//               if (err) console.log("\n ❌ Problem in withdrawing");
//               else {
//                 console.log(`\n ✅ Amount ${amount} Withdraw succesfully`);
//                 if (onWithdraw) {
//                   onWithdraw(`\n ✅ Amount ${amount} Withdraw succesfully`);
//                 }
//               }
//             }
//           );
//         } else console.log("\n ❌ Insufficient balance");
//       }
//     }
//   );
// };

// // -------------- TO DEPOSITE MONEY ---------------------------
// const deposit = ({ acId, amount }, onDeposit = undefined) => {
//   client.query(
//     `select balance from account where ac_id = $1 `,
//     [acId],
//     (err, res) => {
//       if (err) {
//         console.log("\n ❌ Problem in Depositing");
//       } else {
//         const balance = parseFloat(res.rows[0].balance);

//         const newBalance = balance + parseFloat(amount);

//         client.query(
//           `update account set balance = $1 where ac_id = $2`,
//           [newBalance, acId],
//           (err, res) => {
//             if (err) console.log("\n ❌ Problem in Depositing");
//             else {
//               console.log(`\n ✅ Amount ${amount} Deposited succesfully`);

//               if (onDeposit)
//                 onDeposit(`\n ✅ Amount ${amount} Deposited succesfully`);
//             }
//             client.query(
//               `select balance from account where ac_id = $1 `,
//               [acId],
//               (err, res) => {
//                 const balance = parseFloat(res.rows[0].balance);
//                 console.log(`
//               \n Now Your Existing Balance is ${balance}`);
//               }
//             );
//           }
//         );
//       }
//     }
//   );
// };
// // -------------- TO TRANSFER MONEY ---------------------------

// const transfer = ({ srcId, destId, amount }, onTransfer = undefined) => {
//   // client.query(
//   //   `select balance from account where ac_id = $1`,
//   //   [srcId],
//   //   (err, res) => {
//   //     if (err) {
//   //       console.log("Enter valid id");
//   //     } else {
//   //       const srcbal = parseFloat(res.rows[0].balance);

//   //       client.query(
//   //         `select balance from account where ac_id = $1`,
//   //         [destId],
//   //         (err, res) => {
//   //           if (err) {
//   //             console.log("Enter valid id");
//   //           } else {
//   //             const destBal = parseFloat(res.rows[0].balance);

//   //             const newSrcBal = srcbal - amount;
//   //             const newDestBal = destBal + amount;

//   //             client.query(
//   //               `update account set balance = $1 where ac_id = $2`,
//   //               [newSrcBal, srcId],
//   //               (err, res) => {
//   //                 if (err) {
//   //                   console.log("\n ❌ Transaction failed");
//   //                 }
//   //                 console.log(
//   //                   `\n ${amount} is debited from your account number ${srcId}`
//   //                 );
//   //                 client.query(
//   //                   `update account set balance = $1 where ac_id = $2`,
//   //                   [newDestBal, destId],
//   //                   (err, res) => {
//   //                     if (err) {
//   //                       console.log("\n ❌ Transaction failed");
//   //                     } else
//   //                       console.log(
//   //                         `\n ${amount} is credited in your account number ${destId}`
//   //                       );
//   //                   }
//   //                 );
//   //               }
//   //             );
//   //           }
//   //         }
//   //       );
//   //     }
//   //   }
//   // );
//   withdraw({ acId: srcId, amount }, (msgWd) => {
//     deposit({ acId: destId, amount }, (msgDp) => {
//       if (onTransfer) {
//         onTransfer(`✅ Amount ${amount} Transfer Successfully`);
//       }
//     });
//   });
// };

// // -------------- TO CHECK BALANCE ---------------------------

// const checkBalance = (acId, onBalance = undefined) => {
//   client.query(
//     `select balance from account where ac_id = $1`,
//     [acId],
//     (err, res) => {
//       if (err) {
//         console.log("\n ❌ Problem in Fetching the balance");
//       } else {
//         const balance = parseFloat(res.rows[0].balance);
//         console.log(`\n Your Existing Balance is ${balance}`);
//         if (onBalance) onBalance(balance);
//       }
//     }
//   );
// };

// // --------------------users list ------------------------------
// const usersList = (onUsers = undefined) => {
//   client.query("SELECT * FROM account ORDER BY ac_id", (err, res) => {
//     if (err) {
//       console.log("\n ❌ Problem in Fetching the users");
//     } else {
//       const users = res.rows;
//       console.log(users);
//       if (onUsers) onUsers(users);
//     }
//   });
// };

// module.exports = {
//   createNewAccount,
//   withdraw,
//   deposit,
//   transfer,
//   checkBalance,
//   usersList,
// };






const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with your database connection details
const sequelize = new Sequelize('bankdb', 'root', 'Mysql@786', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
});

// Define the "Account" model
const Account = sequelize.define('Account', {
  ac_nm: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// Synchronize the model with the database (create the "Account" table if it doesn't exist)
sequelize.sync()
  .then(() => {
    console.log('\n ✅ Database synchronized');
  })
  .catch((error) => {
    console.error(`\n ❌ Error synchronizing the database: ${error.message}`);
  });

// TO CREATE ACCOUNT
const createNewAccount = async ({ acNm, balance }, onCreate = undefined) => {
  try {
    const account = await Account.create({ ac_nm: acNm, balance: balance });
    console.log('\n ✅ New Customer Created Successfully');
    if (onCreate) {
      onCreate(`\n ✅ Account created successfully `);
    }
  } catch (error) {
    console.error(`\n ❌ Problem in Creating the customer: ${error.message}`);
  }
};

// TO WITHDRAW MONEY
const withdraw = async ({ acId, amount }, onWithdraw = undefined) => {
  try {
    const account = await Account.findByPk(acId);
    if (!account) {
      console.log('\n ❌ Account not found');
      return;
    }

    const currentBalance = account.balance;
    if (currentBalance < amount) {
      console.log('\n ❌ Insufficient balance');
      return;
    }

    const newBalance = currentBalance - amount;
    account.balance = newBalance;
    await account.save();

    console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
    if (onWithdraw) {
      onWithdraw(`\n ✅ Amount ${amount} Withdrawn successfully`);
    }
  } catch (error) {
    console.error(`\n ❌ Problem in withdrawing: ${error.message}`);
  }
};

// TO DEPOSIT MONEY
const deposit = async ({ acId, amount }, onDeposit = undefined) => {
  try {
    const account = await Account.findByPk(acId);
    if (!account) {
      console.log('\n ❌ Account not found');
      return;
    }
    const currentBalance = parseFloat(account.balance);
    const newBalance = currentBalance + parseFloat(amount);

    account.balance = newBalance; // Keep it as a floating-point number
    
        await account.save();
    
    console.log(`\n ✅ Amount ${amount} Deposited successfully`);
    if (onDeposit) onDeposit(`\n ✅ Amount ${amount} Deposited successfully`);

    console.log(`\n Your Existing Balance is ${newBalance}`);
  } catch (error) {
    console.error(`\n ❌ Problem in Depositing: ${error.message}`);
  }
};

// TO TRANSFER MONEY
const transfer = async ({ srcId, destId, amount }, onTransfer = undefined) => {
  try {
    await sequelize.transaction(async (transaction) => {
      const sourceAccount = await Account.findByPk(srcId, { transaction });
      const destinationAccount = await Account.findByPk(destId, { transaction });

      if (!sourceAccount || !destinationAccount) {
        console.log('\n ❌ Account not found');
        return;
      }

      const sourceBalance = sourceAccount.balance;
      if (sourceBalance < amount) {
        console.log('\n ❌ Insufficient balance');
        return;
      }

      const newSourceBalance = sourceBalance - amount;
      const newDestinationBalance = destinationAccount.balance + amount;

      sourceAccount.balance = newSourceBalance;
      await sourceAccount.save({ transaction });

      destinationAccount.balance = newDestinationBalance;
      await destinationAccount.save({ transaction });
    });

    console.log(`\n ✅ Amount ${amount} Transfer Successfully`);
    if (onTransfer) {
      onTransfer(`\n ✅ Amount ${amount} Transfer Successfully`);
    }
  } catch (error) {
    console.error(`\n ❌ Problem in transferring: ${error.message}`);
  }
};

// TO CHECK BALANCE
const checkBalance = async (acId, onBalance = undefined) => {
  try {
    const account = await Account.findByPk(acId);
    if (!account) {
      console.log('\n ❌ Account not found');
      return;
    }

    const balance = account.balance;
    console.log(`\n Your Existing Balance is ${balance}`);
    if (onBalance) onBalance(balance);
  } catch (error) {
    console.error(`\n ❌ Problem in Fetching the balance: ${error.message}`);
  }
};

// USERS LIST
const usersList = async (onUsers = undefined) => {
  try {
    const users = await Account.findAll();
    console.log(users);
    if (onUsers) onUsers(users);
  } catch (error) {
    console.error(`\n ❌ Problem in Fetching the users: ${error.message}`);
  }
};

module.exports = {
  createNewAccount,
  withdraw,
  deposit,
  transfer,
  checkBalance,
  usersList,
};
