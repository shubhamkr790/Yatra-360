
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import TourGuideCard from "@/components/TourGuideCard";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAllGuides, updateGuideStatus } from "@/services/guideService";
import { Loader2 } from "lucide-react";

const Approvals = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const { 
    data: guides = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['guides'],
    queryFn: fetchAllGuides
  });

  const pendingGuides = guides.filter(guide => guide.status === "pending");

  const handleApprove = async (id: string) => {
    if (!user) return;
    
    try {
      await updateGuideStatus(id, 'approved', user.id);
      
      toast({
        title: "Guide Approved",
        description: "The tour guide has been approved successfully.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error approving guide:", error);
      toast({
        title: "Approval Failed",
        description: "There was an error approving the guide.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!user) return;
    
    try {
      await updateGuideStatus(id, 'rejected', user.id);
      
      toast({
        title: "Guide Rejected",
        description: "The tour guide has been rejected.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error rejecting guide:", error);
      toast({
        title: "Rejection Failed",
        description: "There was an error rejecting the guide.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading pending approvals...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve new tour guide registrations
          </p>
        </div>
        
        {pendingGuides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-muted/40 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No pending approvals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingGuides.map((guide) => (
              <TourGuideCard 
                key={guide.id} 
                guide={guide}
                showActions={true}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Approvals;
