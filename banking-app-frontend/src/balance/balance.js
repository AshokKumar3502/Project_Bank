import Nav from "../nav/nav_bar";
import { Footer } from "../footer/footer";
import { useState } from "react";
import styles from "./balance.module.css";

export default function Balance() {
  const [bal, setBal] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const onBalance = (e) => {
    e.preventDefault();

    const acId = e.target.acId.value;

    fetch(`http://localhost:3100/balance/${acId}`)
      .then((res) => res.json())
      .then((json) => setBal(json.bal));
  };
  const handleClick = () => {
    setIsClicked(true);
  };

  return (
    <>
      <Nav />
      <div className={styles.outer_container}>
        <div className={styles.inner_container}>
          <h1>Check Balance</h1>
          <form onSubmit={onBalance}>
            <div>
              <input
                type="number"
                placeholder=" Enter Account id "
                name="acId"
              />
            </div>

            <div>
              <button type="submit" onClick={handleClick}>
                Check Balance
              </button>
            </div>
          </form>
          <h2>{isClicked && `Your Account balance is ${bal} Rs.`}</h2>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
}
