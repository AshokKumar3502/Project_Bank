import Nav from "../nav/nav_bar";
import { Footer } from "../footer/footer";
import styles from "./transfer.module.css";

export default function Transfer() {
  const onTransfer = (e) => {
    e.preventDefault();

    const srcId = e.target.srcId.value;
    const destId = e.target.destId.value;
    const amount = e.target.amount.value;

    fetch("http://localhost:3100/transfer", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ srcId, destId, amount }),
    })
      .then((res) => res.json())
      .then((json) => console.log(json));

    alert(` Amount: ${amount} Transfered successfully`);
  };

  return (
    <>
      <Nav />
      <div className={styles.outer_container}>
        <div className={styles.inner_container}>
          <h1>Transfer Amount</h1>
          <form onSubmit={onTransfer}>
            <div>
              <input
                type="number"
                placeholder=" From Account id "
                name="srcId"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder=" To  Account id"
                name="destId"
              />
            </div>
            <div>
              <input type="number" placeholder="Amount to Tranfer" name="amount" />
            </div>
            <div>
              <button type="submit">Transfer</button>
            </div>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
}
