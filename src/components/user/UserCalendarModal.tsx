import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import { format } from "date-fns";

interface CalendarTimeEntryModalProps {
  open: boolean;
  date: Date | null;
  onClose: () => void;
  onSubmit?: (data: { date: Date; startTime: string; endTime: string }) => void;
}

const CalendarTimeEntryModal: React.FC<CalendarTimeEntryModalProps> = ({
  open,
  date,
  onClose,
  onSubmit,
}) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  useEffect(() => {
    // Reset times when modal opens
    if (open) {
      setStartTime("09:00");
      setEndTime("17:00");
    }
  }, [open, date]);

  const handleSubmit = () => {
    if (date && onSubmit) {
      onSubmit({ date, startTime, endTime });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Time Entry</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Date"
              value={date ? format(date, "yyyy-MM-dd") : ""}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Start Time"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Time"
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Break"
              value="Auto"
              fullWidth
              disabled
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarTimeEntryModal;
