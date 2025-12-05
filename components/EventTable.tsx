"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import { formatAddress } from "@/utils/format";
import { EtherscanLink } from "@/components/EtherscanLink";
import { ClientDate } from "@/components/ClientDate";
import { colors } from "@/theme/colors";
import { useEvents } from "@/hooks/useEvents";

export function EventTable() {
  const { events, isLoading, error } = useEvents();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset to first page when events change
  useEffect(() => {
    setPage(0);
  }, [events.length]);

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 2, sm: 0 },
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Recent Transfer, Approval, and Mint events (last ~1.5 hours)
          </Typography>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      ) : events.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No events found
        </Typography>
      ) : (
        <Box>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Token</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>From</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((event, index) => {
                    const eventColor =
                      event.type === "Transfer"
                        ? colors.events.transfer
                        : event.type === "Approval"
                          ? colors.events.approval
                          : colors.events.mint;
                    return (
                      <TableRow
                        key={`${event.transactionHash}-${index}`}
                        sx={{
                          "&:hover": {
                            backgroundColor: colors.surface.item,
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            color: eventColor,
                            fontWeight: 600,
                          }}
                        >
                          {event.type}
                        </TableCell>
                        <TableCell>{event.token}</TableCell>
                        <TableCell>
                          {event.amount} {event.token}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem" }}>
                          <ClientDate timestamp={event.timestamp} />
                        </TableCell>
                        <TableCell
                          sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                        >
                          {formatAddress(event.from)}
                        </TableCell>
                        <TableCell
                          sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                        >
                          {formatAddress(event.to)}
                        </TableCell>
                        <TableCell>
                          <EtherscanLink txHash={event.transactionHash} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={events.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Box>
      )}
    </Box>
  );
}
