const { Sequelize, DataTypes } = require("sequelize");
const { Kafka, Partitioners } = require("kafkajs");

const sequelize = new Sequelize("bankdb", "root", "password", {
  host: "localhost",
  dialect: "mysql",
  port: 3306,
});

const Account = sequelize.define(
  "Kafkadatbase",
  {
    ac_nm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  { tableName: "Kafkadatbase" }
);

const kafka = new Kafka({
  clientId: "banking-app",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

const produceMessage = async (topic, message) => {
  try {
    await producer.connect();
    await producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    console.error(`Error producing message: ${error.message}`);
  } finally {
    await producer.disconnect();
  }
};

const createNewAccount = async ({ acNm, balance }, onCreate = undefined) => {
  const transaction = await sequelize.transaction();
  try {
    const account = await Account.create(
      { ac_nm: acNm, balance: balance },
      { transaction }
    );

    await produceMessage("new-account", {
      accountId: account.id,
      acNm,
      balance,
    });
    await transaction.commit();
    console.log("\n ✅ New Customer Created Successfully");
    if (onCreate) {
      onCreate(`\n ✅ Account created successfully `);
    }
  } catch (error) {
    await transaction.rollback();
    console.error(`\n ❌ Problem in Creating the customer: ${error.message}`);
  }
};

const consumer = kafka.consumer({ groupId: "kafka-group" });

// Connect to Kafka consumer
consumer.connect().then(() => {
  consumer.subscribe({ topic: "new-account", fromBeginning: true });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = JSON.parse(message.value.toString());

      // Extract data from the Kafka message
      const { action, data } = payload;

      if (action === "create-account") {
        // Insert the data into MySQL using Sequelize
        try {
          const { acNm, balance } = data;
          await Account.create({ ac_nm: acNm, balance: balance });
          console.log("Data inserted into MySQL:", data);
        } catch (error) {
          console.error("Error inserting data into MySQL:", error.message);
        }
      } else if (action === "deposit") {
        try {
          const { acId, amount } = data;
          const account = await Account.findByPk(acId);

          if (!account) {
            console.log("\n ❌ Account not found");
            return;
          }

          const currentBalance = parseFloat(account.balance);
          const newBalance = currentBalance + parseFloat(amount);

          // Update the balance in the database
          await account.update({ balance: newBalance });

          console.log(`\n ✅ Amount ${amount} Deposited successfully`);
          console.log(`\n Your Existing Balance is ${newBalance}`);
        } catch (error) {
          console.error(`\n ❌ Problem in Depositing: ${error.message}`);
        }
      } else if (action === "withdraw") {
        try {
          const { acId, amount } = data;
          const account = await Account.findByPk(acId);

          if (!account) {
            console.log("\n ❌ Account not found");
            return;
          }

          const currentBalance = parseFloat(account.balance);

          if (currentBalance < parseFloat(amount)) {
            console.log("\n ❌ Insufficient balance for withdrawal");
            return;
          }

          const newBalance = currentBalance - parseFloat(amount);

          // Update the balance in the database
          await account.update({ balance: newBalance });

          console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
          console.log(`\n Your Existing Balance is ${newBalance}`);
        } catch (error) {
          console.error(`\n ❌ Problem in Withdrawing: ${error.message}`);
        }
      } else if (action === "transfer") {
        try {
          const { srcId, destId, amount } = data;
          const [sourceAccount, destinationAccount] = await Promise.all([
            Account.findByPk(srcId),
            Account.findByPk(destId),
          ]);

          if (!sourceAccount || !destinationAccount) {
            console.log("\n ❌ One or more accounts not found");
            return;
          }

          const sourceBalance = parseFloat(sourceAccount.balance);

          if (sourceBalance < parseFloat(amount)) {
            console.log("\n ❌ Insufficient balance for transfer");
            return;
          }

          const newSourceBalance = sourceBalance - parseFloat(amount);
          const newDestinationBalance =
            parseFloat(destinationAccount.balance) + parseFloat(amount);

          // Update balances in the database
          await Promise.all([
            sourceAccount.update({ balance: newSourceBalance }),
            destinationAccount.update({ balance: newDestinationBalance }),
          ]);

          console.log(`\n ✅ Amount ${amount} Transferred successfully`);
          console.log(
            `\n Source Balance: ${newSourceBalance}, Destination Balance: ${newDestinationBalance}`
          );
        } catch (error) {
          console.error(`\n ❌ Problem in Transferring: ${error.message}`);
        }
      }
    },
  });
});

//DEPOSIT

const deposit = async ({ acId, amount }, onDeposit = undefined) => {
  const transaction = await sequelize.transaction();
  try {
    const account = await Account.findByPk(acId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!account) {
      console.log("\n ❌ Account not found");
      await transaction.rollback();
      return;
    }
    const currentBalance = parseFloat(account.balance);
    const newBalance = currentBalance + parseFloat(amount);
    account.balance = newBalance;
    await account.save({ transaction });
    await produceMessage("new-account", { accountId: acId, amount });
    await transaction.commit();
    console.log(`\n ✅ Amount ${amount} Deposited successfully`);
    if (onDeposit) onDeposit(`\n ✅ Amount ${amount} Deposited successfully`);
    console.log(`\n Your Existing Balance is ${newBalance}`);
  } catch (error) {
    await transaction.rollback();
    console.error(`\n ❌ Problem in Depositing: ${error.message}`);
  }
};

//WITHDRAW

const withdraw = async ({ acId, amount }, onWithdraw = undefined) => {
  const transaction = await sequelize.transaction();
  try {
    const account = await Account.findByPk(acId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!account) {
      console.log("\n ❌ Account not found");
      await transaction.rollback();
      return;
    }
    const currentBalance = account.balance;
    if (currentBalance < amount) {
      console.log("\n ❌ Insufficient balance");
      await transaction.rollback();
      return;
    }
    const newBalance = currentBalance - amount;
    account.balance = newBalance;
    await account.save({ transaction });
    await produceMessage("new-account", { accountId: acId, amount });
    await transaction.commit();
    console.log(`\n ✅ Amount ${amount} Withdrawn successfully`);
    if (onWithdraw) {
      onWithdraw(`\n ✅ Amount ${amount} Withdrawn successfully`);
    }
  } catch (error) {
    await transaction.rollback();
    console.error(`\n ❌ Problem in withdrawing: ${error.message}`);
  }
};

//TRANSFER

const transfer = async ({ srcId, destId, amount }, onTransfer = undefined) => {
  const transaction = await sequelize.transaction();
  try {
    const [sourceAccount, destinationAccount] = await Promise.all([
      Account.findByPk(srcId, { transaction, lock: transaction.LOCK.UPDATE }),
      Account.findByPk(destId, { transaction, lock: transaction.LOCK.UPDATE }),
    ]);
    if (!sourceAccount || !destinationAccount) {
      console.log("\n ❌ Account not found");
      await transaction.rollback();
      return;
    }
    const sourceBalance = sourceAccount.balance;
    if (sourceBalance < amount) {
      console.log("\n ❌ Insufficient balance");
      await transaction.rollback();
      return;
    }
    const newSourceBalance = sourceBalance - amount;
    const newDestinationBalance = destinationAccount.balance + amount;
    await Promise.all([
      sourceAccount.update({ balance: newSourceBalance }, { transaction }),
      destinationAccount.update(
        { balance: newDestinationBalance },
        { transaction }
      ),
    ]);
    await produceMessage("new-account", { accountId: srcId, amount });
    await produceMessage("new-account", { accountId: destId, amount });
    await transaction.commit();
    console.log(`\n ✅ Amount ${amount} Transfer Successfully`);
    if (onTransfer) {
      onTransfer(`\n ✅ Amount ${amount} Transfer Successfully`);
    }
  } catch (error) {
    await transaction.rollback();
    console.error(`\n ❌ Problem in transferring: ${error.message}`);
  }
};

//CHECK-BALANCE

const checkBalance = async (acId, onBalance = undefined) => {
  try {
    const account = await Account.findByPk(acId);
    if (!account) {
      console.log("\n ❌ Account not found");
      return;
    }
    const balance = account.balance;
    console.log(`\n Your Existing Balance is ${balance}`);
    await produceMessage("balance-check-topic", { accountId: acId, balance });
    if (onBalance) onBalance(balance);
  } catch (error) {
    console.error(`\n ❌ Problem in Fetching the balance: ${error.message}`);
  }
};

//USERS-LIST

const usersList = async (onUsers = undefined) => {
  try {
    const users = await Account.findAll();
    console.log(users);
    await produceMessage("new-account", { users });
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
