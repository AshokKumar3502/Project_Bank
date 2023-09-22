const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

const port = 3100;

const {
  createNewAccount,
  withdraw,
  deposit,
  transfer,
  checkBalance,
  usersList,
} = require("./db");

app.post("/create", express.json(), (req, res) => {
  createNewAccount(req.body, (msg) => {
    res.json({ sts: "Success", msg });
  });
});
app.put("/deposit", express.json(), (req, res) => {
  deposit(req.body, (msg) => {
    res.json({ sts: "success", msg });
  });
});

app.put("/withdraw", express.json(), (req, res) => {
  withdraw(req.body, (msg) => {
    res.json({ sts: "Success", msg });
  });
});

app.put("/transfer", express.json(), (req, res) => {
  transfer(req.body, (msg) => {
    res.json({ sts: "Success", msg });
  });
});

app.get("/balance/:acId", (req, res) => {
  console.log(req.params);
  const acId = req.params.acId;
  checkBalance(acId, (bal) => {
    res.json({ bal });
  });
});

app.get("/users", (req, res) => {
  usersList((users) => res.json({ sts: "success", users }));
});
app.listen(port, () => {
  console.log(`Banking App listening on port : ${port}`);
});
