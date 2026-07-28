"use client";

export function Toast({ message }: { message: string | null }) {
  return (
    <div className={message ? "toast on" : "toast"} role="status">
      {message ?? ""}
    </div>
  );
}
