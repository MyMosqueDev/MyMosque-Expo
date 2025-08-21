export type MosqueInfo = {
    name: string;
    id: string;
    uid: string;
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
    contact_info: ContactInfo[];
}

export type ContactInfo = {
    name: string;
    phoneNumber?: string;
    email: string;
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
    status?: "active" | "deleted" | "draft";
}

export type PrayerInfo = {
    prayerTimes: PrayerTime;
    prayerSchedule: PrayerSchedule;
}

export type PrayerTime = {
    fajr: { adhan: string; iqama: string };
    dhuhr: { adhan: string; iqama: string };
    asr: { adhan: string; iqama: string };
    maghrib: { adhan: string; iqama: string };
    isha: { adhan: string; iqama: string };
    jummah: JummahTime;
    nextPrayer: {
        name: string;
        minutesToNextPrayer: number;
        percentElapsed: number;
    };
    warning?: string;
}

export type JummahTime = {
    jummah1: { athan: string; iqama: string };
    jummah2?: { athan: string; iqama: string };
    jummah3?: { athan: string; iqama: string };
}

export type Announcement = {
    id: string;
    created_at: string;
    title: string;
    description: string;
    date: string;
    severity: "low" | "medium" | "high";
    status?: "active" | "deleted" | "draft";
}

export type MosqueData = {
    info: MosqueInfo;
    announcements: Announcement[];
    events: Event[];
    prayerInfo: PrayerInfo;
}

export type ProcessedMosqueData = {
    info: MosqueInfo;
    announcements: Announcement[];
    events: Event[];
    prayerInfo: PrayerInfo;
}

export type UserData = {
    favoriteMosques: string[];
    lastVisitedMosque: string | null;
}

export type PrayerSchedule ={
    id: string
    name: string
    startDate: string
    endDate: string
    status: "active" | "inactive" | "deleted" | null;
    prayerTimes: {
        fajr: string
        dhuhr: string
        asr: string
        maghrib: string
        isha: string
    }
    timeMode: {
        fajr: "static" | "increment"
        dhuhr: "static" | "increment"
        asr: "static" | "increment"
        maghrib: "static" | "increment"
        isha: "static" | "increment"
    }
    incrementValues: {
        fajr: number
        dhuhr: number
        asr: number
        maghrib: number
        isha: number
    }
    isNew?: boolean
    warning?: string;
}
