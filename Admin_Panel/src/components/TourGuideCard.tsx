
import { TourGuide } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  MapPin, 
  Languages, 
  Star, 
  BookOpen 
} from "lucide-react";

interface TourGuideCardProps {
  guide: TourGuide;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const TourGuideCard = ({ 
  guide, 
  showActions = false,
  onApprove,
  onReject
}: TourGuideCardProps) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
      </CardHeader>
      <CardContent className="relative p-6">
        <div className="absolute -top-12 left-6 rounded-full border-4 border-background overflow-hidden">
          <img
            src={guide.profile_image || "https://placehold.co/100x100/brown/white?text=Guide"}
            alt={guide.name}
            className="h-24 w-24 object-cover"
          />
        </div>
        <div className="mt-12">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold">{guide.name}</h3>
            <Badge className={statusColors[guide.status]}>
              {guide.status.charAt(0).toUpperCase() + guide.status.slice(1)}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">{guide.email}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">{guide.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-primary" />
              <span className="text-sm">{guide.languages.join(", ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm">{guide.experience} years experience</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm">{guide.specialization}</span>
            </div>
          </div>
          
          <p className="mt-4 text-sm line-clamp-3">{guide.bio}</p>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-400"
            onClick={() => onReject && onReject(guide.id)}
          >
            <X className="h-4 w-4 mr-1" /> Reject
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => onApprove && onApprove(guide.id)}
          >
            <Check className="h-4 w-4 mr-1" /> Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TourGuideCard;
