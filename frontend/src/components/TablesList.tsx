import React, { useState, useEffect } from "react";

// Define the TableData interface
interface TableData {
  id: number;
  title: string;
  data: Array<{ [key: string]: any }>;
}

interface TablesListProps {
  tables: TableData[];
}

function TablesList({ tables }: TablesListProps) {
  // Log the tables data to inspect it
  console.log("Passed tables data:", tables);

  // If tables is empty, we can show a message
  if (tables.length === 0) {
    return <p>Nessuna tabella disponibile.</p>;
  }

  return (
    <div>
      {tables.map((table) => {
        // Log the individual table data to inspect it
        console.log("Table data:", table);

        return (
          <div key={table.id} style={{ marginBottom: "20px" }}>
            <h5 className="text-md font-semibold mb-2">{table.title}</h5>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2", color: "#1d2125" }}>
                  {/* Ensure table.data[0] exists before trying to get keys */}
                  {table.data.length > 0 &&
                    Object.keys(table.data[0])
                      .filter((column) => column !== "id") // Exclude "id"
                      .map((column) => (
                        <th
                          key={column}
                          style={{
                            padding: "10px",
                            border: "1px solid #ddd",
                            color: "#1d2125",
                          }}
                        >
                          {column}
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {table.data.length > 0 ? (
                  table.data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      style={{
                        border: "1px solid #ddd",
                        color: "#adbbc4",
                      }}
                    >
                      {Object.entries(row)
                        .filter(([key]) => key !== "id") // Exclude "id"
                        .map(([key, value], colIndex) => (
                          <td
                            key={colIndex}
                            style={{ padding: "10px", border: "1px solid #ddd" }}
                          >
                            {value}
                          </td>
                        ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export default TablesList;
