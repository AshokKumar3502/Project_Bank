import React from "react";
import Nav from "../nav/nav_bar";
import { Footer } from "../footer/footer";
import { useState, useEffect } from "react";
import styles from "./users.module.css";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3100/users")
      .then((res) => res.json())
      .then((json) => setUsers(json.users));
  }, []);

  return (
    <>
      <Nav />

      <div className={styles.outer_container}>
        <table>
          <thead>
            <tr>
              <th>Account Id</th>
              <th>Name</th>
              <th>BALANCE(₹)</th>
            </tr>
          </thead>
          <tbody>
            {users.map((data, index) => (
              <tr data-index={index} key={data.id}>
                <td>{data.id}</td>
                <td>{data.ac_nm}</td>
                <td>{data.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
