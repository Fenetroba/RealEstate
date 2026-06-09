// ============================================================
// Core Domain Types
// ============================================================

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  walletAddress?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================================
// Property Types
// ============================================================

export type PropertyType = 'HOUSE' | 'APARTMENT' | 'CONDO' | 'VILLA' | 'COMMERCIAL' | 'LAND' | 'TOWNHOUSE';
export type PropertyStatus = 'ACTIVE' | 'PENDING' | 'SOLD' | 'RENTED' | 'DRAFT' | 'SUSPENDED';
export type InvestmentType = 'BUY' | 'RENT' | 'FRACTIONAL' | 'DAO';
export type ListingType = 'SALE' | 'RENT' | 'BOTH';

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  lat: number;
  lng: number;
  neighborhood?: string;
}

export interface PropertyMedia {
  images: string[];
  videos?: string[];
  virtualTourUrl?: string;
  floorPlanUrl?: string;
}

export interface PropertyAmenities {
  parking: boolean;
  pool: boolean;
  gym: boolean;
  security: boolean;
  elevator: boolean;
  garden: boolean;
  balcony: boolean;
  airConditioning: boolean;
  heating: boolean;
  internet: boolean;
  furnished: boolean;
  petFriendly: boolean;
}

export interface BlockchainData {
  tokenId?: string;
  contractAddress?: string;
  ownerWallet?: string;
  nftCertificateUrl?: string;
  metadataHash?: string;
  imagesRootHash?: string;
  documentsRootHash?: string;
  isVerified: boolean;
  verificationTxHash?: string;
  transferHistory: TransferRecord[];
  /** Registry database id — used to fetch images/documents from the backend API */
  dbId?: string;
}

export interface TransferRecord {
  from: string;
  to: string;
  txHash: string;
  timestamp: string;
  price: number;
}

export interface AIScores {
  riskScore: number;
  marketRisk: number;
  crimeRisk: number;
  floodRisk: number;
  neighborhoodRisk: number;
  economicRisk: number;
  scamProbability: number;
  carbonScore: number;
  energyEfficiency: number;
  investmentPotential: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  /** When ETH, price is token/listing amount in ether (not USD cents) */
  priceCurrency?: 'USD' | 'ETH';
  /** Monthly rent price in ETH (only set when listingType is RENT or BOTH) */
  rentPrice?: number;
  /** Registry NFT listed for sale on chain */
  registryForSale?: boolean;
  /** Registry NFT listed for rent on chain */
  registryForRent?: boolean;
  pricePerSqft?: number;
  propertyType: PropertyType;
  listingType: ListingType;
  investmentType: InvestmentType[];
  status: PropertyStatus;
  location: PropertyLocation;
  media: PropertyMedia;
  amenities: PropertyAmenities;
  bedrooms: number;
  bathrooms: number;
  area: number;
  yearBuilt?: number;
  floors?: number;
  parkingSpaces?: number;
  blockchain: BlockchainData;
  aiScores: AIScores;
  OWNERId: string;
  OWNER?: User;
  agentId?: string;
  agent?: User;
  isFeatured: boolean;
  isFractional: boolean;
  fractionalShares?: number;
  availableShares?: number;
  sharePrice?: number;
  documents: PropertyDocument[];
  timeline: PropertyTimelineEvent[];
  views: number;
  saves: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  ipfsHash?: string;
  uploadedAt: string;
}

export interface PropertyTimelineEvent {
  id: string;
  type: 'LISTED' | 'SOLD' | 'RENOVATED' | 'VALUED' | 'LEGAL' | 'TRANSFERRED';
  title: string;
  description: string;
  date: string;
  price?: number;
  txHash?: string;
}

// ============================================================
// Search & Filter Types
// ============================================================

export interface PropertyFilters {
  query?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  propertyType?: PropertyType[];
  investmentType?: InvestmentType[];
  listingType?: ListingType;
  maxRiskScore?: number;
  minCarbonScore?: number;
  amenities?: Partial<PropertyAmenities>;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'area' | 'risk';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// ============================================================
// Investment Types
// ============================================================

export interface Investment {
  id: string;
  userId: string;
  propertyId: string;
  property?: Property;
  type: InvestmentType;
  amount: number;
  shares?: number;
  sharePercentage?: number;
  status: 'ACTIVE' | 'EXITED' | 'PENDING';
  roi?: number;
  rentalIncome?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentSimulation {
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyRent?: number;
  appreciationRate: number;
  results: {
    monthlyMortgage: number;
    totalCost: number;
    roi: number;
    rentalYield: number;
    cashFlow: number;
    breakEvenYears: number;
    projectedValue5yr: number;
    projectedValue10yr: number;
    chartData: { year: number; value: number; equity: number; cashFlow: number }[];
  };
}

// ============================================================
// Transaction Types
// ============================================================

export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type TransactionType = 'PURCHASE' | 'RENTAL' | 'FRACTIONAL_BUY' | 'FRACTIONAL_SELL' | 'DIVIDEND';

export interface Transaction {
  id: string;
  buyerId: string;
  buyer?: User;
  OWNERId: string;
  OWNER?: User;
  propertyId: string;
  property?: Property;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  txHash?: string;
  contractAddress?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Offer Types
// ============================================================

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED';

export interface Offer {
  id: string;
  propertyId: string;
  property?: Property;
  buyerId: string;
  buyer?: User;
  OWNERId: string;
  amount: number;
  message?: string;
  status: OfferStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DAO Types
// ============================================================

export type ProposalStatus = 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED' | 'CANCELLED';
export type ProposalType = 'IMPROVEMENT' | 'INVESTMENT' | 'GOVERNANCE' | 'SALE' | 'COMMUNITY';

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  type: ProposalType;
  propertyId?: string;
  property?: Property;
  proposerId: string;
  proposer?: User;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  startDate: string;
  endDate: string;
  executionData?: string;
  createdAt: string;
}

export interface DAOVote {
  id: string;
  proposalId: string;
  userId: string;
  vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
  weight: number;
  createdAt: string;
}

// ============================================================
// Notification Types
// ============================================================

export type NotificationType =
  | 'OFFER_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'TRANSACTION_COMPLETE'
  | 'PROPERTY_VERIFIED'
  | 'DAO_VOTE'
  | 'RENTAL_DUE'
  | 'PRICE_CHANGE'
  | 'NEW_MESSAGE'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ============================================================
// Analytics Types
// ============================================================

export interface MarketAnalytics {
  totalListings: number;
  totalTransactions: number;
  totalVolume: number;
  avgPrice: number;
  priceGrowth: number;
  topCities: { city: string; count: number; avgPrice: number }[];
  monthlyData: { month: string; listings: number; sales: number; volume: number }[];
  propertyTypeDistribution: { type: string; count: number; percentage: number }[];
}

export interface PortfolioAnalytics {
  totalValue: number;
  totalInvested: number;
  totalROI: number;
  monthlyIncome: number;
  properties: number;
  shares: number;
  performanceData: { month: string; value: number; income: number }[];
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// UI Types
// ============================================================

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data?: unknown;
}

export interface LoadingState {
  [key: string]: boolean;
}
