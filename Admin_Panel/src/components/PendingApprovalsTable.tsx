
import { TourGuide } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface PendingApprovalsTableProps {
  guides: TourGuide[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const PendingApprovalsTable = ({
  guides,
  onApprove,
  onReject,
}: PendingApprovalsTableProps) => {
  const pendingGuides = guides.filter((guide) => guide.status === "pending");

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingGuides.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No pending approvals
              </TableCell>
            </TableRow>
          ) : (
            pendingGuides.map((guide) => (
              <TableRow key={guide.id}>
                <TableCell className="font-medium">{guide.name}</TableCell>
                <TableCell>{guide.location}</TableCell>
                <TableCell>{guide.specialization}</TableCell>
                <TableCell>{guide.experience} years</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    Pending
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/tour-guides/${guide.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onReject(guide.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-green-500 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onApprove(guide.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingApprovalsTable;
