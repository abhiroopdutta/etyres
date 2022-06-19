import React from "react";
import styles from "./Button.module.css";

function Button({ text, loading = false, className, onClick }) {
  let modularizedClassNames = ` ${styles.button} `;
  if (loading) {
    modularizedClassNames += ` ${styles.loadingButton} `;
  }
  return (
    <button
      className={modularizedClassNames + className}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <div className={styles.loader}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : null}

      {text}
    </button>
  );
}

export default Button;
