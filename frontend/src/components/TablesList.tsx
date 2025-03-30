import React from "react";

interface TableData {
  id: number;
  title: string;
  data: Array<{ [key: string]: any }>;
}

interface TablesListProps {
  tables: TableData[];
}

function TablesList({ tables }: TablesListProps) {
  if (tables.length === 0) {
    return <p>Nessuna tabella disponibile.</p>;
  }

  return (
    <div></div>) ;
   /* <div>
      {tables.map((table) => (
        <div key={table.id} style={{ marginBottom: "20px" }}>
          <h5 className="text-md font-semibold mb-2">{table.title}</h5>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2", color: "#1d2125" }}>
                {/* Escludi la colonna "id" dall'intestazione */}
      /*           {Object.keys(table.data[0])
                  .filter((column) => column !== "id") // Escludi "id"
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
              {table.data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    border: "1px solid #ddd",
                    color: "#adbbc4",
                  }}
                >
                  {/* Escludi la colonna "id" dai dati */
         /*          {Object.entries(row)
                    .filter(([key]) => key !== "id") // Escludi "id"
                    .map(([key, value], colIndex) => (
                      <td
                        key={colIndex}
                        style={{ padding: "10px", border: "1px solid #ddd" }}
                      >
                        {value}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
*/
export default TablesList;
