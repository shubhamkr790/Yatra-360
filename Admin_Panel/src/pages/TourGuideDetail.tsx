
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { TourGuide } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchGuideById, updateGuideStatus } from "@/services/guideService";
import { 
  ArrowLeft, 
  MapPin, 
  Languages, 
  Star, 
  BookOpen, 
  Mail, 
  Phone,
  Check,
  X,
  Clock,
  Loader2
} from "lucide-react";

const TourGuideDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { 
    data: guide,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['guide', id],
    queryFn: () => fetchGuideById(id || ''),
    enabled: !!id
  });

  const handleApprove = async () => {
    if (!user || !id) return;
    
    try {
      await updateGuideStatus(id, 'approved', user.id);
      
      toast({
        title: "Guide Approved",
        description: `${guide?.name} has been approved successfully.`,
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

  const handleReject = async () => {
    if (!user || !id) return;
    
    try {
      await updateGuideStatus(id, 'rejected', user.id);
      
      toast({
        title: "Guide Rejected",
        description: `${guide?.name} has been rejected.`,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-7 w-36 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="mt-6 flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (isError || !guide) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="flex items-center space-x-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Tour Guide Details</h1>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12 bg-muted/40 rounded-lg border border-dashed">
            <p className="text-muted-foreground mb-4">Tour guide not found</p>
            <Button variant="default" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Tour Guide Details</h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
                    <img
                      src={guide.profile_image || "https://placehold.co/200x200/brown/white?text=Guide"}
                      alt={guide.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold">{guide.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{guide.specialization}</p>
                  <Badge className={statusColors[guide.status]}>
                    {guide.status.charAt(0).toUpperCase() + guide.status.slice(1)}
                  </Badge>
                  
                  <div className="w-full mt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{guide.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm break-all">{guide.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{guide.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{guide.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{guide.languages.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">Registered on {formatDate(guide.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {guide.status === "pending" && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 text-red-500 hover:text-red-700 border-red-200 hover:border-red-400"
                  onClick={handleReject}
                >
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button 
                  variant="default"
                  className="flex-1"
                  onClick={handleApprove}
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-sm whitespace-pre-line">{guide.bio}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Identity Proof</h3>
                {guide.identity_proof ? (
                  <div className="rounded-md overflow-hidden border">
                    <img 
                      src={guide.identity_proof} 
                      alt="Identity Document" 
                      className="w-full object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No identity document provided</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TourGuideDetail;
