
import { supabase } from "@/integrations/supabase/client";
import { TourGuide } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export const fetchAllGuides = async (): Promise<TourGuide[]> => {
  const { data, error } = await supabase
    .from("guide_registrations")
    .select("*");

  if (error) {
    console.error("Error fetching guides:", error);
    throw error;
  }

  // Convert database records to TourGuide type
  return data.map((guide) => ({
    id: guide.id,
    created_at: guide.created_at,
    name: guide.full_name,
    email: guide.email,
    phone: guide.phone_number,
    experience: guide.experience_years,
    languages: guide.spoken_languages,
    specialization: guide.areas_of_expertise[0], // Taking the first area as the main specialization
    location: getLocationString(guide.current_location),
    bio: guide.bio,
    profile_image: guide.profile_picture_url,
    identity_proof: guide.id_proof_url,
    status: guide.status as 'pending' | 'approved' | 'rejected',
  }));
};

// Helper function to safely extract location from JSON
const getLocationString = (locationJson: any): string => {
  if (!locationJson) return "Unknown";
  
  if (typeof locationJson === 'object') {
    // Try to extract city and state properties if they exist
    const city = locationJson.city || '';
    const state = locationJson.state || '';
    
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
  }
  
  return "Unknown";
};

export const fetchGuideById = async (id: string): Promise<TourGuide | null> => {
  const { data, error } = await supabase
    .from("guide_registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No data found
      return null;
    }
    console.error("Error fetching guide:", error);
    throw error;
  }

  // Convert to TourGuide type
  return {
    id: data.id,
    created_at: data.created_at,
    name: data.full_name,
    email: data.email,
    phone: data.phone_number,
    experience: data.experience_years,
    languages: data.spoken_languages,
    specialization: data.areas_of_expertise[0], // Taking the first area as the main specialization
    location: getLocationString(data.current_location),
    bio: data.bio,
    profile_image: data.profile_picture_url,
    identity_proof: data.id_proof_url,
    status: data.status as 'pending' | 'approved' | 'rejected',
  };
};

export const updateGuideStatus = async (
  guideId: string, 
  status: 'approved' | 'rejected', 
  adminId: string
) => {
  // First, update the guide status
  const { error: updateError } = await supabase
    .from("guide_registrations")
    .update({ 
      status,
      ...(status === 'approved' ? { approved_at: new Date().toISOString(), approved_by: adminId } : {})
    })
    .eq("id", guideId);

  if (updateError) {
    console.error("Error updating guide status:", updateError);
    throw updateError;
  }

  // Then, log the admin action
  const { error: actionError } = await supabase
    .from("admin_actions")
    .insert({
      guide_id: guideId,
      admin_id: adminId,
      action_type: status === 'approved' ? 'approve_guide' : 'reject_guide',
      action_details: {
        status,
        timestamp: new Date().toISOString()
      }
    });

  if (actionError) {
    console.error("Error logging admin action:", actionError);
    // We still consider the operation successful even if logging fails
  }

  return { success: true };
};

export const fetchDashboardStats = async () => {
  const { data, error } = await supabase
    .from("guide_registrations")
    .select("status");

  if (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }

  const stats = {
    totalGuides: data.length,
    pendingApprovals: data.filter(guide => guide.status === 'pending').length,
    approvedGuides: data.filter(guide => guide.status === 'approved').length,
    rejectedGuides: data.filter(guide => guide.status === 'rejected').length,
  };

  return stats;
};

export const fetchRecentActivity = async (limit = 5) => {
  const { data, error } = await supabase
    .from("admin_actions")
    .select(`
      *,
      guide_registrations(full_name)
    `)
    .order("performed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }

  return data.map(activity => {
    // Determine the action type and ensure it's one of the allowed values
    let actionType: 'approved' | 'rejected' | 'registered';
    
    if (activity.action_type.includes('approve')) {
      actionType = 'approved';
    } else if (activity.action_type.includes('reject')) {
      actionType = 'rejected';
    } else {
      actionType = 'registered';
    }
    
    return {
      id: activity.id,
      action: activity.action_type.includes('approve') ? 'approved' : 
              activity.action_type.includes('reject') ? 'rejected' : 'registered',
      guideName: activity.guide_registrations?.full_name || "Unknown Guide",
      timestamp: activity.performed_at,
      status: actionType,
    };
  });
};
