import { MosqueData } from './types';

export const mosqueData: MosqueData[] = [
    {
        name: "Nueces Mosque",
        address: "1906 Nueces St, Austin, TX 78705",
        images: [
            'https://thedailytexan.com/wp-content/uploads/2019/04/mosque_2019-04-19_Nueces_Mosque_Conor.Duffy4459_0.jpg',
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ971qo6iYRJzTWkp8P7Ts988aWgFh0YmsLZw&s',
            'https://cdn.prod.website-files.com/65a9b84e7204db0451653424/6722db91987737a325e16e01_si_qalam-17%20(1).jpg'
        ],
        coordinates: {
            latitude: 30.283252,
            longitude: -97.744386,
        },
        hours: {
            monday: "5:00 AM - 10:00 PM",
            tuesday: "5:00 AM - 10:00 PM",
            wednesday: "5:00 AM - 10:00 PM",
            thursday: "5:00 AM - 10:00 PM",
            friday: "5:00 AM - 10:00 PM",
            saturday: "5:00 AM - 10:00 PM",
            sunday: "5:00 AM - 10:00 PM",
        },
        prayerTimes: {
            fajr: { adhan: "5:22", iqama: "5:47" },
            dhuhr: { adhan: "1:37", iqama: "2:00" },
            asr: { adhan: "6:29", iqama: "6:45" },
            maghrib: { adhan: "8:35", iqama: "8:40" },
            isha: { adhan: "9:52", iqama: "10:05" },
        },
        announcements: [
            {
                title: "New Jummah Timings",
                date: "2025-05-08",
                description: "We have changed our Jummah Prayer Times. We will now only have two Jummas at 1:30 and 2:30.We have changed our Jummah Prayer Times. We will now only have two Jummas at 1:30 and 2:30.We have changed our Jummah Prayer Times. We will now only have two Jummas at 1:30 and 2:30.",
                severity: "high"
            },
            {
                title: "Donation Drive",
                date: "2025-05-04",
                description: "We're collecting donations for the local food bank. Please bring non-perishable items to the mosque.",
                severity: "medium"
            },
        ],
        events: [
            {
                title: "cookies 'n mulk",
                date: "2025-06-30",
                description: "Join us every Monday Night as Mufti Anwer gives us a deep dive into Surah Al Mulk followed by some delicious cookies and milk!",
                host: "Mufti Anwer",
                location: "Nueces Main Prayer Hall",
                time: "8:30 PM",
                image: "https://www.islamiccenter.com/wp-content/uploads/2021/03/cookies-n-mulk-1.jpg"
            }
        ]
    },
    {
        name: "ISGH River Oaks Islamic Center (ROIC)",
        address: "3110 Eastside St, Houston, TX 77098",
        coordinates: {
            latitude: 29.736879,
            longitude: -95.425072,
        },
        hours: {
            monday: "5:00 AM - 10:00 PM",
            tuesday: "5:00 AM - 10:00 PM",
            wednesday: "5:00 AM - 10:00 PM",
            thursday: "5:00 AM - 10:00 PM",
            friday: "5:00 AM - 10:00 PM",
            saturday: "5:00 AM - 10:00 PM",
            sunday: "5:00 AM - 10:00 PM",
        },
        prayerTimes: {
            fajr: { adhan: "5:22", iqama: "5:47" },
            dhuhr: { adhan: "1:37", iqama: "2:00" },
            asr: { adhan: "6:29", iqama: "6:45" },
            maghrib: { adhan: "8:35", iqama: "8:40" },
            isha: { adhan: "9:52", iqama: "10:05" },
        },
        announcements: [
            {
                title: "New Jummah Timings",
                date: "2025-05-08",
                description: "We have changed our Jummah Prayer Times. We will now only have two Jummas at 1:30 and 2:30.",
                severity: "high"
            },
            {
                title: "Donation Drive",
                date: "2025-05-04",
                description: "We're collecting donations for the local food bank. Please bring non-perishable items to the mosque.",
                severity: "medium"
            },
        ],
        events: [
            {
                title: "cookies 'n mulk",
                date: "2025-06-30",
                description: "Join us every Monday Night as Mufti Anwer gives us a deep dive into Surah Al Mulk followed by some delicious cookies and milk!",
                host: "Mufti Anwer",
                location: "Nueces Main Prayer Hall",
                time: "8:30 PM",
                image: "https://www.islamiccenter.com/wp-content/uploads/2021/03/cookies-n-mulk-1.jpg"
            }
        ]
    }
    
]