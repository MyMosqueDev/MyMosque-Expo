import { formatPrayerTimes } from "./getPrayerTimes";
import { storage } from "./mmkv";
import { supabase } from "./supabase";
import { MosqueData } from "./types";

// syncs the local storage with the db & returns all mosque info
export const syncStorage = async (lastVisitedMosqueId: string) => {
    const dbMosqueData = await getMosqueData(lastVisitedMosqueId);
    if (!dbMosqueData) {
        throw new Error(`Mosque with ID ${lastVisitedMosqueId} not found`);
    }
    
    const storageData = storage.getString(`mosqueData-${lastVisitedMosqueId}`);
    const storageMosqueData = storageData ? JSON.parse(storageData) : null;
    
    // first time visiting this mosque
    if (!storageMosqueData || Object.keys(storageMosqueData).length === 0) {
        const city = dbMosqueData.address.split(',')[1].trim();

        // gets all the needed data from supabase
        const [announcements, events, prayerTimes] = await Promise.all([
            getMosqueAnnouncements(lastVisitedMosqueId),
            getMosqueEvents(lastVisitedMosqueId),
            getPrayerTimes(city, lastVisitedMosqueId)
        ]);

        // creates the mosque data object
        const mosqueData: MosqueData = {
            info: {
                ...dbMosqueData,
                last_event: dbMosqueData.last_event || new Date().toISOString(),
                last_announcement: dbMosqueData.last_announcement || new Date().toISOString(),
                last_prayer: dbMosqueData.last_prayer || new Date().toISOString(),
            },
            announcements: announcements || [],
            events: events || [],
            prayerTimes: prayerTimes || {},
        };

        storage.set(`mosqueData-${mosqueData.info.id}`, JSON.stringify(mosqueData));
        return mosqueData;
    }

    // Run sync operations in parallel for better performance
    const [updatedEvents, updatedAnnouncements, updatedPrayerTimes] = await Promise.all([
        syncEvents(lastVisitedMosqueId, storageMosqueData, dbMosqueData),
        syncAnnouncements(lastVisitedMosqueId, storageMosqueData, dbMosqueData),
        syncPrayerTimes(lastVisitedMosqueId, storageMosqueData, dbMosqueData)
    ]);

    // Update timestamps to reflect when we last synced with the database
    // This represents when we last checked for updates, regardless of whether new data was found
    const currentSyncTime = new Date().toISOString();
    const updatedMosqueInfo = { 
        ...storageMosqueData.info,
        last_event: currentSyncTime,
        last_announcement: currentSyncTime,
        last_prayer: currentSyncTime,
    };

    const updatedMosqueData = {
        ...storageMosqueData,
        events: updatedEvents,
        announcements: updatedAnnouncements,
        prayerTimes: updatedPrayerTimes,
        info: updatedMosqueInfo,
    }

    storage.set(`mosqueData-${lastVisitedMosqueId}`, JSON.stringify(updatedMosqueData));
    return updatedMosqueData;
}

const syncEvents = async (lastVisitedMosqueId: string, storageMosqueData: any, dbMosqueData: any) => {
    const lastEventFetched = storageMosqueData.info.last_event;
    const lastEventPushed = dbMosqueData.last_event;

    if (lastEventFetched < lastEventPushed) {
        const events = await getMosqueEvents(lastVisitedMosqueId, lastEventFetched);
        if (events && events.length > 0) {
            const existingEventsMap = new Map(
                storageMosqueData.events.map((event: any) => [event.id, event])
            );
            
            events.forEach(event => {
                existingEventsMap.set(event.id, event);
            });
            
            const updatedEvents = Array.from(existingEventsMap.values());
            return updatedEvents;
        }
    }

    return storageMosqueData.events;
}

const syncAnnouncements = async (lastVisitedMosqueId: string, storageMosqueData: any, dbMosqueData: any) => {
    const lastAnnouncementFetched = storageMosqueData.info.last_announcement;
    const lastAnnouncementPushed = dbMosqueData.last_announcement;

    if(lastAnnouncementFetched < lastAnnouncementPushed) {
        const announcements = await getMosqueAnnouncements(lastVisitedMosqueId, lastAnnouncementFetched);

        if (announcements && announcements.length > 0) {
            const existingAnnouncementsMap = new Map(
                storageMosqueData.announcements.map((announcement: any) => [announcement.id, announcement])
            );
            
            announcements.forEach(announcement => {
                existingAnnouncementsMap.set(announcement.id, announcement);
            });
            
            const updatedAnnouncements = Array.from(existingAnnouncementsMap.values());
            return updatedAnnouncements;
        }
    }

    return storageMosqueData.announcements;
}

const syncPrayerTimes = async (lastVisitedMosqueId: string, storageMosqueData: any, dbMosqueData: any) => {
    const lastPrayerFetched = storageMosqueData.info.last_prayer;
    const lastPrayerPushed = dbMosqueData.last_prayer;

    if (lastPrayerFetched < lastPrayerPushed) {
        const city = dbMosqueData.address.split(',')[1].trim();
        const newPrayerTimes = await getPrayerTimes(city, lastVisitedMosqueId, lastPrayerFetched);

        if (newPrayerTimes && Object.keys(newPrayerTimes).length > 0) {
            // Create a map of existing prayer times by date for duplicate handling
            const existingPrayerTimesMap = new Map(
                Object.entries(storageMosqueData.prayerTimes).map(([date, prayerTime]) => [date, prayerTime])
            );
            
            // Overwrite existing prayer times with new ones (fetched prayer times take precedence)
            Object.entries(newPrayerTimes).forEach(([date, prayerTime]) => {
                existingPrayerTimesMap.set(date, prayerTime);
            });
            
            // Convert map back to object
            const updatedPrayerTimes = Object.fromEntries(existingPrayerTimesMap);
            return updatedPrayerTimes;
        }
    }

    return storageMosqueData.prayerTimes;
}

// function to get the mosque data from supabase
const getMosqueData = async (lastVisitedMosqueId: string) => {
    try {
        const {data: mosqueInfo, error} = await supabase
            .from('mosques')
            .select()
            .eq('id', lastVisitedMosqueId)
            .single();

        if (error) {
            console.error('Error fetching mosque data:', error);
            return null;
        }

        return mosqueInfo;
    } catch (error) {
        console.error('Error in getMosqueData:', error);
        return null;
    }
}

// function to get the mosque events from supabase
const getMosqueEvents = async (lastVisitedMosqueId: string, createdAfter?: string) => {
    try {
        let query = supabase
            .from('events')
            .select()
            .eq('masjid_id', lastVisitedMosqueId);

        if (createdAfter) {
            query = query.or(`created_at.gt.${createdAfter},updated_at.gt.${createdAfter}`);
        }

        const { data: events, error } = await query;
        
        if (error) {
            console.error('Error fetching mosque events:', error);
            return null;
        }

        return events;
    } catch (error) {
        console.error('Error in getMosqueEvents:', error);
        return null;
    }
}

// function to get the mosque announcements from supabase
const getMosqueAnnouncements = async (lastVisitedMosqueId: string, createdAfter?: string) => {
    try {
        let query = supabase
            .from('announcements')
            .select()
            .eq('masjid_id', lastVisitedMosqueId);

        if (createdAfter) {
            query = query.or(`created_at.gt.${createdAfter},updated_at.gt.${createdAfter}`);
        }

        const { data: announcements, error } = await query;
        
        if (error) {
            console.error('Error fetching mosque announcements:', error);
            return null;
        }

        return announcements;
    } catch (error) {
        console.error('Error in getMosqueAnnouncements:', error);
        return null;
    }
}

const getPrayerTimes = async (city: string, lastVisitedMosqueId: string, lastPrayerFetched?: string) => {
    try {
        // Get current month's start and end dates
        const today = new Date();
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth() + 1;
        const endOfMonth = new Date(year, month, 0);
        
        const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00+00`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')} 23:59:59+00`;

        // Build query based on whether we're fetching all or just updates
        let query = supabase
            .from('prayer_times')
            .select()
            .eq('masjid_id', lastVisitedMosqueId);

        if (lastPrayerFetched) {
            // Only fetch updated prayer times since last sync
            query = query.or(`created_at.gt.${lastPrayerFetched},updated_at.gt.${lastPrayerFetched}`);
        } else {
            // First time fetch - get entire month
            query = query.gte('date', startDate).lte('date', endDate);
        }

        const { data: monthPrayerTimes, error } = await query;

        if (error) {
            console.error('Error fetching prayer times:', error);
            return null;
        }

        // Format each day's prayer times in parallel for better performance
        const formattedPrayerTimes: { [date: string]: any } = {};
        
        if (monthPrayerTimes && monthPrayerTimes.length > 0) {
            const formatPromises = monthPrayerTimes.map(async (dayPrayerTime) => {
                const formattedDay = await formatPrayerTimes(city, dayPrayerTime.times);
                return { date: dayPrayerTime.date, formattedDay };
            });
            
            const formattedResults = await Promise.all(formatPromises);
            
            formattedResults.forEach(({ date, formattedDay }) => {
                formattedPrayerTimes[date] = formattedDay;
            });
        }
        return formattedPrayerTimes;
    } catch (error) {
        console.error('Error in getPrayerTimes:', error);
        return null;
    }
}