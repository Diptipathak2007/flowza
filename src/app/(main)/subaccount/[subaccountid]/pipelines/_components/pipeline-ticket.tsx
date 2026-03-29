import React from "react";
import { TicketAndTags, TicketsWithTags } from "@/lib/types";

interface PipelineTicketProps {
  setAllTickets: React.Dispatch<React.SetStateAction<TicketsWithTags>>;
  allTickets: TicketsWithTags;
  ticket: TicketAndTags;
  subAccountId: string;
  index: number;
}

const PipelineTicket: React.FC<PipelineTicketProps> = ({ ticket }) => {
  return (
    <div className="bg-card w-full shadow-sm rounded-md p-4 mb-2 cursor-grab border">
      <span className="font-semibold text-sm">{ticket.name}</span>
    </div>
  );
};

export default PipelineTicket;
