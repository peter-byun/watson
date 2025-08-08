import React, { useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  flexRender,
  type ColumnResizeMode,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Box } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";

export type IISLogEntry = Record<string, string>;

interface Props {
  data: IISLogEntry[];
  fieldNames: string[];
}

const columnNames: Record<string, string> = {
  date: "Date",
  time: "Time",
  "s-ip": "Server IP",
  "cs-method": "Method",
  "cs-uri-stem": "URI Stem",
  "cs-uri-query": "URI Query",
  "s-port": "Port",
  "cs-username": "Username",
  "c-ip": "Client IP",
  "cs(User-Agent)": "User Agent",
  "cs(Referer)": "Referer",
  "sc-status": "Status",
  "sc-substatus": "Substatus",
  "sc-win32-status": "Win32 Status",
  "time-taken": "Time Taken (ms)",
};

const IISLogTable: React.FC<Props> = ({ data, fieldNames }) => {
  const columns = fieldNames.map((fieldName) => {
    let cell;

    // Combine and format date + time fields if available
    if (fieldName === "date") {
      cell = ({ row }: any) => {
        const dateStr = row.original.date;
        const timeStr = row.original.time;
        if (!dateStr || !timeStr) return "";

        // Combine into UTC datetime string
        const utcString = `${dateStr}T${timeStr}Z`;
        const dateObj = new Date(utcString);

        const formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Seoul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formatter.format(dateObj);
      };
    } else if (fieldName === "time") {
      cell = ({ row }: any) => {
        const dateStr = row.original.date;
        const timeStr = row.original.time;
        if (!dateStr || !timeStr) return "";

        const utcString = `${dateStr}T${timeStr}Z`;
        const dateObj = new Date(utcString);

        const formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Seoul",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        return formatter.format(dateObj);
      };
    }

    return {
      accessorKey: fieldName,
      header: columnNames[fieldName] || fieldName,
      ...(cell && { cell }), // apply custom cell if needed
    };
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange" as ColumnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 10,
  });

  return (
    <Box
      sx={{ height: "95vh", width: "95vw", overflow: "auto" }}
      ref={parentRef}
    >
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead
          style={{
            backgroundColor: "#f0f0f0",
            position: "sticky",
            top: "0px",
            zIndex: 1,
          }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    width: header.getSize(),
                    minWidth: 60,
                    maxWidth: 500,
                    position: "relative",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    background: "#f0f0f0",
                    fontSize: "13px",
                    textAlign: "left",
                    padding: "4px 8px",
                    borderBottom: "1px solid #ccc",
                    userSelect: "none",
                  }}
                >
                  <div
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: " ⬆️",
                      desc: " ⬇️",
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>

                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        height: "100%",
                        width: "5px",
                        cursor: "col-resize",
                        zIndex: 1,
                        backgroundColor: "skyblue",
                      }}
                    />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          style={{
            position: "relative",
            height: rowVirtualizer.getTotalSize(),
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                style={{
                  position: "absolute",
                  top: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: "flex",
                  width: "100%",
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: 60,
                      maxWidth: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      padding: "4px 8px",
                      fontSize: "13px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};

export default IISLogTable;
