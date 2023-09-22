import Nav from "../nav/nav_bar";
import { Footer } from "../footer/footer";

import styles from "./deposit.module.css";

export default function Deposit() {
  const onDeposit = (e) => {
    e.preventDefault();

    const acId = e.target.acId.value;
    const amount = e.target.amount.value;

    console.log(acId, amount);

    fetch("http://localhost:3100/deposit", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ acId, amount }),
    })
      .then((res) => res.json())
      .then((json) => console.log(json));

    alert(` Amount: ${amount} deposited successfully`);
  };

  return (
    <>
      <Nav />
      <div className={styles.outer_container}>
        <div className={styles.inner_container}>
          <h1>Deposit Amount</h1>
          <form onSubmit={onDeposit}>
            <div>
              <input type="number" placeholder="Enter Account Id" name="acId" />
            </div>

            <div>
              <input type="number" placeholder="Amount to deposit" name="amount" />
            </div>
            <div>
              <button type="submit">Deposit</button>
            </div>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
}
