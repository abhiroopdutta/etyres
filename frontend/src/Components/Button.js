import React from "react";
import styles from "./Button.module.css";
import { useTransition, animated } from "@react-spring/web";

function Button({ text, loading = false, className, onClick }) {
  const transitions = useTransition(loading, {
    config: { mass: 1, tension: 500, friction: 40, clamp: true },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
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
      {transitions((transitionStyles, loading) =>
        loading ? (
          <animated.div style={transitionStyles} className={styles.loader}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </animated.div>
        ) : null
      )}

      {text}
    </button>
  );
}

export default Button;
