import React from "react";
import { TicketsWithTags } from "@/lib/types";

interface TicketDetailsProps {
  getNewTicket: (ticket: TicketsWithTags[0]) => void;
  laneId: string;
  subAccountId: string;
}

const TicketDetails: React.FC<TicketDetailsProps> = () => {
  return (
    <div className="p-4 bg-card rounded-md border">
      <p className="text-sm text-muted-foreground">Ticket Form Placeholder</p>
    </div>
  );
};

export default TicketDetails;
