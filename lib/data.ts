import { MosqueData } from './types';

export const mosqueData: MosqueData[] = [
    {
        name: "Nueces Mosque",
        supabaseId: "1",
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
                date: "2025-07-12",
                time: "8:30 PM",
                isoDateTime: "2025-07-12T20:30:00.000Z",
                description: "Join us every Monday Night as Mufti Anwer gives us a deep dive into Surah Al Mulk followed by some delicious cookies and milk!",
                host: "Mufti Anwer",
                location: "Nueces Main Prayer Hall",
                image: "https://scontent-hou1-1.cdninstagram.com/v/t51.2885-15/489415712_18498821830054823_3290200103975185669_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjE0NDB4MTQ0MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=scontent-hou1-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGTDVFRt-7ZN9M7wD8f2yKHtYbzwGdtrZgR_UpD_bHByMaiQo4rSEKNgDEOHlhNJbOttyQVxmxsrLBPtwkq89Jm&_nc_ohc=VOuM5c4OHaQQ7kNvwF5ZHxW&_nc_gid=tcdcyxSVbqxQx9Bsv7rJuw&edm=APoiHPcBAAAA&ccb=7-5&ig_cache_key=MzYwNDkyMTMyNjE0NzkwNDY3NA%3D%3D.3-ccb7-5&oh=00_AfQwgkPLhdi0k18nUuEbUpfmjWpbBnMd-eZDiapj4AxbmQ&oe=6879B8C5&_nc_sid=22de04"
            },
            {
                title: "Quran Competition",
                date: "2025-07-13", 
                time: "2:00 PM",
                isoDateTime: "2025-07-13T14:00:00.000Z",
                description: "Annual Quran competition. Prizes will be awarded for memorization and tajweed categories.",
                host: "Mufti Anwer",
                location: "Nueces Community Center",
                image: "https://scontent-hou1-1.cdninstagram.com/v/t51.2885-15/489778309_18499311598054823_843495426331207181_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjE0NDB4MTQ0MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=scontent-hou1-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGTDVFRt-7ZN9M7wD8f2yKHtYbzwGdtrZgR_UpD_bHByMaiQo4rSEKNgDEOHlhNJbOttyQVxmxsrLBPtwkq89Jm&_nc_ohc=my8-zYA1wAQQ7kNvwEbD3uF&_nc_gid=tcdcyxSVbqxQx9Bsv7rJuw&edm=APoiHPcBAAAA&ccb=7-5&ig_cache_key=MzYwNjY1MTk1ODMxMzk2NzAwNw%3D%3D.3-ccb7-5&oh=00_AfTw-rhXJ3X6Zyp4lJyuX5DZs6Vw_yvI64s1kqV18CFAog&oe=6879DC8B&_nc_sid=22de04"
            },
            {
                title: "Sisters' Book Club",
                date: "2025-07-07",
                time: "6:00 PM", 
                isoDateTime: "2025-07-07T18:00:00.000Z",
                description: "Monthly sisters' book club meeting discussing 'Reclaim Your Heart' by Yasmin Mogahed. Light refreshments will be served.",
                host: "Sr. Fatima",
                location: "Sisters' Prayer Hall",
                image: "https://scontent-hou1-1.cdninstagram.com/v/t51.2885-15/504398570_18510397549054823_2653423764479756366_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjE0NDB4MTQ0MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=scontent-hou1-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGxJGtmqu-ldO8jpn3ESezTCOOiDSYOeGc9gjnnkbXS8WY6WC0oo1JstfGaXD_NU_tqT7wKXMlzaSdQvZQp6BsK&_nc_ohc=lhSvK8wa2sYQ7kNvwFqgJ0L&_nc_gid=kCQ_tMUJKyCV0qbpYPh-ng&edm=APoiHPcBAAAA&ccb=7-5&ig_cache_key=MzY0OTAxMjE4MTQ4MDU2Nzk2NA%3D%3D.3-ccb7-5&oh=00_AfTa_Mmv78YwDImuOLcTig3DQu8nm1WPo_9oCyqGHUKBhw&oe=6879D55B&_nc_sid=22de04"
            }
        ]
    },
    {
        name: "ISGH River Oaks Islamic Center (ROIC)",
        supabaseId: "1",
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
                time: "8:30 PM",
                isoDateTime: "2025-06-30T20:30:00.000Z",
                description: "Join us every Monday Night as Mufti Anwer gives us a deep dive into Surah Al Mulk followed by some delicious cookies and milk!",
                host: "Mufti Anwer",
                location: "Nueces Main Prayer Hall",
                image: "https://scontent-hou1-1.cdninstagram.com/v/t51.2885-15/504398570_18510397549054823_2653423764479756366_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjE0NDB4MTQ0MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=scontent-hou1-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGxJGtmqu-ldO8jpn3ESezTCOOiDSYOeGc9gjnnkbXS8WY6WC0oo1JstfGaXD_NU_tqT7wKXMlzaSdQvZQp6BsK&_nc_ohc=lhSvK8wa2sYQ7kNvwFqgJ0L&_nc_gid=kCQ_tMUJKyCV0qbpYPh-ng&edm=APoiHPcBAAAA&ccb=7-5&ig_cache_key=MzY0OTAxMjE4MTQ4MDU2Nzk2NA%3D%3D.3-ccb7-5&oh=00_AfTa_Mmv78YwDImuOLcTig3DQu8nm1WPo_9oCyqGHUKBhw&oe=6879D55B&_nc_sid=22de04"
            }
        ]
    }
    
]