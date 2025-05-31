import { useState } from "react";

export function Table() {
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortKey, setSortKey] = useState("name");

  const data = [{ name: "Alice", email: "alice@example.com" }];

  const sorted = [...data].sort((a, b) => {
    const result = a[sortKey].localeCompare(b[sortKey]);
    return sortDirection === "asc" ? result : -result;
  });

  function handleSort(key) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => handleSort("name")}>Name</th>
          <th onClick={() => handleSort("email")}>Email</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => (
          <tr key={i}>
            <td>{row.name}</td>
            <td>{row.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}