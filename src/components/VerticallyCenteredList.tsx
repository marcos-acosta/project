import React from "react";
import styles from "./VerticallyCenteredList.module.css";

interface VerticallyCenteredListProps {
  children: JSX.Element | JSX.Element[];
  scrollAmount: string;
}

export default function VerticallyCenteredList(
  props: VerticallyCenteredListProps
) {
  return (
    <div
      className={styles.verticalContainer}
      style={{ marginTop: props.scrollAmount }}
    >
      {props.children}
    </div>
  );
}
