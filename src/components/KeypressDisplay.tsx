import React from "react";
import { TypedKey } from "react-keyboard-control";
import styles from "./KeypressDisplay.module.css";

interface KeypressDisplayProps {
  currentSequence: TypedKey[];
}

export default function KeypressDisplay(props: KeypressDisplayProps) {
  return (
    <div className={styles.keypressDisplayContainer}>
      {props.currentSequence.map((key, i) => (
        <span key={i}>{key.basicRepresentation}</span>
      ))}
    </div>
  );
}
