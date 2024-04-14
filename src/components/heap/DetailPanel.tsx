import React from "react";
import styles from "./DetailPanel.module.css";
import { EpochSeconds } from "@/interfaces/Interfaces";
import { classnames, formatMillisToLocaleDate, moveCaratToEnd } from "@/util";
import ReactTextareaAutosize from "react-textarea-autosize";

interface DetailPanelProps {
  creationTime: EpochSeconds;
  completionTime: EpochSeconds | null;
  notes: string;
  currentNotes: string;
  setCurrentNotes: (notes: string) => void;
  isEditingNotes: boolean;
  cancel: () => void;
}

export default function DetailPanel(props: DetailPanelProps) {
  return (
    <div
      className={classnames(
        styles.detailPanelContainer,
        props.isEditingNotes && styles.selected
      )}
    >
      <div className={styles.creationTime}>
        created {formatMillisToLocaleDate(props.creationTime)}
      </div>
      {props.completionTime && (
        <div className={styles.completionTime}>
          completed {formatMillisToLocaleDate(props.completionTime)}
        </div>
      )}
      <div>
        {(props.notes.length > 0 || props.isEditingNotes) && (
          <hr className={styles.divider} />
        )}
        {props.isEditingNotes ? (
          <ReactTextareaAutosize
            className={styles.inputNotes}
            value={props.currentNotes}
            onChange={(e) => {
              props.setCurrentNotes(e.target.value);
            }}
            spellCheck={false}
            onBlur={props.cancel}
            onFocus={moveCaratToEnd}
            autoFocus
          />
        ) : (
          <span className={styles.notesText}>{props.notes}</span>
        )}
      </div>
    </div>
  );
}
