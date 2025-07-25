// this file deals wih all the syncing of data between the db and the local storage
// if a user visits a mosque, we need to sync the data from the db to the local storage
// if it's their first time visiting, we need to get all the data from the db
// if it's not their first time visiting, we need to get the data from the db that has changed since the last time they visited
// this is done by checking the last_event, last_announcement, and last_prayer times and comparing them to their database counterparts
// if the last_x stored in the local storage is older than the last_x in the db, we need to get the data from the db
// this is done by checking the last_event, last_announcement, and last_prayer times and comparing them to their database counterparts

import { formatPrayerTimes } from "./getPrayerTimes";
import { storage } from "./mmkv";
import { supabase } from "./supabase";
import { MosqueData } from "./types";

// syncs the local storage with the db & returns all mosque info
/**
 * syncs the local storage with the db & returns all mosque info
 * @param lastVisitedMosqueId - the id of the mosque to sync
 * @returns the mosque data
 */
export const syncStorage = async (lastVisitedMosqueId: string) => {
    const dbMosqueData = await getMosqueData(lastVisitedMosqueId); // gets the mosque data from the db
    if (!dbMosqueData) {
        throw new Error(`Mosque with ID ${lastVisitedMosqueId} not found`);
    }
    
    // gets the mosque data from the local storage
    const storageData = storage.getString(`mosqueData-${lastVisitedMosqueId}`);
    const storageMosqueData = storageData ? JSON.parse(storageData) : null;
    
    // first time visiting this mosque, so we need to get all the data from the db
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

    // syncs the events, announcements, and prayer times in parallel
    const [updatedEvents, updatedAnnouncements, updatedPrayerTimes] = await Promise.all([
        syncEvents(lastVisitedMosqueId, storageMosqueData, dbMosqueData),
        syncAnnouncements(lastVisitedMosqueId, storageMosqueData, dbMosqueData),
        syncPrayerTimes(lastVisitedMosqueId, storageMosqueData, dbMosqueData)
    ]);

    // updates the timestamps to reflect when we last synced with the database
    // this represents when we last checked for updates, regardless of whether new data was found
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

/**
 * syncs the events from the db to the local storage
 * @param lastVisitedMosqueId - the id of the mosque to sync
 * @param storageMosqueData - the mosque data from the local storage
 * @param dbMosqueData - the mosque data from the db
 * @returns the updated events
 */
const syncEvents = async (lastVisitedMosqueId: string, storageMosqueData: any, dbMosqueData: any) => {
    const lastEventFetched = storageMosqueData.info.last_event;
    const lastEventPushed = dbMosqueData.last_event;

    // if the last event in the local storage is older than the last event in the db, we need to get the data from the db
    if (lastEventFetched < lastEventPushed) {
        const events = await getMosqueEvents(lastVisitedMosqueId, lastEventFetched);
        if (events && events.length > 0) {
            // creates a map of the existing events
            const existingEventsMap = new Map(
                storageMosqueData.events.map((event: any) => [event.id, event])
            );
            
            // adds the new events & overwrites edited events
            events.forEach(event => {
                existingEventsMap.set(event.id, event);
            });
            
            const updatedEvents = Array.from(existingEventsMap.values());
            return updatedEvents;
        }
    }

    return storageMosqueData.events;
}

/**
 * syncs the announcements from the db to the local storage
 * @param lastVisitedMosqueId - the id of the mosque to sync
 * @param storageMosqueData - the mosque data from the local storage
 * @param dbMosqueData - the mosque data from the db
 * @returns the updated announcements
 */
const syncAnnouncements = async (lastVisitedMosqueId: string, storageMosqueData: any, dbMosqueData: any) => {
    const lastAnnouncementFetched = storageMosqueData.info.last_announcement;
    const lastAnnouncementPushed = dbMosqueData.last_announcement;

    // if the last announcement in the local storage is older than the last announcement in the db, we need to get the data from the db
    if(lastAnnouncementFetched < lastAnnouncementPushed) {
        const announcements = await getMosqueAnnouncements(lastVisitedMosqueId, lastAnnouncementFetched);
        
        // creates a map of the existing announcements
        if (announcements && announcements.length > 0) {
            const existingAnnouncementsMap = new Map(
                storageMosqueData.announcements.map((announcement: any) => [announcement.id, announcement])
            );
            
            // adds the new announcements & overwrites edited announcements
            announcements.forEach(announcement => {
                existingAnnouncementsMap.set(announcement.id, announcement);
            });
            
            const updatedAnnouncements = Array.from(existingAnnouncementsMap.values());
            return updatedAnnouncements;
        }
    }

    return storageMosqueData.announcements;
}

/**
 * syncs the prayer times from the db to the local storage
 * @param lastVisitedMosqueId - the id of the mosque to sync
 * @param storageMosqueData - the mosque data from the local storage
 * @param dbMosqueData - the mosque data from the db
 * @returns the updated prayer times
 */
const syncPrayerTimes = async (lastVisitedMosqueId: string, storageMosqueData: any, dbMosqueData: any) => {
    const lastPrayerFetched = storageMosqueData.info.last_prayer;
    const lastPrayerPushed = dbMosqueData.last_prayer;
    console.log(lastPrayerFetched, lastPrayerPushed);
    console.log(lastPrayerFetched < lastPrayerPushed);

    if (lastPrayerFetched < lastPrayerPushed) {
        const city = dbMosqueData.address.split(',')[1].trim();
        const newPrayerTimes = await getPrayerTimes(city, lastVisitedMosqueId, lastPrayerFetched);
        console.log(newPrayerTimes);
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

/**
 * gets the prayer times from the db within the current week
 * @param city - the city of the mosque
 * @param lastVisitedMosqueId - the id of the mosque
 * @param lastPrayerFetched - the last prayer time fetched
 * @returns the prayer times
 */
const getPrayerTimes = async (city: string, lastVisitedMosqueId: string, lastPrayerFetched?: string) => {
    try {
        // Get current week's start and end dates
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
        endOfWeek.setHours(23, 59, 59, 999);
        
        const startDate = startOfWeek.toISOString().replace('T', ' ').replace('Z', '+00');
        const endDate = endOfWeek.toISOString().replace('T', ' ').replace('Z', '+00');

        // Build query based on whether we're fetching all or just updates
        let query = supabase
            .from('prayer_times')
            .select()
            .eq('masjid_id', lastVisitedMosqueId);

        if (lastPrayerFetched) {
            // Only fetch updated prayer times since last sync
            query = query.or(`created_at.gt.${lastPrayerFetched},updated_at.gt.${lastPrayerFetched}`);
        } else {
            // First time fetch - get current week
            query = query.gte('date', startDate).lte('date', endDate);
        }

        const { data: weekPrayerTimes, error } = await query;

        if (error) {
            console.error('Error fetching prayer times:', error);
            return null;
        }

        // Format each day's prayer times in parallel for better performance
        const formattedPrayerTimes: { [date: string]: any } = {};
        
        if (weekPrayerTimes && weekPrayerTimes.length > 0) {
            const formatPromises = weekPrayerTimes.map(async (dayPrayerTime) => {
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