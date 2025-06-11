
export interface Product {
  id: string;
  name: string;
  description: string;
  tags: string[];
  price: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type ProductFormValues = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  retrievedContext?: {
    uri: string;
    title: string;
  };
  // other types of chunks can be added here if needed
}

export interface GroundingMetadata {
  groundingAttributions?: {
    sourceId: string;
    content: {
      text: string;
    };
  }[];
  webSearchQueries?: string[];
  groundingChunks?: GroundingChunk[];
}
