export type MosqueInfo = {
    name: string;
    supabaseId: string;
    address: string;
    images?: string[] | null;
    hours: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    },
}

export type Event = {
    title: string;
    description: string;
    date: string;
    host: string;
    location: string;
    image: string;
}

export type PrayerTime = {
    fajr: { adhan: string; iqama: string };
    dhuhr: { adhan: string; iqama: string };
    asr: { adhan: string; iqama: string };
    maghrib: { adhan: string; iqama: string };
    isha: { adhan: string; iqama: string };
}

export type MosqueData = {
    name: string;
    supabaseId: string;
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
    prayerTimes: {
        fajr: { adhan: string; iqama: string; },
        dhuhr: { adhan: string; iqama: string; },
        asr: { adhan: string; iqama: string; },
        maghrib: { adhan: string; iqama: string; },
        isha: { adhan: string; iqama: string; },
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
        time: string;
        isoDateTime: string;
        host: string;
        location: string;
        image: string;
    }[];
}

export type EventData = {
    mosqueName: string;
    title: string;
    description: string;
    date: string;
    time: string;
    isoDateTime: string;
    host: string;
    location: string;
    image: string;
}


export type UserData = { // TODO: This will be MosqueIDs when DB setup
    favoriteMosques: MosqueData[];
    lastVisitedMosque: MosqueData | null;
}