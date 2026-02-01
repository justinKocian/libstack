import React from "react";

export default function Badge({ theme, label }) {
  return (
    <span
      style={{
        fontSize: 12,
        color: theme.fg,
        border: `1px solid ${theme.border}`,
        background: theme.codeBg,
        padding: "4px 8px",
        borderRadius: 999,
      }}
    >
      {label}
    </span>
  );
}
