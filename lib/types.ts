export type MosqueData = {
    name: string;
    address: string;
    images?: string[];
    coordinates: {
        latitude: number;
        longitude: number;
    }
}

export type UserData = { // TODO: This will be MosqueIDs when DB setup
    favoriteMosques: MosqueData[];
    lastVisitedMosque: MosqueData | null;
}