
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import TourGuideCard from "@/components/TourGuideCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";
import { fetchAllGuides } from "@/services/guideService";

const TourGuides = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { 
    data: guides = [],
    isLoading
  } = useQuery({
    queryKey: ['guides'],
    queryFn: fetchAllGuides
  });

  // Apply filters
  const filteredGuides = guides.filter(guide => {
    // Status filter
    if (statusFilter !== "all" && guide.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        guide.name.toLowerCase().includes(query) ||
        guide.email.toLowerCase().includes(query) ||
        guide.location.toLowerCase().includes(query) ||
        guide.specialization.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading tour guides...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tour Guides</h1>
          <p className="text-muted-foreground">
            View and manage all registered tour guides
          </p>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search guides..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {filteredGuides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-muted/40 rounded-lg border border-dashed">
            <p className="text-muted-foreground mb-4">No tour guides found</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <TourGuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TourGuides;
