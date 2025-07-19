export type MosqueInfo = {
    name: string;
    id: string;
    address: string;
    images?: string[] | null;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    hours: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    },
    last_announcement: string | null;
    last_event: string | null;
    last_prayer: string | null;
}

export type Event = {
    id: string;
    title: string;
    description: string;
    date: string;
    host: string;
    location: string;
    image: string;
    mosqueName?: string;
    displayDate?: string;
}

export type PrayerTime = {
    fajr: { adhan: string; iqama: string };
    dhuhr: { adhan: string; iqama: string };
    asr: { adhan: string; iqama: string };
    maghrib: { adhan: string; iqama: string };
    isha: { adhan: string; iqama: string };
    nextPrayer: {
        name: string;
        minutesToNextPrayer: number;
        percentElapsed: number;
    };
}

export type Announcement = {
    id: string;
    created_at: string;
    title: string;
    description: string;
    date: string;
    severity: "low" | "medium" | "high";
    is_deleted?: boolean;
}

export type MosqueData = {
    info: MosqueInfo;
    announcements: Announcement[];
    events: Event[];
    prayerTimes: { [date: string]: PrayerTime };
}

export type ProcessedMosqueData = {
    info: MosqueInfo;
    announcements: Announcement[];
    events: Event[];
    prayerTimes: PrayerTime;
}

export type UserData = { // TODO: This will be MosqueIDs when DB setup
    favoriteMosques: MosqueData[];
    lastVisitedMosque: MosqueData | null;
}