export type MosqueData = {
    name: string;
    address: string;
    images?: string[] | null;
    coordinates: {
        latitude: number;
        longitude: number;
    },
    hours: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    },
    announcements: {
        title: string;
        description: string;
        date: string;
        severity: "low" | "medium" | "high";
    }[];
    events: {
        title: string;
        description: string;
        date: string;
        host: string;
        location: string;
        time: string;
        image: string;
    }[];
}

export type UserData = { // TODO: This will be MosqueIDs when DB setup
    favoriteMosques: MosqueData[];
    lastVisitedMosque: MosqueData | null;
}