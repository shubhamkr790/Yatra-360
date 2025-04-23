import { HeritageSite, Region } from '../types/types';

export const localGuides: LocalGuide[] = [
  {
    id: 'g1',
    name: 'Dr. Rajesh Kumar',    photo: 'https://rldrqubkpaxnxvlktlef.supabase.co/storage/v1/object/public/profile//307ce493-b254-4b2d-8ba4-d12c080d6651.jpg',
    rating: 4.9,
    reviews: 128,
    languages: ['English', 'Hindi', 'Tamil'],
    expertise: ['Ancient Architecture', 'Chola Dynasty', 'Temple History'],
    hourlyRate: 1500,
    yearsOfExperience: 15,
    certifications: ['PhD in Indian History', 'Certified Heritage Guide'],
    availability: {
      status: 'available'
    },
    location: {
      latitude: 11.1271,
      longitude: 78.6569
    },
    bio: 'Expert in South Indian temple architecture with 15 years of experience. PhD in Ancient Indian History.'
  },
  {
    id: 'g2',
    name: 'Lakshmi Priya',    photo: 'https://rldrqubkpaxnxvlktlef.supabase.co/storage/v1/object/public/profile//307ce493-b254-4b2d-8ba4-d12c080d6651.jpg',
    rating: 4.8,
    reviews: 95,
    languages: ['English', 'Tamil', 'Telugu'],
    expertise: ['Cultural Heritage', 'Art History', 'Local Customs'],
    hourlyRate: 1200,
    yearsOfExperience: 8,
    certifications: ['MA in Art History', 'Cultural Tourism Expert'],
    availability: {
      status: 'busy',
      nextAvailable: '2:00 PM'
    },
    location: {
      latitude: 11.1261,
      longitude: 78.6589
    },
    bio: 'Passionate about sharing Tamil culture and heritage. Specialized in art history and local traditions.'
  },
  {
    id: 'g3',
    name: 'Mohammed Hussain',    photo: 'https://rldrqubkpaxnxvlktlef.supabase.co/storage/v1/object/public/profile//307ce493-b254-4b2d-8ba4-d12c080d6651.jpg',
    rating: 4.7,
    reviews: 82,
    languages: ['English', 'Hindi', 'Urdu'],
    expertise: ['Islamic Architecture', 'Mughal History', 'Heritage Sites'],
    hourlyRate: 1300,
    yearsOfExperience: 12,
    certifications: ['Heritage Conservation Expert', 'Licensed Tour Guide'],
    availability: {
      status: 'available'
    },
    location: {
      latitude: 11.1291,
      longitude: 78.6549
    },
    bio: 'Expert in Islamic architecture and Mughal history. Providing insightful tours for over a decade.'
  }
];

export const regions: Region[] = [
  {
    id: '1',
    name: 'Tamil Nadu Heritage',
    imageUrl: 'https://www.ttdconline.com/virtualtour/img/thanjavur_virtualtour.jpg',
    siteCount: 5,
  }
];

export const heritageSites: HeritageSite[] = [
  {
    id: '1',
    name: 'Thanjavur Big Temple',
    location: 'Thanjavur, Tamil Nadu',
    region: 'Tamil Nadu Heritage',
    description: 'The Brihadeeswara Temple, also known as Big Temple, is a Hindu temple dedicated to Shiva located in Thanjavur, Tamil Nadu, India. Built by Raja Raja Chola I between 1003 and 1010 AD, the temple is a part of the UNESCO World Heritage Site. This magnificent temple represents the zenith of Chola architecture and showcases the grandeur of ancient Tamil engineering and artistry.',
    period: '11th Century CE',
    imageUrl: 'https://www.ttdconline.com/virtualtour/img/thanjavur_virtualtour.jpg',
    panoramaUrl: 'https://www.ttdconline.com/virtualtour/thanjavur/index.html',
    rating: 4.9,
    visitCount: 1000000,
    coordinates: {
      latitude: 10.7827,
      longitude: 79.1317
    },
    tags: ['UNESCO Site', 'Chola Architecture', 'Heritage'],    audioNarration: '',
    tourHighlights: [
      {
        id: 'h1',
        title: 'Main Sanctum',
        description: 'The towering Vimana with its massive Shiva Lingam',
        position: { x: 0, y: 0, z: 0 }
      }
    ]
  },
  {
    id: '2',
    name: 'Mamallapuram Temples',
    location: 'Mahabalipuram, Tamil Nadu',
    region: 'Tamil Nadu Heritage',
    description: 'Mamallapuram, also known as Mahabalipuram, features a group of sanctuaries carved out of rock in the 7th and 8th centuries. These ancient archaeological wonders include rathas (temples in the form of chariots), mandapas (cave sanctuaries), and giant open-air rock reliefs.',
    period: '7th-8th Century CE',
    imageUrl: 'https://www.ttdconline.com/virtualtour/img/mamallapuram_virtualtour.jpg',
    panoramaUrl: 'https://www.ttdconline.com/virtualtour/mamallapuram/index.html',
    rating: 4.8,
    visitCount: 800000,
    coordinates: {
      latitude: 12.6269,
      longitude: 80.1927
    },
    tags: ['UNESCO Site', 'Pallava Art', 'Rock-cut Architecture'],    audioNarration: '',
    tourHighlights: [
      {
        id: 'h1',
        title: 'Shore Temple',
        description: 'The iconic Shore Temple overlooking the Bay of Bengal',
        position: { x: 0, y: 0, z: 0 }
      }
    ]
  },
  {
    id: '3',
    name: 'Airavateswara Temple',
    location: 'Darasuram, Tamil Nadu',
    region: 'Tamil Nadu Heritage',
    description: 'The Airavateswara Temple is a Hindu temple of Dravidian architecture located in Darasuram, near Kumbakonam. Built by Rajaraja Chola II in the 12th century CE, it is part of the UNESCO World Heritage Site "Great Living Chola Temples".',
    period: '12th Century CE',
    imageUrl: 'https://www.ttdconline.com/virtualtour/img/darasuram_virtualtour.jpg',
    panoramaUrl: 'https://www.ttdconline.com/virtualtour/darasuram/index.html',
    rating: 4.7,
    visitCount: 500000,
    coordinates: {
      latitude: 10.9494,
      longitude: 79.3536
    },
    tags: ['UNESCO Site', 'Chola Architecture', 'Heritage'],    audioNarration: '',
    tourHighlights: [
      {
        id: 'h1',
        title: 'Main Mandapa',
        description: 'The intricately carved main hall',
        position: { x: 0, y: 0, z: 0 }
      }
    ]
  },
  {
    id: '4',
    name: 'Gangaikonda Cholapuram',
    location: 'Gangaikonda Cholapuram, Tamil Nadu',
    region: 'Tamil Nadu Heritage',
    description: 'The Brihadeeswarar Temple at Gangaikonda Cholapuram was built by Rajendra Chola I in the 11th century. It is part of the UNESCO World Heritage Site "Great Living Chola Temples".',
    period: '11th Century CE',
    imageUrl: 'https://www.ttdconline.com/virtualtour/img/gkcpuram_virtualtour.jpg',
    panoramaUrl: 'https://www.ttdconline.com/virtualtour/gangaikondacholapuram/index.html',
    rating: 4.6,
    visitCount: 400000,
    coordinates: {
      latitude: 11.2089,
      longitude: 79.4499
    },
    tags: ['UNESCO Site', 'Chola Architecture', 'Heritage'],    audioNarration: '',
    tourHighlights: [
      {
        id: 'h1',
        title: 'Main Shrine',
        description: 'The magnificent central shrine with its towering vimana',
        position: { x: 0, y: 0, z: 0 }
      }
    ]
  },
  {
    id: '5',
    name: 'Nilgiri Mountain Railway',
    location: 'Nilgiris, Tamil Nadu',
    region: 'Tamil Nadu Heritage',
    description: 'The Nilgiri Mountain Railway is a UNESCO World Heritage Site and a historic railway in Tamil Nadu. Built by the British in 1908, it is one of the steepest railway tracks in Asia.',
    period: 'Early 20th Century',
    imageUrl: 'https://www.ttdconline.com/virtualtour/img/nilgirimountaintrain_virtualltour.jpg',
    panoramaUrl: 'https://www.ttdconline.com/virtualtour/nilgirimountainailway/index.html',
    rating: 4.8,
    visitCount: 600000,
    coordinates: {
      latitude: 11.4102,
      longitude: 76.6950
    },
    tags: ['UNESCO Site', 'Heritage Railway', 'Mountain Train'],    audioNarration: '',
    tourHighlights: [
      {
        id: 'h1',
        title: 'Steam Locomotive',
        description: 'The iconic steam engine of the mountain railway',
        position: { x: 0, y: 0, z: 0 }
      }
    ]
  }
];