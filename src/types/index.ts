export interface Service {
  id: string;
  slug: string;
  title: string;
  category: string; // e.g., 'antar-jemput', 'temenin'
  categoryName: string;
  subCategory?: string;
  subCategoryName?: string;
  serviceMode?: ServiceMode;
  shortDescription: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  featured: boolean;
  included: string[];
  excluded: string[];
  faqs?: { q: string; a: string }[];
}

export interface Talent {
  id: string;
  slug: string;
  name: string;
  gender: 'Pria' | 'Wanita';
  age: number;
  location: string;
  latitude?: number;
  longitude?: number;
  bio: string;
  avatar: string;
  services: string[]; // slugs of services they can do
  skills: string[];
  languages: string[];
  joinedYear: number;
  rating: number;
  reviewCount: number;
  completedOrders: number;
  verified: boolean;
  available: boolean;
  schedule: { day: string; time: string; available: boolean }[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  location: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export type BookingStatus =
  | "WAITING_PAYMENT"
  | "PAYMENT_VERIFICATION"
  | "PAID"
  | "WAITING_TALENT_CONFIRMATION"
  | "TALENT_ACCEPTED"
  | "TALENT_PREPARING"
  | "TALENT_ON_THE_WAY"
  | "TALENT_NEARBY"
  | "TALENT_ARRIVED"
  | "WAITING_MEETING_CONFIRMATION"
  | "SERVICE_ACTIVE"
  | "EXTENSION_REQUESTED"
  | "WAITING_EXTENSION_APPROVAL"
  | "SERVICE_COMPLETED_BY_TALENT"
  | "WAITING_CUSTOMER_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED"
  | "REFUNDED"
  | "pending" // Legacy compatibility
  | "confirmed" // Legacy compatibility
  | "REQUESTED_EXTENSION" // Legacy compatibility
  | "WAITING_CUSTOMER_APPROVAL" // Legacy compatibility
  | "EXTENSION_ACTIVE" // Legacy compatibility
  | "EXTENSION_COMPLETED" // Legacy compatibility
  | "EXTENSION_CANCELLED" // Legacy compatibility
  | "EXTENSION_DISPUTED"; // Legacy compatibility

export type MeetingType =
  | "CUSTOMER_LOCATION"
  | "PUBLIC_PLACE"
  | "CUSTOM_LOCATION"
  | "TALENT_LOCATION";

export type TrackingMode =
  | "REQUIRED_DURING_TRAVEL"
  | "REQUIRED_DURING_SERVICE"
  | "OPTIONAL_DURING_SERVICE"
  | "ARRIVAL_ONLY";

export type LocationRole = "CUSTOMER" | "TALENT";

export type VerificationMethod = "PIN" | "QR" | "TWO_PARTY";

export interface LiveLocation {
  id: string;
  bookingId: string;
  userId: string;
  role: LocationRole;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  altitude?: number;
  recordedAt: string;
  expiresAt: string;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  previousStatus: BookingStatus | null;
  newStatus: BookingStatus;
  changedById: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  createdAt: string;
}

export interface MeetingVerification {
  id: string;
  bookingId: string;
  method: VerificationMethod;
  pinHash?: string;
  pinRaw?: string; // stored raw for easy simulation verification
  customerConfirmedAt?: string;
  talentConfirmedAt?: string;
  verifiedAt?: string;
  failedAttempts: number;
  expiresAt: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  talentId: string;
  date: string;
  time: string;
  duration: number; // e.g., jam, sesi, hari
  location: string;
  notes: string;
  customerName: string;
  customerPhone: string;
  price: number;
  platformFee: number;
  total: number;
  status: BookingStatus;
  
  // Meeting locations fields
  meetingAddress?: string;
  meetingPlaceName?: string;
  meetingNotes?: string;
  meetingLatitude?: number;
  meetingLongitude?: number;
  meetingType?: MeetingType;
  estimatedTravelDistanceKm?: number;
  estimatedTravelDurationMinutes?: number;

  // Tracking waktu fields
  bookedStartTime?: string;
  bookedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  bookedDurationMinutes?: number;
  actualDurationMinutes?: number;
  overtimeMinutes?: number;

  // Tracking timestamps
  talentStartedJourneyAt?: string;
  talentArrivedAt?: string;
  meetingVerifiedAt?: string;
  customerCompletedAt?: string;
  talentCompletedAt?: string;

  // Tracking configuration
  trackingMode?: TrackingMode;
  trackingStartedAt?: string;
  trackingStoppedAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceExtension {
  id: string;
  bookingId: string;
  requestedBy: 'talent' | 'customer';
  requestedMinutes: number;
  requestedPrice: number;
  approvedPrice: number;
  paymentType: 'balance' | 'qris' | 'va' | 'ewallet' | '';
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'disputed' | 'held' | 'refunded';
  reason: string;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
}

export interface Tip {
  id: string;
  bookingId: string;
  talentId: string;
  customerId: string;
  amount: number;
  message: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  bookingId: string;
  action: string;
  performedBy: 'talent' | 'customer' | 'admin' | 'system';
  details: string;
  timestamp: string;
}

export interface SystemConfig {
  hourlyOvertimeRate: number; // e.g. 40000
  toleranceFreeMinutes: number; // e.g. 10
  tolerance30MinLimit: number; // e.g. 30
  tolerance60MinLimit: number; // e.g. 60
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon name
  bgColor: string; // light pastel bg
  textColor: string; // text color matching
}

export enum TalentServiceStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED"
}

export type PricingType = "HOURLY" | "FIXED" | "PER_SESSION" | "CUSTOM_QUOTE" | "PER_DAY";

export type ServiceMode = "ONLINE" | "OFFLINE" | "ONLINE_OFFLINE";

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TalentServiceImage {
  id: string;
  talentServiceId: string;
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt?: string;
}

export interface TalentServiceSchedule {
  id: string;
  talentServiceId: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface TalentServiceRevision {
  id: string;
  talentServiceId: string;
  submittedById: string;
  previousData: any;
  proposedData: any;
  status: TalentServiceStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface TalentService {
  id: string;
  talentId: string;
  categoryId: string;
  categoryName: string;
  subCategoryId?: string;
  subCategoryName?: string;
  serviceMode?: ServiceMode;

  title: string;
  slug: string;
  shortDescription: string;
  description: string;

  pricingType: PricingType;
  basePrice: number;
  hourlyPrice?: number;
  sessionPrice?: number;
  overtimePrice?: number;
  minimumDurationMinutes: number;
  maximumDurationMinutes?: number;

  city: string;
  district?: string;
  serviceRadiusKm?: number;
  defaultMeetingAddress?: string;
  defaultMeetingLatitude?: number;
  defaultMeetingLongitude?: number;

  trackingMode: TrackingMode;
  onlineAvailable: boolean;
  instantBookingAvailable: boolean;
  negotiable: boolean;

  includedItems?: string[];
  excludedItems?: string[];
  requirements?: string[];
  cancellationPolicy?: string;
  latenessPolicy?: string;
  overtimePolicy?: string;
  safetyNotes?: string;

  status: TalentServiceStatus;
  rejectionReason?: string;
  moderationNotes?: string;

  publishedAt?: string;
  reviewedAt?: string;
  reviewedById?: string;

  isDeleted: boolean;
  deletedAt?: string;
  archivedAt?: string;

  createdAt: string;
  updatedAt: string;

  // relations / helpers for frontend
  images: TalentServiceImage[];
  schedules: TalentServiceSchedule[];
  bookingsCount?: number;
  totalEarnings?: number;
  rating?: number;
}
