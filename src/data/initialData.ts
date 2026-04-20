import type { EquipmentItem, MaintenanceRecord, EquipmentFormData, MaintenanceFormData } from '../types/equipment';

export const initialEquipmentData: EquipmentItem[] = [
    {
        id: 1,
        name: 'Ordinateur portable',
        brand: 'Dell',
        model: 'Latitude 7440',
        serialNumber: 'DL7440-2024-0018',
        purchaseDate: '2024-04-05',
        warrantyExpiration: '2026-05-10',
        status: 'En service',
        position: 'Bureau Ennevelin'
    },
    {
        id: 2,
        name: 'Pétrin électrique',
        brand: 'Bongard',
        model: 'Spiral Evo 80',
        serialNumber: 'BG-SE80-2021-442',
        purchaseDate: '2021-05-10',
        warrantyExpiration: '2026-03-15',
        status: 'En service',
        position: 'Laboratoire Wasquehal'
    },
    {
        id: 3,
        name: 'Four ventilé',
        brand: 'Rational',
        model: 'iCombi Pro 10',
        serialNumber: 'RA-ICP10-2022-908',
        purchaseDate: '2022-09-20',
        warrantyExpiration: '2026-06-01',
        status: 'En service',
        position: 'Boulangerie Avelin'
    },
    {
        id: 4,
        name: 'Chambre froide positive',
        brand: 'Friginox',
        model: 'CFP 12m3',
        serialNumber: 'FR-CFP12-2020-073',
        purchaseDate: '2020-11-12',
        warrantyExpiration: '2026-04-25',
        status: 'En service',
        position: 'Restaurant Avelin'
    },
    {
        id: 5,
        name: 'Terminal de caisse',
        brand: 'Elo',
        model: 'PayPoint Plus',
        serialNumber: 'ELO-PP-2023-311',
        purchaseDate: '2023-01-08',
        warrantyExpiration: '2026-12-31',
        status: 'En service',
        position: 'Boulangerie Lambersart'
    },
    {
        id: 6,
        name: 'Machine à café',
        brand: 'Nespresso Pro',
        model: 'Zenius',
        serialNumber: 'NP-ZEN-2024-502',
        purchaseDate: '2024-01-25',
        warrantyExpiration: '2026-05-28',
        status: 'En service',
        position: 'Boulangerie Roubaix'
    },
    {
        id: 7,
        name: 'Lave-vaisselle professionnel',
        brand: 'Winterhalter',
        model: 'UC-L',
        serialNumber: 'WH-UCL-2019-114',
        purchaseDate: '2019-08-30',
        warrantyExpiration: '2025-08-30',
        status: 'En maintenance',
        position: 'Boulangerie Lille'
    },
    {
        id: 8,
        name: 'Armoire réfrigérée',
        brand: 'Liebherr',
        model: 'GKPv 1490',
        serialNumber: 'LB-GKPV-2022-631',
        purchaseDate: '2022-02-14',
        warrantyExpiration: '2026-07-30',
        status: 'En service',
        position: 'Boulangerie Avelin'
    },
    {
        id: 9,
        name: 'Ordinateur portable',
        brand: 'HP',
        model: 'ProBook 450 G10',
        serialNumber: 'HP-PB450-2025-119',
        purchaseDate: '2025-02-18',
        warrantyExpiration: '2027-02-18',
        status: 'En service',
        position: 'Bureau Ennevelin'
    },
    {
        id: 10,
        name: 'Four ventilé',
        brand: 'Unox',
        model: 'CHEFTOP MIND.Maps',
        serialNumber: 'UNX-CTM-2023-207',
        purchaseDate: '2023-06-11',
        warrantyExpiration: '2026-05-22',
        status: 'En service',
        position: 'Boulangerie Lille'
    },
    {
        id: 11,
        name: 'Machine à café',
        brand: 'Jura',
        model: 'X8',
        serialNumber: 'JURA-X8-2022-081',
        purchaseDate: '2022-10-03',
        warrantyExpiration: '2026-04-28',
        status: 'En service',
        position: 'Restaurant Avelin'
    },
    {
        id: 12,
        name: 'Terminal de caisse',
        brand: 'SumUp',
        model: 'Point of Sale Lite',
        serialNumber: 'SU-POS-2024-533',
        purchaseDate: '2024-08-27',
        warrantyExpiration: '2026-08-27',
        status: 'En service',
        position: 'Boulangerie Lambersart'
    },
    {
        id: 13,
        name: 'Pétrin électrique',
        brand: 'VMI',
        model: 'SPI 52',
        serialNumber: 'VMI-SPI52-2020-334',
        purchaseDate: '2020-04-14',
        warrantyExpiration: '2026-04-20',
        status: 'En maintenance',
        position: 'Boulangerie Roubaix'
    },
    {
        id: 14,
        name: 'Armoire réfrigérée',
        brand: 'Foster',
        model: 'EP700H',
        serialNumber: 'FOS-EP700-2021-900',
        purchaseDate: '2021-12-09',
        warrantyExpiration: '2026-06-18',
        status: 'En service',
        position: 'Laboratoire Wasquehal'
    },
    {
        id: 15,
        name: 'Lave-vaisselle professionnel',
        brand: 'Hobart',
        model: 'PREMAX FP',
        serialNumber: 'HB-PREMAX-2022-144',
        purchaseDate: '2022-07-02',
        warrantyExpiration: '2026-05-30',
        status: 'En service',
        position: 'Boulangerie Avelin'
    }
];

export const initialMaintenanceData: MaintenanceRecord[] = [
    {
        id: 1,
        equipmentId: 1,
        date: '2026-03-18',
        interventionType: 'Corrective',
        interventionStatus: 'Terminée',
        description: 'Remplacement du clavier défectueux',
        performedBy: 'IT interne',
        downtimeMinutes: 90,
        notes: 'Clavier changé, BIOS mis à jour.',
        cost: 95
    },
    {
        id: 2,
        equipmentId: 2,
        date: '2026-02-20',
        interventionType: 'Préventive',
        interventionStatus: 'Terminée',
        description: 'Graissage et contrôle des courroies',
        performedBy: 'Tech Boulangerie Services',
        downtimeMinutes: 120,
        notes: 'RAS sur le moteur. Prochaine visite dans 6 mois.',
        cost: 180
    },
    {
        id: 3,
        equipmentId: 3,
        date: '2026-04-10',
        interventionType: 'Corrective',
        interventionStatus: 'Terminée',
        description: 'Sonde de température recalibrée',
        performedBy: 'Rational SAV',
        downtimeMinutes: 180,
        notes: 'Test de montée en température validé.',
        cost: 240
    },
    {
        id: 4,
        equipmentId: 4,
        date: '2026-04-16',
        interventionType: 'Préventive',
        interventionStatus: 'En cours',
        description: 'Contrôle d\'étanchéité et nettoyage condenseur',
        performedBy: 'Froid Nord Maintenance',
        downtimeMinutes: 60,
        notes: 'Intervention en deux passages, fin prévue demain.',
        cost: 120
    },
    {
        id: 5,
        equipmentId: 6,
        date: '2026-04-22',
        interventionType: 'Préventive',
        interventionStatus: 'Planifiée',
        description: 'Détartrage complet et changement joint groupe',
        performedBy: 'Nespresso Pro Service',
        downtimeMinutes: 60,
        notes: 'Machine de prêt demandée pour la durée de l\'intervention.',
        cost: 85
    },
    {
        id: 6,
        equipmentId: 7,
        date: '2026-04-24',
        interventionType: 'Corrective',
        interventionStatus: 'Planifiée',
        description: 'Remplacement pompe de vidange',
        performedBy: 'Winterhalter SAV',
        downtimeMinutes: 240,
        notes: 'Pièce en attente de livraison.',
        cost: 430
    },
    {
        id: 7,
        equipmentId: 8,
        date: '2026-05-03',
        interventionType: 'Préventive',
        interventionStatus: 'Planifiée',
        description: 'Nettoyage évaporateur et contrôle thermostat',
        performedBy: 'Froid Nord Maintenance',
        downtimeMinutes: 90,
        notes: 'Intervention calée hors production.',
        cost: 110
    },
    {
        id: 8,
        equipmentId: 5,
        date: '2026-03-07',
        interventionType: 'Corrective',
        interventionStatus: 'Terminée',
        description: 'Lecteur CB remplacé',
        performedBy: 'Prestataire monétique',
        downtimeMinutes: 30,
        notes: 'Paramétrage terminal validé en caisse.',
        cost: 70
    }
];

export const emptyEquipmentFormData: EquipmentFormData = {
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpiration: '',
    status: '',
    position: ''
};

export const emptyMaintenanceFormData: MaintenanceFormData = {
    date: '',
    interventionType: 'Préventive',
    interventionStatus: 'Planifiée',
    description: '',
    performedBy: '',
    downtimeMinutes: 0,
    notes: '',
    cost: 0
};
