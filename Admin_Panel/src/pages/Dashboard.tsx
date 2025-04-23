
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import DashboardStatsCard from "@/components/DashboardStatsCard";
import PendingApprovalsTable from "@/components/PendingApprovalsTable";
import RecentActivityList, { Activity } from "@/components/RecentActivityList";
import { DashboardStats, TourGuide } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  fetchAllGuides, 
  fetchDashboardStats, 
  fetchRecentActivity, 
  updateGuideStatus 
} from "@/services/guideService";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch dashboard statistics
  const { 
    data: stats = {
      totalGuides: 0,
      pendingApprovals: 0,
      approvedGuides: 0,
      rejectedGuides: 0,
    },
    isLoading: isStatsLoading 
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 60000 // Refetch every minute
  });

  // Fetch all guides
  const { 
    data: guides = [],
    isLoading: isGuidesLoading,
    refetch: refetchGuides
  } = useQuery({
    queryKey: ['guides'],
    queryFn: fetchAllGuides
  });

  // Fetch recent activities
  const { 
    data: activities = [] as Activity[],
    isLoading: isActivitiesLoading,
    refetch: refetchActivities
  } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => fetchRecentActivity(5),
    refetchInterval: 60000 // Refetch every minute
  });

  const handleApprove = async (id: string) => {
    if (!user) return;
    
    try {
      await updateGuideStatus(id, 'approved', user.id);
      
      toast({
        title: "Guide Approved",
        description: "The tour guide has been approved successfully.",
      });
      
      // Refetch data
      refetchGuides();
      refetchActivities();
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
      
      // Refetch data
      refetchGuides();
      refetchActivities();
    } catch (error) {
      console.error("Error rejecting guide:", error);
      toast({
        title: "Rejection Failed",
        description: "There was an error rejecting the guide.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isStatsLoading || isGuidesLoading || isActivitiesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage tour guide registrations and approvals
          </p>
        </div>

        <DashboardStatsCard stats={stats} />

        <div className="grid gap-6 md:grid-cols-7">
          <div className="md:col-span-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Pending Approvals</h2>
            </div>
            <PendingApprovalsTable 
              guides={guides} 
              onApprove={handleApprove} 
              onReject={handleReject} 
            />
          </div>
          <div className="md:col-span-3">
            <RecentActivityList activities={activities} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
