import Nav from "../nav/nav_bar";
import { Footer } from "../footer/footer";
import styles from "./new-customer.module.css";

export default function NewCustomer() {
  const onNewCustomer = (e) => {
    e.preventDefault();

    const acNm = e.target.acNm.value;
    const balance = e.target.balance.value;

    fetch("http://localhost:3100/create", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ acNm, balance }),
    })
      .then((res) => res.json())
      .then((json) => console.log(json));

    alert(` New account created successfully`);
  };

  return (
    <>
      <Nav />
      <div className={styles.outer_container}>
        <div className={styles.inner_container}>
          <h1>Create new account</h1>
          <form onSubmit={onNewCustomer}>
            <div>
              <input type="Text" placeholder="Enter Account Name" name="acNm" />
            </div>
            <div>
              <input type="number" placeholder="Enter Balance" name="balance" />
            </div>
            <div>
              <button type="submit" value="Create">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
}
