
export interface TourGuide {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  experience: number;
  languages: string[];
  specialization: string;
  location: string;
  bio: string;
  profile_image?: string;
  identity_proof?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DashboardStats {
  totalGuides: number;
  pendingApprovals: number;
  approvedGuides: number;
  rejectedGuides: number;
}
