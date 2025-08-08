import { useMemo, useState } from "react";
import "./App.css";
import IISLogTable, { type IISLogEntry } from "./IISLogTable";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Modal,
  TextareaAutosize,
} from "@mui/material";

function App() {
  const [rawData, setRawData] = useState("");
  const logData = useMemo(() => {
    const parsed = parseIISLogs(rawData);
    return parsed ? parsed : null;
  }, [rawData]);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"start"}
        gap={"10px"}
      >
        <Button onClick={handleOpen} variant="outlined">
          Enter Log
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            sx={{
              width: "100%",
              height: "100%",
            }}
          >
            <Card>
              <CardContent>
                <h3>Enter Log</h3>
                <TextareaAutosize
                  name="raw-logs"
                  id="raw-logs-textarea"
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  minRows={5}
                  style={{ width: 400 }}
                />
              </CardContent>
              <CardActions>
                <Button onClick={handleClose}>Close</Button>
              </CardActions>
            </Card>
          </Box>
        </Modal>
        {logData && (
          <IISLogTable
            data={logData.dataEntries}
            fieldNames={logData.fieldNames}
          />
        )}
      </Box>
    </>
  );
}

export default App;

export function parseIISLogs(raw: string) {
  const lines = raw.trim().split("\n");
  const fieldLine = lines.find((line) => line.startsWith("#Fields:"));
  if (!fieldLine) return null;

  const fieldNames = fieldLine.replace("#Fields: ", "").split(" ");
  const dataLines = lines.filter((line) => !line.startsWith("#"));

  const dataEntries = dataLines.map((line) => {
    const parts = line.split(" ");

    const entry: Record<string, string> = {};

    fieldNames.forEach((field, i) => {
      const key = field;
      entry[key] = parts[i] || "";
    });

    return entry as IISLogEntry;
  });

  return {
    dataEntries,
    fieldNames,
  };
}
