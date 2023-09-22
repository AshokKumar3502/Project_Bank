import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./dashboard/dashboard";
import NewCustomer from "./new-customer/new-customer";
import Withdraw from "./withdraw/withdraw";
import Deposit from "./deposit/deposit";
import Balance from "./balance/balance";
import Transfer from "./transfer/transfer";
import Users from "./users/users";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/new" element={<NewCustomer />} />
      <Route path="/withdraw" element={<Withdraw />} />
      <Route path="/deposit" element={<Deposit />} />
      <Route path="/transfer" element={<Transfer />} />
      <Route path="/balance" element={<Balance />} />
      <Route path="/users" element={<Users />} />
    </Routes>
  </BrowserRouter>
);
