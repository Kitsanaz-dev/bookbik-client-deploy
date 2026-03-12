import {
  Building2,
  Hotel,
  Utensils,
  Trophy,
  Sparkles,
  Ticket,
  LayoutGrid,
} from "lucide-react";
export const CATEGORIES = [
  { id: "all", name: "All", icon: LayoutGrid },
  { id: "Stay", name: "Stay", icon: Hotel },
  { id: "Dining", name: "Dining", icon: Utensils },
  { id: "Sports", name: "Sports", icon: Trophy },
  { id: "Beauty", name: "Beauty", icon: Sparkles },
  { id: "Events", name: "Events", icon: Ticket },
  { id: "General", name: "General", icon: Building2 },
];

export const LAO_PROVINCES = [
    {
        id: "all",
        name: "All Provinces",
        lat: 18.5,
        lng: 103.5,
        districts: [],
    },
    {
        id: "vcap",
        name: "Vientiane Capital",
        lat: 17.9757,
        lng: 102.6331,
        districts: [
            { name: "Chanthabuly", lat: 17.973, lng: 102.613 },
            { name: "Sikhottabong", lat: 17.985, lng: 102.585 },
            { name: "Xaysettha", lat: 17.965, lng: 102.655 },
            { name: "Sisattanak", lat: 17.945, lng: 102.625 },
            { name: "Naxaithong", lat: 18.150, lng: 102.500 },
            { name: "Xaythany", lat: 18.100, lng: 102.800 },
            { name: "Hadxayfong", lat: 17.850, lng: 102.700 },
            { name: "Sangthong", lat: 18.300, lng: 102.100 },
            { name: "Mayparkngum", lat: 18.050, lng: 103.100 }
        ]
    },
    {
        id: "psl",
        name: "Phongsaly",
        lat: 21.6833,
        lng: 102.1,
        districts: [
            { name: "Phongsaly", lat: 21.683, lng: 102.100 },
            { name: "May", lat: 21.383, lng: 102.750 },
            { name: "Khoua", lat: 21.083, lng: 102.417 },
            { name: "Samphanh", lat: 21.367, lng: 102.217 },
            { name: "Boun Neua", lat: 21.650, lng: 101.917 },
            { name: "Yot Ou", lat: 22.017, lng: 101.767 },
            { name: "Boun Tay", lat: 21.417, lng: 101.883 }
        ]
    },
    {
        id: "lnm",
        name: "Luang Namtha",
        lat: 20.95,
        lng: 101.4,
        districts: [
            { name: "Namtha", lat: 20.950, lng: 101.400 },
            { name: "Sing", lat: 21.183, lng: 101.150 },
            { name: "Long", lat: 20.967, lng: 100.833 },
            { name: "Viengphoukha", lat: 20.667, lng: 101.067 },
            { name: "Na Le", lat: 20.700, lng: 101.450 }
        ]
    },
    {
        id: "odx",
        name: "Oudomxay",
        lat: 20.6833,
        lng: 101.9833,
        districts: [
            { name: "Xay", lat: 20.683, lng: 101.983 },
            { name: "La", lat: 20.883, lng: 102.167 },
            { name: "Na Mo", lat: 21.017, lng: 101.783 },
            { name: "Nga", lat: 20.483, lng: 102.317 },
            { name: "Beng", lat: 20.450, lng: 101.717 },
            { name: "Houne", lat: 20.133, lng: 101.533 },
            { name: "Pak Beng", lat: 19.867, lng: 101.117 }
        ]
    },
    {
        id: "bk",
        name: "Bokeo",
        lat: 20.2833,
        lng: 100.4167,
        districts: [
            { name: "Houayxay", lat: 20.283, lng: 100.417 },
            { name: "Tonpheung", lat: 20.350, lng: 100.117 },
            { name: "Meung", lat: 20.617, lng: 100.283 },
            { name: "Pha Oudom", lat: 19.983, lng: 100.800 },
            { name: "Paktha", lat: 20.083, lng: 100.583 }
        ]
    },
    {
        id: "lpbr",
        name: "Luang Prabang",
        lat: 19.8833,
        lng: 102.1333,
        districts: [
            { name: "Luang Prabang", lat: 19.883, lng: 102.133 },
            { name: "Xiengngeun", lat: 19.750, lng: 102.250 },
            { name: "Nane", lat: 19.483, lng: 102.117 },
            { name: "Pak Ou", lat: 20.050, lng: 102.233 },
            { name: "Nambak", lat: 20.417, lng: 102.450 },
            { name: "Ngoy", lat: 20.683, lng: 102.667 },
            { name: "Pak Seng", lat: 20.117, lng: 102.733 },
            { name: "Phonxay", lat: 20.017, lng: 102.500 },
            { name: "Chomphet", lat: 19.933, lng: 102.050 },
            { name: "Viengkham", lat: 20.583, lng: 102.933 },
            { name: "Phoukhoune", lat: 19.450, lng: 102.433 },
            { name: "Phon Thong", lat: 20.283, lng: 102.350 }
        ]
    },
    {
        id: "hp",
        name: "Houaphanh",
        lat: 20.4167,
        lng: 104.05,
        districts: [
            { name: "Xamneua", lat: 20.417, lng: 104.050 },
            { name: "Xiengkhor", lat: 20.833, lng: 104.017 },
            { name: "Hiam", lat: 20.233, lng: 103.367 },
            { name: "Viengxay", lat: 20.400, lng: 104.233 },
            { name: "Huameuang", lat: 20.150, lng: 103.733 },
            { name: "Samthay", lat: 19.850, lng: 104.533 },
            { name: "Sopbao", lat: 20.733, lng: 104.583 },
            { name: "Et", lat: 20.850, lng: 103.633 },
            { name: "Keo Nua", lat: 20.167, lng: 104.333 },
            { name: "Xone", lat: 20.433, lng: 103.883 }
        ]
    },
    {
        id: "xyb",
        name: "Sainyabuli",
        lat: 19.25,
        lng: 101.75,
        districts: [
            { name: "Sainyabuli", lat: 19.250, lng: 101.750 },
            { name: "Khop", lat: 19.717, lng: 100.667 },
            { name: "Hongsa", lat: 19.700, lng: 101.333 },
            { name: "Ngeun", lat: 19.733, lng: 101.083 },
            { name: "Xayngone", lat: 19.483, lng: 101.217 },
            { name: "Phiang", lat: 19.017, lng: 101.550 },
            { name: "Parklai", lat: 18.200, lng: 101.400 },
            { name: "Kenethao", lat: 17.633, lng: 101.000 },
            { name: "Botene", lat: 17.867, lng: 100.867 },
            { name: "Thongmixay", lat: 18.000, lng: 101.167 },
            { name: "Xayxathan", lat: 18.983, lng: 101.917 }
        ]
    },
    {
        id: "vtp",
        name: "Vientiane Province",
        lat: 18.5,
        lng: 102.4167,
        districts: [
            { name: "Phonhong", lat: 18.500, lng: 102.417 },
            { name: "Thoulakhom", lat: 18.450, lng: 102.617 },
            { name: "Keo Oudom", lat: 18.583, lng: 102.450 },
            { name: "Kasi", lat: 19.217, lng: 102.250 },
            { name: "Vangviang", lat: 18.933, lng: 102.450 },
            { name: "Feuang", lat: 18.483, lng: 102.050 },
            { name: "Sanakham", lat: 18.150, lng: 101.650 },
            { name: "Mad", lat: 18.883, lng: 101.783 },
            { name: "Viengkham", lat: 18.300, lng: 102.733 },
            { name: "Hinherb", lat: 18.633, lng: 102.267 },
            { name: "Meun", lat: 18.733, lng: 102.067 }
        ]
    },
    {
        id: "bkx",
        name: "Bolikhamxay",
        lat: 18.38,
        lng: 104.15,
        districts: [
            { name: "Pakxan", lat: 18.380, lng: 104.150 },
            { name: "Thaphabath", lat: 18.330, lng: 103.520 },
            { name: "Pakkading", lat: 18.310, lng: 104.000 },
            { name: "Borikane", lat: 18.650, lng: 104.050 },
            { name: "Khamkeud", lat: 18.210, lng: 104.970 },
            { name: "Viengthong", lat: 18.670, lng: 104.420 },
            { name: "Xaychamphone", lat: 18.850, lng: 104.820 }
        ]
    },
    {
        id: "km",
        name: "Khammouane",
        lat: 17.4333,
        lng: 104.8333,
        districts: [
            { name: "Thakhek", lat: 17.433, lng: 104.833 },
            { name: "Mahaxay", lat: 17.417, lng: 105.183 },
            { name: "Nongbok", lat: 17.150, lng: 104.800 },
            { name: "Hineboon", lat: 17.783, lng: 104.650 },
            { name: "Yommalath", lat: 17.600, lng: 105.167 },
            { name: "Bualapha", lat: 17.383, lng: 105.750 },
            { name: "Nakai", lat: 17.717, lng: 105.150 },
            { name: "Sebangfay", lat: 17.067, lng: 104.933 },
            { name: "Xaybuathong", lat: 17.517, lng: 105.450 },
            { name: "Kounkham", lat: 17.883, lng: 104.533 }
        ]
    },
    {
        id: "svk",
        name: "Savannakhet",
        lat: 16.5667,
        lng: 104.7556,
        districts: [
            { name: "Kaysone Phomvihane", lat: 16.567, lng: 104.756 },
            { name: "Outhoumphone", lat: 16.683, lng: 105.000 },
            { name: "Atsaphangthong", lat: 16.650, lng: 105.283 },
            { name: "Phine", lat: 16.250, lng: 105.983 },
            { name: "Sepon", lat: 16.700, lng: 106.200 },
            { name: "Nong", lat: 16.367, lng: 106.517 },
            { name: "Thapangthong", lat: 16.033, lng: 105.617 },
            { name: "Songkhone", lat: 16.233, lng: 105.217 },
            { name: "Champhone", lat: 16.433, lng: 105.150 },
            { name: "Xonabuly", lat: 16.117, lng: 105.150 },
            { name: "Xaybuly", lat: 16.783, lng: 105.050 },
            { name: "Vilabuly", lat: 16.950, lng: 105.950 },
            { name: "Atsaphone", lat: 16.850, lng: 105.483 },
            { name: "Xayphone", lat: 16.483, lng: 104.950 },
            { name: "Phalanxay", lat: 16.483, lng: 105.617 }
        ]
    },
    {
        id: "slv",
        name: "Salavan",
        lat: 15.7167,
        lng: 106.4167,
        districts: [
            { name: "Salavan", lat: 15.717, lng: 106.417 },
            { name: "Ta Oi", lat: 16.100, lng: 106.633 },
            { name: "Toumlane", lat: 16.033, lng: 106.217 },
            { name: "Lakhonepheng", lat: 15.867, lng: 105.783 },
            { name: "Vapi", lat: 15.650, lng: 105.950 },
            { name: "Khongsedone", lat: 15.533, lng: 105.800 },
            { name: "Lao Ngam", lat: 15.433, lng: 106.283 },
            { name: "Samuoi", lat: 16.300, lng: 106.917 }
        ]
    },
    {
        id: "sk",
        name: "Sekong",
        lat: 15.3444,
        lng: 106.7167,
        districts: [
            { name: "Lamarm", lat: 15.344, lng: 106.717 },
            { name: "Kaleum", lat: 15.700, lng: 107.033 },
            { name: "Dakcheung", lat: 15.350, lng: 107.300 },
            { name: "Thateng", lat: 15.433, lng: 106.383 }
        ]
    },
    {
        id: "cps",
        name: "Champasak",
        lat: 15.1167,
        lng: 105.7833,
        districts: [
            { name: "Pakse", lat: 15.117, lng: 105.783 },
            { name: "Sanamxay", lat: 14.833, lng: 106.467 },
            { name: "Pathumphone", lat: 14.800, lng: 105.867 },
            { name: "Paksong", lat: 15.183, lng: 106.233 },
            { name: "Champasak", lat: 14.883, lng: 105.867 },
            { name: "Sukuma", lat: 14.583, lng: 105.617 },
            { name: "Moonlapamok", lat: 14.333, lng: 105.833 },
            { name: "Khong", lat: 14.117, lng: 105.850 },
            { name: "Phonthong", lat: 15.017, lng: 105.650 },
            { name: "Bachiangchaleunsook", lat: 15.183, lng: 105.867 }
        ]
    },
    {
        id: "atp",
        name: "Attapeu",
        lat: 14.8,
        lng: 106.8333,
        districts: [
            { name: "Xaysettha", lat: 14.800, lng: 106.833 },
            { name: "Sanamxay", lat: 14.583, lng: 106.467 },
            { name: "Sanxay", lat: 15.000, lng: 107.133 },
            { name: "Phouvong", lat: 14.517, lng: 106.917 },
            { name: "Samakkhixay", lat: 14.800, lng: 106.833 }
        ]
    },
    {
        id: "xsb",
        name: "Xaisomboun",
        lat: 18.8333,
        lng: 103.1333,
        districts: [
            { name: "Anouvong", lat: 18.833, lng: 103.133 },
            { name: "Longchaeng", lat: 19.383, lng: 102.833 },
            { name: "Longxan", lat: 18.783, lng: 102.883 },
            { name: "Hom", lat: 18.733, lng: 103.167 },
            { name: "Thathom", lat: 18.983, lng: 103.650 }
        ]
    }
];

export const LOCATIONS = [
    // --- SPORTS ---

    {
        id: 'loc-2',
        name: 'Laos National Stadium',
        address: 'Xaythany District, Vientiane',
        image: 'src/assets/image/lao_national_stadium.jpg',
        category: 'sport',
        tags: ['football'],
    },
    {
        id: 'loc-3',
        name: 'Chao Anouvong Arena (ເດີ່ນເຈົ້າອານຸວົງ)',
        address: 'Nongbone Rd, Vientiane',
        image: 'src/assets/image/chaoanou.png',
        category: 'sport',
        tags: ['badminton', 'basketball', 'football'],
    },
    {
        id: 'loc-4',
        name: 'Thanong Art Sports Center (ທະນົງອາດ)',
        address: 'Thatluang lake, Vientiane',
        image: 'src/assets/image/thanongart.jpg',
        category: 'sport',
        tags: ['badminton', 'football'],
    },
    {
        id: 'loc-5',
        name: 'Settha Badminton Club',
        address: 'Beung Kha Nyong, Sisattanak',
        image: 'src/assets/image/settha.png',
        category: 'sport',
        tags: ['badminton'],
    },

    {
        id: 'loc-7',
        name: 'Ferrari Football Club (ເດີ່ນເຕະບານເຟີຣາຣີ)',
        address: 'Phonthan, Vientiane',
        image: 'src/assets/image/ferrari.png',
        category: 'sport',
        tags: ['football'],
    },


    // --- RESTAURANTS ---
    {
        id: 'res-1',
        name: 'Kualao Restaurant',
        address: 'Samsenthai Road, Vientiane',
        image: 'src/assets/image/kualao.png',
        category: 'restaurant',
        tags: ['lao food', 'dinner'],
    },
    {
        id: 'res-2',
        name: 'Doi Ka Noi',
        address: 'Sisangvone Village, Vientiane',
        image: 'src/assets/image/doikanoi.png',
        category: 'restaurant',
        tags: ['authentic', 'lunch'],
    },

    // --- NIGHT CLUBS ---
    {
        id: 'club-1',
        name: 'Marina Night Club',
        address: 'Mekong Riverfront',
        image: 'src/assets/image/marina.png',
        category: 'nightclub',
        tags: ['party', 'music'],
    },


    // --- BEAUTY SALONS ---

    {
        id: 'salon-2',
        name: 'Vientiane Beauty Studio',
        address: 'Phonxay Village',
        image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
        category: 'salon',
        tags: ['makeup', 'nails'],
    },
    // --- NEW ADDITIONS ---
    // SPORTS

    {
        id: 'loc-10',
        name: 'Lane Xang Sports Complex',
        address: 'Donkoy, Vientiane',
        image: 'src/assets/image/lanexang.jpg',
        category: 'sport',
        tags: ['football', 'basketball'],
    },
    // RESTAURANTS
    {
        id: 'res-3',
        name: 'Khop Chai Deu',
        address: 'Setthathirath Road',
        image: 'src/assets/image/khopchaideu.png',
        category: 'restaurant',
        tags: ['lao food', 'live music'],
    },
    {
        id: 'res-4',
        name: '3 Merchants',
        address: 'Crowne Plaza Vientiane',
        image: 'src/assets/image/3merchant.png',
        category: 'restaurant',
        tags: ['fusion', 'fine dining'],
    },
    {
        id: 'res-5',
        name: 'Pimentón',
        address: 'Nokeokoummane Rd',
        image: 'src/assets/image/pimenton.png',
        category: 'restaurant',
        tags: ['steakhouse', 'grill'],
    },
    {
        id: 'res-6',
        name: 'Senglao Café',
        address: 'Thepphanom Road',
        image: 'src/assets/image/senglao.png',
        category: 'restaurant',
        tags: ['cinema', 'retro'],
    },
    // NIGHT CLUBS
    {
        id: 'club-3',
        name: 'What\'s Club',
        address: 'Vientiane New World',
        image: 'src/assets/image/whatsclub.png',
        category: 'nightclub',
        tags: ['dance', 'edm'],
    },

    {
        id: 'club-5',
        name: 'Phoenix Custom Club',
        address: 'Near National Circus',
        image: 'src/assets/image/phoenix.png',
        category: 'nightclub',
        tags: ['high-end', 'party'],
    },
    // SALONS
    {
        id: 'salon-3',
        name: 'Tina Beauty',
        address: 'Dongpalane',
        image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
        category: 'salon',
        tags: ['hair', 'makeup'],
    },
    {
        id: 'salon-4',
        name: 'The Hair & Nail',
        address: 'Phonthan',
        image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
        category: 'salon',
        tags: ['nails', 'eyelash'],
    },
    {
        id: 'salon-5',
        name: 'Vientiane Barber',
        address: 'Travellers Area',
        image: 'src/assets/image/barber.jpg',
        category: 'salon',
        tags: ['barber', 'men'],
    },
];

export const COURTS = [
    // SPORTS

    { id: 'field-1', locationId: 'loc-2', sportId: 'football', name: 'Field 1 (7-a-side)', pricePerHour: 1 },
    { id: 'field-2', locationId: 'loc-2', sportId: 'football', name: 'Field 2 (7-a-side)', pricePerHour: 1 },
    { id: 'court-4', locationId: 'loc-3', sportId: 'badminton', name: 'Court 1', pricePerHour: 1 },
    { id: 'court-ta-1', locationId: 'loc-4', sportId: 'badminton', name: 'Court 1', pricePerHour: 1 },
    { id: 'court-ta-2', locationId: 'loc-4', sportId: 'badminton', name: 'Court 2', pricePerHour: 1 },
    { id: 'field-ta-1', locationId: 'loc-4', sportId: 'football', name: 'Field A', pricePerHour: 1 },
    { id: 'court-bk-1', locationId: 'loc-5', sportId: 'badminton', name: 'Court 1', pricePerHour: 1 },
    { id: 'court-bk-2', locationId: 'loc-5', sportId: 'badminton', name: 'Court 2', pricePerHour: 1 },

    { id: 'field-ferrari-1', locationId: 'loc-7', sportId: 'football', name: 'Field 1 (7-7)', pricePerHour: 1 },
    { id: 'field-ferrari-2', locationId: 'loc-7', sportId: 'football', name: 'Field 2 (5-5)', pricePerHour: 1 },


    // RESTAURANTS (Tables)
    { id: 'table-k1', locationId: 'res-1', sportId: 'restaurant', name: 'Table for 2', pricePerHour: 1 }, // Booking fee only? Or reservation deposit
    { id: 'table-k2', locationId: 'res-1', sportId: 'restaurant', name: 'Family Table (4-6)', pricePerHour: 1 },
    { id: 'table-d1', locationId: 'res-2', sportId: 'restaurant', name: 'Garden Seat', pricePerHour: 1 }, // Deposit

    // NIGHT CLUBS (Booths)
    { id: 'booth-m1', locationId: 'club-1', sportId: 'nightclub', name: 'VIP Booth A', pricePerHour: 1 },
    { id: 'booth-m2', locationId: 'club-1', sportId: 'nightclub', name: 'Standing Table', pricePerHour: 1 },


    // SALONS (Services as "Courts")

    { id: 'serv-vs1', locationId: 'salon-2', sportId: 'salon', name: 'Manicure & Pedicure', pricePerHour: 1 },

    // NEW ADDITIONS UNITS
    // Sports

    { id: 'field-lx-1', locationId: 'loc-10', sportId: 'football', name: 'Field A', pricePerHour: 1 },

    // Restaurant Tables/Seats
    { id: 'tbl-kcd-1', locationId: 'res-3', sportId: 'restaurant', name: 'Terrace Table', pricePerHour: 1 },
    { id: 'tbl-kcd-2', locationId: 'res-3', sportId: 'restaurant', name: 'Indoor Table', pricePerHour: 1 },
    { id: 'tbl-3m-1', locationId: 'res-4', sportId: 'restaurant', name: 'Chef\'s Table', pricePerHour: 1 },
    { id: 'tbl-pim-1', locationId: 'res-5', sportId: 'restaurant', name: 'Booth 1', pricePerHour: 1 },
    { id: 'tbl-sl-1', locationId: 'res-6', sportId: 'restaurant', name: 'Window Seat', pricePerHour: 1 },

    // Club Booths
    { id: 'vip-wc-1', locationId: 'club-3', sportId: 'nightclub', name: 'VIP Sofa', pricePerHour: 1 },

    { id: 'vip-phx-1', locationId: 'club-5', sportId: 'nightclub', name: 'Super VIP', pricePerHour: 1 },

    // Salon Services
    { id: 'svc-tn-1', locationId: 'salon-3', sportId: 'salon', name: 'Hair Cut', pricePerHour: 1 },
    { id: 'svc-tn-2', locationId: 'salon-3', sportId: 'salon', name: 'Styling', pricePerHour: 1 },
    { id: 'svc-hn-1', locationId: 'salon-4', sportId: 'salon', name: 'Gel Nails', pricePerHour: 1 },
    { id: 'svc-vb-1', locationId: 'salon-5', sportId: 'salon', name: 'Men\'s Cut', pricePerHour: 1 },
];
