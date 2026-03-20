/** Lightweight catalog entry (loaded client-side for browsing) */
export interface SignCatalogEntry {
  slug: string;
  name: string;
  videoId: string | null;
  blogUrl: string;
  semanticField: string | null;
  lexicalClass: string | null;
  difficulty: 1 | 2 | 3;
  signType: string | null;
  frequency: number | null;
  frequencyLabel: string | null;
  hasLexData: boolean;
  handshape?: string | null;
  majorLocation?: string | null;
}

/** Full sign detail (loaded server-side for RAG context) */
export interface SignDetail extends SignCatalogEntry {
  handshape: string | null;
  selectedFingers: string | null;
  flexion: string | null;
  flexionChange: string | null;
  spread: string | null;
  movement: string | null;
  repeatedMovement: string | null;
  majorLocation: string | null;
  minorLocation: string | null;
  secondMinorLocation: string | null;
  contact: string | null;
  nonDominantHandshape: string | null;
  ulnarRotation: string | null;
  thumbPosition: string | null;
  thumbContact: string | null;
  iconicity: number | null;
  iconicityLabel: string | null;
  iconicityType: string | null;
  isCompound: boolean | null;
  numMorphemes: number | null;
  ageOfAcquisition: number | null;
  aoaLabel: string | null;
  neighborhoodDensity: number | null;
  signBankTranslations: string | null;
  signBankId: string | null;
}

/** MediaPipe hand landmark (21 per hand) */
export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/** Single frame of landmark data */
export interface LandmarkFrame {
  timestamp: number;
  hands: {
    landmarks: Landmark[];
    handedness: string;
    score: number;
  }[];
}

/** Feedback API request */
export interface FeedbackRequest {
  signSlug: string;
  landmarks: LandmarkFrame[];
  duration: number;
  locale?: string;
}
