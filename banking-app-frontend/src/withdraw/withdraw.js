import Nav from "../nav/nav_bar";
import { Footer } from "../footer/footer";
import styles from "./withdraw.module.css";

export default function Withdraw() {
  const onWithdraw = (e) => {
    e.preventDefault();

    const acId = e.target.acId.value;
    const amount = e.target.amount.value;

    fetch("http://localhost:3100/withdraw", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ acId, amount }),
    })
      .then((res) => res.json())
      .then((json) => console.log(json));

    alert(` Amount: ${amount} withdraw successfully`);
  };

  return (
    <>
      <Nav />
      <div className={styles.outer_container}>
        <div className={styles.inner_container}>
          <h1>Withdraw Amount</h1>
          <form onSubmit={onWithdraw}>
            <div>
              <input type="number" placeholder="Enter Account Id" name="acId" />
            </div>

            <div>
              <input type="number" placeholder="Amount to withdraw" name="amount" />
            </div>
            <div>
              <button type="submit">Withdraw</button>
            </div>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
}
