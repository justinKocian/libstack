import React from "react";

export default function Messages({ theme, errorMsg, successMsg }) {
  if (!errorMsg && !successMsg) return null;

  return (
    <div style={{ marginTop: 14 }}>
      {errorMsg && (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            background: theme.card,
            color: theme.danger,
            fontWeight: 650,
          }}
        >
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            background: theme.card,
            color: theme.success,
            fontWeight: 650,
            marginTop: errorMsg ? 8 : 0,
          }}
        >
          {successMsg}
        </div>
      )}
    </div>
  );
}
