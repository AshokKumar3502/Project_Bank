import styles from "./dashboard.module.css";
import { useNavigate } from "react-router-dom";

import Nav from "../nav/nav_bar";
import { Footer } from "../footer/footer";
import bankImg from "../images/bank.png";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <Nav />

      <main className={styles.outer_container}>
        <div className={styles.img_container}>
          <img src={bankImg} alt="bank-img" className={styles.bankImg} />
        </div>
        <div className={styles.dashContainer}>
          <div onClick={() => navigate("/new")}>Create New Account</div>
          <div onClick={() => navigate("/deposit")}>Deposit</div>
          <div onClick={() => navigate("/withdraw")}>Withdraw</div>
          <div onClick={() => navigate("/transfer")}>Transfer</div>
          <div onClick={() => navigate("/balance")}>Check Balance</div>
          <div onClick={() => navigate("/users")}>Users List</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
